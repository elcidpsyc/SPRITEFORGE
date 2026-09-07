# FASE 1 — Investigação do MCP do PixelLab

**Data:** 2026-09-07
**Timebox:** uma tentativa (Tentativa A). A Tentativa B (stdio) **não foi executada**, porque a
Tentativa A conectou — ver veredito.

---

## Veredito

> **MCP é viável neste setup: SIM — condicionado a uma coisa só.**
>
> O transporte HTTP conecta (`√ Connected`), a descoberta de tools funciona (84 tools), e a
> expansão de `${PIXELLAB_API_KEY}` no bloco `headers` **funciona** nesta versão do Claude Code
> (o bug conhecido não está presente aqui — comprovado, ver §3).
>
> O único bloqueio real é que **`PIXELLAB_API_KEY` não existe no ambiente onde o Claude Code
> roda**. Ela está configurada na Vercel (Production/Preview/Development), que é um ambiente
> diferente. Sem ela, toda chamada de tool volta `401`.

**O que falta, e é resolvível sem terminal:** adicionar `PIXELLAB_API_KEY` às *environment
variables* do ambiente do Claude Code on the web (mesma coisa que já foi feita na Vercel, só que
no outro painel). É ação de UI, não de CLI.

**Ressalva secundária:** um `.mcp.json` de escopo de projeto exige aprovação de confiança
interativa por sessão (`⏸ Pending approval`). Ver §5.

---

## 1. `PIXELLAB_API_KEY` existe no ambiente do Claude Code?

```
$ if [ -n "${PIXELLAB_API_KEY:-}" ]; then echo "DEFINIDA"; else echo "NAO DEFINIDA"; fi
NAO DEFINIDA

$ env | grep -i -o '^[A-Z_]*PIXEL[A-Z_]*'
nenhuma
```

**Não.** Nenhuma variável com `PIXEL` no nome está definida. O valor nunca foi impresso, lido ou
gravado em lugar nenhum durante esta investigação.

O próprio Claude Code detecta isso e avisa:

```
[Contains warnings] Project config (shared via .mcp.json)
Location: /home/user/SPRITEFORGE/.mcp.json
 └ [Warning] [pixellab] mcpServers.pixellab: Missing environment variables: PIXELLAB_API_KEY
```

---

## 2. Tentativa A — HTTP

`.mcp.json` na raiz, exatamente como especificado:

```json
{
  "mcpServers": {
    "pixellab": {
      "type": "http",
      "url": "https://api.pixellab.ai/mcp",
      "headers": { "Authorization": "Bearer ${PIXELLAB_API_KEY}" }
    }
  }
}
```

### Saída literal do health check

`/mcp` é um comando interativo do CLI e esta sessão é headless — não dá para digitá-lo. O
equivalente exato é `claude mcp list`, que roda o mesmo health check contra os mesmos servidores
configurados. Saída literal:

**(a) com o `.mcp.json` de escopo de projeto, sem a variável definida:**

```
Checking MCP server health…

pixellab: https://api.pixellab.ai/mcp (HTTP) - ⏸ Pending approval (run `claude` to approve)

MCP config diagnostics ‼

[Contains warnings] Project config (shared via .mcp.json)
Location: /home/user/SPRITEFORGE/.mcp.json
 └ [Warning] [pixellab] mcpServers.pixellab: Missing environment variables: PIXELLAB_API_KEY
```

**(b) mesmo servidor, registrado em escopo local (que dispensa a aprovação interativa), com a
variável definida com um valor-sentinela falso:**

```
$ claude mcp add --scope local --transport http pixellab-probe \
    https://api.pixellab.ai/mcp -H 'Authorization: Bearer ${PIXELLAB_API_KEY}'
Added HTTP MCP server pixellab-probe with URL: https://api.pixellab.ai/mcp to local config
Headers: {
  "Authorization": "[REDACTED]"
}

$ claude mcp list
Checking MCP server health…

pixellab-probe: https://api.pixellab.ai/mcp (HTTP) - √ Connected
```

**Conectado.** Transporte HTTP, handshake e descoberta funcionam de ponta a ponta pelo próprio
Claude Code.

