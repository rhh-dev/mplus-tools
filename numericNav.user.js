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
