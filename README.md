# SPRITEFORGE

Estúdio de spritesheets para os guerreiros medievais (TanStack Start + React 19 +
Tailwind v4). Ver `AGENTS.md` / `AGENTS.project.md` para o contrato geral do
sandbox.

## Pack do Cavaleiro Templário (`public/packs/templar-v4/`)

O pack v4 do Templário é gerado a partir da referência artística
(`tools/reference/templar-ref-sheet.jpg`, 8 colunas × 4 linhas, células de
182px) pelo script `tools/build_templar_v4.py`. O pipeline faz keying do
fundo, amostragem por bloco com mediana, paleta travada por distância
perceptual, limpeza de pixels órfãos, outline 1px e composição das 7 ações
(walk, run, attack, guard, dash, hurt, death) × 4 direções.

Para regenerar o pack:

```sh
pip install pillow numpy
npm run pack:templar
```

Isso roda `python3 tools/build_templar_v4.py tools/reference/templar-ref-sheet.jpg public/packs/templar-v4`
e sobrescreve `public/packs/templar-v4/*`. O script é determinístico — rodar de
novo sobre a mesma referência produz bytes idênticos.

Os outros nove guerreiros usam o renderer procedural em
`src/lib/spriteforge/render.ts` (sem pack de imagem).
