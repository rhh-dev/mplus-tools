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

  // ============================================
  // CONFIGURACIÓN
  // ============================================
  const HEADER = "#edit-form-optometry .w-header"; // header del modal (id estable)
  const ALTERNAR = false; // true: cada clic alterna entre tus estilos y los originales
  const MARGEN = 0;       // píxeles de separación con el borde derecho e inferior

  // Tamaño y opacidad fijos; left/top se calculan al aplicar
  const ESTILOS_FIJOS = {
    width: "935px",
    height: "840px",
    opacity: "0.9",
  };

  // ============================================
  // Lógica
  // ============================================
  const originales = new WeakMap(); // estilo original de cada ventana

  // Posición pegada abajo a la derecha según el tamaño actual del navegador
  function calcularPosicion() {
    const ancho = parseInt(ESTILOS_FIJOS.width, 10);
    const alto = parseInt(ESTILOS_FIJOS.height, 10);
    return {
      left: Math.max(0, document.documentElement.clientWidth - ancho - MARGEN) + "px",
      top: Math.max(0, document.documentElement.clientHeight - alto - MARGEN) + "px",
    };
  }

  function aplicar(ventana) {
    const ESTILOS = { ...ESTILOS_FIJOS, ...calcularPosicion() };

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
