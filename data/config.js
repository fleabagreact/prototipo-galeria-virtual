// Edite este arquivo para adaptar a galeria a qualquer tema.
window.GALERIA_CONFIG = {
  titulo: "Galeria Virtual",
  subtitulo: "Título do seu tema",
  descricao: "Descreva aqui o tema, o objetivo e o público da exposição.",
  rodape: "Créditos, referências ou aviso de licenças.",
  tema: "escuro",           // "escuro" | "claro" (o visitante pode alternar)
  filtroImagem: "nenhum",   // "nenhum" | "p&b" (só nas miniaturas; o visualizador mostra o original)
  permitirUpload: true,     // false = galeria somente leitura
  rotulos: { item: "item", itens: "itens" },
  categorias: [
    { id: "cat-a", nome: "Categoria A", texto: "Texto de apresentação da categoria A." },
    { id: "cat-b", nome: "Categoria B", texto: "Texto de apresentação da categoria B." },
    { id: "cat-c", nome: "Categoria C", texto: "Texto de apresentação da categoria C." }
  ],
  tipos: ["Imagem", "Documento", "Mapa", "Fotografia", "Outro"]
};
