// ==UserScript==
// @name         Navegacion numérica    
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @description  Script para navegar entre filtros con las teclas numéricas.
// @author       Tu Nombre
// @match        https://mplus.rahhal.com/mplus/app/dashboard
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
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

    $(document).on('keydown', function(e) {

        if ($(e.target).is('input, textarea, select, [contenteditable="true"]')) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        let $tabs = $('#tabButtons div').find('label');

        // Tecla 0: marcar las casillas de la 2 a la 5
        if (e.key === '0') {
            $tabs.slice(1, 5).each(function() {
                $(this).trigger('click');
            });
            console.log('Marcadas las casillas 2 a 5');
            return;
        }

        // Teclas 1-9: cambiar a la pestaña correspondiente
        if (e.key >= '1' && e.key <= '9') {
            let index = parseInt(e.key) - 1;
            let $targetTab = $tabs.eq(index);

            if ($targetTab.length) {
                $targetTab.trigger('click');
                console.log('Cambiando a pestaña:', index + 1);
            }
        }
    });
})(window.jQuery);
