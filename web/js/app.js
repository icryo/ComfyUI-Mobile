(async (window, document, undefined) => {

    // UUID generator
    function uuidv4() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }
    const client_id = uuidv4();

    // Load the workflow
    async function loadWorkflow() {
        const response = await fetch('/fastgen/js/base_workflow.json');
        return await response.json();
    }
    const workflow = await loadWorkflow();
    console.log(workflow);

    // Expose workflow globally
    window.workflow = workflow;

    // WebSocket
    const server_address = window.location.hostname + ':' + window.location.port;
    const socket = new WebSocket('ws://' + server_address + '/ws?clientId=' + client_id);
    socket.addEventListener('open', (event) => {
        console.log('Connected to the server');
    });

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'executed') {
            if ('images' in data['data']['output']) {
                const image = data['data']['output']['images'][0];
                const filename = image['filename'];
                const subfolder = image['subfolder'];
                const rand = Math.random();

                _maingen.src = '/view?filename=' + filename + '&type=output&subfolder=' + subfolder + '&rand=' + rand;
            }
        }
    });

    const _maingen = document.getElementById('maingen');

    async function queue_prompt(prompt = {}) {
        const data = { 'prompt': prompt, 'client_id': client_id };

        const response = await fetch('/prompt', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    const _prompt = document.getElementById('prompt');
    _prompt.value = "detailed,detailed background,holographic color,masterpiece,best quality,amazing quality,very aesthetic,absurdres,newest,volumetric lighting,";
    _prompt.focus();
    _prompt.setSelectionRange(_prompt.value.length, _prompt.value.length);
    const _cfgrescale = document.getElementById('cfgrescale');
    let cachedPrompt = _prompt.value;
    let lastExecutedPrompt = null;

    async function checkPrompt () {
        const currentPrompt = _prompt.value;
        clearTimeout(promptTimeout);

        if ( currentPrompt.length < 2 || currentPrompt != cachedPrompt ) {
            cachedPrompt = currentPrompt;
            promptTimeout = setTimeout(checkPrompt, 360);
            return;
        }

        workflow["6"]["inputs"]["text"] = currentPrompt.replace(/(\r\n|\n|\r)/gm, " ");
        workflow["3"]["inputs"]["seed"] = Math.floor(Math.random() * 9999999999);

        if ( lastExecutedPrompt !== currentPrompt ) {
            await queue_prompt(workflow);
            lastExecutedPrompt = currentPrompt;
        }

        promptTimeout = setTimeout(checkPrompt, 360);
    }
    let promptTimeout = setTimeout(checkPrompt, 360);

    // --- Settings Modal Code ---
    async function populateModelDropdown() {
        try {
            const response = await fetch('/list-models');
            const rawText = await response.text();
            console.log("Raw /list-models response:", rawText);
            
            let data = {};
            try {
                data = JSON.parse(rawText);
            } catch (jsonError) {
                console.error("Failed to parse JSON from /list-models:", jsonError);
                return;
            }
            
            const selectElem = document.getElementById("model-select");
            // Clear any existing options
            selectElem.innerHTML = "";

            if (data.models && data.models.length > 0) {
                data.models.forEach(modelName => {
                    const option = document.createElement("option");
                    option.value = modelName;
                    option.textContent = modelName;
                    selectElem.appendChild(option);
                });
            } else {
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "No models found";
                selectElem.appendChild(option);
            }
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    }

    // Open settings modal and populate models list
    document.getElementById("settings-button").addEventListener("click", () => {
        populateModelDropdown();
        document.getElementById("settings-modal").style.display = "block";
    });

    // Width slider event listener
    const widthSlider = document.getElementById('width-slider');
    const widthDisplay = document.getElementById('width-value');

    widthSlider.addEventListener('input', (event) => {
        const newWidth = parseInt(event.target.value);
        widthDisplay.textContent = newWidth;
        
        // Update width in node "5"
        window.workflow["5"]["inputs"]["width"] = newWidth;
        
        console.log(`Updated width to: ${newWidth}`);
    });

    // Height slider event listener
    const heightSlider = document.getElementById('height-slider');
    const heightDisplay = document.getElementById('height-value');

    heightSlider.addEventListener('input', (event) => {
        const newHeight = parseInt(event.target.value);
        heightDisplay.textContent = newHeight;
        
        // Update height in node "5"
        window.workflow["5"]["inputs"]["height"] = newHeight;
        
        console.log(`Updated height to: ${newHeight}`);
    });

    // CFG slider event listener
    const cfgSlider = document.getElementById('cfg-slider');
    const cfgDisplay = document.getElementById('cfg-value');

    cfgSlider.addEventListener('input', (event) => {
        const newCfg = parseInt(event.target.value);
        cfgDisplay.textContent = newCfg;
        
        // Update cfg in node "3"
        window.workflow["3"]["inputs"]["cfg"] = newCfg;
        
        console.log(`Updated CFG to: ${newCfg}`);
    });

    // Steps slider event listener
    const stepsSlider = document.getElementById('steps-slider');
    const stepsDisplay = document.getElementById('steps-value');

    stepsSlider.addEventListener('input', (event) => {
        const newSteps = parseInt(event.target.value);
        stepsDisplay.textContent = newSteps;
        
        // Update steps in node "3"
        window.workflow["3"]["inputs"]["steps"] = newSteps;
        
        console.log(`Updated Steps to: ${newSteps}`);
    });

    // Save new model selection and close settings modal
    document.getElementById("save-settings").addEventListener("click", () => {
        const selectedModel = document.getElementById("model-select").value.trim();
        // Prepend the fixed path to ensure consistency with the allowed list
        const fullModelPath = "Stable-diffusion\\" + selectedModel;
        window.workflow["4"]["inputs"]["ckpt_name"] = fullModelPath;
        console.log("Updated model to:", fullModelPath);
        document.getElementById("settings-modal").style.display = "none";
    });

    // Close modal without saving
    document.getElementById("close-settings").addEventListener("click", () => {
        document.getElementById("settings-modal").style.display = "none";
    });

})(window, document, undefined);
