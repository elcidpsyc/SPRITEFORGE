# FASE 2 — A API do PixelLab, estudada antes de codar

**Data:** 2026-09-07
**Fontes (todas oficiais e verificáveis, nenhuma de memória):**
- OpenAPI v2: `https://api.pixellab.ai/v2/openapi.json` — 85 endpoints, é a especificação viva
- `llms.txt` oficial: `https://api.pixellab.ai/v2/llms.txt`
- Descrições das tools do servidor MCP (`https://api.pixellab.ai/mcp`, `tools/list` é aberto) —
  é onde o **custo em créditos** está documentado com precisão; a OpenAPI não traz isso.

> **Nada foi implementado nesta fase**, conforme instruído.

---

## 0. Correção de rota: existem DUAS APIs, e a v1 é a errada

A primeira coisa que apareceu foi `https://api.pixellab.ai/v1/openapi.json`, com **8 endpoints
síncronos** e **nenhum conceito de personagem, direção ou job**. Se eu tivesse parado ali, o
relatório teria sido "o endpoint de personagem com N direções não existe" — e estaria errado.

A v1 é a API antiga, no nível de *imagem*. A **v2** (`https://api.pixellab.ai/v2`) é a atual, com
85 endpoints, e tem tudo: personagens, direções, animações, jobs assíncronos, spritesheet.

| | v1 | v2 |
|---|---|---|
| Endpoints | 8 | 85 |
| Modelo | síncrono (imagem no corpo da resposta) | assíncrono (job id + polling) |
| Personagem / direções | **não existe** | `create-character-with-4-directions` |
| Animação por template | **não existe** | `characters/animations` |
| Spritesheet | **não existe** | `characters/{id}/spritesheet` |

O `pixellab.server.ts` que a FASE 0 validou **já aponta para a v2**
(`https://api.pixellab.ai/v2/create-image-pixflux`) — então a base está certa e não muda.

**Base URL:** `https://api.pixellab.ai/v2`
**Auth:** `Authorization: Bearer <token>` em toda requisição (`HTTPBearer` no spec).

---

## 1. Criação de personagem com N direções

### `POST /v2/create-character-with-4-directions`

É exatamente o que o pipeline pede: 4 direções cardeais, que mapeiam 1:1 no nosso contrato.

| Campo | Tipo | Default | Nota |
|---|---|---|---|
| `description` * | string | — | descrição do personagem |
| `image_size` * | `{width, height}` | — | 16–128. **Ver o alerta de canvas abaixo.** |
| `async_mode` | `const(true)` | `true` | sempre assíncrono, não dá para desligar |
| `text_guidance_scale` | number | `8.0` | |
| `outline` | string | `single color black outline` | *soft guidance* — o modelo pode não obedecer |
| `shading` | string | `basic shading` | *soft guidance* |
| `detail` | string | `medium detail` | *soft guidance* |
| `view` | string | `low top-down` | `side`, `low top-down`, `high top-down`, `perspective` |
| `color_image` | Base64Image | — | imagem cuja paleta será usada |
| `force_colors` | boolean | `false` | **força** a paleta do `color_image` |
| `proportions` | preset ou custom | — | `default`, `chibi`, `cartoon`, `stylized`, `realistic_male`, `realistic_female`, `heroic` |
| `template_id` | string | — | `mannequin` (humanoide); `bear`/`cat`/`dog`/`horse`/`lion` (quadrúpede) |
| `directions` | `{direção: Base64Image}` | — | **âncora de referência por direção** — ver §3 |
| `seed` | integer | — | reprodutibilidade |

**Resposta (imediata):**
```json
{
  "character_id": "…",          // disponível NA HORA, antes de gerar
  "background_job_id": "…",     // para polling
  "status": "processing",
  "usage": { "type": "usd", "usd": 0.0, "generations": 0 }
}
```

> ### ⚠️ Alerta 1 — o canvas não é o tamanho que você pede
> Da própria spec, no campo `image_size`:
> *"Character size in pixels. **Canvas will be ~40% larger** to make room for animations."*
>
> Pedir `64` **não devolve 64×64** — devolve o personagem com ~64px de altura num canvas de
> ~90×90. Isso colide de frente com `CELL = 64` do Contrato 1.0. Consequência direta para a
> FASE 4 (`bbox.test.ts`): **não existe parâmetro que faça a API entregar 64×64 direto.**
> É preciso um passo de recorte/recentragem nosso, por translação inteira, depois da geração.

