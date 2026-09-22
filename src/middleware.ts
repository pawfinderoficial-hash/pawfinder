import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const protectedPrefixes = [
    "/feed",
    "/mapa",
    "/match",
    "/mis-avisos",
    "/notificaciones",
    "/publicar",
  ];

  const needsAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (needsAuth && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/feed";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/feed/:path*",
    "/mapa/:path*",
    "/match/:path*",
    "/mis-avisos/:path*",
    "/notificaciones/:path*",
    "/publicar/:path*",
  ],
};
