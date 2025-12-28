import type { Metadata } from "next";
import "./globals.css";
import "./wallet-fix";
import { WagmiProvider } from "@/providers/WagmiProvider";
import { AppProvider } from "./context";
import { NavBar } from "@/components/NavBar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Background } from "@/components/Background";

export const metadata: Metadata = {
  title: "pm.ag terminal",
  description: "Real-time prediction market aggregation dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-terminal-bg text-terminal-text font-mono antialiased">
        <WagmiProvider>
          <AppProvider>
            <div className="relative min-h-screen overflow-hidden">
              <Background />
              <div className="relative z-10 flex flex-col min-h-screen">
                <NavBar />
                <main className="flex-1 p-4 md:p-6">{children}</main>
                <footer className="border-t border-terminal-border px-4 py-3 text-xs text-terminal-dim">
                  <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <span>pm.ag terminal v0.1.0</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-terminal-accent animate-pulse" />
                      SYSTEM ONLINE
                    </span>
                  </div>
                </footer>
              </div>
              <StatusIndicator />
            </div>
          </AppProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