### Confirmação por baixo do CLI

O servidor foi sondado direto com `curl` para caracterizar o comportamento de auth:

| Chamada | Auth enviada | Resultado |
|---|---|---|
| `initialize` | nenhuma | `200` — `serverInfo: {"name":"PixelLab MCP Server","version":"0.2.0"}` |
| `tools/list` | nenhuma | `200` — **84 tools** listadas |
| `tools/call get_balance` | nenhuma | `401: Missing Authorization header` |
| `tools/call get_balance` | `Bearer ${PIXELLAB_API_KEY}` literal | `401: Invalid API token` |

Ou seja: **descoberta é aberta, execução é autenticada.** Um `/mcp` mostrando "conectado" não
prova que as tools vão funcionar — só a primeira chamada real prova.

---

## 3. O bug de não-expansão de `${VAR}` em `headers`: **não existe nesta versão**

O aviso do prompt era que `${VAR}` no bloco `headers` de servidores HTTP não seria expandido,
chegando como string literal ao servidor e retornando 401. Isso foi testado diretamente, **sem
usar o token real**: subi um servidor HTTP local descartável que só registra o header
`Authorization` recebido, apontei um servidor MCP para ele com
`"Authorization": "Bearer ${PIXELLAB_API_KEY}"` e defini a variável com um valor-sentinela falso
(`SENTINELA-FALSA-XYZ`).

O que o servidor recebeu:

```
AUTH_HEADER_RECEIVED=[Bearer SENTINELA-FALSA-XYZ]
AUTH_HEADER_RECEIVED=[Bearer SENTINELA-FALSA-XYZ]
AUTH_HEADER_RECEIVED=[Bearer SENTINELA-FALSA-XYZ]
AUTH_HEADER_RECEIVED=[Bearer SENTINELA-FALSA-XYZ]
```

**A expansão funciona.** O header chegou com o valor da variável, não com a string `${...}`.
Portanto o 401 que veríamos aqui não é o bug — é simplesmente a variável não existir neste
ambiente. Nada foi hardcodado no arquivo; o token real nunca entrou em jogo.

---

## 4. Tentativa B — stdio: não executada

O prompt define a Tentativa B como condicional ("só se A falhar"). A Tentativa A conectou, e a
causa do 401 foi isolada e explicada (variável ausente, não bug de expansão). Rodar a B não
mudaria o veredito: ela depende da **mesma** `PIXELLAB_API_KEY` ausente, via `env` em vez de
`headers`. Timebox respeitado — uma tentativa, sem insistir.

Se no futuro a variável for provisionada e o escopo de projeto continuar incômodo, a B vira uma
alternativa legítima; nada nesta investigação a desqualifica.

---

## 5. Ressalva: aprovação de escopo de projeto

Um `.mcp.json` versionado no repositório é config de **escopo de projeto**. O Claude Code não
confia nele automaticamente — ele fica `⏸ Pending approval` até alguém aprovar interativamente
(é uma proteção contra um repositório clonado apontar seu agente para um servidor arbitrário).

Foi adicionado `.claude/settings.json` com `enabledMcpjsonServers: ["pixellab"]`, que é o
mecanismo declarativo documentado para pré-aprovar. **Ele não suprimiu o prompt neste container
headless** — a aprovação de confiança da pasta vem antes e é gravada em `~/.claude.json`, fora do
repositório e efêmera por container. Não tentei forçar essa flag: contornar um diálogo de
confiança programaticamente é exatamente o tipo de coisa que ele existe para impedir.

Consequência prática: numa sessão interativa (incluindo a web, no tablet) aparece um prompt de
aprovação a ser aceito uma vez por ambiente. Em sessões headless como esta, o caminho que
funciona é o escopo local (`claude mcp add --scope local`), que é o que foi usado para obter o
`√ Connected` acima.

---

## 6. O que a investigação rendeu de brinde: as 84 tools

A descoberta ser aberta significa que **o catálogo completo de tools do PixelLab foi obtido sem
gastar um único crédito e sem token**. Isso alimenta a FASE 2 diretamente. As relevantes para o
nosso pipeline:

