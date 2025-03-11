import os
import server
from aiohttp import web

# Existing routes...
WEBROOT = os.path.join(os.path.dirname(os.path.realpath(__file__)), "web")

@server.PromptServer.instance.routes.get("/mob")
def deungeon_entrance(request):
    return web.FileResponse(os.path.join(WEBROOT, "index.html"))

server.PromptServer.instance.routes.static("/mob/js/", path=os.path.join(WEBROOT, "js"))

# New route to list models
MODELS_DIR = "D:\\ComfyUI_windows_portable\\ComfyUI\\models\\checkpoints\\Stable-diffusion"

@server.PromptServer.instance.routes.get("/list-models")
async def list_models(request):
    try:
        files = os.listdir(MODELS_DIR)
        models = [f for f in files if f.endswith('.safetensors') or f.endswith('.ckpt')]
        return web.json_response({"models": models})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)
