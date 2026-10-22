// global.d.ts

// Tipos de los imports de imágenes (`import logo from "@/public/logo.png"`).
// Los trae `next-env.d.ts`, pero ese archivo lo genera Next al arrancar y no se
// versiona: en un checkout limpio (el CI) no existe y `tsc` no reconoce ningún
// import de imagen. Referenciarlos aquí hace que el typecheck no dependa de él.
/// <reference types="next/image-types/global" />

interface Window {
  Pusher: any; // You can specify the exact type if needed, but 'any' will work if you want flexibility
}
