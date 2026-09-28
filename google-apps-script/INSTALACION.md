# Conectar Ninaru 3D con Apps Script

El usuario eligió el enfoque de ETM para esta etapa. Usaremos un Apps Script NUEVO con los servicios integrados DriveApp y SpreadsheetApp. No hacen falta CLIENT_SECRET, refresh tokens ni una configuración OAuth manual en la tienda. Google solicitará autorización al propietario al ejecutar el script.

## 1. Crear e instalar (cuenta correcta)

1. Entra a https://script.google.com/ con **ninaru3d@gmail.com**.
2. Crea **Nuevo proyecto** y nómbralo **Ninaru 3D — Tienda**. No abras ni reemplaces el proyecto ETM.
3. Reemplaza el contenido inicial de `Código.gs` por el contenido completo del archivo `Code.gs` de esta carpeta.
4. Guarda. Selecciona la función **setupNinaru** en la barra superior y pulsa **Ejecutar**.
5. Revisa y autoriza los permisos con **ninaru3d@gmail.com**. Son lectura/escritura de Sheets y Drive e identificación de la cuenta. Si la cuenta o el proyecto no corresponden, detente.

Opcional: el archivo `appsscript.json` incluye el manifiesto de referencia. Apps Script puede inferir los permisos del código; no es necesario editar el manifiesto para la primera instalación.

La función comprueba el correo efectivo y el propietario de la carpeta `1eGRyKqQ4x3waWR2mK4iuESxvJLIMTUHM`. Crea dentro de ella:

- **Ninaru 3D — Catálogo**, una hoja con `Catalogo` y `Pedidos`.
- **Ninaru — Imágenes**, una subcarpeta privada.

`Catalogo` conserva versiones del contenido como bloques JSON de texto. Es almacenamiento interno del panel, no una tabla para editar manualmente. `Pedidos` sí está preparada para registro manual; la web no la consulta ni escribe pedidos automáticamente. No se ha importado contenido de demostración por defecto.

Si ejecutas setup otra vez, reutiliza los IDs ya creados. No modifica ETM. Guarda el enlace de la hoja que aparece en el registro de ejecución. No borres las propiedades del script.

## 2. Clave del administrador

En **Configuración del proyecto → Propiedades de la secuencia de comandos**, encontrarás `ADMIN_KEY`, generado automáticamente durante setup. Guárdalo en tu gestor de contraseñas. Se utiliza como clave de acceso al panel; no es una contraseña de Google.

**No envíes esa clave por chat, no la subas a GitHub y no la agregues a variables VITE_.** La tienda la solicita al iniciar sesión y mantiene el token temporal solo en memoria. Las sesiones duran hasta una hora y pueden vencer antes si Google elimina entradas de caché. Recargar la página requiere volver a ingresar.

## 3. Implementar la aplicación web

1. **Implementar → Nueva implementación → Aplicación web**.
2. Descripción: **Ninaru 3D catálogo v1**.
3. Ejecutar como: **Yo (ninaru3d@gmail.com)**.
4. Quién tiene acceso: **Cualquier persona**. Esto permite leer el catálogo publicado, mientras las escrituras requieren la sesión de administrador validada por el script. No vuelve pública la carpeta de Drive.
5. Implementa y copia la URL que termina en **/exec**. No uses la URL del editor ni `/dev`.
6. Comparte esa URL con el asistente para configurar la tienda. La URL es pública; la clave no.

El proyecto Cloud `ninaru3d-web` puede conservarse. Para este flujo no es necesario vincularlo manualmente con Apps Script; el script puede usar su proyecto predeterminado.

## 4. Conectar el sitio e importar

Con la URL confirmada, crear `.env.local` en la raíz del proyecto:

```dotenv
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/ID_DE_LA_IMPLEMENTACION/exec
```

Reconstruir/reiniciar la vista previa. La URL se incorpora al frontend (no es secreta).

- Sin URL: demo local, sin tráfico a Google.
- Con URL: lee el catálogo de Google; ante errores no muestra un catálogo local como si fuera el remoto.
- `/admin`: ingresar `ADMIN_KEY`. Solo una sesión válida puede ver borradores, guardar o subir imágenes.
- Para una hoja vacía aparece **Preparar catálogo local para Google**. Copia los datos del mismo navegador y convierte fotos locales a archivos Drive. Revisa nombres, precios y estados de demostración antes de **Guardar cambios**. Solo se ofrece sobre catálogo remoto vacío.
- Las fotos nuevas se comprimen en el navegador y se cargan mediante el script. Máximo 500 KB por imagen; no se cambia su contenido artístico.

## 5. Prueba real requerida antes de publicar

1. Confirmar que la respuesta tiene `store: ninaru3d` y catálogo vacío de la hoja recién creada.
2. Ingresar al administrador; crear un producto **borrador** con una foto y guardar.
3. Verificar la hoja y la subcarpeta correctas. Recargar/reingresar y comprobar persistencia.
4. Abrir sin sesión: el borrador y su foto no deben ser públicos.
5. Publicar el producto de prueba y verificar PLP, PDP e imagen en una sesión sin login.
6. Editar desde dos sesiones: la segunda no debe sobrescribir una versión más reciente; debe informar conflicto.
7. Revisar el comportamiento de red y las redirecciones ContentService en el navegador. Nunca cambiar a `no-cors`: impediría confirmar el guardado.

## Límites y operación

Apps Script tiene cuotas y latencia. Esta implementación corresponde a un catálogo pequeño (máximo inicial 500 productos, 40 secciones y 12 fotos por producto); se validará rendimiento con contenido real. Las imágenes se sirven como datos a través del script y se reutilizan en memoria durante la visita, sin exponer archivos privados ajenos. Cada versión guardada se agrega a la hoja antes de cambiar el puntero activo. Si falla el guardado, la versión anterior sigue activa.

Las imágenes subidas antes de cancelar una edición quedan privadas en la carpeta; no hay borrado automático. Las versiones también se conservan. Revisar almacenamiento y respaldos periódicamente. No almacenar datos sensibles del cliente en descripciones públicas.

Si cambias `Code.gs`, crea una **nueva versión de la implementación existente** para conservar la URL. La compilación local aprobada no sustituye estas pruebas contra Google.

Referencias: https://developers.google.com/apps-script/guides/web · https://developers.google.com/apps-script/guides/content · https://developers.google.com/apps-script/guides/services/quotas
