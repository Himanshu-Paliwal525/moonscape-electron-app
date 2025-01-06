import SingleMessage from "./SingleMessage";
import select from "../assets/select.svg";
interface Props {
    index: number;
    msg: {
        message: string;
        timestamp: number;
        notification: boolean;
        voiceMessage?: {
            data: string | null;
            mimeType: string | null;
            duration: number;
        };
    };
    messageUser: string;
    groupUser: string;
    selection: boolean;
    selected: number[];
    handleSelectionChange: (timestamp: number) => void;
}
const SelectedMessages = ({
    index,
    msg,
    messageUser,
    groupUser,
    selection,
    selected,
    handleSelectionChange,
}: Props) => {
    return (
        <>
            {msg.notification && (
                <div className="w-full flex justify-center mb-4 mt-2">
                    <span className="bg-red-900 text-white text-[13px] font-nunito px-3 py-[2px] rounded-[4px] shadow-[0_0_1px_black] cursor-default select-none">
                        {msg.message}
                    </span>
                </div>
            )}
            {!msg.notification && (
                <div
                    className={`flex items-center ${
                        messageUser === groupUser ? "justify-end" : ""
                    } ${
                        messageUser === groupUser && selection
                            ? "justify-between"
                            : ""
                    } ${selection ? " select-none" : ""} ${
                        selection
                            ? selected.find((c) => c === msg.timestamp)
                                ? "bg-[rgba(112,161,245,0.4)] hover:bg-[rgba(112,161,245,0.4)]"
                                : "hover:bg-[rgba(49,78,110,0.4)]"
                            : ""
                    }
                ${index === 0 ? "pt-3" : ""} w-full py-[1px]`}
                    onClick={() =>
                        selection && handleSelectionChange(msg.timestamp)
                    }
                >
                    {selection && (
                        <span
                            className={`rounded-[5px] ml-12 ${
                                selected.find((c) => c === msg.timestamp)
                                    ? "bg-red-900 opacity-80"
                                    : "bg-white"
                            } shadow-[0_0_1px_black] px-1 py-1`}
                        >
                            <img src={select} alt="" className="h-4" />
                        </span>
                    )}
                    <SingleMessage
                        index={index}
                        messageUser={messageUser}
                        groupUser={groupUser}
                        msg={msg}
                        selection={selection}
                    />
                </div>
            )}
        </>
    );
};
export default SelectedMessages;
