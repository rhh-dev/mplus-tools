// ==UserScript==
// @name         Relleno optometría desde historia
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  En el modal "Añadir / Modificar campos - Optometría", al clicar en un headline rellena el input con el último dato de la historia.
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
    const dec = String.fromCharCode(...raw.match(/.{1,2}/g).map((h, i) => parseInt(h, 16) ^ k.charCodeAt(i % k.length) % 255));
    return JSON.parse(dec).trader ?? null;
  }
  const usuario = getUsuario();
  if (!usuario || usuario.id != 31) return;
  document.title += ' ·';

  const MODAL = "#edit-form-optometry";
  const camposTexto = ["MC", "AVSC", "AVCSC", "GF", "MOTE"];
  const camposRS = ["ESF", "CIL", "EJE", "AD", "AV"];

  const buscarHistoria = (etiqueta) => {
    const actos = document.querySelectorAll('ul.timeline > li');
    for (const acto of actos) {
      for (const tr of acto.querySelectorAll('tr.status')) {
        const campo = tr.querySelector('.field-reverse');
        if (campo && campo.textContent.trim() === etiqueta) {
          const celdas = tr.querySelectorAll('td');
          if (celdas[1]) return celdas[1].textContent.replace(/\s+/g, ' ').trim();
        }
      }
    }
    return null;
  };

  const num = (s) => (s ? s.replace(/\s+/g, '') : undefined);

  const parsearRS = (texto) => {
    const res = { od: {}, oi: {} };
    if (!texto) return res;
    const partes = texto.split('/');
    const re = /^\s*([+-]?\s*\d+(?:[.,]\d+)?)\s*(?:\(\s*([+-]?\s*\d+(?:[.,]\d+)?)\s*\))?\s*(\d{1,3})?\s*º?\s*(?:=\s*([\d.,]+[+-]?))?/;
    const reAD = /\bA(?:DD?)?\s*=?\s*([+-]?\s*\d+(?:[.,]\d+)?)/i;
    const adGlobal = texto.match(reAD);

    [["od", partes[0]], ["oi", partes[1]]].forEach(([ojo, p]) => {
      if (!p) return;
      const m = p.match(re);
      if (m) {
        res[ojo].ESF = num(m[1]);
        res[ojo].CIL = num(m[2]);
        res[ojo].EJE = m[3];
        res[ojo].AV = num(m[4]);
      }
      const adOjo = p.match(reAD) || adGlobal;
      if (adOjo) res[ojo].AD = num(adOjo[1]);
    });
    return res;
  };

  const buscarInput = (headline) => {
    const tr = headline.closest('tr');
    if (!tr) return null;
    return [...tr.querySelectorAll('input[type="text"]')].find(
      (inp) => headline.compareDocumentPosition(inp) & Node.DOCUMENT_POSITION_FOLLOWING
    ) || null;
  };

  const ojoDe = (headline, todos) => {
    for (let i = todos.indexOf(headline); i >= 0; i--) {
      const t = todos[i].textContent.trim();
      if (t === "OJO DERECHO") return "od";
      if (t === "OJO IZQUIERDO") return "oi";
    }
    return null;
  };

  const rellenar = (headline, todos, rs) => {
    const texto = headline.textContent.trim();
    let valor;

    if (camposRS.includes(texto)) {
      const ojo = ojoDe(headline, todos);
      valor = ojo ? rs[ojo][texto] : undefined;
    } else if (camposTexto.includes(texto)) {
      valor = buscarHistoria(texto);
    }
    if (!valor) return null;

    const input = buscarInput(headline);
    if (!input || input.value.trim() !== "") return null;

    input.value = valor;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return input;
  };

  document.addEventListener('click', (e) => {
    const headline = e.target.closest('.headline');
    if (!headline) return;

    const modal = headline.closest(MODAL);
    if (!modal) return;

    const texto = headline.textContent.trim();
    const todos = [...modal.querySelectorAll('.headline')];
    const rs = parsearRS(buscarHistoria('RS'));

    if (texto === "MC") {
      todos.forEach((h) => rellenar(h, todos, rs));
      return;
    }

    if (texto === "RS") {
      todos
        .filter((h) => headline.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING)
        .filter((h) => camposRS.includes(h.textContent.trim()))
        .forEach((h) => rellenar(h, todos, rs));
      return;
    }

    const input = rellenar(headline, todos, rs);
    if (input) input.focus();
  }, true);
})();
