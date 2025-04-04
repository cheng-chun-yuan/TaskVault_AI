import type { Metadata } from "next"
import { Mona_Sans as FontSans, Fira_Mono as FontMono } from "next/font/google"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import Web3Provider from "@/components/layout/Web3Provider"
import AppHeader from "@/components/layout/AppHeader"
import AppFooter from "@/components/layout/AppFooter"
import "@workspace/ui/styles/globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "TaskVault AI",
  description: "Create tasks. Let AI judge. Reward the best — transparently.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Web3Provider>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <AppHeader />
              <main className="flex-1">{children}</main>
              <AppFooter />
            </div>
          </Providers>
        </Web3Provider>
      </body>
    </html>
  )
}