Existe também `create-character-with-8-directions` (mesma forma), e as variantes de qualidade
`create-character-pro` e `create-character-v3` (ambas **sempre 8 direções**, muito mais caras —
ver §6). Para o nosso contrato de 4 direções, a de 4 direções é a certa.

### Consultar o personagem — `GET /v2/characters/{character_id}`

Devolve `status` (`completed` / `failed` / `pending`), `size`, `directions`, `animation_count`,
`animations[]` agrupadas, `skeletons`, e o que interessa:

```
rotation_urls: { south, west, east, north }   // obrigatórios nas 4 direções
                + south-east, north-east, north-west, south-west (só 8-dir)
```
São URLs públicas — `rotation_urls` é `null` enquanto `status != "completed"`.

### Mapa de direções

| Contrato SPRITEFORGE | PixelLab |
|---|---|
| `down` | `south` |
| `up` | `north` |
| `right` | `east` |
| `left` | `west` |

**1:1, sem espelhamento.** O PixelLab gera `east` e `west` como imagens independentes — o que
confirma a suspeita do prompt sobre o `mirror.test.ts` (ver §7).

---

## 2. Animações

### `POST /v2/characters/animations` (canônico) — e `POST /v2/animate-character` (alias)

São **o mesmo endpoint** (`CreateCharacterAnimationRequest` nos dois), com o mesmo
`operationId` de handler. Uso o canônico.

Três modos, auto-detectados, sobrescrevíveis por `mode`:

| Modo | Como dispara | Frames | Custo |
|---|---|---|---|
| **`template`** | passar `template_animation_id` | fixo pelo template | **1 geração/direção** |
| **`v3`** (default sem template) | `action_description` | `frame_count` 4–16, par | ~1 ger./dir. até 96px (escala com o canvas) |
| **`pro`** | `mode: "pro"` | fixo pelo tamanho (≤64px → 16; >64px → 4) | **20–40 ger./direção** |

Campos principais: `character_id` *, `action_description`, `template_animation_id`,
`frame_count` (só v3), `directions[]`, `animation_name`, `color_image` + `force_colors`,
`seed`, `enhance_prompt`.

**Resposta:**
```json
{
  "background_job_ids": ["…", "…", "…", "…"],   // UM JOB POR DIREÇÃO
  "directions": ["south", "north", "east", "west"],
  "status": "processing"
}
```

> ### ⚠️ Alerta 2 — a unidade de cobrança é a direção, não a animação
> Uma animação de 4 direções são **4 jobs** e **4× o custo**. As 7 ações do contrato × 4 direções
> = **28 jobs por classe**, × 10 classes = **280 jobs**. Isto é o que torna a guarda de custo da
> FASE 3.3 inegociável.

### 2.1 Por template

`template_animation_id`. Lista de humanoides (das descrições do MCP, que trazem a lista completa —
a v2 trunca a dela):

`angry`, `attack`, `attack-back`, `attack-left`, `attack-right`, `backflip`, `bark`,
`breathing-idle`, `cross-punch`, `crouched-walking`, `crouching`, `drinking`,
`falling-back-death`, `fight-stance-idle-8-frames`, `fireball`, `flying-kick`, `front-flip`,
`getting-up`, `high-kick`, `hurricane-kick`, `jumping-1`, `jumping-2`, `lead-jab`, `leg-sweep`,
`picking-up`, `pull-heavy-object`, `pushing`, `roundhouse-kick`, `running-4-frames`,
`running-6-frames`, `running-8-frames`, `running-jump`, `running-slide`, `sad-walk`,
`scary-walk`, `surprise-uppercut`, `taking-punch`, `throw-object`, `two-footed-jump`, `walk`,
`walk-1`, `walk-2`, `walking`, `walking-2` … `walking-10`, `walking-4-frames`,
`walking-6-frames`, `walking-8-frames`.

