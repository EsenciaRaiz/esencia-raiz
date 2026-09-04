/**
 * API pública de solo lectura para Esencia Raíz.
 * Publica exclusivamente datos seleccionados de PRODUCTOS.
 * No expone recetas, costos, proveedores ni movimientos de stock.
 */
const PLANILLA_ID = '1BBIIuGlssSipCcZr2EzKMNrpIAHBUb_e_qC8RQ17PnM';

function doGet() {
  const salida = {
    version: 1,
    actualizado: new Date().toISOString(),
    productos: obtenerProductosPublicos_(),
    contacto: obtenerContactoPublico_(),
  };

  return ContentService
    .createTextOutput(JSON.stringify(salida))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerContactoPublico_() {
  const hoja = SpreadsheetApp.openById(PLANILLA_ID).getSheetByName('CONTACTO');
  if (!hoja) return null;

  const valores = hoja.getRange('A2:B20').getDisplayValues();
  const campos = Object.fromEntries(
    valores
      .filter((fila) => fila[0])
      .map((fila) => [normalizarEncabezado_(fila[0]), String(fila[1]).trim()])
  );

  const telefono = (campos.TELEFONO_WHATSAPP || '').replace(/\D/g, '');
  return {
    telefono: telefono,
    telefonoVisible: campos.TELEFONO_VISIBLE || telefono,
    mensajeAutomatico: campos.MENSAJE_AUTOMATICO || 'Hola, quiero consultar por los productos de Esencia Raíz.',
    facebookUrl: campos.FACEBOOK_URL || '',
    instagramUrl: campos.INSTAGRAM_URL || '',
  };
}

function obtenerProductosPublicos_() {
  const hoja = SpreadsheetApp.openById(PLANILLA_ID).getSheetByName('PRODUCTOS');
  if (!hoja) throw new Error('No existe la hoja PRODUCTOS');

  const valores = hoja.getDataRange().getDisplayValues();
  if (valores.length < 2) return [];

  const encabezados = valores[0].map(normalizarEncabezado_);
  const indice = Object.fromEntries(encabezados.map((nombre, posicion) => [nombre, posicion]));
  const requeridos = ['ID', 'NOMBRE', 'ACTIVO', 'STOCK_PUBLICABLE', 'STOCK'];
  requeridos.forEach((nombre) => {
    if (indice[nombre] === undefined) throw new Error(`Falta la columna ${nombre}`);
  });

  return valores.slice(1)
    .filter((fila) => fila[indice.ID])
    .map((fila) => ({
      id: fila[indice.ID],
      nombre: fila[indice.NOMBRE],
      activo: esSi_(fila[indice.ACTIVO]),
      stockPublicable: esSi_(fila[indice.STOCK_PUBLICABLE]),
      stock: numeroSeguro_(fila[indice.STOCK]),
      precio: indice.PRECIO_PUBLICADO === undefined ? null : numeroOpcional_(fila[indice.PRECIO_PUBLICADO]),
      precioPromocional: indice.PRECIO_PROMOCIONAL === undefined ? null : numeroOpcional_(fila[indice.PRECIO_PROMOCIONAL]),
    }));
}

function normalizarEncabezado_(valor) {
  return String(valor).trim().toUpperCase();
}

function esSi_(valor) {
  return String(valor).trim().toUpperCase() === 'SI';
}

function numeroSeguro_(valor) {
  const numero = Number(String(valor).replace(',', '.'));
  return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

function numeroOpcional_(valor) {
  if (valor === '') return null;
  const numero = Number(String(valor).replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}
