// Archivo: background.js (Service Worker)
// Este script se encarga de la comunicación con la API de Gemini.

const API_MODEL = 'gemini-2.5-flash-preview-05-20'; // Modelo de la API de Gemini por defecto

/**
 * Función para llamar a la API de Gemini y obtener la respuesta JSON.
 * @param {string} prompt El prompt completo a enviar a la API.
 * @param {string} apiKey La clave de API de Gemini.
 * @returns {Promise<object>} Una promesa que se resuelve con el objeto JSON generado.
 */
async function callGeminiApi(prompt, apiKey) {
    // URL de la API de Gemini, ahora con la API key correctamente incluida.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${apiKey}`;

    // Configuración para generar una respuesta en formato JSON.
    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: {
            "type": "OBJECT",
            "properties": {
                "title": { "type": "STRING" },
                "html_description": { "type": "STRING" },
                "focus_keyword": { "type": "STRING" },
                "seo_title": { "type": "STRING" },
                "slug": { "type": "STRING" },
                "seo_description": { "type": "STRING" },
                "image_alt": { "type": "STRING" }
            },
            "required": ["title", "html_description", "focus_keyword", "seo_title", "slug", "seo_description", "image_alt"]
        }
    };

    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }],
        generationConfig
    };

    // Implementación de reintentos con backoff exponencial.
    const maxRetries = 3;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(`[WooSEO] Error en la API: ${response.statusText}`);
                throw new Error(`Error de la API: ${response.statusText}`);
            }

            const result = await response.json();

            // Verificación del formato de la respuesta.
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const jsonText = result.candidates[0].content.parts[0].text;
                return JSON.parse(jsonText);
            } else {
                throw new Error("Respuesta de la API con formato inesperado.");
            }
        } catch (error) {
            console.error(`[WooSEO] Intento ${retries + 1} fallido. Error: ${error.message}`);
            retries++;
            if (retries < maxRetries) {
                const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error; // Lanzar el error después de todos los reintentos.
            }
        }
    }
}

// Escucha mensajes de popup.js y content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Maneja la solicitud de generación de SEO.
    if (request.action === 'generate_seo') {
        const { title, description, ingredients, size, imageUrl } = request.data;

        // Recupera la API key y el prompt base de chrome.storage.sync.
        chrome.storage.sync.get(['gemini_api_key', 'base_prompt'], async (items) => {
            const apiKey = items.gemini_api_key;
            let basePrompt = items.base_prompt;

            if (!apiKey) {
                sendResponse({ error: 'API key no configurada. Por favor, ve a las opciones de la extensión para configurarla.' });
                return;
            }

            if (!basePrompt) {
                // Prompt por defecto si no hay uno configurado.
                basePrompt = `Eres un experto en SEO para fichas de producto de e-commerce (WooCommerce + Rank Math).
Devuelve SOLO un objeto JSON con EXACTAMENTE estas claves en este orden:
title, html_description, focus_keyword, seo_title, slug, seo_description, image_alt.
No añadas texto fuera del JSON ni bloques de código.

Reglas obligatorias:
Español neutro, acentos correctos.
Especifica la especie cuando sea evidente (usa “para perros” o “para gatos”; si no, “para mascotas”).
Mantén CONSISTENCIA: usa la misma forma exacta de la focus_keyword (singular/plural, sin diminutivos) en todos los campos.
La focus_keyword debe aparecer exactamente igual en: title, seo_title, seo_description, slug y en el primer párrafo de html_description.
No inventes datos que no estén en título, descripción o imagen. No hagas afirmaciones médicas.
Si hay presentación/tamaño (p. ej., 100 g, 500 g) inclúyelo en title, html_description, focus_keyword, seo_title, slug y, cuando sea natural, en seo_description.
Evita marca a menos que esté en los datos.
No usar mayúsculas innecesarias, solo en nombres propios o inicio de frase.

Definiciones de cada campo:
title: orientado a conversión; inicia con la focus_keyword; incluye especie y presentación si aplica (ej.: “Hueso de calcio con pollo 100 g para perros”).
html_description: usa HTML semántico con esta estructura:
<h2>{title}</h2>
<p>Resumen introductorio que incluya la focus_keyword exacta y sea atractivo para el comprador.</p>
<h3>Beneficios</h3><ul><li>…</li></ul>
<h3>Uso recomendado</h3><ul><li>…</li></ul>
<h3>Composición y presentación</h3><ul><li>…</li></ul>
<h3>Conservación</h3><ul><li>…</li></ul>
<p>Llamado a la acción final breve y persuasivo.</p>

Incluir la focus_keyword al menos una vez en el primer párrafo y otra en el cuerpo, sin sobreoptimizar.
focus_keyword: específica y natural; incluye “para perros” o “para gatos” cuando aplique (ej.: “hueso de calcio con pollo para perros”).
seo_title: comienza EXACTAMENTE con la focus_keyword + “ | Golfitos Petshop” (≤60 caracteres).
slug: minúsculas, sin tildes, con guiones; basado en la focus_keyword, incluye tamaño si aplica (ej.: “hueso-calcio-pollo-perros-100g”).
seo_description: ≤160 caracteres; empieza con la focus_keyword, añade 1–2 beneficios clave y un CTA breve. Sin comillas ni emojis.
image_alt: ≤125 caracteres; describe el producto y especie; incluye tamaño/color/variante si consta o es visible; evita repeticiones innecesarias.

Datos del producto a optimizar:
Título: {title}
Descripción: {description}
Ingredientes/Medidas: {ingredients}
URL de la imagen: {imageUrl}
    `;
            }

            // Construye el prompt completo.
            const fullPrompt = basePrompt
                .replace('{title}', title)
                .replace('{description}', description)
                .replace('{ingredients}', ingredients)
                .replace('{size}', size)
                .replace('{imageUrl}', imageUrl);

            try {
                // Llama a la API de Gemini.
                const jsonResult = await callGeminiApi(fullPrompt, apiKey);
                console.log('[WooSEO] Respuesta de la API recibida:', jsonResult);
                sendResponse({ data: jsonResult });
            } catch (error) {
                console.error('[WooSEO] Error al llamar a la API:', error);
                sendResponse({ error: error.message });
            }
        });
        return true; // Indica que se enviará una respuesta de forma asíncrona.
    }
});
