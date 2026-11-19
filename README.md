# Galeria Virtual

Galeria de imagens e fontes, neutra quanto ao tema, em HTML/CSS/JS puros (sem build, sem dependências).
Abre com duplo clique em `index.html` ou pode ser hospedada em qualquer servidor estático (ex.: GitHub Pages).

## Estrutura
```
index.html        página única
css/styles.css    visual (variáveis de cor no topo; temas escuro e claro)
js/util.js        escape de HTML, toasts, redimensionamento de imagem
js/store.js       persistência local (IndexedDB)
js/app.js         interface: filtros, visualizador, formulário, backup, rotas
data/config.js    título, textos, categorias, tipos, opções   <- edite para mudar o tema
data/acervo.js    itens fixos da exposição                    <- edite para montar o acervo
assets/img/       imagens dos itens fixos
```

## Usar com outro tema
1. Edite `data/config.js` (título, descrição, categorias, tipos).
2. Coloque as imagens em `assets/img/` e liste cada item em `data/acervo.js`.
3. `permitirUpload: false` transforma a galeria em exposição somente leitura.

## Ficha de cada item
`titulo`, `descricao`, `autor`, `data`, `tipo`, `local`, `fonte`, `licenca`, `categoria`, `tags`, `imagem`.
Registre sempre autoria, fonte e licença das imagens.

## Notas
- Itens adicionados pelo visitante ficam só no navegador dele; use **Exportar/Importar backup** para levar a outro computador.
- Links diretos: `#/item/ID` e `#/cat/ID`.
- Segurança: todo texto é escapado e há Content-Security-Policy no `index.html`.
- Ainda não incluso: zoom na imagem, linha do tempo, mapa, modo professor/aluno, PWA offline.
