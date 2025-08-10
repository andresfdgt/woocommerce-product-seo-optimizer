// Archivo: content.js
// Este script se inyecta en la página de edición de productos de WooCommerce.
// Se encarga de extraer la información y de inyectar el JSON de la API.

console.log('[WooSEO] Script content.js cargado.');

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
    let targetElement = null;

    switch (field) {
        case 'title':
            targetElement = document.querySelector('#title') || document.querySelector('.editor-post-title__input');
            if (targetElement) targetElement.value = value;
            break;
        case 'html_description':
            if (isGutenbergEditor()) {
                window.wp.data.dispatch('core/editor').editPost({ content: value });
            } else {
                targetElement = document.querySelector('textarea.wp-editor-area');
                if (targetElement) {
                    targetElement.value = value;
                    if (window.tinymce) {
                        const editor = window.tinymce.get('content');
                        if (editor) editor.setContent(value);
                    }
                }
            }
            break;
        case 'focus_keyword':
            targetElement = document.querySelector('input[name="rank_math_focus_keyword"]');
            if (targetElement) targetElement.value = value;
            break;
        case 'seo_title':
            targetElement = document.querySelector('input[name="rank_math_title"]');
            if (targetElement) targetElement.value = value;
            break;
        case 'slug':
            targetElement = document.querySelector('#new-post-slug') || document.querySelector('.editor-post-slug__input');
            if (targetElement && !targetElement.readOnly && !targetElement.disabled) {
                targetElement.value = value;
            } else {
                console.warn('[WooSEO] El campo slug no es editable.');
            }
            break;
        case 'seo_description':
            targetElement = document.querySelector('textarea[name="rank_math_description"]');
            if (targetElement) targetElement.value = value;
            break;
        case 'image_alt':
            targetElement = document.querySelector('input[aria-label="Alt text"]') || document.querySelector('input[aria-label="Texto alternativo"]');
            if (targetElement) targetElement.value = value;
            break;
    }

    if (targetElement) {
        dispatchEvents(targetElement);
        return true;
    }
    return false;
}

// Escucha mensajes del popup (e.g., para aplicar el JSON).
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || !request.action) {
        console.error('[WooSEO] Mensaje de solicitud inválido.');
        return;
    }

    if (request.action === 'GET_PRODUCT_DATA') {
        const data = getProductData();
        sendResponse({ productData: data });
    } else if (request.action === 'APPLY_JSON') {
        applySeoData(request.data);
        sendResponse({ success: true });
    } else if (request.action === 'APPLY_SINGLE_FIELD') {
        const success = applySingleField(request.field, request.value);
        sendResponse({ success: success });
    }
    return true; // Indica que la respuesta será asíncrona.
});
