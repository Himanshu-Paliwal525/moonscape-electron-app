import { useState, useEffect, useCallback, useRef } from "react";

import play_user from "../assets/play_user.svg";
import pause from "../assets/pause2.svg";
import "../Styles/style.css";
interface Props {
    index: number;
    messageUser: string;
    groupUser: string;
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
    selection: boolean;
}

const SingleMessage = ({ index, messageUser, groupUser, msg, selection }: Props) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const duration = msg.voiceMessage ? msg.voiceMessage?.duration : null;
    const [playing, setPlaying] = useState<boolean | null>(false);
    const timerIdRef = useRef<number | null>(null);
    const [time, setTime] = useState<number>(duration ? duration : 0);
    const [currPosition, setCurrPosition] = useState<number>(0);

    const formatTime = (milliseconds: number) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
        return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
    };
    useEffect(() => {
        if (msg.voiceMessage?.data) {
            const byteCharacters = atob(msg.voiceMessage.data); // Decode Base64 string
            const byteNumbers = new Array(byteCharacters.length)
                .fill(0)
                .map((_, i) => byteCharacters.charCodeAt(i));
            const byteArray = new Uint8Array(byteNumbers);

            const audioBlob = new Blob([byteArray], {
                type: msg.voiceMessage.mimeType || "audio/ogg",
            });
            const audioUrl = URL.createObjectURL(audioBlob);
            if (!audioRef.current) {
                audioRef.current = new Audio(audioUrl);
            }
        }
    }, [msg, duration]);

    const getMsgStyle = (user: string) => {
        return messageUser !== user ? { background: "#0879a2" } : {};
    };

    const startTimer = () => {
        if (timerIdRef.current === null) {
            timerIdRef.current = window.setInterval(() => {
                setTime((prev) => prev - 100);
            }, 100);
        }
    };
    const stopTimer = useCallback(() => {
        if (timerIdRef.current !== null) {
            clearInterval(timerIdRef.current);
            timerIdRef.current = null;
        }
    }, []);
    const PauseCurrentAudio = () => {
        const audio = audioRef.current;
        if (audio && !audio.paused) {
            audio.pause();
            stopTimer();
            setPlaying(false);
        }
    };
    const PlayCurrentAudio = () => {
        const audio = audioRef.current;
        if (audio && duration) {
            console.log(audio);
            audio.currentTime = (currPosition * duration) / 1000 / 100;
            audio.play();
        }
    };
    useEffect(() => {
        if (time <= 0 && duration) {
            setTime(duration);
            setPlaying(false);
            stopTimer();
            setCurrPosition(0);
        }
        if (playing && time > 0 && duration) {
            setCurrPosition(((duration - time) / duration) * 100);
        }
    }, [time, stopTimer, duration, playing]);
    return (
        <div className={`flex items-start ${selection ? "pointer-events-none": ""}`}>
            {index === 0 && messageUser !== groupUser && (
                <span className="border-4 ml-2  border-transparent border-t-[#0879a2] border-r-[#0879a2]"></span>
            )}
            <div
                className={` flex items-end ${
                    index === 0 && messageUser !== groupUser
                        ? "rounded-tl-none mx-0"
                        : "ml-4"
                } ${
                    messageUser === groupUser && index === 0
                        ? "rounded-tr-none mx-0"
                        : "mr-2"
                } bg-slate-900 rounded-[8px] gap-[10px] px-[10px] py-[6px] z-50 max-w-[500px]`}
                style={getMsgStyle(groupUser)}
            >
                {!msg.voiceMessage ? (
                    <span className="text-white text-[12px] whitespace-pre-wrap">
                        {msg.message}
                    </span>
                ) : audioRef && duration ? (
                    <div className="text-white flex items-center justify-between w-full gap-2">
                        <div className="flex flex-col items-center justify-center gap-2 mt-1">
                            {playing ? (
                                <button onClick={PauseCurrentAudio}>
                                    <img
                                        src={pause}
                                        alt=""
                                        className="h-4"
                                    />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (currPosition === 0)
                                            setTime(duration);
                                        setPlaying(true);
                                        startTimer();
                                        PlayCurrentAudio();
                                    }}
                                    className=""
                                >
                                    <img
                                        src={
                                            play_user
                                        }
                                        alt=""
                                        className="h-4"
                                    />
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
                                groupUser === messageUser
                                    ? "audio-msg-user"
                                    : "audio-msg-receiver"
                            } appearance-none w-40`}
                            onChange={(e) => {
                                setCurrPosition(Number(e.target.value));
                                setTime(
                                    Math.round(
                                        ((100 - Number(e.target.value)) / 100) *
                                            duration
                                    )
                                );
                            }}
                        />
                    </div>
                ) : (
                    <div>Loading audio...</div>
                )}
                <span className="text-[10px] text-right w-[70px] text-gray-300">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>
            {index === 0 && messageUser === groupUser && (
                <span className="border-4 border-transparent border-t-slate-900 border-l-slate-900"></span>
            )}
        </div>
    );
};

export default SingleMessage;
