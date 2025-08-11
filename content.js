// Archivo: content.js
// Este script se inyecta en la página de edición de productos de WooCommerce.
// Se encarga de extraer la información y de inyectar el JSON de la API.

console.log('[WooSEO] Script content.js cargado.');

/**
 * Función de debugging para identificar qué editores están disponibles
 */
function debugEditors() {
    console.log('[WooSEO] === DEBUG: Analizando editores disponibles ===');
    
    // Check Gutenberg
    const isGutenberg = window.wp && window.wp.data && window.wp.data.select('core/editor');
    console.log('[WooSEO] Gutenberg disponible:', isGutenberg);
    
    // Check TinyMCE
    const hasTinyMCE = window.tinymce;
    console.log('[WooSEO] TinyMCE disponible:', hasTinyMCE);
    if (hasTinyMCE) {
        const editor = window.tinymce.get('content');
        console.log('[WooSEO] TinyMCE editor "content":', editor);
    }
    
    // Check elementos del DOM
    const elements = {
        'textarea.wp-editor-area': document.querySelector('textarea.wp-editor-area'),
        '#content': document.querySelector('#content'),
        '#content_ifr': document.querySelector('#content_ifr'),
        '.wp-editor-area': document.querySelector('.wp-editor-area'),
        '[name="content"]': document.querySelector('[name="content"]'),
        '#postdivrich textarea': document.querySelector('#postdivrich textarea'),
        '.editor-rich-text__editable': document.querySelector('.editor-rich-text__editable')
    };
    
    console.log('[WooSEO] Elementos encontrados:');
    Object.entries(elements).forEach(([selector, element]) => {
        console.log(`  ${selector}:`, element ? 'ENCONTRADO' : 'NO ENCONTRADO');
    });
    
    console.log('[WooSEO] === FIN DEBUG ===');
}

/**
 * Función para detectar si el editor es Gutenberg o el clásico.
 * @returns {boolean} True si es Gutenberg, false si es clásico.
 */
function isGutenbergEditor() {
    return window.wp && window.wp.data && window.wp.data.select('core/editor');
}

/**
 * Extrae los datos del producto de la página de edición.
 * @returns {object} Un objeto con los datos del producto.
 */
function getProductData() {
    let title = '';
    let description = '';
    let ingredients = '';
    let size = '';
    let imageUrl = '';
    
    // 1. Extraer título
    const titleInput = document.querySelector('#title') || document.querySelector('.editor-post-title__input');
    if (titleInput) {
        title = titleInput.value;
    }

    // 2. Extraer descripción
    if (isGutenbergEditor()) {
        try {
            description = window.wp.data.select('core/editor').getEditedPostAttribute('content');
        } catch (e) {
            console.error('[WooSEO] Error al obtener la descripción de Gutenberg:', e);
        }
    } else {
        const classicDescription = document.querySelector('textarea.wp-editor-area');
        if (classicDescription) {
            description = classicDescription.value;
        }
    }

    // 3. Extraer ingredientes y medidas usando heurística
    if (description) {
        const ingredientsMatch = description.match(/ingredientes:(.*?)(\.|\n)/i);
        if (ingredientsMatch) {
            ingredients = ingredientsMatch[1].trim();
        }
        const sizeMatch = description.match(/(peso|talla|medida|contenido): (.*?)(\.|\n)/i);
        if (sizeMatch) {
            size = sizeMatch[2].trim();
        }
    }

    // 4. Extraer URL de la imagen destacada
    const featuredImage = document.querySelector('.editor-post-featured-image img') || document.querySelector('#postimagediv img');
    if (featuredImage && featuredImage.src) {
        imageUrl = featuredImage.src;
    }

    return { title, description, ingredients, size, imageUrl };
}

/**
 * Dispara eventos de input y change para que WordPress y Rank Math detecten los cambios.
 * @param {HTMLElement} element El elemento del DOM a actualizar.
 */
