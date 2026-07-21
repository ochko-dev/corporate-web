import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { ClosingStatement } from "@/components/layout/footer";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/i18n/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const siteUrl = "https://odin.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Odin — Engineering the next generation of software",
    template: "%s · Odin",
  },
  description:
    "Odin is a premium software studio building web, mobile, cloud and AI products for ambitious teams. Design, engineering and DevOps under one roof.",
  keywords: [
    "software agency",
    "web development",
    "mobile app development",
    "UI/UX design",
    "cloud solutions",
    "AI solutions",
    "DevOps",
    "IT consulting",
  ],
  authors: [{ name: "Odin" }],
  creator: "Odin",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Odin — Engineering the next generation of software",
    description:
      "A premium software studio building web, mobile, cloud and AI products for ambitious teams.",
    siteName: "Odin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Odin — Engineering the next generation of software",
    description:
      "A premium software studio building web, mobile, cloud and AI products for ambitious teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fefeff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e14" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider initialLocale={locale}>
            <TooltipProvider delay={150}>
              <Navbar />
              <main className="flex-1">{children}</main>
              <ClosingStatement />
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
