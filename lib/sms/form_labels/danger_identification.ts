const DANGER_IDENTIFICATION_FORM_LABEL = {
    transmandu: {
        title: "Identificación de Peligros",
        fields: [
            { id: "part_number", label: "Número de Parte (P/N)" },
            { id: "serial_number", label: "Serial del Componente" },
            { id: "status", label: "Condición de la Pieza" },
        ]
    },
    hangar74: {
        title: "Notifiacion de Peligros",
        fields: [
            { id: "status", label: "Estado Actual" }, // Hangar74 quiere el estado primero
            { id: "part_number", label: "Referencia de Parte" }, // Diferente label para el mismo ID
            { id: "description", label: "Descripción Técnica" },
        ]
    }
};
