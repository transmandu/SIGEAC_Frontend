// pdfjs-dist trae una rama que sólo corre en Node y pide `canvas`, un módulo
// nativo que no existe en el navegador. Turbopack no acepta `false` como alias
// (lo que hacía la config de webpack), así que se le da este módulo vacío.
export {};
