/**
 * Registry Central de Tools
 * 
 * Único punto de verdad para todas las tools registradas.
 */
import { ToolDefinition } from "../types/tool.js";

// Import all tool modules
import { filesystemTools } from "../tools/filesystem/index.js";
import { systemTools } from "../tools/system/index.js";
import { memoryTools } from "../tools/memory/index.js";
import { automationToolsV4 } from "../tools/automation/index.js";
import { securityToolsV4 } from "../tools/security/index.js";
import { cloudToolsV4 } from "../tools/cloud/index.js";
import { aiToolsV4 } from "../tools/ai/index.js";
import { funToolsV4 } from "../tools/fun/index.js";
import { desktopTools } from "../tools/desktop/index.js";

/**
 * Array unificado de todas las tools
 */
export const allTools: ToolDefinition[] = [
    ...filesystemTools,
    ...systemTools,
    ...desktopTools,
    ...memoryTools,
    ...automationToolsV4,
    ...securityToolsV4,
    ...cloudToolsV4,
    ...aiToolsV4,
    ...funToolsV4
];

/**
 * Busca una tool por nombre
 */
export function getToolByName(name: string): ToolDefinition | undefined {
    return allTools.find(t => t.name === name);
}
