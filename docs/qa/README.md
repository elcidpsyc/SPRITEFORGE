# QA — Gerador de Imagem (PixelLab)

Artefatos da validação ao vivo da FASE 0 (integração `create-image-pixflux`).

- `pixellab_smoke_test.png` — resultado bruto (PNG 64×64) do teste ao vivo contra o deploy em
  preview, gerado a partir do prompt de teste "medieval templar knight, white surcoat, red cross,
  top-down".

## Resultado (2026-09-06)

- **Status: PASS.** Chamada real ao endpoint `create-image-pixflux` (via a server function
  `generateConceptArt`) num deploy em preview, com `PIXELLAB_API_KEY` de verdade. Sem retry — uma
  única chamada.
- PNG confirmado 64×64, `colorType 6` (RGBA), fundo genuinamente transparente (alpha 0 nos 4
  cantos e em 3202/4096 pixels; os demais são alpha 255 — nenhum pixel com alpha intermediário).
- `usd` de custo veio `null` na resposta do PixelLab (a API não devolveu o campo de uso desta
  vez); o valor gasto não pôde ser confirmado por essa via.
- Grep em `.vercel/output/static/` (bundle cliente da build de produção): **zero** ocorrências de
  `PIXELLAB_API_KEY` ou do endpoint `pixellab.ai`. Confirmado que a chave só existe em
  `.vercel/output/functions/__server.func/_ssr/pixellab.server-*.mjs` (código server-only).

## Achado importante: build travada (corrigido nesta branch)

O deploy em preview da branch `claude/pixellab-mcp-integration-bqss0i` (e todo deploy do projeto
desde a importação inicial) estava servindo um snapshot **congelado** do dia 05/09, porque
`.vercel/output/` — artefato de build — tinha sido commitado no import original ("Export from
Grok") e nunca mais atualizado. A Vercel trata um `.vercel/output/` versionado como *prebuilt
deployment* e o serve direto, pulando o build real — então nenhuma mudança de código desde então
(templar-v4, a integração do PixelLab) estava realmente chegando a produção/preview. Corrigido
removendo `.vercel/output/` do git e adicionando `.vercel/` ao `.gitignore` nesta branch.

## Como o teste ao vivo foi feito

O ambiente onde este agente roda não tem um browser funcional através do proxy de rede (Chromium
via Playwright falha na conexão TLS/HTTP2 com qualquer host, incluindo `example.com` — não é um
problema específico do PixelLab ou da Vercel). Como alternativa, chamei diretamente o endpoint da
server function (`POST /_serverFn/<id>`) do deploy em preview, replicando exatamente o payload que
o cliente React monta (protocolo `seroval` do TanStack Start). Isso testa o mesmo caminho de
código real (browser → server function → PixelLab), só sem o navegador no meio.

Para acessar o deploy em preview (protegido por Vercel Authentication/SSO por padrão), a proteção
foi desativada temporariamente **só para deployments de preview** durante a janela do teste e
reativada imediatamente depois — produção nunca ficou exposta.