Há também `ai_freedom` (0–900, **só no modo template**): 0 = segue o esqueleto do template
rigidamente; alto = deixa a IA se afastar da pose.

#### Mapeamento das 7 ações do contrato

O contrato (`src/lib/spriteforge/contract.ts`) exige:

| Ação | frames | fps | loop | holdLast | hitFrame |
|---|---|---|---|---|---|
| `walk` | 8 | 8 | sim | não | |
| `run` | 8 | 12 | sim | não | |
| `attack` | 8 | 10 | não | não | **3** |
| `guard` | 6 | 8 | não | sim | |
| `dash` | 6 | 14 | não | não | |
| `hurt` | 6 | 10 | não | não | |
| `death` | 8 | 8 | não | sim | |

Proposta de mapeamento (a validar na primeira geração real):

| Ação | Rota | Justificativa |
|---|---|---|
| `walk` | template `walking-8-frames` | 8 frames exatos, 1 ger./dir. |
| `run` | template `running-8-frames` | 8 frames exatos, 1 ger./dir. |
| `attack` | template `attack` | 8 frames precisam de conferência |
| `guard` | **v3**, `frame_count: 6` | não há template de defesa/bloqueio |
| `dash` | **v3**, `frame_count: 6` | `running-slide` é o mais próximo, mas não é dash |
| `hurt` | template `taking-punch` | contagem de frames a conferir |
| `death` | template `falling-back-death` | contagem de frames a conferir |

> ### ⚠️ Alerta 3 — contagem de frames no modo template não é escolhida por nós
> No modo `template`, `frame_count` é **ignorado** — quem manda é o template. Os nomes com
> sufixo (`walking-8-frames`) resolvem `walk` e `run`, mas `attack`, `taking-punch` e
> `falling-back-death` **não declaram a contagem no nome**, e a spec não a publica. Só a primeira
> geração real revela. Se não baterem com 8/6/8, as opções são: (a) usar v3 com `frame_count`
> explícito, mais caro e menos consistente; ou (b) mudar o contrato. **É decisão sua, não minha.**

### 2.2 Por texto

Dentro do fluxo de personagem: `mode: "v3"` + `action_description` + `frame_count` (4–16, par).
`keep_first_frame` (default `true`) mantém o frame de referência como frame 0 — logo
`frame_count: 8` **armazena 9 frames**; para exatamente 8, `keep_first_frame: false`.

Fora do fluxo de personagem, avulso: `animate-with-text-v3` (atual), `animate-with-text-v2`
(pro), `animate-with-text` (legado, **só 64×64 e sempre 4 frames**).

### 2.3 Por esqueleto

- `POST /v2/estimate-skeleton` — recebe uma imagem, devolve `keypoints[]` (`x`, `y`, `label`,
  `z_index`).
- `POST /v2/animate-with-skeleton` — `skeleton_keypoints: Point[][]` exigindo
  **exatamente 3 frames** ("the model is a 3-frame window; other counts are rejected"),
  mais `reference_image` obrigatória.

Os esqueletos de um personagem já criado vêm de graça em `GET /characters/{id}` no campo
`skeletons`. **Não recomendo esta via para o pipeline**: a janela de 3 frames obriga a costurar
manualmente animações de 6–8 frames. Fica registrada porque foi pedida.

---

## 3. Style transfer e referência de imagem — as três vias

Este é o ponto que decide se as 10 classes saem coerentes. Existem **três** mecanismos distintos,
e eles não são intercambiáveis:

### Via A — `directions` no próprio `create-character-with-4-directions` ← **recomendada**
```
directions: { "south": Base64Image, "east": Base64Image, … }
```
Da spec: *"Missing directions are AI-generated; provided ones are used as-is. Each image's
dimensions must match `image_size`. Bipedal templates require `south` if any are provided."*

É a mais forte: as direções fornecidas entram **como estão**, não são reinterpretadas. Ancora
identidade e estilo dentro do mesmo endpoint que já vamos chamar, sem custo extra de chamada.

