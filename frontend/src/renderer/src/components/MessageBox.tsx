import { useEffect, useState } from 'react'
import { socket } from '../socket'
import '../Styles/style.css'
import { groupMessages, formatDate } from './HelperFunctions'
import SelectedMessages from './SelectMessages'

interface Fetched {
  message: string
  timestamp: number
  user: string
  notification: boolean
  voiceMessage?: {
    data: string
    mimeType: string | null
    duration: number
  }
}

interface Message {
  user: string
  msg: string
  receiver: string
}

interface Props {
  fetchedMessages: Fetched[]
  setFetchedMessages: (value: React.SetStateAction<Fetched[]>) => void
  message: Message
  receiver: string
  chatRef: React.RefObject<HTMLDivElement>
  selection: boolean
  selected: number[]
  setSelected: (value: React.SetStateAction<number[]>) => void
}

const MessageBox = ({
  fetchedMessages,
  setFetchedMessages,
  message,
  receiver,
  chatRef,
  selection,
  selected,
  setSelected
}: Props) => {
  const GroupedMessages = groupMessages(fetchedMessages)

  const clubbedMessages = fetchedMessages.reduce<{ index: number; time: string }[]>(
    (acc, msg, i) => {
      if (i === 0 || formatDate(msg.timestamp) !== formatDate(fetchedMessages[i - 1].timestamp)) {
        acc.push({ index: msg.timestamp, time: formatDate(msg.timestamp) })
      }
      return acc
    },
    []
  )

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }

    const handleSendMessage = (allMessages: Fetched[]) => {
      setFetchedMessages(allMessages)
    }

    const handleSend = (all: Fetched[]) => {
      if (receiver === all[all.length - 1].user) {
        setFetchedMessages(all)
      }
    }

    socket.on('sendMessage', handleSendMessage)
    socket.on('send', handleSend)

    return () => {
      socket.off('sendMessage', handleSendMessage)
      socket.off('send', handleSend)
    }
  }, [receiver, setFetchedMessages, chatRef])

  const handleSelectionChange = (timestamp: number) => {
    console.log('message selected.')
    setSelected((prev: number[]) => {
      if (prev.includes(timestamp)) {
        return prev.filter((item: number) => item !== timestamp)
      } else {
        return [...prev, timestamp]
      }
    })
  }
  return (
    <div
      className="flex flex-col items-end h-full bg-slate-300 overflow-y-auto flex-1 z-10 scrollbar scrollbar-style py-2 bg-image"
      ref={chatRef}
    >
      {GroupedMessages &&
        GroupedMessages.map((group, index) => (
          <div key={`group-${index}`} className="flex flex-col w-full">
            {group.messages.map((msg, i) => (
              <div
                key={`msg-${index}-${i}`}
                className="flex flex-col"
                style={
                  message.user === group.user
                    ? { alignItems: 'flex-end' }
                    : { alignItems: 'flex-start' }
                }
              >
                {clubbedMessages.some((c) => c.index === msg.timestamp) && (
                  <div className="w-full flex justify-center mb-4 mt-2">
                    <span className="bg-emerald-900 text-white text-[13px] font-nunito px-3 py-[2px] rounded-[4px] shadow-[0_0_1px_black] cursor-default select-none">
                      {clubbedMessages.find((c) => c.index === msg.timestamp)?.time}
                    </span>
                  </div>
                )}
                <SelectedMessages
                  msg={msg}
                  messageUser={message.user}
                  groupUser={group.user}
                  index={i}
                  handleSelectionChange={handleSelectionChange}
                  selected={selected}
                  selection={selection}
                />
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}

export default MessageBox
