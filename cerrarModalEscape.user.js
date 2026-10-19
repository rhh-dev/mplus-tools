// ==UserScript==
// @name         Cerrar modales con Esc
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Al presionar Escape cierra la ventana/modal superior
// @author       Tu Nombre
// @match        https://mplus.rahhal.com/*
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
  
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    
    const botones = document.querySelectorAll(".window_button_close");
    // Cierra solo la última (la más reciente/superior)
    botones[botones.length - 1]?.click();
  });
})();
