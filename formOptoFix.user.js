// ==UserScript==
// @name         Estilos modal optometría
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Al clicar en el header del modal "Añadir / Modificar campos - Optometría", aplica tamaño y posición establecidos.
// @author       Tu Nombre
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

  // ============================================
  // CONFIGURACIÓN
  // ============================================
  const HEADER = "#edit-form-optometry .w-header"; // header del modal (id estable)
  const ALTERNAR = false; // true: cada clic alterna entre tus estilos y los originales

  const ESTILOS = {
    width: "935px",
    height: "840px",
    left: "1176px",
    top: "135px",
  };

  // ============================================
  // Lógica
  // ============================================
  const originales = new WeakMap(); // estilo original de cada ventana

  function aplicar(ventana) {
    if (!originales.has(ventana)) {
      const guardado = {};
      for (const prop of Object.keys(ESTILOS)) {
        guardado[prop] = ventana.style.getPropertyValue(prop);
      }
      originales.set(ventana, { original: guardado, aplicado: false });
    }

    const estado = originales.get(ventana);

    if (ALTERNAR && estado.aplicado) {
      for (const [prop, valor] of Object.entries(estado.original)) {
        valor
          ? ventana.style.setProperty(prop, valor)
          : ventana.style.removeProperty(prop);
      }
      estado.aplicado = false;
      return;
    }

    // "important" para ganar a los estilos inline que pone la app
    for (const [prop, valor] of Object.entries(ESTILOS)) {
      ventana.style.setProperty(prop, valor, "important");
    }
    estado.aplicado = true;
  }

  // Delegación en document: funciona aunque la ventana se cree y destruya cada vez
  document.addEventListener("click", (e) => {
    const header = e.target.closest(HEADER);
    if (!header) return;

    // window_N cambia, así que subimos hasta la ventana desde el header
    const ventana = header.closest(".window");
    if (ventana) aplicar(ventana);
  });
})();
