// ==UserScript==
// @name         Contador pacs
// @namespace    https://tampermonkey.net/
// @version      1.0
// @description  Guarda el paciente al pulsar "Guardar" y muestra un toast
// @match        https://mplus.rahhal.com/mplus/app/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      cchqfwjiirezhevzdbbv.supabase.co
// @connect      supabase.co
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
    const mostrarToast = true; // false para desactivar el toast
    const TABLE_NAME = "pacientes_duplicate";
  
    // ============================================
    // Credenciales (almacenadas en Tampermonkey)
    // ============================================
    function getCredenciales() {
      let url = GM_getValue("supabase_url", "");
      let key = GM_getValue("supabase_anon_key", "");
  
      if (!url || !key) {
        url = prompt("URL de Supabase (ej: https://xxxx.supabase.co):");
        key = prompt("Anon key de Supabase:");
        if (!url || !key) return null;
  
        url = url.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "") + "/rest/v1/";
        key = key.trim();
        GM_setValue("supabase_url", url);
        GM_setValue("supabase_anon_key", key);
      }
      return { url, key };
    }
  
    function resetCredenciales() {
      GM_deleteValue("supabase_url");
      GM_deleteValue("supabase_anon_key");
      toast("info", "Credenciales de Supabase eliminadas");
      console.log("Credenciales de Supabase eliminadas.");
    }
  
    // Aparece en el menú del icono de Tampermonkey
    GM_registerMenuCommand("Restablecer credenciales Supabase", resetCredenciales);
  
    // ============================================
    // Toast (Cute Alert de la página)
    // ============================================
    function toast(type, message, timer = 1500) {
      if (!mostrarToast) return;
      if (typeof unsafeWindow.cuteToast !== "function") return;
      unsafeWindow.cuteToast({ type, message, timer });
    }
  
    // ============================================
    // Petición HTTP con GM_xmlhttpRequest (promesa)
    // ============================================
    function request({ method, url, headers, body }) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method,
          url,
          headers,
          data: body,
          onload: (r) => {
            let data = null;
            try {
              data = r.responseText ? JSON.parse(r.responseText) : null;
            } catch (_) {
              data = r.responseText;
            }
            resolve({ ok: r.status >= 200 && r.status < 300, status: r.status, data });
          },
          onerror: () => reject(new Error("Error de red")),
          ontimeout: () => reject(new Error("Tiempo de espera agotado")),
        });
      });
    }
  
    // ============================================
    // Guardar en Supabase (si no existe ya para hoy)
    // Devuelve: "guardado" | "existente" | "error"
    // ============================================
    async function addPacienteSupabase(numeroHistoria) {
      const cred = getCredenciales();
      if (!cred) {
        console.warn("Sin credenciales de Supabase. No se guarda.");
        return "error";
      }
  
      const headers = {
        "Content-Type": "application/json",
        apikey: cred.key,
        Authorization: `Bearer ${cred.key}`,
      };
  
      const hoy = new Date().toLocaleDateString("sv-SE");
  
      try {
        // 1. Comprobar si ya existe
        const checkUrl = `${cred.url}${TABLE_NAME}?numero_historia=eq.${encodeURIComponent(
          numeroHistoria
        )}&fecha=eq.${hoy}&select=*`;
  
        const check = await request({ method: "GET", url: checkUrl, headers });
        if (!check.ok) {
          throw new Error(
            `Error al verificar paciente: ${check.status} - ${JSON.stringify(check.data)}`
          );
        }
        if (check.data.length > 0) {
          console.log(`Paciente ${numeroHistoria} ya existe para ${hoy}. No se añade.`);
          return "existente";
        }
  
        // 2. Insertar
        const add = await request({
          method: "POST",
          url: cred.url + TABLE_NAME,
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify({ numero_historia: numeroHistoria, fecha: hoy }),
        });
        if (!add.ok) {
          throw new Error(
            `Error al guardar paciente: ${add.status} - ${JSON.stringify(add.data)}`
          );
        }
  
        console.log("¡Paciente guardado en Supabase!", add.data);
        return "guardado";
      } catch (error) {
        console.error("Error en Supabase:", error.message);
        return "error";
      }
    }
  
    // ============================================
    // Listener principal
    // ============================================
    document.addEventListener("click", async (e) => {
      const boton = e.target.closest("button");
      if (!boton || !boton.textContent.includes("Guardar")) return;
  
      const paciente = document.querySelector("#patient-profile")?.dataset.label;
      if (!paciente) {
        console.warn("No se encontró #patient-profile o no tiene data-label");
        return;
      }
  
      console.log("Guardando paciente en base de datos:", paciente);
  
      const tituloOriginal = document.title;
      document.title += " ok";
      setTimeout(() => (document.title = tituloOriginal), 500);
  
      const resultado = await addPacienteSupabase(paciente);
      if (resultado === "guardado") toast("success", "Paciente guardado");
      else if (resultado === "existente") toast("info", "El paciente ya estaba registrado hoy");
      else toast("error", "Error al guardar el paciente");
    });
  })();
