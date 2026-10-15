// ==UserScript==
// @name         Siguiente estado con espacio
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Con la ventana "Modificar estado del paciente" abierta, el espacio marca el siguiente estado (Shift+Espacio, el anterior).
// @author       rhhl
// @match        https://mplus.rahhal.com/mplus/app/dashboard
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";
  function getUsuario() {
      const k = "!dyCqDqJvn-wK0#e";
      const raw = localStorage.getItem("mplus-data");
      if (!raw) return null;
      const dec = String.fromCharCode(...raw.match(/.{1,2}/g).map((h,i)=>parseInt(h,16)^k.charCodeAt(i%k.length)%255));
      return JSON.parse(dec).trader ?? null;
    };
    const usuario=getUsuario();
    if (usuario.id!=31)return;
    document.title+=' ✓';

  const TECLA = " ";        // tecla para avanzar (" " = espacio)
  const CIRCULAR = true;    // true: del último pasa al primero
  const SELECTOR = "#dashboard-status input.tgl.chbg";

  // Visible = ocupa espacio en pantalla (funciona también con position: fixed)
  const esVisible = (el) => !!el && el.getClientRects().length > 0;

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== TECLA) return;

      const inputs = [...document.querySelectorAll(SELECTOR)];
      if (!inputs.length) return;

      // Solo actúa si la ventana de estado está visible
      if (!esVisible(inputs[0].closest("#dashboard-status"))) return;

      // No interferir si el usuario está escribiendo
      const el = document.activeElement;
      if (el && (el.matches("input:not(.tgl), textarea, select") || el.isContentEditable)) return;

      e.preventDefault();

      const actual = inputs.findIndex((i) => i.checked);
      const paso = e.shiftKey ? -1 : 1;

      let siguiente = actual === -1 ? (paso === 1 ? 0 : inputs.length - 1) : actual + paso;
      if (siguiente >= inputs.length) siguiente = CIRCULAR ? 0 : inputs.length - 1;
      if (siguiente < 0) siguiente = CIRCULAR ? inputs.length - 1 : 0;
      if (siguiente === actual) return;

      inputs[siguiente].click();
    },
    true // captura: se ejecuta antes que los listeners de la app
  );
})();
