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

### Selección de Proveedor de IA
La extensión ahora soporta múltiples proveedores de IA:
- **Google Gemini** (recomendado para español)
- **OpenAI ChatGPT** (excelente calidad general)

### Configuración Paso a Paso

**Paso 1: Obtener API Keys**

Para Gemini:
- Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
- Crea un nuevo proyecto y obtén tu clave de API

Para OpenAI:
- Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
- Crea una nueva API Key

**Paso 2: Acceder a la página de opciones**
- Haz clic derecho en el icono de la extensión en la barra de herramientas
- Selecciona "Opciones"
- Se abrirá la página de configuración

**Paso 3: Configurar proveedor y modelo**
1. **Proveedor de IA**: Selecciona entre Gemini o OpenAI
2. **API Key**: Introduce tu clave de API correspondiente
3. **Modelo**: Elige el modelo específico:
   - **Gemini**: 2.5 Flash (recomendado), 1.5 Pro, 1.5 Flash, Pro
   - **OpenAI**: GPT-4o (recomendado), GPT-4o Mini, GPT-4, GPT-3.5 Turbo
4. **Prompt base**: Se auto-ajusta según el proveedor, pero puedes personalizarlo

**Paso 4: Probar conexión**
- Usa el botón "🔍 Probar Conexión" para verificar que todo funciona
- La extensión te confirmará si la conexión es exitosa

**Paso 5: Guardar**
- Haz clic en "Guardar Configuración"
- Verás un mensaje de confirmación

### Recomendaciones de Uso

**¿Qué IA elegir?**

**Google Gemini:**
- ✅ Excelente para contenido en español
- ✅ Respuesta JSON estructurada nativa
- ✅ Gratuito hasta cierto límite
- ✅ Rápido y eficiente
- 🎯 **Recomendado para**: Uso general, múltiples productos

**OpenAI (ChatGPT):**
- ✅ Calidad de escritura superior
- ✅ Mejor comprensión de contexto
- ✅ Creatividad en descripciones
- 💰 Requiere créditos de API
- 🎯 **Recomendado para**: Productos premium, descripciones complejas

**¿Qué modelo elegir?**

**Para Gemini:**
- **2.5 Flash**: Ideal para uso diario (rápido y económico)
- **1.5 Pro**: Para productos que requieren más creatividad

**Para OpenAI:**
- **GPT-4o**: Mejor calidad general (recomendado si el presupuesto lo permite)
- **GPT-4o Mini**: Buen balance calidad/precio

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

## Changelog v3.0

### 🚀 Nuevas Funcionalidades Principales
- **Soporte Multi-IA**: Elige entre Google Gemini y OpenAI (ChatGPT)
- **Selección de modelos**: Acceso a diferentes modelos de cada proveedor
- **Configuración inteligente**: Prompts optimizados automáticamente para cada IA
- **Prueba de conexión**: Verifica tu configuración antes de usar
- **Metadatos de generación**: Información sobre qué IA y modelo se usó

### 🤖 Proveedores de IA Soportados

**Google Gemini:**
- Gemini 2.5 Flash (recomendado para rapidez)
- Gemini 1.5 Pro (mejor calidad)
- Gemini 1.5 Flash
- Gemini Pro

**OpenAI:**
- GPT-4o (recomendado para calidad)
- GPT-4o Mini (económico)
- GPT-4
- GPT-3.5 Turbo

### ✨ Mejoras Anteriores (v2.0)
- **Persistencia automática**: El contenido ya no se pierde al cerrar el popup
- **Sistema de historial**: Hasta 20 generaciones guardadas localmente
- **Auto-guardado**: Los cambios se guardan automáticamente cada segundo
- **Restauración inteligente**: Detecta y restaura contenido de la sesión anterior
- **Debugging mejorado**: Herramientas para diagnosticar problemas

### 🎨 Mejoras en la Interfaz
- **Panel de configuración renovado**: Interfaz más intuitiva para elegir IA
- **Indicadores de estado**: Muestra qué IA se está usando
- **Feedback de conexión**: Prueba tu configuración al instante
- **Botones de acción**: Limpiar, restaurar, probar conexión

### 🔧 Mejoras Técnicas
- **API unificada**: Misma interfaz para diferentes proveedores
- **Manejo de errores robusto**: Mejor gestión de fallos de API
- **Reintentos automáticos**: Sistema de reintentos con backoff exponencial
- **Metadata de generación**: Rastrea qué IA generó cada contenido