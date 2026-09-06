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

## Paper-doll do Templário (`public/packs/templar-v5/`)

O v5 substitui a transformação do frame inteiro (v4) por composição de
**partes** (`shadow, legs, torso, cape, head, weapon, shield, vfx`) por pose,
via `src/lib/spriteforge/compose.ts`. O app usa isso automaticamente
(`PARTS_FOLDER.templar` em `sheet.ts`); regenerar do zero requer 2 passos:

```sh
pip install pillow numpy
npm run pack:templar-parts   # tools/extract_parts.py -> public/packs/templar-v5/parts/*.png + manifest.json
npm run pack:templar-v5      # tools/build_templar_v5.mjs -> sheet.png, *.png por ação, icons/, thumbs/, atlas.json
```

O segundo passo roda o compositor de verdade (`compose.ts` + `poses.ts`), o
mesmo código que o app usa ao vivo — não existe um caminho de renderização
separado só para gerar os arquivos estáticos. Testes: `node --experimental-strip-types --test src/lib/spriteforge/templar-v5.test.ts`
(também incluído em `npm test`).
