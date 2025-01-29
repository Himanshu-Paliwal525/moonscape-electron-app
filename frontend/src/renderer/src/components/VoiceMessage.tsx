import { useState, useEffect, useCallback, useRef } from 'react'

import play_user from '../assets/play_user.svg'
import pause from '../assets/pause2.svg'
import '../Styles/style.css'
import { useAudioContext } from '@renderer/context/AudioContext'
interface voiceMessage {
  data: string | Blob | null
  mimeType: string | null
  duration: number
}
interface Props {
  messageUser: string
  groupUser: string
  msg: {
    message: string
    timestamp: number
    notification: boolean
    voiceMessage?: voiceMessage
  }
}

const VoiceMessage = ({ messageUser, groupUser, msg }: Props) => {
  const { audioRef, setCurrAudio, currAudio } = useAudioContext()
  const duration = msg.voiceMessage?.duration ? msg.voiceMessage?.duration : null
  const [playing, setPlaying] = useState<boolean | null>(false)
  const timerIdRef = useRef<number | null>(null)
  const [time, setTime] = useState<number>(duration ? duration : 0)
  const [currPosition, setCurrPosition] = useState<number>(0)

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0)
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`
  }

  const startTimer = () => {
    if (timerIdRef.current === null) {
      timerIdRef.current = window.setInterval(() => {
        setTime((prev) => prev - 100)
      }, 100)
    }
  }
  const stopTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current)
      timerIdRef.current = null
    }
  }, [])
  const PauseCurrentAudio = () => {
    const audio = audioRef.current
    if (audio && !audio.paused) {
      audio.pause()
      stopTimer()
      setPlaying(false)
      // setCurrAudio(0) // Reset active audio ID
    }
  }

  const PlayCurrentAudio = async (id: number) => {
    if (currAudio !== id) {
    }
    console.log(msg.voiceMessage?.data)
    if (msg.voiceMessage?.data) {
      const audioUrl = URL.createObjectURL(msg.voiceMessage.data as Blob)
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.load()
      }
    }
    const audio = audioRef.current
    if (audio && duration) {
      setCurrAudio(id)
      setPlaying(true)
      audio.currentTime = (currPosition * duration) / 1000 / 100
      await audio.play()
      startTimer()
    }
  }

  useEffect(() => {
    if (time <= 0 && duration) {
      setTime(duration)
      setPlaying(false)
      stopTimer()
      setCurrPosition(0)
    }
    if(msg.timestamp !== currAudio){
      stopTimer();
      setPlaying(false);
    }
    if (playing && time > 0 && duration) {
      setCurrPosition(((duration - time) / duration) * 100)
    }
  }, [time, stopTimer, duration, playing])
  return audioRef && duration ? (
    <div className="text-white flex items-center justify-between w-full gap-2">
      <div className="flex flex-col items-center justify-center gap-2 mt-1">
        {playing ? (
          <button
            onClick={() => {
              PauseCurrentAudio()
              stopTimer()
              setPlaying(false)
            }}
          >
            <img src={pause} alt="" className="h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (currPosition === 0) setTime(duration)
              setPlaying(true)
              startTimer()
              PlayCurrentAudio(msg.timestamp)
            }}
            className=""
          >
            <img src={play_user} alt="" className="h-4" />
          </button>
        )}
        <span className={`w-10 flex justify-center text-[11px] text-slate-300`}>
          {formatTime(time)}
        </span>
      </div>
      <input
        type="range"
        name=""
        id=""
        step={0.1}
        value={currPosition}
        className={`${
          groupUser === messageUser ? 'audio-msg-user' : 'audio-msg-receiver'
        } appearance-none w-40`}
        onChange={(e) => {
          setCurrPosition(Number(e.target.value))
          setTime(Math.round(((100 - Number(e.target.value)) / 100) * duration))
        }}
      />
    </div>
  ) : (
    <div>Loading audio...</div>
  )
}

export default VoiceMessage
