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

**NUEVA FUNCIONALIDAD - Restauración Automática**: Si habías generado contenido SEO anteriormente en la misma sesión, la extensión restaurará automáticamente tu trabajo anterior. Verás un indicador verde que dice "📄 Contenido restaurado de sesión anterior".

Haz clic en el botón "Generar y Pegar SEO" para crear nuevo contenido.

La extensión extraerá los datos, los enviará a la API de Gemini y mostrará los resultados en un formulario editable en el popup.

**NUEVA FUNCIONALIDAD - Auto-guardado**: Cualquier cambio que hagas en los campos se guarda automáticamente. No perderás tu trabajo al cerrar y abrir el popup.

Edita los campos si lo deseas. Puedes modificar cualquier valor en el formulario.

Haz clic en el botón "Aplicar" junto a cada campo para inyectar su valor en la página del producto.

**NUEVA FUNCIONALIDAD - Gestión de Historial**:
   - **📚 Historial**: Haz clic en este botón para ver todas las generaciones SEO anteriores (hasta 20 entradas).
   - Cada entrada del historial muestra la fecha, URL y una vista previa del contenido.
   - Haz clic en cualquier entrada para cargar esos datos en el formulario.
   - **🗑️ Limpiar**: Elimina todos los datos guardados (historial y sesión actual).

**Flujo recomendado**:
1. Genera contenido nuevo o carga desde el historial
2. Edita los campos según tus necesidades
3. Aplica los campos uno por uno o todos a la vez
4. El contenido se guarda automáticamente para futuras sesiones

4. Nuevas Funcionalidades de Persistencia e Historial

### Persistencia Automática
- **Auto-guardado**: Todos los cambios que realices en el formulario se guardan automáticamente cada segundo.
- **Restauración de sesión**: Al cerrar y abrir el popup, se restaura automáticamente el último contenido generado.
- **Indicador visual**: Cuando se restaura contenido, aparece un indicador verde que puedes cerrar.

### Sistema de Historial
- **Almacenamiento local**: Se guardan hasta 20 generaciones anteriores en el navegador.
- **Información detallada**: Cada entrada incluye fecha, URL de la página y vista previa del contenido.
- **Navegación fácil**: Haz clic en cualquier entrada del historial para cargar esos datos.
- **Persistencia entre sesiones**: El historial se mantiene aunque cierres el navegador.

### Gestión de Datos
- **Botón Historial (📚)**: Muestra/oculta el panel del historial.
- **Botón Limpiar (🗑️)**: Elimina todos los datos guardados con confirmación.
- **Carga inteligente**: Detecta si estás en la misma página para restaurar datos relevantes.

### Flujo de Trabajo Mejorado
1. **Primera vez**: Genera contenido SEO nuevo
2. **Edición**: Modifica los campos según tus necesidades (se guarda automáticamente)
3. **Aplicación**: Usa los botones "Aplicar" para inyectar campos individuales
4. **Reutilización**: Accede al historial para reutilizar generaciones anteriores
5. **Continuidad**: Cierra y abre el popup sin perder tu trabajo

5. Limitaciones Conocidas
Selectores de DOM: La extensión se basa en selectores de CSS específicos (#title, textarea.wp-editor-area, input[name="rank_math_focus_keyword"], etc.). Si tu tema o un plugin modifica la estructura del HTML de la página de edición, es posible que algunos campos no se rellenen correctamente.

Compatibilidad: Se ha probado para funcionar con el editor clásico y Gutenberg, pero las variaciones de la interfaz de Rank Math en diferentes versiones o idiomas pueden requerir ajustes en los selectores.

Slug no editable: Si el campo del slug está bloqueado (por ejemplo, porque ya ha sido publicado y no es editable directamente), la extensión no podrá rellenarlo y mostrará un aviso en la consola del navegador.

5. Limitaciones Conocidas
Selectores de DOM: La extensión se basa en selectores de CSS específicos (#title, textarea.wp-editor-area, input[name="rank_math_focus_keyword"], etc.). Si tu tema o un plugin modifica la estructura del HTML de la página de edición, es posible que algunos campos no se rellenen correctamente.

Compatibilidad: Se ha probado para funcionar con el editor clásico y Gutenberg, pero las variaciones de la interfaz de Rank Math en diferentes versiones o idiomas pueden requerir ajustes en los selectores.

Slug no editable: Si el campo del slug está bloqueado (por ejemplo, porque ya ha sido publicado y no es editable directamente), la extensión no podrá rellenarlo y mostrará un aviso en la consola del navegador.

6. Empaquetar la Extensión
Si quieres compartir la extensión, puedes empaquetarla en un archivo .zip:

Vuelve a la página chrome://extensions o edge://extensions.

Haz clic en el botón "Empaquetar extensión" (Pack extension).

Selecciona la carpeta que contiene todos los archivos de la extensión.

El navegador creará un archivo .crx (la extensión empaquetada) y un archivo .pem (la clave privada). Guarda el archivo .pem en un lugar seguro.

## Changelog v2.0

### ✨ Nuevas Funcionalidades
- **Persistencia automática**: El contenido ya no se pierde al cerrar el popup
- **Sistema de historial**: Hasta 20 generaciones guardadas localmente
- **Auto-guardado**: Los cambios se guardan automáticamente cada segundo
- **Restauración inteligente**: Detecta y restaura contenido de la sesión anterior
- **Navegación por historial**: Interfaz intuitiva para revisar y cargar generaciones anteriores

### 🎨 Mejoras en la Interfaz
- **Botones reorganizados**: Nuevo diseño con botones de Historial y Limpiar
- **Indicadores visuales**: Notificación cuando se restaura contenido
- **Panel de historial**: Vista previa de cada generación con fecha y URL
- **Mejor feedback**: Mensajes de estado más claros y auto-ocultables

### 🔧 Mejoras Técnicas
- **Almacenamiento local**: Uso de Chrome Storage API para persistencia
- **Gestión de datos**: Limpieza automática de entradas antiguas (máximo 20)
- **Detección de páginas**: Restauración inteligente basada en la URL actual
- **Manejo de errores**: Mejor gestión de casos edge y validaciones