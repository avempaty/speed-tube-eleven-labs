"use client"
import { useContext } from "react"
import {
  SummaryPlayerProvider,
  SummaryPlayerContext,
  Tab,
} from "../../SummaryPlayerContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SummaryPlayButton from "./@summary/SummaryPlayButton"
import { Captions, Clapperboard } from "lucide-react"
import SummaryDuration from "./@summary/SummaryDuration"

export default function VideoPageLayout(props: {
  player: React.ReactNode
  transcript: React.ReactNode
  summary: React.ReactNode
}) {
  return (
    <SummaryPlayerProvider>
      <InnerVideoPageLayout {...props} />
    </SummaryPlayerProvider>
  )
}

function InnerVideoPageLayout({
  player,
  transcript,
  summary,
}: {
  player: React.ReactNode
  transcript: React.ReactNode
  summary: React.ReactNode
}) {
  const { activeTab, setActiveTab } = useContext(SummaryPlayerContext)

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="h-2/5 md:w-3/5 md:h-full">{player}</div>
      <Tabs defaultValue={Tab.SUMMARY} className="flex flex-col h-3/5 md:w-2/5 md:h-full">
        <div className="p-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={Tab.SUMMARY} onClick={() => setActiveTab(Tab.SUMMARY)}>
              <Clapperboard className="mr-2 h-4 w-4" /> Summary Reel
            </TabsTrigger>
            <TabsTrigger
              value={Tab.TRANSCRIPT}
              onClick={() => setActiveTab(Tab.TRANSCRIPT)}
            >
              <Captions className="mr-2 h-4 w-4" /> Transcript
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={Tab.SUMMARY} className="m-0">
          <div className="flex justify-center pb-3">
            <SummaryPlayButton className="w-1/3 min-w-fit" />
          </div>
        </TabsContent>
        <div className="flex-grow overflow-y-scroll">
          <TabsContent value={Tab.SUMMARY}>
            <div className="flex pt-2 px-4 pb-3">
              <SummaryDuration className=" text-gray-400 italic" />
            </div>
            <div className="p-1 px-3">{summary}</div>
          </TabsContent>
          <TabsContent value={Tab.TRANSCRIPT}>
            <div className="p-1 px-3">{transcript}</div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
