import { ScaleParserStrategy } from "./scale.types";
import { DEFAULT_WEIGHT_REGEX } from "./scale.config";

/**
 * Parser por defecto: extrae el primer número flotante del buffer.
 */
export class DefaultScaleParser implements ScaleParserStrategy {
    readonly name = "default";

    parse(raw: string): number | null {
        if (!raw || typeof raw !== "string") return null;
        const cleaned = raw.replace(/\s+/g, " ").trim();
        const match = cleaned.match(DEFAULT_WEIGHT_REGEX);
        if(!match) return null;
        const value = parseFloat(match[0]);
        return isNaN(value) ? null : value;
    }
}


/**
 * Parser para balanzas Mettler Toledo con formato específico.
 * Ejemplo: "ST,NT,+  0012.340,kg"
 */
export class MettlerToledoParser implements ScaleParserStrategy {
    readonly name = "mettler_toledo";

    parse(raw: string): number | null {
        if(!raw.includes("kg") && !raw.includes("g")) return null;
        const match = raw.match(/[+-]?\d+\.\d+/);
        if(!match) return null;
        const value = parseFloat(match[0]);
        return isNaN(value) ? null : value;
    }
}

/**
 * Registro de parsers. Permite seleccionar estrategia en runtime.
 */
export class ScaleParserRegistry {
    private parsers: Map<string, ScaleParserStrategy> = new Map();

    constructor() {
        this.register(new DefaultScaleParser());
        this.register(new MettlerToledoParser());
    }

    register(parser: ScaleParserStrategy): void {
        this.parsers.set(parser.name, parser);
    }

    get(name: string): ScaleParserStrategy {
        const parser = this.parsers.get(name);
        if(!parser) {
            console.warn(
                `[ScaleParserRegistry] Parser "${name}" no encontrado. Usando default. `
            );
            return this.parsers.get("default")!;
        }
        return parser;
    }

    getDefault(): ScaleParserStrategy {
        return this.parsers.get("default")!;
    }
}

export const scaleParserRegistry = new ScaleParserRegistry();
