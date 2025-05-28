import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const protectedRoutes = [
    '/inicio',
    '/transmandu',
    '/hangar74',
    '/planificacion',
  ];
  const currentPath = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));

  if (isProtectedRoute) {
    const cookie = req.cookies.get('auth_token')?.value;
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    '/ajustes/:path*',
    '/inicio/:path*',
    '/transmandu/:path*',
    '/hangar74/:path*',
    '/planificacion/:path*',
    '/administracion/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
