// ==UserScript==
// @name         Navegacion numérica    
// @namespace    http://tampermonkey.net/
// @version      2.2.2
// @description  Script para navegar entre filtros con las teclas numéricas.
// @author       Tu Nombre
// @match        https://rahhal.vlcia.com/mplus/app/dashboard
// @match        https://mplus.rahhal.com/mplus/app/dashboard
// @updateURL    https://raw.githubusercontent.com/atrDaw/tampermono/main/mono.user.js
// @downloadURL  https://raw.githubusercontent.com/atrDaw/tampermono/main/mono.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
//return;
 $(document).on('keydown', function(e) {

        if ($(e.target).is('input, textarea, select, [contenteditable="true"]')) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;


        if (e.key >= '1' && e.key <= '9') {
            let index = parseInt(e.key) - 1;


            let $tabs = $('#tabButtons div').find('label');
            let $targetTab = $tabs.eq(index);

            if ($targetTab.length) {
                $targetTab.trigger('click');
                console.log('Cambiando a pestaña:', index + 1);
            }
        }
    });
})(window.jQuery);
