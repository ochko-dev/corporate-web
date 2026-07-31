import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/src/lib/i18n/config";

/** Lets `/en` and `/mn` switch the site language while keeping the prefix
 *  in the address bar (rewritten to `/` under the hood). This app has no
 *  `[locale]` route segment — see locale-provider.tsx for why (this Next.js
 *  fork renamed `middleware` to `proxy`, which next-intl's routing helpers
 *  don't target), so the prefix is handled here instead. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, maybeLocale, ...rest] = pathname.split("/");

  if (!isLocale(maybeLocale)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${rest.join("/")}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", maybeLocale);

  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
  response.cookies.set(LOCALE_COOKIE, maybeLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/en", "/en/:path*", "/mn", "/mn/:path*"],
};
