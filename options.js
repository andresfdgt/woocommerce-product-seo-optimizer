// Archivo: options.js
// Este script maneja la lógica de la página de opciones.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optionsForm');
    const apiKeyInput = document.getElementById('apiKey');
    const promptBaseTextarea = document.getElementById('promptBase');
    const statusDiv = document.getElementById('status');

    /**
     * Muestra un mensaje de estado en la página de opciones.
     * @param {string} message El mensaje a mostrar.
     * @param {string} type El tipo de mensaje ('success', 'error', 'info').
     */
    function showStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'block';
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
    
    // Carga los valores guardados al iniciar la página.
    chrome.storage.sync.get(['gemini_api_key', 'base_prompt'], (items) => {
        apiKeyInput.value = items.gemini_api_key || '';
        promptBaseTextarea.value = items.base_prompt || 
`Eres un experto en SEO para productos de e-commerce. Genera un objeto JSON con los siguientes campos: title, html_description, focus_keyword, seo_title, slug, seo_description y image_alt.

Reglas de redacción:
- Español neutro, acentos correctos.
- Especificar especie si es evidente (perros, gatos, mascotas).
- La focus_keyword debe aparecer en seo_title, seo_description, html_description y estar relacionada con el slug.
- slug en minúsculas, sin tildes, con guiones.
- No inventar datos que no estén en el título, descripción o imagen.
- Mantener un CTA corto al final de la descripción.
- seo_description debe tener un máximo de 160 caracteres.
- image_alt debe tener un máximo de 125 caracteres.
- html_description debe usar etiquetas <h2>, <h3>, <p> y <ul> para una buena estructura.

Datos del producto a optimizar:
Título: {title}
Descripción: {description}
Ingredientes/Medidas: {ingredients}
URL de la imagen: {imageUrl}`;
    });

    // Escucha el evento de envío del formulario.
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const apiKey = apiKeyInput.value.trim();
        const promptBase = promptBaseTextarea.value.trim();

        // Guarda los valores en chrome.storage.sync.
        chrome.storage.sync.set({
            gemini_api_key: apiKey,
            base_prompt: promptBase
        }, () => {
            console.log('[WooSEO] Configuración guardada.');
            showStatus('Configuración guardada con éxito.', 'success');
        });
    });
});
