## Setup

Change the hardcoded paths in ComfyUI-Mobile

In __init__.py:

MODELS_DIR = "D:\\ComfyUI_windows_portable\\ComfyUI\\models\\checkpoints\\Stable-diffusion"

In app.js:

const fullModelPath = "Stable-diffusion\\" + selectedModel;


Place in "comfy-nodes" folder and browse to <comfyurl>:<port>/mob

Fork of https://github.com/cubiq/Comfy_Dungeon/tree/main 
