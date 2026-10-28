import { Geist, Geist_Mono, Inter } from "next/font/google"
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import { Suspense } from "react"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ThemeProvider>
            <header className="flex h-16 items-center justify-end gap-2 p-4">
              <Suspense>
                <Show when="signed-out">
                  <SignInButton
                    forceRedirectUrl="/dashboard"
                    signUpForceRedirectUrl="/dashboard"
                  >
                    <Button variant="outline">Sign In</Button>
                  </SignInButton>
                  <SignUpButton
                    forceRedirectUrl="/dashboard"
                    signInForceRedirectUrl="/dashboard"
                  >
                    <Button>Sign Up</Button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </Suspense>
            </header>
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
