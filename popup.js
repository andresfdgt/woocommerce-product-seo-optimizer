// Archivo: popup.js
// Este script maneja la interfaz de usuario del popup.

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const statusDiv = document.getElementById('status');
    const jsonContainer = document.querySelector('.json-container');
    const jsonOutput = document.getElementById('jsonOutput');
    const seoFormContainer = document.getElementById('seo-form-container');
    const seoForm = document.getElementById('seo-form');

    let currentSeoData = {};

    /**
     * Muestra un mensaje de estado en el popup.
     * @param {string} message El mensaje a mostrar.
     * @param {string} type El tipo de mensaje ('success', 'error', 'info').
     */
    function showStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'block';
    }

    /**
     * Copia el texto del JSON al portapapeles.
     */
    function copyJson() {
        const textToCopy = jsonOutput.textContent;
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = textToCopy;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        try {
            document.execCommand('copy');
            showStatus('JSON copiado al portapapeles.', 'success');
        } catch (err) {
            console.error('[WooSEO] Error al copiar el texto: ', err);
            showStatus('Error al copiar el JSON.', 'error');
        }
        document.body.removeChild(tempTextarea);
    }
    
    /**
     * Rellena el formulario con los datos SEO.
     * @param {object} data El objeto JSON con los datos SEO.
     */
    function fillForm(data) {
        document.getElementById('inputTitle').value = data.title;
        document.getElementById('inputHtmlDescription').value = data.html_description;
        document.getElementById('inputFocusKeyword').value = data.focus_keyword;
        document.getElementById('inputSeoTitle').value = data.seo_title;
        document.getElementById('inputSlug').value = data.slug;
        document.getElementById('inputSeoDescription').value = data.seo_description;
        document.getElementById('inputImageAlt').value = data.image_alt;
        
        // Habilita los inputs para edición.
        document.querySelectorAll('#seo-form input, #seo-form textarea').forEach(input => input.disabled = false);

        seoFormContainer.classList.remove('hidden');
    }

    // Escucha el clic del botón de generar.
    generateBtn.addEventListener('click', async () => {
        showStatus('Generando contenido SEO...', 'info');
        jsonContainer.classList.add('hidden');
        seoFormContainer.classList.add('hidden');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.tabs.sendMessage(tab.id, { action: 'GET_PRODUCT_DATA' }, (response) => {
            if (response && response.productData) {
                const productData = response.productData;

                chrome.runtime.sendMessage({ action: 'generate_seo', data: productData }, (apiResponse) => {
                    if (apiResponse.error) {
                        showStatus(apiResponse.error, 'error');
                        jsonOutput.textContent = apiResponse.error;
                        jsonContainer.classList.remove('hidden');
                        return;
                    }

                    if (apiResponse.data) {
                        try {
                            // Guardamos la respuesta para su uso posterior.
                            currentSeoData = apiResponse.data;

                            const json = JSON.stringify(apiResponse.data, null, 2);
                            jsonOutput.textContent = json;
                            jsonContainer.classList.remove('hidden');

                            fillForm(apiResponse.data);

                            showStatus('Datos SEO generados. Puedes editarlos y aplicarlos.', 'success');
                        } catch (e) {
                            showStatus('Respuesta de la API no es un JSON válido. Copia el texto manualmente.', 'error');
                            jsonOutput.textContent = JSON.stringify(apiResponse.data, null, 2);
                            jsonContainer.classList.remove('hidden');
                        }
                    }
                });
            } else {
                showStatus('No se pudieron extraer los datos del producto. ¿Estás en una página de edición de producto de WooCommerce?', 'error');
            }
        });
    });

    // Escucha los clics de los botones de "Aplicar".
    seoForm.addEventListener('click', async (event) => {
        if (event.target.classList.contains('apply-btn')) {
            const field = event.target.dataset.field;
            const inputId = `input${field.charAt(0).toUpperCase() + field.slice(1)}`;
            const value = document.getElementById(inputId).value;
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Enviamos solo el campo y el valor a aplicar a content.js
            chrome.tabs.sendMessage(tab.id, {
                action: 'APPLY_SINGLE_FIELD',
                field: field,
                value: value
            }, (response) => {
                if (response && response.success) {
                    showStatus(`✅ Campo '${field}' aplicado con éxito.`, 'success');
                } else {
                    showStatus(`❌ Error al aplicar el campo '${field}'.`, 'error');
                }
            });
        }
    });

    // Escucha los cambios en los inputs del formulario y actualiza el JSON visualmente
    seoForm.addEventListener('input', (event) => {
        const fieldMap = {
            inputTitle: 'title',
            inputHtmlDescription: 'html_description',
            inputFocusKeyword: 'focus_keyword',
            inputSeoTitle: 'seo_title',
            inputSlug: 'slug',
            inputSeoDescription: 'seo_description',
            inputImageAlt: 'image_alt'
        };

        const inputId = event.target.id;
        const field = fieldMap[inputId];
        if (field) {
            currentSeoData[field] = event.target.value;
            jsonOutput.textContent = JSON.stringify(currentSeoData, null, 2);
        }
    });

    copyJsonBtn.addEventListener('click', copyJson);
});
