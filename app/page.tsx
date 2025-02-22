import React from "react"
import YouTubeUrlInput from "@/components/YouTubeUrlInput"
import { getServerSession } from "next-auth"
import authOptions from "./api/auth/[...nextauth]/authOptions"

const HomePage = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    console.log("session", session)
  }

  return (
    <div className="bg-gray-900 text-white">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-6xl font-bold mb-8">SpeedTube</h1>
        <p className="text-2xl mb-16">Get a summary of any YouTube video in seconds</p>
        <div className="w-full max-w-lg">
          <YouTubeUrlInput className="w-full px-4 py-3 rounded-lg shadow-lg text-black mb-4" />
        </div>
      </div>
    </div>
  )
}

export default HomePage
