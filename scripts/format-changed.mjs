// Formatea solo los archivos que tu rama cambia respecto a main. El resto del
// repo todavia no sigue el preset y se normaliza a medida que se edita.
// Funciona igual en PowerShell, CMD y bash: no depende del shell.
import { execFileSync } from "node:child_process";

const EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|css)$/;

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

let base = "origin/main";
try {
  git(["rev-parse", "--verify", "--quiet", base]);
} catch {
  base = "main";
}

let files;
try {
  // Tres fuentes: lo que la rama cambia respecto a base, lo ya preparado en el
  // indice, y lo modificado sin commitear. Sin las dos ultimas, el script no
  // formatea justo lo que estas por commitear.
  const merged = [
    git(["diff", "--name-only", "--diff-filter=d", `${base}...HEAD`]),
    git(["diff", "--name-only", "--diff-filter=d"]),
    git(["diff", "--name-only", "--diff-filter=d", "--cached"]),
    // Archivos nuevos sin rastrear: son los que mas necesitan el formateo.
    git(["ls-files", "--others", "--exclude-standard"]),
  ].join("\n");

  files = [
    ...new Set(
      merged
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f && EXT.test(f)),
    ),
  ];
} catch (error) {
  console.error(`No se pudo comparar contra ${base}:`, error.message);
  process.exit(1);
}

if (files.length === 0) {
  console.log(
    "No hay archivos formateables cambiados respecto a " + base + ".",
  );
  process.exit(0);
}

console.log(`Formateando ${files.length} archivo(s):`);
for (const f of files) console.log("  " + f);

execFileSync(
  "node",
  ["node_modules/prettier/bin/prettier.cjs", "--write", ...files],
  {
    stdio: "inherit",
  },
);