| Necessidade da FASE 2 | Tool MCP correspondente |
|---|---|
| Personagem com N direções | `create_character`, `get_character`, `list_characters` |
| Animação | `animate_character`, `delete_animation` |
| Variantes/estados de um personagem | `create_character_state` |
| Rotação | coberto por `create_character` (URLs de rotação em `get_character`) |
| Inpainting | `inpaint_image` |
| Referência de estilo / style transfer | `image_to_pixelart`, `edit_image`, `edit_image_pixen` |
| Paleta / limpeza | `reduce_colors`, `correct_pixelart`, `unzoom_image` |
| Saldo de créditos | `get_balance` |
| Jobs assíncronos | `list_jobs`, `cancel_job` |
| Rascunho conceitual (aba 1, já integrado) | `create_image_pixflux` |

A FASE 2 continua sendo feita contra a **API REST**, que é o que a aplicação em produção usa.
Estes nomes servem como mapa e conferência cruzada.

---

## 7. Impacto no projeto: nenhum

O MCP não é bloqueante para nada. A aba "Gerador de Imagem" já valida contra a API REST
(FASE 0: PASS). O MCP seria conveniência para *este agente* gerar arte durante o desenvolvimento —
não é parte do produto. O pipeline segue pela REST sem prejuízo, exatamente como previsto.

---

## Arquivos desta fase

- `.mcp.json` — mantido (a Tentativa A conectou; o arquivo está correto e não contém segredo).
- `.claude/settings.json` — pré-aprovação declarativa do servidor `pixellab`.
- `docs/mcp_pixellab.md` — este relatório.

**Nenhum segredo foi impresso, commitado ou registrado em qualquer ponto.** O único valor de token
que passou pela rede nesta investigação foi a sentinela falsa `SENTINELA-FALSA-XYZ`.

---

## ADENDO (2026-09-07, mesma data) — o veredito mudou depois de o MCP aparecer na sessão

Depois de o relatório acima ser commitado, o servidor MCP do PixelLab **passou a aparecer nesta
sessão** com as 84 tools registradas. Testei com a chamada gratuita `get_balance`:

```
mcp__pixellab__get_balance  →  Error calling tool 'get_balance': 401: Invalid API token
```

Isso permite fechar o diagnóstico, porque os três modos de falha do servidor são
**distinguíveis** — verificado com curl:

| Header enviado | Resposta do PixelLab |
|---|---|
| nenhum | `401: Missing Authorization header` |
| `Bearer ` (variável expandida para vazio) | `401: Missing Authorization header` |
| `Bearer ${PIXELLAB_API_KEY}` **literal** | **`401: Invalid API token`** |

A tool MCP devolveu **`Invalid API token`** — a assinatura do header **literal**. Como
`PIXELLAB_API_KEY` não existe neste ambiente, o valor enviado só pode ter sido a string
`${PIXELLAB_API_KEY}` sem expandir.

### Correção ao §3

O relatório acima está certo sobre o **CLI** (`claude mcp add`/`claude mcp list`): ali a expansão
funciona, provado com a sentinela. Mas o cliente MCP que executa **as minhas tools** neste
ambiente remoto é outro — e **nele a expansão não acontece**. Ou seja: **o bug que você avisou é
real, só que na camada do harness remoto, não na do CLI.**

Alternativa menos provável, registrada por honestidade: o harness poderia ter um token próprio
que por acaso é inválido/expirado. Não dá para distinguir os dois casos de dentro daqui sem ver o
header enviado. O que é certo é que **não é** "header ausente" nem "variável vazia" — esses dois
dão outra mensagem.

### Veredito revisado

> **MCP conecta e descobre, mas não executa.** O transporte está de pé e as 84 tools estão
> registradas; toda chamada que gasta ou lê dados da conta devolve 401. Continua **não
> bloqueante**: o pipeline vai pela REST v2, que a FASE 0 provou funcionar com a chave da Vercel.

O que destrava, sem terminal: provisionar `PIXELLAB_API_KEY` no ambiente do Claude Code on the
web. Se mesmo assim o 401 persistir, a causa é a não-expansão no harness, e aí a saída é a
Tentativa B (stdio, bloco `env`) — que fica pendente para esse cenário.
