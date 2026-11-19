(function (G) {
  const E = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  G.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => E[c]);
  G.$ = (s, r = document) => r.querySelector(s);
  G.toast = (msg, detail) => {
    const t = document.createElement('div'), p = document.createElement('p');
    t.className = 'toast'; p.textContent = msg; t.append(p);
    if (detail) { const s = document.createElement('span'); s.textContent = detail; t.append(s); }
    G.$('#toasts').append(t); setTimeout(() => t.remove(), 3800);
  };
  // Redimensiona e recomprime a imagem (também remove metadados EXIF).
  G.resize = async (file, max, q = 0.86) => {
    const b = await createImageBitmap(file), k = Math.min(1, max / Math.max(b.width, b.height));
    const c = document.createElement('canvas'); c.width = Math.round(b.width * k); c.height = Math.round(b.height * k);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(b, 0, 0, c.width, c.height);
    if (b.close) b.close();
    return new Promise((ok, no) => c.toBlob(r => r ? ok(r) : no(new Error('toBlob')), 'image/jpeg', q));
  };
  G.b64 = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
  G.unb64 = u => { const [h, d] = u.split(','), m = h.match(/:(.*?);/)[1]; return new Blob([Uint8Array.from(atob(d), c => c.charCodeAt(0))], { type: m }); };
})(window.G = window.G || {});
