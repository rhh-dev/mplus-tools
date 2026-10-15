const USUARIOS_PERMITIDOS = new Set([31, 8, 15]); // ids con acceso

function getUsuario() {
  const k = "!dyCqDqJvn-wK0#e";
  const raw = localStorage.getItem("mplus-data");
  if (!raw) return null;
  try {
    const dec = String.fromCharCode(
      ...raw.match(/.{1,2}/g).map((h, i) => parseInt(h, 16) ^ k.charCodeAt(i % k.length) % 255)
    );
    return JSON.parse(dec).trader ?? null;
  } catch {
    return null;
  }
}

const usuario = getUsuario();
if (!usuario || !USUARIOS_PERMITIDOS.has(Number(usuario.id))) return;
document.title += " ✓";