### Via B — `POST /v2/generate-with-style-v2` (Pro)
`style_images` (1–4, máx. 512×512) + `description` + `style_description`. Assíncrono, devolve job.
**Restrição dura:** `image_size` foi **removido** — *"Output size is deduced from the style
images."* Não dá para pedir 64px; sai no tamanho da referência.

### Via C — `POST /v2/create-image-bitforge`
`style_image` + `style_strength` (0–100, 50 = equilibrado). É o único com um **dial numérico** de
força de estilo. Mas é imagem única — não produz personagem com direções.

### Via D (ortogonal, combinável) — trava de paleta
`color_image` + `force_colors: true` existe no `create-character-with-4-directions` **e** no
endpoint de animação. Força a paleta literal de uma imagem de referência.

**Isto é a alavanca direta do `palette.test.ts`** (≤32 cores, paleta consistente entre frames):
extrair a paleta da referência uma vez, passar como `color_image` com `force_colors: true` em
*toda* criação e *toda* animação. Faz a consistência valer entre classes e entre frames — que é
precisamente o que o teste cobra.

> ### ⛔ Bloqueio — o arquivo-âncora não existe
> O prompt manda usar `assets/reference/warriors_sheet.png` como âncora. **Esse arquivo não
> existe no repositório** — não há `assets/`, e a única coisa com "warrior" no nome é o
> componente `src/components/spriteforge/WarriorGrid.tsx`. Sem ele não há como ancorar estilo
> nem paleta. Preciso que você o forneça ou aponte o caminho certo.

---

## 4. Rotação e inpainting

### `POST /v2/rotate` — síncrono
`from_image` * + `image_size` * (16/32/64/128 apenas) + `from_direction` → `to_direction`,
`from_view` → `to_view`, ou `view_change` / `direction_change` em graus. Também
`image_guidance_scale` (default 3.0), `init_image`, `mask_image`, `color_image`, `seed`.
Devolve a imagem no corpo — **sem job**.

Serve para consertar/gerar uma direção isolada, não para montar o personagem: quem faz isso é o
`create-character-with-4-directions`. Existem ainda `generate-8-rotations-v3` e
`generate-8-rotations-v2` (só 8 direções, caros).

### `POST /v2/inpaint` — síncrono
`description` *, `image_size` * (**área máxima 200×200**), `inpainting_image` *, `mask_image` *
(preto e branco; branco = região a regenerar), `text_guidance_scale` (default 3.0),
`no_background`, `color_image`, `seed`. Devolve a imagem no corpo.

Também síncrono. É a ferramenta de conserto pontual — mas atenção à regra da FASE 4:
**asset reprovado vai para quarentena, não é consertado automaticamente.** O inpaint só entra
por decisão manual. Há ainda `inpaint-v3` (Pro).

---

## 5. Saldo de créditos

### `GET /v2/balance`
```json
{
  "credits":      { "type": "usd", "usd": 12.34 },
  "subscription": { "type": "...", "status": "active", "plan": "…",
                    "generations": 420, "total": 1000 }
}
```
`status` ∈ `active` | `trial` | `expired` | `none`.

> **Duas moedas, não uma.** `credits.usd` (dólares) e `subscription.generations` (gerações do
> período). As gerações da assinatura são consumidas primeiro; os créditos USD são o *fallback*.
> A UI da FASE 3.3 **tem de mostrar as duas** — mostrar só USD faz o usuário achar que tem
> saldo quando as gerações acabaram, ou o contrário.
>
> (A v1 tinha só `{type: "usd", usd}`. Outro motivo para não usar a v1.)

---

## 6. Modelo assíncrono: job, polling e timeout

### O ciclo
1. `POST /create-character-with-4-directions` → `{character_id, background_job_id, status}`
   — o `character_id` vem **na hora**, antes de a arte existir. Dá para persistir imediatamente.
2. `GET /v2/background-jobs/{job_id}` em intervalos.
3. `status == "completed"` → resultado em `last_response`.
4. Para personagens, a fonte de verdade final é `GET /characters/{id}` → `rotation_urls`.

### Formato do job
```json
{
  "id": "…",
  "status": "processing" | "completed" | "failed",
  "created_at": "ISO-8601",
  "last_response": { … },      // resultado quando completed
  "usage": { "type": "usd", "usd": …, "generations": … }
}
```
Só três status. A spec também cita `pending`/`running` no campo `status` da criação — tratar
qualquer coisa que não seja `completed`/`failed` como "ainda processando".

