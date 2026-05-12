import { exec } from "child_process";
import { promisify } from "util";
import { ToolDefinition, ok, fail } from "../../types/tool.js";

const execAsync = promisify(exec);

async function runPs(script: string): Promise<string> {
    const escaped = script.replace(/"/g, '\\"').replace(/\r?\n/g, "; ");
    const { stdout, stderr } = await execAsync(`powershell -NoProfile -Command "${escaped}"`, { timeout: 15000 });
    if (stderr && /error/i.test(stderr)) throw new Error(stderr);
    return (stdout || "").trim();
}

const mouseEventPs = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class MHelper {
    [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, int e);
}
"@
`;

export const moveMouse: ToolDefinition = {
    name: "mover_mouse",
    description: "Mueve el cursor del mouse a coordenadas absolutas (x, y) en la pantalla.",
    inputSchema: {
        type: "object",
        properties: {
            x: { type: "number", description: "Coordenada X horizontal (píxeles desde la izquierda)" },
            y: { type: "number", description: "Coordenada Y vertical (píxeles desde arriba)" }
        },
        required: ["x", "y"]
    },
    execute: async (input) => {
        try {
            const x = Math.round(input.x as number);
            const y = Math.round(input.y as number);
            const script = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})`;
            await runPs(script);
            return ok(`Mouse movido a (${x}, ${y})`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const getMousePosition: ToolDefinition = {
    name: "posicion_mouse",
    description: "Obtiene la posición actual del cursor del mouse en la pantalla.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
        try {
            const script = "Add-Type -AssemblyName System.Windows.Forms; $p = [System.Windows.Forms.Cursor]::Position; Write-Output \"$($p.X),$($p.Y)\"";
            const output = await runPs(script);
            const parts = output.split(",");
            if (parts.length < 2) return fail("No se pudo obtener la posición");
            return ok({ x: parseInt(parts[0]), y: parseInt(parts[1]) });
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const clickMouse: ToolDefinition = {
    name: "clic_mouse",
    description: "Realiza un click en la posición actual del cursor. Por defecto click izquierdo.",
    inputSchema: {
        type: "object",
        properties: {
            boton: {
                type: "string",
                enum: ["izquierdo", "derecho", "medio"],
                description: "Botón a usar: izquierdo (default), derecho, medio"
            },
            doble: {
                type: "boolean",
                description: "Si es true, hace doble click"
            }
        }
    },
    execute: async (input) => {
        try {
            const boton = (input.boton as string) || "izquierdo";
            const doble = input.doble === true;
            const clickMap: Record<string, { down: string; up: string }> = {
                izquierdo: { down: "0x02", up: "0x04" },
                derecho: { down: "0x08", up: "0x10" },
                medio: { down: "0x20", up: "0x40" }
            };
            const btn = clickMap[boton];
            if (!btn) return fail(`Botón inválido: ${boton}. Usa: izquierdo, derecho, medio`);

            const clicks = doble ? 2 : 1;
            let script = mouseEventPs;
            for (let i = 0; i < clicks; i++) {
                script += `[MHelper]::mouse_event(${btn.down}, 0, 0, 0, 0); Start-Sleep -Milliseconds 50; [MHelper]::mouse_event(${btn.up}, 0, 0, 0, 0); Start-Sleep -Milliseconds 50;`;
            }
            await runPs(script);
            const label = doble ? "doble click" : "click";
            return ok(`${label} ${boton} ejecutado`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const dragMouse: ToolDefinition = {
    name: "arrastrar_mouse",
    description: "Arrastra el cursor desde (x1, y1) hasta (x2, y2) manteniendo el botón presionado.",
    inputSchema: {
        type: "object",
        properties: {
            x1: { type: "number", description: "Coordenada X inicial" },
            y1: { type: "number", description: "Coordenada Y inicial" },
            x2: { type: "number", description: "Coordenada X final" },
            y2: { type: "number", description: "Coordenada Y final" },
            boton: { type: "string", enum: ["izquierdo", "derecho"], description: "Botón para arrastrar (default: izquierdo)" }
        },
        required: ["x1", "y1", "x2", "y2"]
    },
    execute: async (input) => {
        try {
            const x1 = Math.round(input.x1 as number);
            const y1 = Math.round(input.y1 as number);
            const x2 = Math.round(input.x2 as number);
            const y2 = Math.round(input.y2 as number);
            const boton = (input.boton as string) || "izquierdo";
            const down = boton === "derecho" ? "0x08" : "0x02";
            const up = boton === "derecho" ? "0x10" : "0x04";

            const script = `
Add-Type -AssemblyName System.Windows.Forms
${mouseEventPs}
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x1}, ${y1})
Start-Sleep -Milliseconds 100
[MHelper]::mouse_event(${down}, 0, 0, 0, 0)
Start-Sleep -Milliseconds 100
$steps = 20
for ($i = 1; $i -le $steps; $i++) {
    $x = ${x1} + (${x2} - ${x1}) * $i / $steps
    $y = ${y1} + (${y2} - ${y1}) * $i / $steps
    [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point([int]$x, [int]$y)
    Start-Sleep -Milliseconds 10
}
Start-Sleep -Milliseconds 100
[MHelper]::mouse_event(${up}, 0, 0, 0, 0)
`;
            await runPs(script);
            return ok(`Arrastrado desde (${x1}, ${y1}) hasta (${x2}, ${y2})`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const scrollMouse: ToolDefinition = {
    name: "desplazar_mouse",
    description: "Desplaza la rueda del mouse hacia arriba o abajo.",
    inputSchema: {
        type: "object",
        properties: {
            direccion: {
                type: "string",
                enum: ["arriba", "abajo"],
                description: "Dirección del scroll (arriba o abajo)"
            },
            cantidad: {
                type: "number",
                description: "Número de 'clicks' de rueda (default: 1)"
            }
        },
        required: ["direccion"]
    },
    execute: async (input) => {
        try {
            const direccion = input.direccion as string;
            const cantidad = Math.round((input.cantidad as number) || 1);
            const delta = direccion === "arriba" ? 120 : -120;

            let script = mouseEventPs;
            for (let i = 0; i < cantidad; i++) {
                script += `[MHelper]::mouse_event(0x0800, 0, 0, ${delta}, 0); Start-Sleep -Milliseconds 30;`;
            }
            await runPs(script);
            return ok(`Scroll ${direccion} x${cantidad}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const desktopTools: ToolDefinition[] = [
    moveMouse,
    getMousePosition,
    clickMouse,
    dragMouse,
    scrollMouse
];
