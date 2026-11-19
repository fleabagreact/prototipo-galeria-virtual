(function (G) {
  'use strict';
  const C = window.GALERIA_CONFIG || {}, { $, esc, toast } = G;
  const R = Object.assign({ item: 'item', itens: 'itens' }, C.rotulos);
  const cats = C.categorias || [], tipos = C.tipos || [];
  const F = ['titulo', 'descricao', 'autor', 'data', 'tipo', 'categoria', 'local', 'licenca', 'fonte', 'tags'];
  const root = document.documentElement, V = $('#viewer'), D = $('#form'), f = $('#f');
  let items = [], list = [], q = '', cat = '', ord = 'curadoria', cur = -1, queue = [], editing = null;

  const rec = ({ url, thumb, seed, ...r }) => r;
  const nome = id => (cats.find(c => c.id === id) || {}).nome || '';
  const ini = i => esc([...String(i.titulo || '?')][0]);
  const link = u => /^https?:\/\//i.test(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a>` : esc(u);
  const opt = (v, t) => `<option value="${esc(v)}">${esc(t)}</option>`;
  const txt = (id, v) => { const e = $(id); e.textContent = v || ''; e.hidden = !v; };
  const home = () => location.pathname + location.search;

  async function load() {
    items.forEach(i => { if (!i.seed) { URL.revokeObjectURL(i.url); URL.revokeObjectURL(i.thumb); } });
    const seeds = (window.GALERIA_ACERVO || []).map((i, n) => ({ ...i, seed: true, ordem: n, criado: 0, url: i.imagem || '', thumb: i.miniatura || i.imagem || '' }));
    const mine = (await G.store.all()).map(i => ({ ...i, url: URL.createObjectURL(i.blob), thumb: URL.createObjectURL(i.miniatura) }));
    items = [...seeds, ...mine];
  }

  function view() {
    const t = q.toLowerCase();
    list = items.filter(i => (!cat || i.categoria === cat) &&
      (!t || [i.titulo, i.descricao, i.autor, i.data, i.tipo, i.local, i.fonte, nome(i.categoria), [].concat(i.tags || []).join(' ')].join(' ').toLowerCase().includes(t)));
    list.sort(ord === 'titulo' ? (a, b) => String(a.titulo).localeCompare(String(b.titulo), 'pt-BR')
      : (a, b) => (!!b.seed - !!a.seed) || (a.seed ? a.ordem - b.ordem : b.criado - a.criado));
  }

  function render() {
    view();
    $('#chips').innerHTML = cats.length ? [{ id: '', nome: 'Todas' }, ...cats].map(c =>
      `<button class="chip" type="button" aria-pressed="${c.id === cat}" data-c="${esc(c.id)}">${esc(c.nome)}</button>`).join('') : '';
    txt('#catText', (cats.find(c => c.id === cat) || {}).texto);
    $('#gallery').innerHTML = list.map((i, n) =>
      `<article class="card" tabindex="0" role="button" data-n="${n}" aria-label="${esc(i.titulo)}">
        <div class="img">${i.thumb ? `<img src="${esc(i.thumb)}" alt="${esc(i.titulo)}" loading="lazy">` : `<div class="ph">${ini(i)}</div>`}</div>
        <div class="info"><h3>${esc(i.titulo)}</h3><small>${esc([i.autor, i.data].filter(Boolean).join(', '))}</small></div></article>`).join('');
    const e = $('#empty'); e.hidden = !!list.length;
    e.textContent = items.length ? 'Nenhum resultado. Ajuste a busca ou a categoria.' : 'A galeria está vazia. Adicione imagens para começar.';
    $('#count').textContent = `${list.length} ${list.length === 1 ? R.item : R.itens}` + (list.length !== items.length ? ` de ${items.length}` : '');
  }

  function open(n) {
    const i = list[n]; if (!i) return; cur = n;
    $('#vImg').innerHTML = i.url ? `<img src="${esc(i.url)}" alt="${esc(i.titulo)}">` : `<div class="ph">${ini(i)}</div>`;
    const m = [['Autoria', i.autor], ['Data', i.data], ['Tipo', i.tipo], ['Local', i.local], ['Categoria', nome(i.categoria)], ['Licença', i.licenca]]
      .filter(x => x[1]).map(x => `<dt>${x[0]}</dt><dd>${esc(x[1])}</dd>`);
    if (i.fonte) m.push(`<dt>Fonte</dt><dd>${link(i.fonte)}</dd>`);
    $('#vInfo').innerHTML = `<h2 id="vTitle">${esc(i.titulo)}</h2><p>${esc(i.descricao)}</p><dl>${m.join('')}</dl>` +
      `<div class="tags">${[].concat(i.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>`;
    $('#edit').hidden = $('#del').hidden = !!i.seed;
    $('#prev').disabled = n === 0; $('#next').disabled = n === list.length - 1;
    if (!V.open) V.showModal();
    history.replaceState(null, '', '#/item/' + encodeURIComponent(i.id));
  }

  function ask(x) {
    editing = x; f.reset();
    const d = x.file ? {} : x;
    F.forEach(k => { f.elements[k].value = k === 'tags' ? [].concat(d.tags || []).join(', ') : (d[k] || ''); });
    $('#fTitle').textContent = x.file ? `Novo ${R.item}: ${x.file.name}` : `Editar ${R.item}`;
    D.showModal();
  }

  function addFiles(fl) {
    if (C.permitirUpload === false || D.open || V.open || !fl.length) return;
    const imgs = [...fl].filter(x => x.type.startsWith('image/'));
    if (!imgs.length) return toast('Nenhuma imagem selecionada.', 'Escolha arquivos PNG, JPG, WEBP ou GIF.');
    queue = imgs.map(file => ({ file })); ask(queue.shift());
  }

  f.onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f)); d.titulo = d.titulo.trim(); if (!d.titulo) return;
    d.tags = d.tags.split(',').map(s => s.trim()).filter(Boolean);
    try {
      let i = editing;
      if (i.file) {
        const blob = await G.resize(i.file, 1800), miniatura = await G.resize(i.file, 480);
        i = { id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), criado: Date.now(), blob, miniatura, url: URL.createObjectURL(blob), thumb: URL.createObjectURL(miniatura) };
      }
      Object.assign(i, d); await G.store.put(rec(i));
      if (!items.includes(i)) items.push(i);
    } catch (err) { console.error(err); return toast('Não foi possível salvar.', 'Confira se o arquivo é uma imagem válida e se o navegador permite armazenamento local.'); }
    D.close(); toast('Salvo.');
    if (queue.length) ask(queue.shift()); else render();
  };
  D.oncancel = () => { queue = []; };
  $('#fCancel').onclick = () => { queue = []; D.close(); };

  $('#del').onclick = async () => {
    const i = list[cur]; if (!i || i.seed || !confirm(`Excluir "${i.titulo}"?`)) return;
    await G.store.del(i.id); URL.revokeObjectURL(i.url); URL.revokeObjectURL(i.thumb);
    items = items.filter(x => x !== i); V.close(); render(); toast('Removido da galeria.');
  };
  $('#edit').onclick = () => { const i = list[cur]; V.close(); ask(i); };
  $('#prev').onclick = () => open(cur - 1);
  $('#next').onclick = () => open(cur + 1);
  $('#vClose').onclick = () => V.close();
  V.onclose = () => history.replaceState(null, '', home());
  V.onclick = e => { if (e.target === V) V.close(); };
  V.onkeydown = e => { if (e.key === 'ArrowLeft' && cur > 0) open(cur - 1); if (e.key === 'ArrowRight' && cur < list.length - 1) open(cur + 1); };

  $('#gallery').onclick = e => { const c = e.target.closest('.card'); if (c) open(+c.dataset.n); };
  $('#gallery').onkeydown = e => { const c = e.target.closest('.card'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(+c.dataset.n); } };
  $('#chips').onclick = e => {
    const b = e.target.closest('button'); if (!b) return; cat = b.dataset.c;
    history.replaceState(null, '', cat ? '#/cat/' + encodeURIComponent(cat) : home()); render();
  };
  $('#busca').oninput = e => { q = e.target.value.trim(); render(); };
  $('#ordem').onchange = e => { ord = e.target.value; render(); };

  $('#add').onclick = () => $('#fileImg').click();
  $('#fileImg').onchange = e => { const fl = [...e.target.files]; e.target.value = ''; addFiles(fl); };
  ['dragover', 'drop'].forEach(t => addEventListener(t, e => {
    e.preventDefault(); if (t === 'drop' && e.dataTransfer) addFiles(e.dataTransfer.files);
  }));

  $('#exp').onclick = async () => {
    const mine = items.filter(i => !i.seed);
    if (!mine.length) return toast('Nada para exportar.', `Só ${R.itens} adicionados por você entram no backup.`);
    const out = await Promise.all(mine.map(async i => ({ ...rec(i), blob: await G.b64(i.blob), miniatura: await G.b64(i.miniatura) })));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, itens: out })], { type: 'application/json' }));
    a.download = 'galeria-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('#imp').onclick = () => $('#fileJson').click();
  $('#fileJson').onchange = async e => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    try {
      let n = 0;
      for (const r of (JSON.parse(await file.text()).itens || [])) {
        if (!r || !r.id || typeof r.titulo !== 'string') continue;
        r.id = String(r.id); r.blob = G.unb64(r.blob); r.miniatura = G.unb64(r.miniatura);
        r.tags = Array.isArray(r.tags) ? r.tags : []; r.criado = +r.criado || Date.now(); delete r.seed;
        await G.store.put(r); n++;
      }
      await load(); render(); toast(`${n} importado(s).`);
    } catch (err) { console.error(err); toast('Backup inválido.', 'Use um arquivo gerado por "Exportar backup".'); }
  };

  const tema = t => { root.dataset.tema = t; $('#tema').textContent = t === 'claro' ? 'Tema escuro' : 'Tema claro'; };
  $('#tema').onclick = () => {
    const t = root.dataset.tema === 'claro' ? 'escuro' : 'claro'; tema(t);
    try { localStorage.setItem('galeria-tema', t); } catch (_) {}
  };

  function route() {
    let k, id;
    try { [, k, id] = location.hash.slice(1).split('/').map(decodeURIComponent); } catch (_) { return; }
    if (k === 'cat' && cats.some(c => c.id === id)) { cat = id; render(); }
    if (k === 'item') {
      const i = items.find(x => x.id === id);
      if (i) { if (!list.includes(i)) { q = ''; cat = ''; $('#busca').value = ''; render(); } open(list.indexOf(i)); }
    }
  }
  addEventListener('hashchange', route);

  (async function init() {
    let t = C.tema || 'escuro'; try { t = localStorage.getItem('galeria-tema') || t; } catch (_) {}
    tema(t);
    if (C.filtroImagem === 'p&b') root.classList.add('pb');
    document.title = C.titulo || 'Galeria Virtual';
    txt('#titulo', C.titulo || 'Galeria Virtual'); txt('#subtitulo', C.subtitulo); txt('#descricao', C.descricao); txt('#rodape', C.rodape);
    $('#acoes').hidden = C.permitirUpload === false;
    $('#selTipo').innerHTML = opt('', '—') + tipos.map(x => opt(x, x)).join(''); $('#tipoLabel').hidden = !tipos.length;
    $('#selCat').innerHTML = opt('', '—') + cats.map(c => opt(c.id, c.nome)).join(''); $('#catLabel').hidden = !cats.length;
    await load(); render(); route();
  })();
})(window.G = window.G || {});
