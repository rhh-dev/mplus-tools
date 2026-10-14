// ==UserScript==
// @name         autoExportOct_button
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Exporta automaticamente las capturas de oct
// @author       You
// @match        http://localhost:8082/IMAGEnet/*
// @match        http://192.168.50.212:8082/IMAGEnet/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=50.212
// @updateURL    https://raw.githubusercontent.com/atrDaw/tampermono/main/octauto.user.js
// @downloadURL  https://raw.githubusercontent.com/atrDaw/tampermono/main/octauto.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const EXPIRATION = new Date("2027-07-01T00:00:00");
  if (new Date() >= EXPIRATION) {
    console.warn("Script expired.");
    return;
  }

  const EXAM_PATH = "/IMAGEnet/Exam";
  const BUTTON_ID = "buttonAutoExport";
  const ICON_COLOR = "#e76c0c";

  function delay(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function simularDobleClick(elemento) {
    let eventoDobleClick = new MouseEvent("dblclick", {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: 1,
      clientX: 100,
      clientY: 100,
    });

    elemento.dispatchEvent(eventoDobleClick);
  }

  async function clickMacular(resultados) {
    for (let resultado of resultados) {
      if (
        resultado.textContent.includes("Radial") ||
        resultado.textContent.includes("Macula")
      ) {
        console.log(resultado + " es macular");
        await simularDobleClick(resultado);
        await delay(1000);
        document.querySelector("#buttonMultiScan_12").click();
        console.log("clico en multi12");
        await delay(500);
        document.querySelector("#buttonExport").click();
        console.log("clico en export");
        await delay(500);
        document.querySelector("#buttonExportScreenShot").click();
        console.log("clico en screenshot");
        await delay(500);
        document.querySelector("#buttonExport").click();
        console.log("clico en export");
        await delay(500);
        document.querySelector("#buttonExportFunduscolor").click();
        console.log("clico en color");
        await delay();
      } else {
        console.log(resultado + " no es macular");
      }
    }
  }

  async function clickPapilar(resultados) {
    let pap = false;

    resultados.forEach((resultado) => {
      if (resultado.textContent.includes("Disc")) {
        console.log("es papilar");
        resultado.click();
        pap = true;
      }
    });
    if (pap) {
      await delay();
      document.querySelector("#buttonOUView")?.click();
      await delay();
      document.querySelector("#buttonReport")?.click();
      await delay();
      document.querySelector("#buttonExport")?.click();
    } else {
      console.log("No hay papilar");
    }
  }

  async function clickMacPap(resultados) {
    await clickMacular(resultados);
    console.log("Terminé con clickMacular, ahora ejecuto clickPapilar.");
    await clickPapilar(resultados);
    console.log("Terminé con clickPapilar.");
  }

  async function ejecutar() {
    await delay(1000);
    let resultados = document.querySelectorAll("#thumbnailListSlide li");
    console.log(resultados);
    await clickMacPap(resultados);
  }


  let procesando = false;

  async function iniciarAutoExport() {
    if (procesando) {
      console.log("Ya hay una exportación en curso.");
      return;
    }

    const primerElemento = document.querySelector("#dataList ul li");
    if (!primerElemento) {
      console.log("No se encontró ningún elemento en #dataList ul li");
      return;
    }

    procesando = true;
    actualizarEstadoBoton(true);
    try {
      await simularDobleClick(primerElemento);
      console.log("clicado datalist ul li");
      await ejecutar();
    } catch (err) {
      console.error("Error durante la exportación automática:", err);
    } finally {
      procesando = false;
      actualizarEstadoBoton(false);
    }
  }

  function actualizarEstadoBoton(ocupado) {
    const boton = document.getElementById(BUTTON_ID);
    if (!boton) return;
    boton.classList.toggle("disabled", ocupado);
    boton.title = ocupado ? "Exportando..." : "Auto Export";
  }

  function crearBoton() {
      const boton = document.createElement("div");
      boton.id = BUTTON_ID;
      boton.className = "grayButton common";
      boton.title = "Auto Export";
      boton.style.cssText = `
        cursor: pointer;
        width: 47px;
        min-width: 24px;
        height: 33px;
        min-height: 24px;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      `;
      boton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="width:24px;height:24px;flex-shrink:0;display:block;"><polygon points="6,4 20,12 6,20" fill="${ICON_COLOR}"></polygon></svg>`;

      boton.addEventListener("click", (e) => {
          e.stopPropagation();
          iniciarAutoExport();
      });

      return boton;
  }

  function esPaginaExam() {
    return window.location.pathname.startsWith(EXAM_PATH);
  }

  function sincronizarBoton() {
    const existente = document.getElementById(BUTTON_ID);
    const mainMenu = document.querySelector("#mainMenu");

    if (!esPaginaExam() || !mainMenu) {
      if (existente) existente.remove();
      return;
    }

    if (!existente) {
      mainMenu.appendChild(crearBoton());
      console.log("Botón AutoExport insertado en #mainMenu.");
    }
  }

  sincronizarBoton();
  setInterval(sincronizarBoton, 1000);

  document.addEventListener("keydown", (e) => {
    if (e.key === "F6" && e.altKey) {
      iniciarAutoExport();
    }
  });
})();
