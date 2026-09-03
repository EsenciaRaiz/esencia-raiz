# Seguridad

- La página pública nunca debe acceder directamente a la planilla privada.
- La API de Apps Script es de solo lectura y publica únicamente datos seleccionados de `PRODUCTOS`.
- No deben exponerse `FORMULAS`, `MATERIAS_PRIMAS`, compras, proveedores, costos, lotes ni movimientos de `STOCK`.
- No se deben guardar claves, tokens, correos privados o credenciales en este repositorio.
- Antes de cada despliegue, probar que la respuesta pública no contiene columnas internas.
