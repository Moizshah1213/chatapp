import "./globals.css"
import { Inter } from "next/font/google"
import { NextAuthProvider } from "@/providers/NextAuthProvider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata = {
  title: "Discord Clone",
  description: "Realtime chat app",
  manifest: "/manifest.json",
  themeColor: "#0f0f0f",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
     <body className={`${inter.className} bg-[#0f0f0f] text-white`}>
  <NextAuthProvider>{children}</NextAuthProvider>

  <script
    dangerouslySetInnerHTML={{
      __html: `
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
          })
        }
      `,
    }}
  />
</body>

    </html>
  )
}
