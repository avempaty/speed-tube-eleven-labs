import "./globals.css"
import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" })
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "SpeedTube - Get a summary of any YouTube video in seconds",
  description:
    "Discover the power of our YouTube highlight reel app. Our app leverages the latest in AI technology to generate watchable summary of any video, making it easy to find the most important parts of any video. Whether you're a podcast enthusiast, news junkie, or just looking to save time, our app has you covered. Try it out today and experience the future of video content consumption!",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased dark",
          fontSans.variable,
        )}
      >
        {children}
      </body>
    </html>
  )
}
