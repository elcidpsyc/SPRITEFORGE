# FASE 4 — Contrato 1.0 contra os assets reais

**Data:** 2026-09-07
**Como rodar:** `npm test` (ou só a suíte: `node --experimental-strip-types --test src/lib/spriteforge/qa/*.test.ts`)

---

## Primeiro: os testes não existiam

O prompt diz "todo asset que voltar passa pelos **testes existentes**". Eles não existiam.
`palette.test.ts`, `alpha.test.ts`, `pivot.test.ts`, `bbox.test.ts`, `nointerp.test.ts` e
`mirror.test.ts` não estavam no repositório — só havia `app-data`, `sign-in-gate` e
`gate-identity`. Então a FASE 4 foi **escrever** a suíte, não apenas executá-la.

Escritos em `src/lib/spriteforge/qa/`, ligados ao `npm test`, com um decodificador de PNG feito
à mão (`qa/png.ts`) em cima do `fflate` que o projeto já usa — zero dependências novas.

---

## Resultado: 4 passam, 5 falham

Rodados contra os 3 packs reais do repositório (`templar`, `templar-v2`, `templar-v3`).

| Teste | Resultado |
|---|---|
| `bbox` — geometria da grade (512×256) | ✅ passa |
| `bbox` — nada estoura 64×64 | ✅ passa |
| `mirror` — left/right independentes | ✅ passa |
| `nointerp` — sem interpolação no código | ✅ passa |
| `alpha` — alpha ∈ {0, 255} | ❌ **falha** |
| `palette` — ≤ 32 cores | ❌ **falha** |
| `palette` — paleta consistente entre ações | ❌ **falha** |
| `pivot` — linha de solo em `PIVOT.y` | ❌ **falha** |
| `pivot` — sprite ancorado na coluna do pivô | ❌ **falha** |

**191 entradas em `assets/quarantine/quarantine.log`**, cada uma com o motivo. Nenhum asset foi
consertado automaticamente, conforme a regra.

> As falhas são dos **assets atuais do paper-doll**, que são anteriores a estes testes. Nenhum
> teste foi relaxado para fazer passar. Nada disso vem do PixelLab — ainda não há asset do
> PixelLab (ver "O que ficou de fora").

---

## As quatro falhas reais

### 1. `alpha` — o smear de movimento é semitransparente
`src/lib/spriteforge/render.ts:430`:
```ts
const a = Math.min(90, 28 * pose.smear);
```
O renderizador desenha o rastro de movimento com **alpha 90**. Aparece em todos os packs e todas
as ações (1.667 px no `templar/walk`, 3.019 px no `templar/death`); o `templar-v2` usa alpha 64 e
96. O contrato exige alpha binário — e o motivo dele é bom: alpha parcial quebra colisão
pixel-perfect e cria franja contra qualquer fundo que não seja o da composição original.

**Decisão sua:** o smear é um efeito querido (e aí o contrato precisa de uma exceção explícita
para ele) ou é dívida (e aí o `render.ts` precisa desenhá-lo com alpha 255 numa cor mais clara).

### 2. `palette` — a ação `hurt` tem o dobro de cores
`templar/hurt`: **64 cores**. As outras ficam entre 22 e 24. É o flash vermelho de dano criando
uma segunda paleta tingida. A união das 7 ações dá **66 cores**, mais que o dobro do teto de 32 —
ou seja, as ações **não compartilham paleta**, que é exatamente o que o teste de consistência
existe para pegar.

No pipeline do PixelLab isto tem solução direta: `color_image` + `force_colors: true` na criação
**e** em toda animação (`docs/pixellab_api.md` §3). No paper-doll atual, o flash precisa sair da
paleta base em vez de multiplicar.

### 3. `pivot` — 100 frames com a linha de solo 1px baixa
A esmagadora maioria dos frames acerta `y=56` exatamente. **100 frames** (concentrados no
`attack`) caem em `y=57`. Desvio de 1px, e o contrato pede desvio 0.

