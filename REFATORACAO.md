# Refatoração — Wizard Duel

## Problemas encontrados

- Variáveis com nomes sem significado (`pg`, `d`, `tmp`, `c`, `a`, `obj`, `pw`, `mg`, `df`, `dmg`, `x`, `y`, `z`)
- Números mágicos espalhados pelo código sem contexto
- Código duplicado entre as rotas `/api/pack` e `/api/cpu-deck`
- Funções com múltiplas responsabilidades (fetch, filtro, cálculo e embaralhamento na mesma função)
- Uso de `var` ao invés de `const`/`let`
- Concatenação de strings ao invés de template literals
- Uso de `==` ao invés de `===`
- `console.log` para tratamento de erros
- Todo o CSS e JS do front-end embutidos no `index.html`

---

## Etapa 1 — Renomeação de variáveis

### Decisão
Renomeei todas as variáveis com nomes sem significado para nomes que expressem claramente sua intenção, em português.

### Alterações
- `pg` → `numeroPagina`
- `d`, `api`, `espera` → `resposta`, `dados`
- `tmp` → `personagens` / `feiticos`
- `c` → `personagem`, `s` → `feitico`
- `a` → `atributos`, `obj` → `carta`
- `pw` → `poder`, `mg` → `magia`, `df` → `defesa`, `dmg` → `dano`
- `x`, `y`, `z` → `indice`, `indiceAleatorio`, `temporario`

---

## Etapa 2 — Extração de constantes

### Decisão
Criei o arquivo `constants.js` na raiz do projeto e movi todos os números mágicos para ele, nomeados em camelCase e em português para deixar claro o que cada valor representa.

### Alterações
- Criado `constants.js` com todas as constantes da aplicação
- `index.js` passou a importar as constantes via `require('./constants')`
- Números como `90`, `85`, `100`, `4`, `2`, `20` foram substituídos por nomes como `poderGryffindor`, `tamanhoPagina`, `cartasNoPack`, etc.

---

## Etapa 3 — Eliminação de código duplicado

### Decisão
O cálculo de atributos (`poder`, `magia`, `defesa`) e a lógica de embaralhamento estavam duplicados entre as rotas `/api/pack` e `/api/cpu-deck`. Extraí essas lógicas para funções reutilizáveis no arquivo `services/statsCalculator.js`.

### Alterações
- Criado `services/statsCalculator.js` com as funções `calcularAtributos`, `construirPersonagem` e `embaralhar`
- Os blocos duplicados nas duas rotas foram substituídos por chamadas a essas funções
- Corrigido erro `no-param-reassign`: `embaralhar` agora trabalha em uma cópia do array
- Substituído `continue` por condicionais invertidas (`no-continue`)
- Substituído `console.log` por `console.error` nos blocos `catch` (`no-console`)

---

## Etapa 4 — Separação de responsabilidades

### Decisão
Reorganizei o projeto separando cada responsabilidade em seu próprio arquivo, seguindo a estrutura definida no enunciado.

### Alterações no back-end
- `services/potterApi.js`: centraliza todas as chamadas à PotterDB API (`buscarPersonagens`, `buscarFeiticos`)
- `routes/characters.js`: rota `/api/pack`
- `routes/spells.js`: rota `/api/spells`
- `routes/game.js`: rota `/api/cpu-deck`
- `index.js`: passou a apenas inicializar o servidor e registrar as rotas

### Alterações no front-end
- `public/css/style.css`: estilos extraídos do `index.html`
- `public/js/render.js`: funções de renderização (`renderCard`, `renderDeckBadges`, `renderSpells`, `renderPack`)
- `public/js/api.js`: chamadas ao back-end (`fetchPack`, `fetchSpells`, `fetchCpuDeck`)
- `public/js/game.js`: estado global e lógica do jogo (`loadGame`, `startBattle`, `castSpell`, `endGame`, etc.)
- `public/index.html`: passou a conter apenas a estrutura HTML, referenciando os arquivos externos
