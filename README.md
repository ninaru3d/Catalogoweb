# Ninaru 3D — catálogo web

Tienda catálogo de maquillaje e impresión 3D construida con React, Vite y TypeScript. Los precios se muestran en MXN y las solicitudes se envían por WhatsApp; el cobro en línea se incorporará cuando estén definidos los costos de envío.

## Ejecutar localmente

Requiere Node.js 24 o posterior.

```sh
npm ci
npm run dev
```

Para compilar y revisar la versión de producción:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

La variable `VITE_GOOGLE_SCRIPT_URL` debe contener la URL `/exec` del Apps Script exclusivo de Ninaru. Consulta `.env.example`; nunca agregues la clave del administrador ni `.env.local` al repositorio.

## Funcionalidad

- Home administrable con banners animados, promociones, tarjetas y carruseles por categoría.
- PLP para Maquillaje e Impresión 3D.
- PDP con variantes, cantidad, referencias relacionadas y galería táctil de varias fotografías.
- Solicitudes por WhatsApp con producto, variante, cantidad, subtotal y datos de personalización.
- Administrador para productos, imágenes, precios, variantes, secciones del Home y número de contacto.
- Persistencia en Google Sheets y almacenamiento privado de imágenes en Drive mediante Apps Script.
- Control de versiones del catálogo y prevención de sobrescrituras concurrentes.
- Diseño adaptable a móvil y preferencias de movimiento reducido.

## Validación

```sh
npm test
npm run build
```

La integración se verificó contra el Apps Script de Ninaru: lectura pública, autenticación administrativa, guardado persistente, subida y recuperación de imágenes. Home, PLP y PDP fueron revisados en escritorio y móvil.

## Estado del lanzamiento

La infraestructura y el catálogo de demostración están conectados. Antes del lanzamiento deben reemplazarse los textos, precios e imágenes provisionales por contenido real, rotarse la clave administrativa que se utilizó durante las pruebas, configurar Vercel y retirar `noindex` cuando el dominio definitivo esté listo.

No hay pagos ni carrito en este alcance. Los pedidos y costos de envío se confirman por WhatsApp.

## Apps Script

El backend y su guía de instalación están en `google-apps-script/`. Utiliza recursos exclusivos de Ninaru y no reutiliza credenciales ni archivos del proyecto ETM.
