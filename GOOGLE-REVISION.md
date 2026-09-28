# Google para Ninaru 3D — decisión vigente

Se usará un Apps Script nuevo, como ETM, por solicitud del usuario. No se reutilizan URLs, archivos .env, claves ni proyectos de ETM.

- Cuenta indicada: ninaru3d@gmail.com.
- Carpeta: https://drive.google.com/drive/folders/1eGRyKqQ4x3waWR2mK4iuESxvJLIMTUHM
- Proyecto Cloud creado: ninaru3d-web, Drive y Sheets habilitadas según el usuario. Puede conservarse sin vincularlo al script.
- OAuth manual/client secret/refresh token: descartados para este flujo. Apps Script gestiona su autorización.
- Código nuevo preparado en google-apps-script/Code.gs. Comprueba la cuenta y el propietario de la carpeta al ejecutar setupNinaru.
- Setup e implementación completados por el propietario. El 27 de septiembre de 2026 se verificó lectura HTTP 200 del endpoint /exec?action=catalog: ok=true, store=ninaru3d, version=1, sin productos ni secciones. URL configurada en .env.local. Pendiente verificar login, imágenes y guardado real desde el navegador; no se ha escrito contenido remoto.
- Único dato requerido para conectar el frontend después: URL de aplicación web /exec. ADMIN_KEY nunca debe compartirse por chat ni incluirse en el frontend.

Ver google-apps-script/INSTALACION.md para pasos y prueba real. El script genera la hoja y subcarpeta nuevas dentro de la carpeta confirmada. La carpeta sigue privada; solo el catálogo publicado y sus imágenes se sirven a visitantes por la aplicación.

