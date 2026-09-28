# Actualización de Home

- Banner principal: tres tarjetas fijas (maquillaje, impresión 3D, promociones), navegación manual por flechas y puntos. Conserva composición de tarjeta y logo de la primera.
- Admin > Home > carrusel principal: título, descripción, CTA, destino y foto de escritorio/celular independientes por tarjeta.
- Carrusel de productos de impresión 3D agregado, editable igual que los anteriores.
- Sección personalizada: título conservado, texto específico y botón WhatsApp con mensaje editable. Usa el número de Configuración, permanece deshabilitado si falta. No envía automáticamente.
- Carrusel personalizado: tres imágenes y descripciones editables; inicialmente ilustraciones de marca, reemplazables por fotos reales.
- Fondo general rosa pálido #FFF0F5.
- Migración local idempotente: mantiene productos, variantes, configuración y ediciones; no duplica el carrusel 3D al recargar.

## Ilustraciones

Generadas con la herramienta integrada image_gen a partir de la referencia del logo. Tres prompts: personaje Ninaru con brocha de maquillaje; personaje con cubo 3D lila; personaje con regalo corazón y listón cian. Paleta #2E2E56, #6B5BD6, #12C4D6, #E6007E. Rostro, pestañas, pelo corto y mejillas inspirados en referencia; sin texto. Archivos en public/brand/mascot-makeup.png, mascot-creation.png, mascot-custom.png.

La generación dibujó una cuadrícula en lugar de transparencia. La corrección con image_gen alcanzó el límite de uso; se solicitó autorización para limpieza local. No afirmar transparencia mientras esa corrección siga pendiente.

## Pruebas

Cinco pruebas de dominio y compilación aprobadas. Navegación 1→2→3→1 del banner, tercera imagen personalizada, edición/guardado/restauración de título de promociones y construcción del enlace de WhatsApp comprobados en navegador. Número de prueba retirado. Google sin conectar.