function dispatchEvents(element) {
    if (!element) return;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Inyecta los datos SEO generados por la API en la página.
 * @param {object} data El objeto JSON con los datos SEO.
 */
function applySeoData(data) {
    if (!data) return;

    // Rellenar campos de WooCommerce
    const titleInput = document.querySelector('#title') || document.querySelector('.editor-post-title__input');
    if (titleInput) {
        titleInput.value = data.title;
        dispatchEvents(titleInput);
    }
    
    if (isGutenbergEditor()) {
        try {
            window.wp.data.dispatch('core/editor').editPost({ content: data.html_description });
        } catch (e) {
            console.error('[WooSEO] Error al inyectar descripción en Gutenberg:', e);
        }
    } else {
        const classicDescription = document.querySelector('textarea.wp-editor-area');
        if (classicDescription) {
            classicDescription.value = data.html_description;
            // Para el editor TinyMCE, también necesitamos actualizar el iframe.
            if (window.tinymce) {
                const editor = window.tinymce.get('content');
                if (editor) {
                    editor.setContent(data.html_description);
                }
            }
            dispatchEvents(classicDescription);
        }
    }

    // Rellenar campos de Rank Math
    try {
        const rankMathFocus = document.querySelector('input[name="rank_math_focus_keyword"]');
        if (rankMathFocus) {
            rankMathFocus.value = data.focus_keyword;
            dispatchEvents(rankMathFocus);
        }
        
        const rankMathTitle = document.querySelector('input[name="rank_math_title"]');
        if (rankMathTitle) {
            rankMathTitle.value = data.seo_title;
            dispatchEvents(rankMathTitle);
        }

        const rankMathDescription = document.querySelector('textarea[name="rank_math_description"]');
        if (rankMathDescription) {
            rankMathDescription.value = data.seo_description;
            dispatchEvents(rankMathDescription);
        }
    } catch (e) {
        console.error('[WooSEO] Error al rellenar campos de Rank Math:', e);
    }
    
    // Rellenar Slug
    const slugInput = document.querySelector('#new-post-slug') || document.querySelector('.editor-post-slug__input');
    if (slugInput) {
        if (!slugInput.readOnly && !slugInput.disabled) {
            slugInput.value = data.slug;
            dispatchEvents(slugInput);
        } else {
            console.warn('[WooSEO] El campo slug no es editable.');
            // Muestra un aviso en el popup o en la consola si no es editable
        }
    }

    // Rellenar Alt de imagen destacada
    const altInput = document.querySelector('input[aria-label="Alt text"]') || document.querySelector('input[aria-label="Texto alternativo"]');
    if (altInput) {
        altInput.value = data.image_alt;
        dispatchEvents(altInput);
    }

    // Mostrar un aviso de éxito
    const successMsg = document.createElement('div');
    successMsg.textContent = '✅ Datos SEO pegados con éxito.';
    successMsg.style.cssText = 'position:fixed;top:10px;right:10px;background-color:#4CAF50;color:white;padding:15px;border-radius:5px;z-index:9999;font-size:16px;box-shadow:0 4px 8px rgba(0,0,0,0.2);';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
}

/**
 * Aplica un único campo al producto.
 * @param {string} field El nombre del campo a aplicar.
 * @param {string} value El valor a aplicar.
 */
function applySingleField(field, value) {
    console.log(`[WooSEO] Aplicando campo: ${field} con valor:`, value);
    
    // Mapeo de campos del popup a campos de WordPress
    const fieldMappings = {
        'title': ['#title', 'input[name="post_title"]', '#post-title-0'],
        'html_description': ['#content', 'textarea[name="content"]', '#content_ifr'],
        'focus_keyword': [
            '.tagify__input',
            'input[name="rank_math_focus_keyword"]',
            '#rank-math-focus-keyword',
            '.rank-math-focus-keyword'
        ],
        'seo_title': [
            '#rank-math-editor-title',
            'input[name="rank_math_title"]',
            '#rank-math-title',
            '.rank-math-title'
        ],
        'slug': ['#post_name', '#editable-post-name', 'input[name="post_name"]'],
        'seo_description': [
            '#rank-math-editor-description',
            'textarea[name="rank_math_description"]',
            '#rank-math-description',
            '.rank-math-description'
        ],
        'image_alt': ['input[name="_wp_attachment_image_alt"]', '#attachment_alt']
    };

    const selectors = fieldMappings[field];
    if (!selectors) {
        console.error(`[WooSEO] Campo '${field}' no reconocido`);
        return false;
    }

    let success = false;
    let lastError = '';

    // Manejo especial para descripción HTML
    if (field === 'html_description') {
        success = applyHtmlDescription(value);
        return success;
    }

    // Manejo especial para focus keyword (Tagify)
    if (field === 'focus_keyword') {
        success = applyFocusKeyword(value);
        return success;
    }

    // Para otros campos, intentar selectores en orden
    for (const selector of selectors) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`[WooSEO] Elemento encontrado con selector: ${selector}`);
                
                // Aplicar valor según el tipo de elemento
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = value;
                    element.focus();
                    dispatchEvents(element);
                } else {
                    element.textContent = value;
                }
                
                success = true;
                console.log(`[WooSEO] Campo '${field}' aplicado exitosamente`);
                break;
            }
        } catch (error) {
            lastError = error.message;
            console.warn(`[WooSEO] Error con selector ${selector}:`, error);
        }
    }

    if (!success) {
        console.error(`[WooSEO] No se encontró el campo '${field}'. Último error: ${lastError}`);
    }

    return success;
}

