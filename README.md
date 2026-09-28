# Tienda catálogo — primera implementación

React + Vite + TypeScript. Marca provisional Estudio. MXN. Maquillaje e impresión 3D.

## Ejecutar

Node 24+. Dependencias y lockfile incluidos.

```sh
npm ci
npm run demo
```

Abrir http://127.0.0.1:4173/ y /admin. El modo local-demo habilita edición en el navegador: no publicar ese build. `npm run build` genera producción con admin deshabilitado hasta implementar autenticación. `npm test` ejecuta las pruebas.

`npm run dev` es el flujo normal con HMR. En el sandbox Windows actual esbuild falla por permisos de lectura de un directorio antecesor. `npm run demo` es el camino verificado, sin modificar permisos del sistema; recompilar tras cambiar código.

## Implementado

- Home modular: banners, carruseles por selección/categoría y tarjetas informativas/de producto, con orden y visibilidad.
- PLP con publicados por categoría, precios desde/por cotizar y carga incremental.
- PDP con galería, variantes, cantidades, personalización, plazo y relacionados de la misma categoría.
- WhatsApp con selección y subtotal; deshabilitado hasta configurar número; no envía mensajes automáticamente.
- Admin local: CRUD de productos, variantes, relacionados, fotos comprimidas, orden de galería, bloques y configuración.
- Guardado explícito localStorage y exportación JSON. Error visible si la cuota impide guardar.
- Rutas directas, 404 visual, títulos por ruta y estilos responsive.

## Límites actuales

Google sin conectar y autenticación productiva pendiente. NO se utilizan credenciales de ETM. Datos/precios/marca de demostración y fotos pendientes. El almacenamiento es de este navegador, no compartido. Robots sigue en noindex. No hay pagos ni carrito. Ver GOOGLE-REVISION.md antes de configurar Google.

## Validación

Build de producción y demo aprobados. Cuatro pruebas de dominio. Navegador: Home, PLP con cuatro productos de maquillaje, PDP con cambio de precio 320→360, relacionados correctos y guardar/recargar/restaurar nombre de producto. Home móvil sin desbordamiento. No se enviaron mensajes.

## Próximos pasos

Revisión de cuenta y recursos Google exclusivos → backend OAuth/Sheets/Drive y login → persistencia real → contenido y fotos → pruebas de permisos y publicación → SEO/prerenderizado → GitHub/Vercel/dominio. Planeación general en ../PLANEACION.md.

## Integración preparada con Apps Script

La decisión vigente sustituye OAuth manual por un Apps Script exclusivo de Ninaru, como ETM. Código y guía en `google-apps-script/`. El sitio cambia a modo remoto al configurar `VITE_GOOGLE_SCRIPT_URL`; requiere login validado por el script para edición. Sin URL conserva la demostración local. La clave del panel permanece en las propiedades privadas del script; token de sesión solo en memoria. La hoja aún debe crearse y probarse en la cuenta real mediante `setupNinaru`.

Las notas anteriores sobre autenticación pendiente corresponden al estado previo: la implementación ahora está preparada, pero la conexión real, las redirecciones de Google y la persistencia deben verificarse una vez recibida la URL /exec. No hay una conexión activa ni se han leído credenciales de ETM.
