/**
 * System Tools
 * 
 * Control del sistema operativo, procesos y hardware.
 */
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import path from "path";
import screenshot from "screenshot-desktop";
import clipboardy from "clipboardy";
import notifier from "node-notifier";
import { Jimp } from "jimp";
import { ToolDefinition, ok, fail } from "../../types/tool.js";
import { formatUptime } from "../../lib/utils.js";

const execAsync = promisify(exec);

export const executeCommand: ToolDefinition = {
    name: "ejecutar_comando",
    description: "Ejecuta un comando en la terminal del sistema.",
    inputSchema: {
        type: "object",
        properties: { comando: { type: "string" } },
        required: ["comando"]
    },
    execute: async (input) => {
        try {
            const { stdout, stderr } = await execAsync(input.comando as string);
            return ok(`STDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const systemInfo: ToolDefinition = {
    name: "info_sistema",
    description: "Obtiene información del sistema (hostname, OS, uptime, memoria).",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
        const info = {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            uptime: formatUptime(os.uptime()),
            totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
            freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
            cpus: os.cpus().length
        };
        return ok(info);
    }
};

export const takeScreenshot: ToolDefinition = {
    name: "captura_pantalla",
    description: "Captura la pantalla. Puede recortar una región y devolver archivo o base64.",
    inputSchema: {
        type: "object",
        properties: {
            ruta_destino: { type: "string", description: "Ruta para guardar la imagen (default: temp)" },
            formato: {
                type: "string",
                enum: ["archivo", "base64"],
                description: "'archivo' guarda en disco (default), 'base64' devuelve la imagen en base64"
            },
            region: {
                type: "object",
                properties: {
                    x: { type: "number", description: "Coord X de la esquina superior izquierda" },
                    y: { type: "number", description: "Coord Y de la esquina superior izquierda" },
                    width: { type: "number", description: "Ancho del recorte en píxeles" },
                    height: { type: "number", description: "Alto del recorte en píxeles" }
                },
                description: "Región opcional para recortar la captura"
            }
        }
    },
    execute: async (input) => {
        try {
            const formato = (input.formato as string) || "archivo";
            const region = input.region as { x: number; y: number; width: number; height: number } | undefined;

            const buf: Buffer = await screenshot();

            let image: any = await Jimp.read(buf);

            if (region) {
                const r = {
                    x: Math.round(region.x),
                    y: Math.round(region.y),
                    w: Math.round(region.width),
                    h: Math.round(region.height)
                };
                image = image.crop(r);
            }

            if (formato === "base64") {
                const base64: string = await image.getBase64("image/jpeg");
                return ok(base64);
            }

            const dest = (input.ruta_destino as string) || path.join(os.tmpdir(), `screenshot_${Date.now()}.jpg`);
            await image.write(dest);
            return ok(`Captura guardada: ${dest}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const openBrowser: ToolDefinition = {
    name: "abrir_navegador",
    description: "Abre una URL en el navegador predeterminado o especificado.",
    inputSchema: {
        type: "object",
        properties: {
            url: { type: "string" },
            navegador: { type: "string", description: "Opcional: chrome, edge, operagx" }
        },
        required: ["url"]
    },
    execute: async (input) => {
        try {
            const url = input.url as string;
            const browser = input.navegador as string;
            let cmd = `start "" "${url}"`;
            if (browser === "operagx") cmd = `start "" "opera" "${url}"`;
            else if (browser === "chrome") cmd = `start "" "chrome" "${url}"`;
            await execAsync(cmd);
            return ok(`Abierto: ${url}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const readClipboard: ToolDefinition = {
    name: "leer_portapapeles",
    description: "Lee el contenido actual del portapapeles.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
        try {
            const content = await clipboardy.read();
            return ok(content);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const writeClipboard: ToolDefinition = {
    name: "escribir_portapapeles",
    description: "Escribe texto al portapapeles.",
    inputSchema: {
        type: "object",
        properties: { contenido: { type: "string" } },
        required: ["contenido"]
    },
    execute: async (input) => {
        try {
            await clipboardy.write(input.contenido as string);
            return ok("Copiado al portapapeles");
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const killProcess: ToolDefinition = {
    name: "matar_proceso",
    description: "Termina un proceso por PID o nombre.",
    inputSchema: {
        type: "object",
        properties: {
            pid: { type: "number" },
            nombre: { type: "string" }
        }
    },
    execute: async (input) => {
        try {
            if (input.pid) {
                process.kill(input.pid as number);
            } else if (input.nombre) {
                await execAsync(`taskkill /F /IM "${input.nombre}"`);
            } else {
                return fail("Debes proporcionar pid o nombre");
            }
            return ok("Proceso terminado");
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const sendNotification: ToolDefinition = {
    name: "enviar_notificacion",
    description: "Envía una notificación del sistema.",
    inputSchema: {
        type: "object",
        properties: {
            titulo: { type: "string" },
            mensaje: { type: "string" }
        },
        required: ["titulo", "mensaje"]
    },
    execute: async (input) => {
        notifier.notify({
            title: input.titulo as string,
            message: input.mensaje as string
        });
        return ok("Notificación enviada");
    }
};

export const systemTools: ToolDefinition[] = [
    executeCommand,
    systemInfo,
    takeScreenshot,
    openBrowser,
    readClipboard,
    writeClipboard,
    killProcess,
    sendNotification
];
