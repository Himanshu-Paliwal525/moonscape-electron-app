import { useState } from 'react'
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
  return (
    <div className="min-w-96 bg-slate-300 rounded-tl-[15px] flex-1 z-30 shadow-[0.5px_6px_2px_black] flex flex-col">
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
      <div className={`${visible ? '' : 'flex-col items-center'} flex shadow-[0_0_4px_black]`}>
        <button
          className="hover:text-white bg-slate-900 text-slate-300 py-2 px-3 border-none shadow-[0_0_1px_black] my-2 text-[13px] hover:bg-red-900 rounded-md mx-1"
          onClick={() => setVisible((prev) => !prev)}
        >
          {!visible ? 'Change Status' : 'Cancel'}{' '}
        </button>
        <form
          className={`${
            visible ? 'flex justify-center items-center flex-1' : 'hidden'
          } overflow-hidden`}
        >
          <input
            type="text"
            name="status"
            id=""
            value={status}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatus(e.target.value)}
            className="text-[14px] outline-none bg-transparent border-b-2 border-slate-900 flex-1 mx-1 py-1 px-2 "
          />
          <button
            type="submit"
            className="bg-slate-900 text-[13px] text-slate-300 px-3 py-2 rounded-md mx-1 hover:text-white hover:bg-red-900"
            onClick={handleStatusSave}
          >
            save
          </button>
        </form>
      </div>
    </div>
  )
}

export default ActiveUsers
