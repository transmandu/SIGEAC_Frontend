import { NextRequest, NextResponse } from "next/server";

// Lo público se enumera y todo lo demás se protege. La empresa es el primer
// segmento de la URL (/{slug}/...) y es dinámica: listar las protegidas dejaba
// fuera a cualquier empresa nueva, sin proxy ni `from` hacia el login.
const PUBLIC_ROUTES = ["/login", "/acceso_publico", "/not-authorized"];

const isPublicRoute = (path: string) =>
  path === "/" ||
  PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));

// Formato de Sanctum: "<id>|<hash>", con o sin el prefijo "Bearer ".
const isUsableToken = (token: string) => {
  const raw = token.startsWith("Bearer ") ? token.slice(7) : token;

  return raw.trim().length > 0 && raw.includes("|");
};

export default async function proxy(req: NextRequest) {
  const currentPath = req.nextUrl.pathname;

  const isProtectedRoute = !isPublicRoute(currentPath);

  // 4. Redirección si está en ruta protegida sin autenticación
  if (isProtectedRoute) {
    const authToken = req.cookies.get("auth_token")?.value;

    // El token es opaco (Sanctum), así que aquí sólo se comprueba que exista y
    // tenga forma utilizable. La validación real la hace el backend en cada
    // request, y el 401 resultante expulsa la sesión desde AuthContext.
    if (!authToken || !isUsableToken(authToken)) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("from", currentPath);

      const response = NextResponse.redirect(loginUrl);
      if (authToken) {
        response.cookies.delete("auth_token");
      }

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // 9. Configuración optimizada del matcher
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (Speed Insights / Analytics endpoints)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth routes
     * - cualquier ruta con extensión (los archivos de /public en la raíz, como
     *   /logo.png): con la lógica invertida serían "protegidos" y un visitante
     *   sin sesión recibiría el HTML del login en lugar de la imagen.
     */
    "/((?!api/auth|_next/static|_next/image|_vercel|favicon.ico|images|icons|fonts|.*\\..*).*)",
  ],
};
