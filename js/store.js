// Persistência local (IndexedDB). Guarda apenas itens adicionados pelo visitante.
(function (G) {
  const S = 'itens'; let db;
  const open = () => db || (db = new Promise((ok, no) => {
    const r = indexedDB.open('galeria-virtual', 1);
    r.onupgradeneeded = () => r.result.createObjectStore(S, { keyPath: 'id' });
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
  }));
  const tx = async (mode, fn) => {
    const d = await open();
    return new Promise((ok, no) => {
      const t = d.transaction(S, mode), rq = fn(t.objectStore(S));
      t.oncomplete = () => ok(rq && rq.result); t.onerror = () => no(t.error); t.onabort = () => no(t.error);
    });
  };
  G.store = {
    all: () => tx('readonly', s => s.getAll()).catch(() => []),
    put: i => tx('readwrite', s => s.put(i)),
    del: id => tx('readwrite', s => s.delete(id))
  };
})(window.G = window.G || {});
