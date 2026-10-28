// ==UserScript==
// @name         Dilatando: marcar TROPI automáticamente
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Al marcar "Marcar como Dilatando" se marca también TROPI.
// @author       Tu Nombre
// @match        https://mplus.rahhal.com/mplus/app/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  // ============================================
  // CONTROL DE ACCESO
  // ============================================
const IDS_PERMITIDOS = new Set([31, 26]);

  function getUsuario() {
    const k = "!dyCqDqJvn-wK0#e";
    const raw = localStorage.getItem("mplus-data");
    if (!raw) return null;

    try {
      const dec = String.fromCharCode(
        ...raw.match(/.{1,2}/g).map((h, i) =>
          parseInt(h, 16) ^ (k.charCodeAt(i % k.length) % 255)
        )
      );
      return JSON.parse(dec).trader ?? null;
    } catch {
      return null;
    }
  }

  const usuario = getUsuario();
  if (!usuario || !IDS_PERMITIDOS.has(Number(usuario.id))) return;
  //document.title += " ✓";
  $('app-footer h5').first().append(' ✓');

  // ============================================
  // CONFIGURACIÓN
  // ============================================
  const ORIGEN = "#dashboard-comment #dil-1";   // "Marcar como Dilatando"
  const DESTINO = "#dashboard-comment #dil-2";  // TROPI
  const DESMARCAR_TAMBIEN = false;              // true: al desmarcar dil-1 se desmarca dil-2

  // ============================================
  // Lógica
  // ============================================
  document.addEventListener("change", (e) => {
    if (!e.target.matches(ORIGEN)) return;

    const destino = document.querySelector(DESTINO);
    if (!destino) return;

    if (e.target.checked && !destino.checked) {
      destino.click(); // click real para que se ejecute la lógica de la app
    } else if (!e.target.checked && DESMARCAR_TAMBIEN && destino.checked) {
      destino.click();
    }
  });
})();
