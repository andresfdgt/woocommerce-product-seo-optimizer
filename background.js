// Archivo: background.js (Service Worker)
// Este script se encarga de la comunicación con múltiples APIs de IA.

/**
 * Función para llamar a la API de Gemini
 */
async function callGeminiApi(prompt, apiKey, model) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Error de Gemini API: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        return JSON.parse(jsonText);
    } else {
        throw new Error("Respuesta de Gemini con formato inesperado.");
    }
}

/**
 * Función para llamar a la API de OpenAI
 */
async function callOpenAIApi(prompt, apiKey, model) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const payload = {
        model: model,
        messages: [
            {
                role: "system",
                content: "Eres un experto en SEO. Responde únicamente con un objeto JSON válido, sin texto adicional ni bloques de código."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error de OpenAI API: ${response.statusText} - ${errorData.error?.message || 'Error desconocido'}`);
    }

    const result = await response.json();

    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
        const jsonText = result.choices[0].message.content;
        return JSON.parse(jsonText);
    } else {
        throw new Error("Respuesta de OpenAI con formato inesperado.");
    }
}

/**
 * Función principal para generar contenido SEO con cualquier IA
 */
async function generateSEOContent(prompt, config) {
    const { ai_provider, gemini_api_key, gemini_model, openai_api_key, openai_model } = config;

    // Implementación de reintentos con backoff exponencial
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            let result;

            if (ai_provider === 'openai') {
                if (!openai_api_key) {
                    throw new Error('API Key de OpenAI no configurada');
                }
                result = await callOpenAIApi(prompt, openai_api_key, openai_model);
            } else {
                // Por defecto usar Gemini
                if (!gemini_api_key) {
                    throw new Error('API Key de Gemini no configurada');
                }
                result = await callGeminiApi(prompt, gemini_api_key, gemini_model);
            }

            console.log('[WooSEO] Respuesta de la IA recibida:', result);
            return result;

        } catch (error) {
            console.error(`[WooSEO] Intento ${retries + 1} fallido. Error: ${error.message}`);
            retries++;
            
            if (retries < maxRetries) {
                const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

// Escucha mensajes de popup.js y content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generate_seo') {
        const { title, description, ingredients, size, imageUrl } = request.data;

        // Recupera toda la configuración de IA
        chrome.storage.sync.get([
            'ai_provider',
            'gemini_api_key',
            'gemini_model', 
            'openai_api_key',
            'openai_model',
            'base_prompt'
        ], async (items) => {
            // Configuración por defecto
            const config = {
                ai_provider: items.ai_provider || 'gemini',
                gemini_api_key: items.gemini_api_key || '',
                gemini_model: items.gemini_model || 'gemini-2.5-flash-preview-05-20',
                openai_api_key: items.openai_api_key || '',
                openai_model: items.openai_model || 'gpt-4o'
            };

            let basePrompt = items.base_prompt;

            // Verificar API Key según el proveedor
            const currentProvider = config.ai_provider;
            const hasApiKey = currentProvider === 'openai' ? 
                config.openai_api_key : 
                config.gemini_api_key;

            if (!hasApiKey) {
                const providerName = currentProvider === 'openai' ? 'OpenAI' : 'Gemini';
                sendResponse({ 
                    error: `API Key de ${providerName} no configurada. Por favor, ve a las opciones de la extensión para configurarla.` 
                });
                return;
            }

            if (!basePrompt) {
                // Prompt por defecto basado en el proveedor
                const defaultPrompts = {
                    gemini: `Eres un experto en SEO para fichas de producto de e-commerce (WooCommerce + Rank Math).
Devuelve SOLO un objeto JSON con EXACTAMENTE estas claves en este orden:
title, html_description, focus_keyword, seo_title, slug, seo_description, image_alt.
No añadas texto fuera del JSON ni bloques de código.

Reglas obligatorias:
Español neutro, acentos correctos.
Especifica la especie cuando sea evidente (usa "para perros" o "para gatos"; si no, "para mascotas").
Mantén CONSISTENCIA: usa la misma forma exacta de la focus_keyword (singular/plural, sin diminutivos) en todos los campos.
La focus_keyword debe aparecer exactamente igual en: title, seo_title, seo_description, slug y en el primer párrafo de html_description.
No inventes datos que no estén en título, descripción o imagen. No hagas afirmaciones médicas.
Si hay presentación/tamaño (p. ej., 100 g, 500 g) inclúyelo en title, html_description, focus_keyword, seo_title, slug y, cuando sea natural, en seo_description.
Evita marca a menos que esté en los datos.
No usar mayúsculas innecesarias, solo en nombres propios o inicio de frase.

Definiciones de cada campo:
title: orientado a conversión; inicia con la focus_keyword; incluye especie y presentación si aplica (ej.: "Hueso de calcio con pollo 100 g para perros").
html_description: usa HTML semántico con esta estructura:
<h2>{title}</h2>
<p>Resumen introductorio que incluya la focus_keyword exacta y sea atractivo para el comprador.</p>
<h3>Beneficios</h3><ul><li>…</li></ul>
<h3>Uso recomendado</h3><ul><li>…</li></ul>
<h3>Composición y presentación</h3><ul><li>…</li></ul>
<h3>Conservación</h3><ul><li>…</li></ul>
<p>Llamado a la acción final breve y persuasivo.</p>

Incluir la focus_keyword al menos una vez en el primer párrafo y otra en el cuerpo, sin sobreoptimizar.
focus_keyword: específica y natural; incluye "para perros" o "para gatos" cuando aplique (ej.: "hueso de calcio con pollo para perros").
seo_title: comienza EXACTAMENTE con la focus_keyword + " | Golfitos Petshop" (≤60 caracteres).
slug: minúsculas, sin tildes, con guiones; basado en la focus_keyword, incluye tamaño si aplica (ej.: "hueso-calcio-pollo-perros-100g").
seo_description: ≤160 caracteres; empieza con la focus_keyword, añade 1–2 beneficios clave y un CTA breve. Sin comillas ni emojis.
image_alt: ≤125 caracteres; describe el producto y especie; incluye tamaño/color/variante si consta o es visible; evita repeticiones innecesarias.

Datos del producto a optimizar:
Título: {title}
Descripción: {description}
Ingredientes/Medidas: {ingredients}
URL de la imagen: {imageUrl}`,

                    openai: `Eres un experto en SEO para fichas de producto de e-commerce (WooCommerce + Rank Math).
Devuelve únicamente un objeto JSON válido con EXACTAMENTE estas claves:
title, html_description, focus_keyword, seo_title, slug, seo_description, image_alt.

Reglas obligatorias:
- Español neutro con acentos correctos
- Especifica la especie cuando sea evidente ("para perros", "para gatos", o "para mascotas")
- Mantén CONSISTENCIA: usa la focus_keyword exacta en todos los campos
- La focus_keyword debe aparecer en: title, seo_title, seo_description, slug y html_description
- No inventes datos que no estén en el título, descripción o imagen
- Incluye presentación/tamaño si está disponible
- Evita marcas a menos que estén en los datos originales

Especificaciones por campo:
- title: optimizado para conversión, comienza con focus_keyword
- html_description: HTML semántico con estructura <h2>, <h3>, <p>, <ul>
- focus_keyword: específica y natural, incluye especie si aplica
- seo_title: focus_keyword + " | Golfitos Petshop" (máximo 60 caracteres)
- slug: minúsculas, sin tildes, con guiones, basado en focus_keyword
- seo_description: máximo 160 caracteres, comienza con focus_keyword, incluye CTA
- image_alt: máximo 125 caracteres, describe producto y especie

Datos del producto:
Título: {title}
Descripción: {description}
Ingredientes/Medidas: {ingredients}
URL de la imagen: {imageUrl}`
                };

                basePrompt = defaultPrompts[currentProvider];
            }

            // Construir el prompt completo
            const fullPrompt = basePrompt
                .replace('{title}', title || '')
                .replace('{description}', description || '')
                .replace('{ingredients}', ingredients || '')
                .replace('{size}', size || '')
                .replace('{imageUrl}', imageUrl || '');

            try {
                console.log(`[WooSEO] Generando contenido con ${currentProvider.toUpperCase()}...`);
                const jsonResult = await generateSEOContent(fullPrompt, config);
                
                // Añadir metadata sobre el proveedor usado
                jsonResult._metadata = {
                    provider: currentProvider,
                    model: currentProvider === 'openai' ? config.openai_model : config.gemini_model,
                    timestamp: new Date().toISOString()
                };
                
                console.log('[WooSEO] Respuesta de la IA recibida:', jsonResult);
                sendResponse({ data: jsonResult });
            } catch (error) {
                console.error('[WooSEO] Error al llamar a la IA:', error);
                sendResponse({ error: `Error con ${currentProvider.toUpperCase()}: ${error.message}` });
            }
        });
        
        return true; // Indica que se enviará una respuesta de forma asíncrona.
    }
});