/**
 * Función específica para aplicar la descripción HTML con múltiples estrategias
 * @param {string} htmlContent El contenido HTML a aplicar
 * @returns {boolean} True si se aplicó correctamente
 */
function applyHtmlDescription(htmlContent) {
    console.log('[WooSEO] Intentando aplicar descripción HTML:', htmlContent);
    
    // Estrategia 1: Editor TinyMCE (Visual)
    if (typeof tinyMCE !== 'undefined' && tinyMCE.get('content')) {
        try {
            const editor = tinyMCE.get('content');
            if (editor && !editor.isHidden()) {
                editor.setContent(htmlContent);
                editor.focus();
                console.log('[WooSEO] ✅ Contenido aplicado via TinyMCE');
                return true;
            }
        } catch (error) {
            console.warn('[WooSEO] Error con TinyMCE:', error);
        }
    }

    // Estrategia 2: Iframe de TinyMCE
    try {
        const iframe = document.getElementById('content_ifr');
        if (iframe && iframe.contentDocument) {
            const body = iframe.contentDocument.body;
            if (body) {
                body.innerHTML = htmlContent;
                console.log('[WooSEO] ✅ Contenido aplicado via iframe TinyMCE');
                return true;
            }
        }
    } catch (error) {
        console.warn('[WooSEO] Error con iframe TinyMCE:', error);
    }

    // Estrategia 3: Textarea (modo Código)
    try {
        const textarea = document.getElementById('content');
        if (textarea) {
            textarea.value = htmlContent;
            textarea.focus();
            dispatchEvents(textarea);
            console.log('[WooSEO] ✅ Contenido aplicado via textarea');
            return true;
        }
    } catch (error) {
        console.warn('[WooSEO] Error con textarea:', error);
    }

    // Estrategia 4: Gutenberg (si está presente)
    try {
        if (typeof wp !== 'undefined' && wp.data && wp.data.select('core/editor')) {
            wp.data.dispatch('core/editor').editPost({ content: htmlContent });
            console.log('[WooSEO] ✅ Contenido aplicado via Gutenberg');
            return true;
        }
    } catch (error) {
        console.warn('[WooSEO] Error con Gutenberg:', error);
    }

    console.error('[WooSEO] ❌ No se pudo aplicar la descripción HTML con ninguna estrategia');
    return false;
}

