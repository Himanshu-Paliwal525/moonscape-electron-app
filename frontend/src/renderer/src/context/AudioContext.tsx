import { createContext, useContext, useState, useRef } from 'react'

interface AudioContextType {
  currAudio: number
  setCurrAudio: (id: number) => void
  audioRef: React.RefObject<HTMLAudioElement>
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currAudio, setCurrAudio] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(new Audio())
  

  return (
    <AudioContext.Provider
      value={{
        currAudio,
        setCurrAudio,
        audioRef,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider')
  }
  return context
}
