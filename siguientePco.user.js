// ==UserScript==
// @name         Siguiente pestaña PCO con espacio
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Con la ventana "Añadir / Modificar campos" (Pruebas Comp.) abierta, el espacio marca la siguiente pestaña: OCT, ORBS, PENTA, RET, SPEC, IOL, CV, ANGIO, KERAT (Shift+Espacio, la anterior).
// @author       rhhl
// @match        https://mplus.rahhal.com/mplus/app/dashboard
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const IDS_PERMITIDOS = new Set([31]);

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
  if (window.$) $("app-footer h5").first().append(" ✓");

  const RUTA = "/mplus/app/account";
  const enRuta = () => location.pathname.replace(/\/+$/, "") === RUTA;

  const TECLA = " ";        // tecla para avanzar (" " = espacio)
  const CIRCULAR = true;    // true: del último pasa al primero
  // Solo los inputs de las pestañas dentro de la ventana de pruebas complementaria
  const CONTENEDOR = "#edit-form-pco";
  const SELECTOR = "#edit-form-pco #tabButtons input.tgl.chbg";
  // Botón que abre la ventana de pruebas complementarias
  const BOTON_PCO = "button.btn-action-pco";

  // Visible = ocupa espacio en pantalla (funciona también con position: fixed)
  const esVisible = (el) => !!el && el.getClientRects().length > 0;

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== TECLA) return;
      if (!enRuta()) return;

      // No interferir si el usuario está escribiendo
      const el = document.activeElement;
      if (el && (el.matches("input:not(.tgl), textarea, select") || el.isContentEditable)) return;

      const inputs = [...document.querySelectorAll(SELECTOR)];
      const ventanaAbierta = inputs.length > 0 && esVisible(inputs[0].closest(CONTENEDOR));

      // Si la ventana de pruebas complementarias no está abierta: abrirla con el botón PCO
      if (!ventanaAbierta) {
        const boton = document.querySelector(BOTON_PCO);
        if (!boton || !esVisible(boton) || boton.disabled) return;
        e.preventDefault();
        if (!e.repeat) boton.click(); // evita abrir varias veces si se deja pulsado
        return;
      }

      e.preventDefault();

      const actual = inputs.findIndex((i) => i.checked);
      const paso = e.shiftKey ? -1 : 1;

      let siguiente = actual === -1 ? (paso === 1 ? 0 : inputs.length - 1) : actual + paso;
      if (siguiente >= inputs.length) siguiente = CIRCULAR ? 0 : inputs.length - 1;
      if (siguiente < 0) siguiente = CIRCULAR ? inputs.length - 1 : 0;
      if (siguiente === actual) return;

      inputs[siguiente].click();
    },
    true
  );
})();