### 4. `pivot` — os pés saem da coluna do pivô no `attack`
No `templar-v2/attack`, alguns frames têm os pés em `x=59..59` ou `x=24..27` — não contêm
`PIVOT.x=32`. O sprite se desloca dentro da célula durante o ataque, em vez de ancorar.

---

## Duas correções que fiz nos **testes**, não nos assets

Registradas porque mudam o número de falhas e seria desonesto omitir:

1. **`pivot` media a coisa errada.** A primeira versão usava o bounding box de tudo com
   `alpha > 0` e definia a linha de solo como a primeira linha *vazia* abaixo dos pés. Isso
   media o smear semitransparente e tinha um off-by-one — acusava **600** frames. Medindo só
   pixels **totalmente opacos** e usando a última linha *preenchida*, o número real é **100**.
   Os outros 500 eram defeito do meu teste.

   Também separei Y de X: a linha de solo é ponto fixo do contrato e vale desvio 0, mas o
   **centro horizontal dos pés não é fixo** — um ciclo de caminhada pisa para os lados por
   design, e exigir X exato reprovaria toda animação correta. X virou verificação de
   contenção: o sprite tem de continuar cruzando a coluna do pivô.

2. **`nointerp` tinha um falso positivo.** O grep literal que o prompt especifica
   (`bilinear|bicubic|LANCZOS|rotate(`) casava com
   `src/lib/spriteforge/export/godot.ts:193` — que é documentação dizendo ao usuário
   *"Nunca bilinear — derrete o pixel"*. Prosa que **proíbe** interpolação bate no mesmo grep
   que código que a **executa**. Resolvi com uma allowlist por **conteúdo exato da linha**, não
   por número de linha: se a linha mudar, ela volta a ser sinalizada. Sem heurística que
   pudesse deixar passar um uso real.

---

## Mudança de contrato: `mirror` (1.0 → 1.1)

O prompt já previu isto, e está certo. **Antes:** `left` tinha de ser o espelho horizontal de
`right`. **Agora:** são independentes, e forçar espelhamento é **proibido**.

O PixelLab entrega `east` e `west` como rotações geradas separadamente
(`docs/pixellab_api.md` §1). Espelhar seria jogar fora informação já paga: um cavaleiro espelhado
troca a espada de mão e inverte a cruz do escudo.

O teste passou a garantir o **oposto** do que garantia: que as duas direções são realmente
distintas. Dois frames pixel-idênticos sob reflexão significam que alguém reintroduziu o
espelhamento. Está documentado no cabeçalho de `mirror.test.ts`.

---

## Contact sheet de silhuetas

`docs/qa/silhouettes/*.svg`, um por pack, gerado por `node scripts/silhouettes.mjs`.

Cada frame vira máscara opaca, com uma cruz vermelha marcando o pivô (32, 56). Silhueta em vez
da arte porque as falhas que se pegam a olho — um frame que salta, um membro que sai da célula,
uma âncora que escorrega — são falhas de forma, e a cor as esconde. SVG em vez de PNG: não
precisa de encoder, versiona como texto e escala.

---

## O que ficou de fora, e por quê

**Nenhum asset do PixelLab foi validado, porque nenhum foi gerado.** Dois motivos, ambos
bloqueantes e nenhum contornável daqui:

1. **A chave não autentica neste ambiente.** `get_balance` pelo MCP devolve
   `401: Invalid API token` (`docs/mcp_pixellab.md`, adendo). Sem token válido não há geração.
2. **Gerar um lote gasta crédito real e precisa da sua confirmação explícita** — é a regra da
   FASE 3.3, que eu implementei e não vou ser o primeiro a furar. Um lote de uma classe são
   **29 jobs / ~29 gerações**; as 10 classes são **~290**.

A suíte está pronta e provada contra assets reais: ela pega alpha parcial, paleta inconsistente,
pivô fora do lugar e bbox estourado, e põe o reprovado em quarentena com o motivo. Quando o
primeiro personagem do PixelLab existir, ela roda nele sem nenhuma mudança.
