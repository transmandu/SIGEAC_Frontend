import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryClientProvider from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { RedirectHandler } from "@/components/misc/RedirectHandler";
import { TooltipProvider } from "@/components/ui/tooltip";

const poppins = localFont({
  src: [
    { path: "../public/fonts/poppins/poppins-100.woff2", weight: "100", style: "normal" },
    { path: "../public/fonts/poppins/poppins-300.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/poppins/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/poppins/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/poppins/poppins-700.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/poppins/poppins-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SIGEAC",
  description: "Sistema de Gestión Aeronáutica Civil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <link rel="icon" href="/logo.png" sizes="any" />
        <QueryClientProvider>
          <RedirectHandler />
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider delayDuration={200}> {/* 👈 Aquí */}
                {children}
              </TooltipProvider>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