/**
 * Función específica para aplicar el focus keyword con Tagify
 * @param {string} keyword La palabra clave a aplicar
 * @returns {boolean} True si se aplicó correctamente
 */
function applyFocusKeyword(keyword) {
    console.log('[WooSEO] Intentando aplicar focus keyword:', keyword);
    
    // Estrategia 1: Tagify input (Rank Math nuevo)
    try {
        const tagifyInput = document.querySelector('.tagify__input');
        if (tagifyInput) {
            // Limpiar contenido actual
            tagifyInput.textContent = '';
            tagifyInput.innerHTML = '';
            
            // Insertar el nuevo keyword
            tagifyInput.textContent = keyword;
            tagifyInput.innerHTML = keyword;
            
            // Simular eventos de teclado para activar Tagify
            tagifyInput.focus();
            
            // Simular typing
            const inputEvent = new Event('input', { bubbles: true, cancelable: true });
            tagifyInput.dispatchEvent(inputEvent);
            
            // Simular Enter para confirmar el tag
            const keydownEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });
            tagifyInput.dispatchEvent(keydownEvent);
            
            console.log('[WooSEO] ✅ Focus keyword aplicado via Tagify');
            return true;
        }
    } catch (error) {
        console.warn('[WooSEO] Error con Tagify:', error);
    }
    
    // Estrategia 2: Input hidden de Rank Math (versión anterior)
    try {
        const hiddenInput = document.querySelector('input[name="rank_math_focus_keyword"]');
        if (hiddenInput) {
            hiddenInput.value = keyword;
            dispatchEvents(hiddenInput);
            console.log('[WooSEO] ✅ Focus keyword aplicado via input hidden');
            return true;
        }
    } catch (error) {
        console.warn('[WooSEO] Error con input hidden:', error);
    }
    
    // Estrategia 3: Otros selectores alternativos
    const alternativeSelectors = [
        '#rank-math-focus-keyword',
        '.rank-math-focus-keyword',
        'input[placeholder*="Rank Math"]'
    ];
    
    for (const selector of alternativeSelectors) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                element.value = keyword;
                element.focus();
                dispatchEvents(element);
                console.log(`[WooSEO] ✅ Focus keyword aplicado via ${selector}`);
                return true;
            }
        } catch (error) {
            console.warn(`[WooSEO] Error con selector ${selector}:`, error);
        }
    }
    
    console.error('[WooSEO] ❌ No se pudo aplicar el focus keyword con ninguna estrategia');
    return false;
}

// Escucha mensajes del popup (e.g., para aplicar el JSON).
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[WooSEO] Mensaje recibido:', request);
    
    if (!request || !request.action) {
        console.error('[WooSEO] Mensaje de solicitud inválido.');
        sendResponse({ success: false, error: 'Mensaje inválido' });
        return;
    }

    if (request.action === 'GET_PRODUCT_DATA') {
        const data = getProductData();
        console.log('[WooSEO] Datos del producto extraídos:', data);
        sendResponse({ productData: data });
        
    } else if (request.action === 'APPLY_JSON') {
        applySeoData(request.data);
        sendResponse({ success: true });
        
    } else if (request.action === 'APPLY_SINGLE_FIELD') {
        console.log(`[WooSEO] Aplicando campo individual: ${request.field}`);
        
        // Ejecutar debugging antes de aplicar el campo
        if (request.field === 'html_description') {
            debugEditors();
        }
        
        const success = applySingleField(request.field, request.value);
        
        if (success) {
            console.log(`[WooSEO] Campo ${request.field} aplicado exitosamente`);
            sendResponse({ success: true });
        } else {
            console.error(`[WooSEO] Error al aplicar campo ${request.field}`);
            sendResponse({ 
                success: false, 
                error: `No se pudo aplicar el campo ${request.field}` 
            });
        }
        
    } else if (request.action === 'DEBUG_EDITORS') {
        // Nueva acción para debugging manual
        debugEditors();
        sendResponse({ success: true });
    }
    
    return true; // Indica que la respuesta será asíncrona.
});
