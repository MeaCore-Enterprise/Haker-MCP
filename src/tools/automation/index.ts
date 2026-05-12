/**
 * Automation Tools
 * 
 * Herramientas de productividad y automatización.
 */
import fs from "fs/promises";
import path from "path";
import os from "os";
import * as xlsx from "xlsx";
import { ToolDefinition, ok, fail } from "../../types/tool.js";

import { PDFParse } from "pdf-parse";

export const generateExcel: ToolDefinition = {
    name: "generar_excel",
    description: "Crea un archivo Excel (.xlsx) a partir de datos JSON.",
    inputSchema: {
        type: "object",
        properties: {
            ruta_destino: { type: "string" },
            datos_json: { type: "string", description: "Array de objetos JSON stringified" },
            nombre_hoja: { type: "string" }
        },
        required: ["ruta_destino", "datos_json"]
    },
    execute: async (input) => {
        try {
            const data = JSON.parse(input.datos_json as string);
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(data);
            xlsx.utils.book_append_sheet(wb, ws, (input.nombre_hoja as string) || "Hoja1");
            xlsx.writeFile(wb, input.ruta_destino as string);
            return ok(`Excel guardado: ${input.ruta_destino}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const readPdf: ToolDefinition = {
    name: "leer_pdf",
    description: "Extrae texto de un archivo PDF.",
    inputSchema: {
        type: "object",
        properties: { ruta: { type: "string" } },
        required: ["ruta"]
    },
    execute: async (input) => {
        try {
            const dataBuffer = await fs.readFile(input.ruta as string);
            const pdf = new PDFParse({ data: dataBuffer });
            const result = await pdf.getText();
            return ok(result.text);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const organizeDesktop: ToolDefinition = {
    name: "organizar_escritorio",
    description: "Mueve archivos del escritorio a carpetas por extensión.",
    inputSchema: {
        type: "object",
        properties: { ruta_escritorio: { type: "string" } }
    },
    execute: async (input) => {
        try {
            const desktop = (input.ruta_escritorio as string) || path.join(os.homedir(), "Desktop");
            const files = await fs.readdir(desktop);
            const cats: Record<string, string[]> = {
                "Imagenes": [".jpg", ".png", ".gif", ".jpeg", ".svg"],
                "Documentos": [".pdf", ".docx", ".txt", ".md", ".xlsx"],
                "Ejecutables": [".exe", ".msi"],
                "Comprimidos": [".zip", ".rar", ".7z"]
            };
            let moved = 0;
            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                for (const [cat, exts] of Object.entries(cats)) {
                    if (exts.includes(ext)) {
                        const targetDir = path.join(desktop, cat);
                        await fs.mkdir(targetDir, { recursive: true });
                        await fs.rename(path.join(desktop, file), path.join(targetDir, file));
                        moved++;
                    }
                }
            }
            return ok(`Organizados ${moved} archivos`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const automationToolsV4: ToolDefinition[] = [generateExcel, readPdf, organizeDesktop];
