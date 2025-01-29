import { useState, useRef } from 'react'
import { socket } from '../socket'

interface Message {
  user: string
  msg: string
  receiver: string
}

interface Props {
  setReceiver: (receiver: React.SetStateAction<string>) => void
  setMessage: (message: React.SetStateAction<Message>) => void
  activeUser: string[]
  user: string
  curr_receiver: string
}

const ActiveUsers = ({ setReceiver, setMessage, activeUser, user, curr_receiver }: Props) => {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [sidebarWidth, setSidebarWidth] = useState(384) // Tailwind's min-w-96 = 384px
  const isResizing = useRef(false)

  const handleClick = (receiver: string) => {
    setMessage((prev) => ({ ...prev, receiver }))
    socket.emit('setReceiver', { user, receiver })
    setReceiver(receiver)
  }

  const handleStatusSave = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    socket.emit('statusUpdate', { status, user })
    setStatus('')
    setVisible(false)
  }

  const handleMouseDown = () => {
    isResizing.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    const newWidth = e.clientX // Get the current mouse position

    // Restrict width between 200px and 384px
    const clampedWidth = Math.max(200, Math.min(384, newWidth))
    setSidebarWidth(clampedWidth)
  }

  const handleMouseUp = () => {
    isResizing.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className="bg-slate-300 rounded-tl-[15px] z-30 shadow-[0.5px_6px_2px_black] flex flex-col"
        style={{ width: `${sidebarWidth}px` }}
      >
        <h3 className="text-white shadow-[0_0.5px_1px_black] bg-slate-900 font-nunito p-5 rounded-tl-[15px] text-[18px] font-semibold">
          Active Users
        </h3>
        <div className="w-full flex-1">
          {activeUser.map((receiver) => (
            <div key={receiver} className="p-2 font-pop">
              <div
                className={`cursor-pointer text-red-900 flex rounded-xl bg-slate-300 flex-col py-2 px-3 duration-400 transition-all hover:bg-slate-50 ${
                  curr_receiver === receiver ? 'bg-slate-50' : 'bg-slate-300'
                }`}
                onClick={() => handleClick(receiver)}
              >
                <span className="text-lg font-bold">{receiver}</span>
                <span className="text-gray-700 mt-2 text-[14px]">
                  Whatever happens happens with truth
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="w-[2px] cursor-ew-resize bg-gray-600 hover:bg-gray-500"
        onMouseDown={handleMouseDown}
        style={{ userSelect: 'none' }}
      ></div>
    </div>
  )
}

export default ActiveUsers
