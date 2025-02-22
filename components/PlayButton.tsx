import { MouseEventHandler } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Loader2 } from "lucide-react"

const PlayButton: React.FC<{
  isLoading: boolean
  isPlaying: boolean
  className?: string | undefined
  onClick?: MouseEventHandler<HTMLButtonElement>
}> = ({ isLoading, isPlaying, onClick, className }) => {
  let variant: "destructive" | "play" | undefined = undefined
  if (!isLoading) {
    variant = isPlaying ? "destructive" : "play"
  }

  return (
    <Button
      disabled={isLoading}
      variant={variant}
      onClick={onClick}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
        </>
      ) : null}
      {!isLoading && isPlaying ? (
        <>
          <Pause className="mr-2 h-4 w-4" /> Pause Summary Reel
        </>
      ) : null}
      {!isLoading && !isPlaying ? (
        <>
          <Play className="mr-2 h-4 w-4" /> Play Summary Reel
        </>
      ) : null}
      {/* {isPlaying ? (
        <>
          <Pause className="mr-2 h-4 w-4" /> Pause Summary Reel
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" /> Play Summary Reel
        </>
      )} */}
    </Button>
  )
}

export default PlayButton
