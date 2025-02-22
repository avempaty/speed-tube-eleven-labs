"use client"

import React, { useState } from "react"
import { Comment } from "react-loader-spinner"
import { useRouter } from "next/navigation"

type PropsType = { className?: string }

const YouTubeUrlInput = ({ className }: PropsType) => {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const videoId = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{11})/,
    )?.[1]
    if (videoId) {
      router.push(`/v/${videoId}`)
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <input
        className="flex-grow px-4 py-3 rounded-l-lg text-black focus:outline-none"
        type="text"
        value={url}
        onChange={handleUrlChange}
        placeholder="Enter YouTube URL"
      />
      <button
        disabled={isLoading}
        className="px-4 py-3 rounded-r-lg bg-blue-500 hover:bg-blue-600 text-white font-bold"
        type="submit"
      >
        {isLoading ? (
          <Comment
            height="35"
            width="35"
            color="#3b82f6"
            backgroundColor="white"
            ariaLabel="comment-loading"
            wrapperStyle={{}}
            wrapperClass="wrapper-class"
            visible={true}
          />
        ) : (
          "Get Summary"
        )}
      </button>
    </form>
  )
}

export default YouTubeUrlInput
