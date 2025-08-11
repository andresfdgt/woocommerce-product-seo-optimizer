// Archivo: options.js
// Este script maneja la lógica de la página de opciones con soporte multi-IA.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optionsForm');
    const aiProviderSelect = document.getElementById('aiProvider');
    const geminiConfig = document.getElementById('geminiConfig');
    const openaiConfig = document.getElementById('openaiConfig');
    const geminiApiKeyInput = document.getElementById('geminiApiKey');
    const openaiApiKeyInput = document.getElementById('openaiApiKey');
    const geminiModelSelect = document.getElementById('geminiModel');
    const openaiModelSelect = document.getElementById('openaiModel');
    const promptBaseTextarea = document.getElementById('promptBase');
    const statusDiv = document.getElementById('status');
    const testConnectionBtn = document.getElementById('testConnection');
    const resetToDefaultBtn = document.getElementById('resetToDefault');

    // Prompts por defecto para cada proveedor
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

    /**
     * Muestra un mensaje de estado en la página de opciones.
     */
    function showStatus(message, type = 'info') {
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.style.display = 'block';
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    /**
     * Muestra/oculta las configuraciones según el proveedor seleccionado
     */
    function toggleAIConfigs() {
        const provider = aiProviderSelect.value;
        
        if (provider === 'gemini') {
            geminiConfig.classList.remove('hidden');
            openaiConfig.classList.add('hidden');
        } else {
            geminiConfig.classList.add('hidden');
            openaiConfig.classList.remove('hidden');
        }

        // Actualizar prompt por defecto si está vacío
        if (!promptBaseTextarea.value.trim()) {
            promptBaseTextarea.value = defaultPrompts[provider];
        }
    }

    /**
     * Carga la configuración guardada
     */
    function loadSavedConfig() {
        chrome.storage.sync.get([
            'ai_provider',
            'gemini_api_key',
            'gemini_model',
            'openai_api_key', 
            'openai_model',
            'base_prompt'
        ], (items) => {
            // Proveedor de IA
            aiProviderSelect.value = items.ai_provider || 'gemini';
            
            // API Keys
            geminiApiKeyInput.value = items.gemini_api_key || '';
            openaiApiKeyInput.value = items.openai_api_key || '';
            
            // Modelos
            geminiModelSelect.value = items.gemini_model || 'gemini-2.5-flash-preview-05-20';
            openaiModelSelect.value = items.openai_model || 'gpt-4o';
            
            // Prompt
            promptBaseTextarea.value = items.base_prompt || defaultPrompts[aiProviderSelect.value];
            
            // Mostrar configuración correcta
            toggleAIConfigs();
        });
    }

    /**
     * Guarda la configuración
     */
    function saveConfig() {
        const config = {
            ai_provider: aiProviderSelect.value,
            gemini_api_key: geminiApiKeyInput.value.trim(),
            gemini_model: geminiModelSelect.value,
            openai_api_key: openaiApiKeyInput.value.trim(),
            openai_model: openaiModelSelect.value,
            base_prompt: promptBaseTextarea.value.trim()
        };

        chrome.storage.sync.set(config, () => {
            console.log('[WooSEO] Configuración guardada:', config);
            showStatus('✅ Configuración guardada con éxito.', 'success');
        });
    }

    /**
     * Prueba la conexión con la IA seleccionada
     */
    async function testConnection() {
        const provider = aiProviderSelect.value;
        const apiKey = provider === 'gemini' ? geminiApiKeyInput.value.trim() : openaiApiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('❌ Por favor introduce una API Key válida.', 'error');
            return;
        }

        // UI feedback
        testConnectionBtn.textContent = '🔄 Probando...';
        testConnectionBtn.classList.add('testing');
        testConnectionBtn.disabled = true;

        try {
            let success = false;
            
            if (provider === 'gemini') {
                success = await testGeminiConnection(apiKey, geminiModelSelect.value);
            } else {
                success = await testOpenAIConnection(apiKey, openaiModelSelect.value);
            }

            if (success) {
                showStatus('✅ Conexión exitosa con ' + (provider === 'gemini' ? 'Gemini' : 'OpenAI'), 'success');
            } else {
                showStatus('❌ Error en la conexión. Verifica tu API Key.', 'error');
            }
        } catch (error) {
            console.error('[WooSEO] Error en test de conexión:', error);
            showStatus('❌ Error al probar la conexión: ' + error.message, 'error');
        } finally {
            // Restaurar botón
            testConnectionBtn.textContent = '🔍 Probar Conexión';
            testConnectionBtn.classList.remove('testing');
            testConnectionBtn.disabled = false;
        }
    }

    /**
     * Prueba la conexión con Gemini
     */
    async function testGeminiConnection(apiKey, model) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: "Test de conexión. Responde solo: OK" }]
                }]
            })
        });

        return response.ok;
    }

    /**
     * Prueba la conexión con OpenAI
     */
    async function testOpenAIConnection(apiKey, model) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: "Test de conexión. Responde solo: OK" }],
                max_tokens: 10
            })
        });

        return response.ok;
    }

    /**
     * Restaura la configuración por defecto
     */
    function resetToDefault() {
        if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto? Esto eliminará todos tus ajustes personalizados.')) {
            const provider = aiProviderSelect.value;
            promptBaseTextarea.value = defaultPrompts[provider];
            
            // Resetear modelos a los recomendados
            geminiModelSelect.value = 'gemini-2.5-flash-preview-05-20';
            openaiModelSelect.value = 'gpt-4o';
            
            showStatus('🔄 Configuración restaurada por defecto.', 'info');
        }
    }

    // Event Listeners
    aiProviderSelect.addEventListener('change', toggleAIConfigs);
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveConfig();
    });
    testConnectionBtn.addEventListener('click', testConnection);
    resetToDefaultBtn.addEventListener('click', resetToDefault);

    // Inicializar
    loadSavedConfig();
});
