"use client"

import { useRef, useState } from "react"
import { DownloadIcon, PauseIcon, PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { formatDuration } from "@/features/calls/format"

const SPEEDS = [1, 1.5, 2]

function CallRecordingPlayer({
  callId,
  durationSeconds,
}: {
  callId: string
  // Shown until the audio's own duration is known
  durationSeconds: number | null
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(durationSeconds ?? 0)
  const [speed, setSpeed] = useState(1)
  const [unavailable, setUnavailable] = useState(false)
  // The signed URL behind src expires, so a failed load is retried once from
  // where it stopped before giving up
  const retried = useRef(false)
  const resumeFrom = useRef<number | null>(null)

  // Stays the same across refreshes, so saving a change doesn't restart playback
  const src = `/api/calls/${callId}/recording`

  if (unavailable) {
    return (
      <p className="text-muted-foreground">
        The recording isn&apos;t available.
      </p>
    )
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }

  const seek = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seconds
    setPosition(seconds)
  }

  const changeSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]
    const audio = audioRef.current
    if (audio) {
      // The default survives a reload after an expired URL
      audio.defaultPlaybackRate = next
      audio.playbackRate = next
    }
    setSpeed(next)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-2 pr-1">
      <audio
        ref={audioRef}
        src={src}
        // Loading asks Vapi for the file, so wait until someone presses play
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onPlaying={() => {
          retried.current = false
        }}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget
          if (Number.isFinite(audio.duration)) setDuration(audio.duration)
          if (resumeFrom.current !== null) {
            audio.currentTime = resumeFrom.current
            resumeFrom.current = null
            audio.play().catch(() => {})
          }
        }}
        onError={(event) => {
          const audio = event.currentTarget
          if (retried.current) {
            setUnavailable(true)
            return
          }
          retried.current = true
          resumeFrom.current = audio.currentTime
          audio.load()
        }}
      />
      <Button
        size="icon"
        className="shrink-0 rounded-full"
        aria-label={playing ? "Pause" : "Play"}
        onClick={togglePlay}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Slider
        aria-label="Position"
        className="flex-1"
        value={position}
        min={0}
        max={Math.max(duration, 1)}
        step={0.1}
        onValueChange={(value) =>
          seek(typeof value === "number" ? value : value[0])
        }
      />
      <span className="shrink-0 text-muted-foreground tabular-nums">
        {formatDuration(position)} / {formatDuration(duration)}
      </span>
      <div className="flex shrink-0 items-center">
        <Button
          variant="ghost"
          size="sm"
          className="w-12 tabular-nums"
          aria-label={`Playback speed ${speed}x`}
          onClick={changeSpeed}
        >
          {speed}x
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Download recording"
          nativeButton={false}
          render={<a href={`${src}?download=1`} />}
        >
          <DownloadIcon />
        </Button>
      </div>
    </div>
  )
}

export { CallRecordingPlayer }
