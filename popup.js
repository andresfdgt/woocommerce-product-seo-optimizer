// Archivo: popup.js
// Este script maneja la interfaz de usuario del popup con persistencia e historial.

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const historyBtn = document.getElementById('historyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const debugBtn = document.getElementById('debugBtn');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const statusDiv = document.getElementById('status');
    const jsonContainer = document.querySelector('.json-container');
    const jsonOutput = document.getElementById('jsonOutput');
    const seoFormContainer = document.getElementById('seo-form-container');
    const seoForm = document.getElementById('seo-form');
    
    // Elementos del historial
    const historyContainer = document.getElementById('history-container');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyList = document.getElementById('history-list');
    
    // Indicador de contenido restaurado
    const restoredIndicator = document.getElementById('restored-indicator');
    const dismissIndicator = document.getElementById('dismissIndicator');

    let currentSeoData = {};
    let currentUrl = '';

    /**
     * Clase para manejar la persistencia y el historial
     */
    class SEODataManager {
        constructor() {
            this.storageKeys = {
                current: 'seo_current_data',
                history: 'seo_history_data'
            };
        }

        /**
         * Guarda los datos actuales
         */
        async saveCurrent(data, url) {
            const saveData = {
                data: data,
                url: url,
                timestamp: Date.now(),
                saved_at: new Date().toLocaleString('es-ES')
            };
            
            await chrome.storage.local.set({
                [this.storageKeys.current]: saveData
            });
        }

        /**
         * Recupera los datos actuales
         */
        async getCurrent() {
            const result = await chrome.storage.local.get([this.storageKeys.current]);
            return result[this.storageKeys.current] || null;
        }

        /**
         * Guarda en el historial
         */
        async saveToHistory(data, url) {
            const historyData = await this.getHistory();
            
            const newEntry = {
                id: Date.now(),
                data: data,
                url: url,
                timestamp: Date.now(),
                saved_at: new Date().toLocaleString('es-ES'),
                preview: {
                    title: data.seo_title || data.title || 'Sin título',
                    keyword: data.focus_keyword || 'Sin palabra clave'
                }
            };

            // Añadir al inicio del array y mantener solo las últimas 20
            historyData.unshift(newEntry);
            const limitedHistory = historyData.slice(0, 20);

            await chrome.storage.local.set({
                [this.storageKeys.history]: limitedHistory
            });
        }

        /**
         * Recupera el historial
         */
        async getHistory() {
            const result = await chrome.storage.local.get([this.storageKeys.history]);
            return result[this.storageKeys.history] || [];
        }

        /**
         * Limpia todos los datos
         */
        async clearAll() {
            await chrome.storage.local.remove([this.storageKeys.current, this.storageKeys.history]);
        }

        /**
         * Elimina solo los datos actuales
         */
        async clearCurrent() {
            await chrome.storage.local.remove([this.storageKeys.current]);
        }
    }

    const dataManager = new SEODataManager();

    /**
     * Muestra un mensaje de estado en el popup.
     */
    function showStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'block';
        
        // Auto-ocultar después de 5 segundos para mensajes de éxito
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Obtiene la URL actual de la pestaña
     */
    async function getCurrentUrl() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
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
     */
    function fillForm(data) {
        document.getElementById('inputTitle').value = data.title || '';
        document.getElementById('inputHtmlDescription').value = data.html_description || '';
        document.getElementById('inputFocusKeyword').value = data.focus_keyword || '';
        document.getElementById('inputSeoTitle').value = data.seo_title || '';
        document.getElementById('inputSlug').value = data.slug || '';
        document.getElementById('inputSeoDescription').value = data.seo_description || '';
        document.getElementById('inputImageAlt').value = data.image_alt || '';
        
        // Habilita los inputs para edición.
        document.querySelectorAll('#seo-form input, #seo-form textarea').forEach(input => input.disabled = false);

        seoFormContainer.classList.remove('hidden');
    }

    /**
     * Actualiza la visualización del JSON
     */
    function updateJsonDisplay() {
        const json = JSON.stringify(currentSeoData, null, 2);
        jsonOutput.textContent = json;
        jsonContainer.classList.remove('hidden');
    }

    /**
     * Guarda automáticamente los datos actuales
     */
    async function autoSave() {
        if (Object.keys(currentSeoData).length > 0) {
            await dataManager.saveCurrent(currentSeoData, currentUrl);
        }
    }

    /**
     * Carga y muestra el historial
     */
    async function loadHistory() {
        const history = await dataManager.getHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="no-history">No hay generaciones guardadas</p>';
            return;
        }

        historyList.innerHTML = history.map(entry => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-meta">
                    <span class="history-date">${entry.saved_at}</span>
                    <span class="history-url" title="${entry.url}">${new URL(entry.url).pathname}</span>
                </div>
                <div class="history-preview">
                    <strong>${entry.preview.title}</strong><br>
                    <small>🎯 ${entry.preview.keyword}</small>
                </div>
            </div>
        `).join('');

        // Añadir eventos de clic a los elementos del historial
        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', async () => {
                const id = parseInt(item.dataset.id);
                const entry = history.find(h => h.id === id);
                if (entry) {
                    await loadFromHistory(entry);
                    historyContainer.classList.add('hidden');
                }
            });
        });
    }

    /**
     * Carga datos desde el historial
     */
    async function loadFromHistory(entry) {
        currentSeoData = { ...entry.data };
        currentUrl = entry.url;
        
        fillForm(currentSeoData);
        updateJsonDisplay();
        
        showStatus(`📚 Datos cargados desde el historial (${entry.saved_at})`, 'success');
        
        // Guardar como datos actuales
        await dataManager.saveCurrent(currentSeoData, currentUrl);
    }

    /**
     * Intenta restaurar los datos de la sesión anterior
     */
    async function tryRestoreSession() {
        const saved = await dataManager.getCurrent();
        const url = await getCurrentUrl();
        
        if (saved && saved.data && Object.keys(saved.data).length > 0) {
            // Verificar si estamos en la misma URL o una similar
            const isSamePage = saved.url === url || url.includes('post.php') || url.includes('wp-admin/post');
            
            if (isSamePage) {
                currentSeoData = { ...saved.data };
                currentUrl = saved.url;
                
                fillForm(currentSeoData);
                updateJsonDisplay();
                
                restoredIndicator.classList.remove('hidden');
                showStatus('✨ Sesión anterior restaurada automáticamente', 'success');
                
                return true;
            }
        }
        
        return false;
    }

    // Inicialización al cargar el popup
    async function initialize() {
        currentUrl = await getCurrentUrl();
        
        // Intentar restaurar sesión anterior
        await tryRestoreSession();
        
        // Cargar historial
        await loadHistory();
    }

    // Event Listeners

    // Generar nuevo contenido SEO
    generateBtn.addEventListener('click', async () => {
        showStatus('Generando contenido SEO...', 'info');
        jsonContainer.classList.add('hidden');
        seoFormContainer.classList.add('hidden');
        restoredIndicator.classList.add('hidden');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentUrl = tab.url;

        chrome.tabs.sendMessage(tab.id, { action: 'GET_PRODUCT_DATA' }, async (response) => {
            if (response && response.productData) {
                const productData = response.productData;

                chrome.runtime.sendMessage({ action: 'generate_seo', data: productData }, async (apiResponse) => {
                    if (apiResponse.error) {
                        showStatus(apiResponse.error, 'error');
                        jsonOutput.textContent = apiResponse.error;
                        jsonContainer.classList.remove('hidden');
                        return;
                    }

                    if (apiResponse.data) {
                        try {
                            currentSeoData = apiResponse.data;
                            
                            updateJsonDisplay();
                            fillForm(currentSeoData);

                            // Guardar en historial y como datos actuales
                            await dataManager.saveToHistory(currentSeoData, currentUrl);
                            await dataManager.saveCurrent(currentSeoData, currentUrl);
                            
                            // Recargar historial
                            await loadHistory();

                            // Mostrar qué IA se usó
                            const provider = currentSeoData._metadata?.provider || 'IA';
                            const model = currentSeoData._metadata?.model || '';
                            const aiInfo = model ? `${provider.toUpperCase()} (${model})` : provider.toUpperCase();
                            
                            showStatus(`✅ Contenido generado con ${aiInfo}. Puedes editarlo y aplicarlo.`, 'success');
                        } catch (e) {
                            showStatus('Error al procesar la respuesta de la API.', 'error');
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

    // Mostrar/ocultar historial
    historyBtn.addEventListener('click', async () => {
        if (historyContainer.classList.contains('hidden')) {
            await loadHistory();
            historyContainer.classList.remove('hidden');
        } else {
            historyContainer.classList.add('hidden');
        }
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyContainer.classList.add('hidden');
    });

    // Limpiar datos
    clearBtn.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que quieres limpiar todos los datos guardados? Esta acción no se puede deshacer.')) {
            await dataManager.clearAll();
            
            // Limpiar interfaz
            currentSeoData = {};
            seoFormContainer.classList.add('hidden');
            jsonContainer.classList.add('hidden');
            restoredIndicator.classList.add('hidden');
            
            // Recargar historial
            await loadHistory();
            
            showStatus('🗑️ Todos los datos han sido eliminados.', 'success');
        }
    });

    // Cerrar indicador de restauración
    dismissIndicator.addEventListener('click', () => {
        restoredIndicator.classList.add('hidden');
    });

    // Aplicar campos individuales
    seoForm.addEventListener('click', async (event) => {
        if (event.target.classList.contains('apply-btn')) {
            const field = event.target.dataset.field;
            
            // Mapeo correcto de campos a IDs de input en el popup
            const fieldToInputMap = {
                'title': 'inputTitle',
                'html_description': 'inputHtmlDescription',
                'focus_keyword': 'inputFocusKeyword',
                'seo_title': 'inputSeoTitle',
                'slug': 'inputSlug',
                'seo_description': 'inputSeoDescription',
                'image_alt': 'inputImageAlt'
            };
            
            const inputId = fieldToInputMap[field];
            const inputElement = document.getElementById(inputId);
            
            if (!inputElement) {
                showStatus(`❌ Error: No se encontró el campo '${field}' en el formulario`, 'error');
                console.error(`[WooSEO] Campo no encontrado: ${field}, inputId esperado: ${inputId}`);
                return;
            }
            
            const value = inputElement.value;
            
            // Mostrar que se está procesando
            const originalText = event.target.textContent;
            event.target.textContent = '⏳';
            event.target.disabled = true;
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            chrome.tabs.sendMessage(tab.id, {
                action: 'APPLY_SINGLE_FIELD',
                field: field,
                value: value
            }, (response) => {
                // Restaurar botón
                event.target.textContent = originalText;
                event.target.disabled = false;
                
                if (response && response.success) {
                    showStatus(`✅ Campo '${field}' aplicado con éxito.`, 'success');
                } else {
                    const errorMsg = response?.error || 'Error desconocido';
                    showStatus(`❌ Error al aplicar '${field}': ${errorMsg}`, 'error');
                    console.error('[WooSEO] Error detallado:', response);
                }
            });
        }
    });

    // Escuchar cambios en el formulario para auto-guardar
    seoForm.addEventListener('input', async (event) => {
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
            updateJsonDisplay();
            
            // Auto-guardar después de un pequeño delay
            clearTimeout(window.autoSaveTimeout);
            window.autoSaveTimeout = setTimeout(autoSave, 1000);
        }
    });

    // Debugging - analizar editores disponibles
    debugBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.tabs.sendMessage(tab.id, { action: 'DEBUG_EDITORS' }, (response) => {
            if (response && response.success) {
                showStatus('🔍 Información de debugging enviada a la consola', 'info');
            } else {
                showStatus('❌ Error al ejecutar debugging', 'error');
            }
        });
    });

    copyJsonBtn.addEventListener('click', copyJson);

    // Inicializar la aplicación
    initialize();
});