### Polling e timeout — recomendação
Tempos observados na documentação: personagem **2–5 min**; animação **2–4 min**; objetos
30–90 s. Um lote de 4 direções são 4 jobs em paralelo.

| Parâmetro | Valor | Porquê |
|---|---|---|
| 1º poll | 30 s | nada termina antes disso; poll cedo é desperdício |
| Backoff | ×1.5, teto de 30 s | 30, 45, 60, 90, 120, 180, 240, 300… |
| **Timeout duro** | **10 min por job** | 2× o pior caso documentado (5 min) |
| Ao estourar | marcar `timeout`, **não** re-submeter | re-submeter cobra de novo |
| Retry | **só manual** | regra da FASE 3.2 |

> O job continua no servidor do PixelLab depois do timeout. O `character_id` já está persistido,
> então `GET /characters/{id}` recupera o resultado depois — sem gastar nada. **Timeout do nosso
> lado nunca deve virar re-submissão.**

### Endpoints síncronos (não têm job)
`/rotate`, `/inpaint`, `/create-image-pixflux`, `/create-image-bitforge`, `/estimate-skeleton`,
`/balance`, `/resize`, `/reduce-colors`, `/remove-background`, `/correct-pixelart`, `/unzoom`.
Todos devolvem o resultado no corpo, com `usage`.

---

## 7. Custo em créditos por operação — **obrigatório**

A OpenAPI **não publica preços**. A fonte precisa são as descrições das tools do MCP. A unidade
é a **geração**; o `usage` de cada resposta traz `usd` e/ou `generations` do que foi cobrado.

### Criação de personagem

| Modo | Endpoint | Gerações | Direções |
|---|---|---|---|
| **standard** | `create-character-with-4-directions` | **1** | 4 |
| standard | `create-character-with-8-directions` | **1** | 8 |
| v3 | `create-character-v3` | **2–9** (pelo tamanho) | sempre 8 |
| pro | `create-character-pro` | **20–40** (pelo tamanho) | sempre 8 |

**O modo standard é ~1 geração para o personagem inteiro, nas 4 direções.** Criar as 10 classes
custa ~10 gerações. É barato — a criação não é o problema de custo.

### Animação — **por direção**

| Modo | Gerações **por direção** | Fórmula |
|---|---|---|
| **template** | **1** | fixo |
| **v3** | ~1 até 96px; 128px ≈ 2; 160px ≈ 4; 256px ≈ 8 | `ceil(w · h · frames / 65536)` |
| **pro** | **20–40** | requer `confirm_cost` |

### Orçamento do lote completo (10 classes × 7 ações × 4 direções)

Assumindo personagem de 64px (canvas ~90px, dentro da faixa "~1 ger./dir." do v3):

| Item | Contagem | Gerações |
|---|---|---|
| Criação dos personagens (standard) | 10 | **~10** |
| Animações por template (5 ações × 4 dir × 10) | 200 jobs | **~200** |
| Animações v3 (`guard`, `dash` — 2 × 4 dir × 10) | 80 jobs | **~80** |
| **Total** | **280 jobs** | **~290 gerações** |

Se `guard`/`dash` fossem no modo **pro**: 80 jobs × 20–40 = **1.600–3.200 gerações** só nessas
duas ações. **O modo pro fica fora do lote automático.** O `animate-character` no modo pro exige
`confirm_cost` explícito na própria API — o PixelLab também trata isso como perigoso.

### Grátis
`GET /balance`, `GET /characters/{id}`, `GET /characters`, `GET /background-jobs/{id}`,
`PATCH .../tags`, `POST /lip-sync`, `POST /talking-gif`, e os `DELETE`. **Polling não custa** —
é seguro pollar à vontade; o cuidado é com rate limit, não com fatura.

