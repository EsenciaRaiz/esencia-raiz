"use strict";

const CATALOGO_API =
  "https://script.google.com/macros/s/AKfycbxMfGB6Sg4j4VQ-s2o7JJriGVPEyyWp-ia7gYXon46-wjyTdEj9eskGGbng3PgBND8kXw/exec";

document.getElementById("anio-actual").textContent = new Date().getFullYear();

function aplicarContacto(contacto) {
  if (!contacto || !contacto.telefono) return;

  const telefono = String(contacto.telefono).replace(/\D/g, "");
  if (!telefono) return;

  const mensaje = contacto.mensajeAutomatico ||
    "Hola, quiero consultar por los productos de Esencia Raíz.";
  const enlace = document.getElementById("enlace-whatsapp");
  const visible = document.getElementById("telefono-visible");

  if (enlace) enlace.href = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  if (visible) visible.textContent = contacto.telefonoVisible || telefono;
}

function aplicarDisponibilidad(productos) {
  const porId = new Map(productos.map((producto) => [String(producto.id), producto]));

  document.querySelectorAll("[data-producto-id]").forEach((tarjeta) => {
    const producto = porId.get(tarjeta.dataset.productoId);
    const estado = tarjeta.querySelector(".disponibilidad");
    if (!estado || !producto) return;

    const disponible = producto.activo && producto.stockPublicable && producto.stock > 0;
    estado.textContent = disponible ? "Disponible" : "Sin stock por el momento";
    estado.classList.toggle("agotado", !disponible);
  });
}

async function cargarCatalogo() {
  if (!CATALOGO_API) return;

  const mensaje = document.getElementById("estado-catalogo");
  const controlador = new AbortController();
  const limite = setTimeout(() => controlador.abort(), 15000);

  try {
    const respuesta = await fetch(CATALOGO_API, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: controlador.signal,
    });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const datos = await respuesta.json();
    if (!datos || !Array.isArray(datos.productos)) throw new Error("Respuesta inválida");
    aplicarDisponibilidad(datos.productos);
    aplicarContacto(datos.contacto);
  } catch (error) {
    mensaje.textContent = "No pudimos actualizar la disponibilidad. Podés consultar directamente con Esencia Raíz.";
    console.warn("No fue posible cargar el catálogo público.", error);
  } finally {
    clearTimeout(limite);
  }
}

cargarCatalogo();
