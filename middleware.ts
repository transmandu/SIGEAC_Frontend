import { NextRequest, NextResponse } from "next/server";

// 1. Definición centralizada de rutas protegidas
const PROTECTED_ROUTES = [
  '/inicio',
  '/transmandu',
  '/hangar74',
  '/ajustes',
  '/sistema',
  '/cuenta',
  '/planificacion',
  '/administracion'
];


// Formato de Sanctum: "<id>|<hash>", con o sin el prefijo "Bearer ".
const isUsableToken = (token: string) => {
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;

  return raw.trim().length > 0 && raw.includes('|');
};

export default async function middleware(req: NextRequest) {
  const currentPath = req.nextUrl.pathname;

  // 3. Verificación más eficiente de rutas
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    currentPath.startsWith(route)
  );


  // 4. Redirección si está en ruta protegida sin autenticación
  if (isProtectedRoute) {
    const authToken = req.cookies.get('auth_token')?.value;

    // El token es opaco (Sanctum), así que aquí sólo se comprueba que exista y
    // tenga forma utilizable. La validación real la hace el backend en cada
    // request, y el 401 resultante expulsa la sesión desde AuthContext.
    if (!authToken || !isUsableToken(authToken)) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('from', currentPath);

      const response = NextResponse.redirect(loginUrl);
      if (authToken) {
        response.cookies.delete('auth_token');
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
     */
    '/((?!api/auth|_next/static|_next/image|_vercel|favicon.ico|images|icons|fonts).*)',
  ],
};