> ⚠️ Na FASE 0 o `usage.usd` voltou `null`. O campo é `number | null` na spec — nulo é legítimo
> e **não** significa gratuito (provavelmente foi cobrado em `generations`, não em USD).
> **`usage` não serve como contador de gastos confiável.** O `credits_spent` da tabela da FASE 3
> deve gravar `usd` **e** `generations`, aceitar nulos, e o número em que confiamos é o delta de
> `GET /balance` antes/depois do lote.

---

## 8. Export: spritesheet e ZIP

### `GET /v2/characters/{character_id}/spritesheet`
ZIP com `<nome>.png` + `<nome>.json`. Grade uniforme: linha 0 = rotações; uma linha por
(animação × direção); colunas = frames em ordem. O JSON traz cell size, sheet size, colunas e o
mapa linha→(animação, direção).

**Não exige autenticação** — o character_id aleatório é a chave de acesso. Códigos: `200` pronto,
`423` ainda gerando, `422` geração falhou, `404` não existe.

### `GET /v2/characters/{character_id}/zip`
PNGs de frame individuais e todos os estados do grupo. É o formato certo para rodar os testes do
Contrato 1.0 frame a frame.

> ### ⚠️ Alerta 4 — o pivô do spritesheet não é o nosso pivô
> Da spec: *"frames are centred in their cell and never rescaled, so the character's **pivot is
> always the cell centre**."*
>
> O pivô do PixelLab é o **centro da célula**. O nosso (`contract.ts`) é a **âncora de solo**,
> `PIVOT = {x: 32, y: 56}`. São coisas diferentes: um está no meio do corpo, o outro nos pés.
> O `pivot.test.ts` **vai reprovar todo asset** vindo direto do spritesheet do PixelLab.
> Isso não é bug — é conversão que temos de fazer, por translação inteira (que o próprio prompt
> já autoriza: *"translação inteira se necessário"*).

---

## 9. Divergências entre o prompt e a realidade — leia antes da FASE 3

Cinco coisas não batem. Nenhuma é fatal; três precisam de decisão sua.

| # | O prompt diz | A realidade | Impacto |
|---|---|---|---|
| 1 | `nDirections: 4, size: 64` → 64×64 | canvas sai **~40% maior** (~90×90) | recorte/recentragem nosso, obrigatório |
| 2 | pivô em **(32, 58)** | `contract.ts` e `atlas.json` dizem **(32, 56)** | **decisão sua:** o código está certo ou o prompt? Assumo 56 (é o que está versionado) |
| 3 | "os testes existentes" | `palette/alpha/pivot/bbox/nointerp/mirror.test.ts` **não existem** | a FASE 4 é escrever esses testes, não só rodá-los |
| 4 | `animateCharacter({characterId, action})` → 1 job | são **4 jobs**, um por direção | muda a modelagem da tabela: o job é por (ação × direção) |
| 5 | `assets/reference/warriors_sheet.png` | **não existe** no repositório | **bloqueia** a âncora de estilo (§3) |

Sobre o `mirror.test.ts`, o prompt já anteviu certo: o PixelLab **entrega `east` e `west`
separados**, gerados de forma independente. Não se deve forçar espelhamento — o teste tem de
mudar e a mudança de contrato tem de ser documentada, como o próprio prompt manda.

---

## 10. Resumo executivo

- **A v2 tem todos os endpoints pedidos.** Nenhum precisa de aproximação ou substituto.
- **Custo é dominado pela animação, não pela criação:** ~10 gerações para os 10 personagens,
  ~280 para animá-los. A unidade de cobrança é a **direção**.
- **O modo `pro` é 20–40× mais caro** e fica fora de qualquer lote automático.
- **Polling é grátis**, e o `character_id` chega antes da arte — dá para persistir na hora e
  nunca depender da aba aberta.
- **`usage` não é contador de gasto confiável** (`usd` volta `null`); confie no delta de
  `GET /balance`.
- **`color_image` + `force_colors: true`** é a alavanca direta do `palette.test.ts`.
- **Dois ajustes geométricos são inevitáveis** e não têm parâmetro de API: canvas 40% maior
  (§1) e pivô no centro da célula em vez do solo (§8).
- **Dois bloqueios de entrada:** o arquivo-âncora `warriors_sheet.png` não existe, e o pivô
  do prompt (58) discorda do código (56).
