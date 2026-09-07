# Geração ao vivo — cavaleiro com marreta, 12 frames

**Data:** 2026-09-07 · **Conta:** trial, 40 gerações, US$ 0,00 de crédito

Primeira geração real de personagem+animação pela API v2. Serve como validação empírica do que
`docs/pixellab_api.md` previu na FASE 2.

---

## Custo real: 5 de 40 gerações

| # | O quê | Gerações | Resultado |
|---|---|---|---|
| 1 | Personagem "marreta **+ escudo**" | 1 | ❌ descartado — ver abaixo |
| 2 | Animação 12 frames, `south` | 1 | ❌ girou o escudo, não a marreta |
| 3 | Personagem "marreta às duas mãos, **sem escudo**" | 1 | ✅ |
| 4 | Animação 12 frames, `east` | **2** | ✅ entregue |

Saldo: **40 → 35**.

### A falha, e por quê
A descrição do personagem #1 pedia marreta **e** escudo. Na vista `south` o modelo desenhou o
escudo em destaque e escondeu a marreta atrás do corpo — ela só aparecia em `east`/`west`. A
animação v3 anima o frame da direção escolhida, então animou o que estava lá: o escudo.

Duas lições que valem para o lote das 10 classes:
1. **Uma arma por descrição.** Pedir dois objetos de mão faz o modelo escolher um, e a vista
   frontal é a que mais esconde.
2. **Confira a rotação antes de animar.** A criação custa 1 geração e devolve as 4 direções; olhar
   para elas é grátis e evita gastar a animação numa pose errada. Foi assim que a #4 acertou.

---

## Correções ao modelo de custo da FASE 2

O `docs/pixellab_api.md` §7 dizia "~1 geração por direção" para animação v3 em sprites ≤96px.
**Está subestimado para 12 frames.**

| Previsto | Real |
|---|---|
| criação standard = 1 geração | ✅ **confirmado** (40 → 39) |
| animação v3 ≈ 1 ger./direção | ❌ **2 gerações** para 12 frames numa direção |

A fórmula documentada é `ceil(w · h · frames / 65536)` por direção. Com o canvas de animação de
76×76 e 12 frames: `ceil(76·76·12/65536) = ceil(1,06) = 2`. Bate. O que a FASE 2 errou foi usar o
tamanho **pedido** (48) em vez do canvas **real** da animação (76) — e o canvas da animação é
maior até que o do personagem.

**Impacto no orçamento do lote:** com 8 frames o custo cai para 1 ger./direção. As 7 ações do
contrato usam 8 e 6 frames, não 12, então a estimativa de ~290 gerações para as 10 classes
continua válida — mas ela **não cabe numa conta trial de 40**.

---

## Geometria: dois canvas diferentes, ambos maiores que o pedido

| Etapa | Pedido | Entregue |
|---|---|---|
| `create-character-with-4-directions` | 48×48 | **68×68** (+42%) |
| frames da animação | — | **76×76** |

Confirma o alerta da FASE 2 (§1): não existe parâmetro que faça a API devolver 64×64. E o canvas
da animação é ainda maior que o do personagem, para caber o arco da marreta.

---

## Contrato 1.0 nos frames crus (76×76)

| Teste | Resultado |
|---|---|
| `alpha` binário ∈ {0,255} | ✅ **PASSA** — 0 pixels parciais nos 12 frames |
| `bbox` cabe em 64×64 | ✅ **PASSA** — maior é 57×51 (frame 7, o arco) |
| `pivot` linha de solo | ⚠️ y=**63** uniforme nos 12 (contrato: 56) |
| `palette` ≤ 32 cores | ❌ **FALHA** — 27–33 por frame, **37** na união |

Nota: o PixelLab passa no `alpha` que **os nossos próprios assets do paper-doll reprovam** (o
smear de `render.ts:430` usa alpha 90). A saída da IA é mais limpa que a nossa nesse ponto.

### A conversão para o contrato
`y=63` uniforme nos 12 frames significa **uma** translação inteira resolve tudo: `dx=6, dy=7`.
Feita, sem reescala e sem interpolação, com recusa explícita se fosse cortar arte. Resultado em
`assets/pixellab/templar_hammer/attack_hammer_64.png` (768×64, 12 células de 64×64):

- linha de solo == 56 nos 12 frames — ✅ **PASSA**
- pés cruzam a coluna do pivô nos 12 — ✅ **PASSA**

Sobra a paleta (37 cores). A alavanca existe e está documentada: `color_image` +
`force_colors: true` na criação **e** na animação (`docs/pixellab_api.md` §3). Não foi usada aqui
porque não havia imagem-âncora — ver abaixo.

---

## A âncora de estilo continua faltando

As imagens de referência foram anexadas ao chat, mas **não chegaram ao contêiner** — vêm como
conteúdo visual para o modelo, não como arquivos em disco. Por isso esta geração é ancorada
**só em texto**, e a paleta ficou livre.

Para destravar sem terminal: subir o PNG para o repositório pela interface web do GitHub (dá para
fazer no tablet), em `assets/reference/`. Aí passo a usar `reference_image_url` apontando para o
`raw.githubusercontent.com` e `color_image` para travar a paleta — o que deve resolver a única
falha de contrato que sobrou.

Enquanto isso, as 4 rotações do personagem #3 ficaram salvas em `assets/reference/` como âncora
provisória.
