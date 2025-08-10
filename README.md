README.md
Este documento contiene las instrucciones para instalar y usar la extensión "Optimizador SEO de Fichas (Woo + Rank Math)".

Descripción
Esta extensión de navegador (Chrome/Edge) está diseñada para ayudar a los usuarios de WooCommerce que utilizan Rank Math. Extrae automáticamente los datos de un producto (título, descripción, imagen destacada), los envía a la API de Gemini para generar contenido SEO optimizado, y luego te permite editar y rellenar los campos de la página de edición de manera selectiva o en su totalidad.

1. Instalación de la Extensión (Modo Desarrollador)
Para instalar la extensión sin publicarla, sigue estos pasos:

Descarga los archivos: Asegúrate de tener todos los archivos (manifest.json, background.js, content.js, popup.html, popup.js, options.html, styles.css) en una sola carpeta. También, crea una subcarpeta llamada icons y añade los iconos de la extensión (por ejemplo, icon16.png, icon48.png, icon128.png). Puedes usar iconos placeholder si no tienes unos propios.

Abrir la página de extensiones:

En Chrome, navega a chrome://extensions.

En Microsoft Edge, navega a edge://extensions.

Activar el modo desarrollador: En la esquina superior derecha, activa el interruptor "Modo de desarrollador".

Cargar la extensión: Haz clic en el botón "Cargar descomprimida" (Load unpacked).

Selecciona la carpeta: Elige la carpeta que contiene los archivos de la extensión.

¡Listo! La extensión aparecerá en tu lista y el icono se mostrará en la barra de herramientas del navegador.

2. Configuración de la API Key y el Prompt
Antes de usar la extensión, debes configurar tu API Key y el prompt base.

Obtener tu API Key de Gemini:

Ve a la consola de desarrolladores de Google AI Studio.

Crea un nuevo proyecto y obtén tu clave de API.

Acceder a la página de opciones:

Haz clic derecho en el icono de la extensión en la barra de herramientas.

Selecciona "Opciones".

Se abrirá la página de configuración.

Configurar los campos:

Pega tu clave de API de Gemini en el campo "API Key de Gemini".

El campo "Prompt base para Gemini" ya tiene un prompt predeterminado que sigue todas las reglas. Puedes ajustarlo si lo deseas, pero asegúrate de mantener los placeholders {title}, {description}, {ingredients}, {size} y {imageUrl} para que la extensión funcione correctamente.

Guardar: Haz clic en "Guardar Configuración". Verás un mensaje de confirmación.

3. Uso de la Extensión
Navega a la página de edición de un producto en tu sitio de WooCommerce (ya sea con el editor clásico o con Gutenberg).

Abre la extensión haciendo clic en su icono en la barra de herramientas del navegador.

Haz clic en el botón "Generar y Pegar SEO".

La extensión extraerá los datos, los enviará a la API de Gemini y mostrará los resultados en un formulario editable en el popup.

Edita los campos si lo deseas. Puedes modificar cualquier valor en el formulario.

Haz clic en el botón "Aplicar" junto a cada campo para inyectar su valor en la página del producto.

Si prefieres pegar todos los campos a la vez, puedes usar el botón "Generar y Pegar SEO", que ahora rellena todos los campos del formulario y los aplica a la página directamente.

4. Limitaciones Conocidas
Selectores de DOM: La extensión se basa en selectores de CSS específicos (#title, textarea.wp-editor-area, input[name="rank_math_focus_keyword"], etc.). Si tu tema o un plugin modifica la estructura del HTML de la página de edición, es posible que algunos campos no se rellenen correctamente.

Compatibilidad: Se ha probado para funcionar con el editor clásico y Gutenberg, pero las variaciones de la interfaz de Rank Math en diferentes versiones o idiomas pueden requerir ajustes en los selectores.

Slug no editable: Si el campo del slug está bloqueado (por ejemplo, porque ya ha sido publicado y no es editable directamente), la extensión no podrá rellenarlo y mostrará un aviso en la consola del navegador.

5. Empaquetar la Extensión
Si quieres compartir la extensión, puedes empaquetarla en un archivo .zip:

Vuelve a la página chrome://extensions o edge://extensions.

Haz clic en el botón "Empaquetar extensión" (Pack extension).

Selecciona la carpeta que contiene todos los archivos de la extensión.

El navegador creará un archivo .crx (la extensión empaquetada) y un archivo .pem (la clave privada). Guarda el archivo .pem en un lugar seguro.