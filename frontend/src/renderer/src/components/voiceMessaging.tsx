import { useState, useRef, useEffect, useCallback } from "react";
import {
    PauseAudio,
    PlayRecording,
    sendVoiceMessage,
    startRecording,
    stopRecording,
} from "./MediaRecorderUtils";
import stop from "../assets/stop.svg";
import voice from "../assets/voice.svg";
import play from "../assets/play.svg";
import pause from "../assets/pause.svg";
import send from "../assets/send.svg";
import anotherRecord from "../assets/anotherRecord.svg";
import cancel from "../assets/close.svg";
import "../Styles/style.css";
// import { pauseRecording } from "./MediaRecorderUtils";
interface Props {
    voiceMessage: boolean;
    setVoiceMessage: (value: boolean) => void;
    user: string;
    receiver: string;
}
const VoiceMessagingBox = ({
    voiceMessage,
    setVoiceMessage,
    user,
    receiver,
}: Props) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerIdRef = useRef<number | null>(null);
    const [time, setTime] = useState<number>(0);
    const [buffer, setBuffer] = useState<number[]>([]);
    const [visual, setVisual] = useState<boolean>(false);
    const [currPosition, setCurrPosition] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [playing, setPlaying] = useState<boolean>(false);
    const [recordingStopped, setRecordingStopped] = useState<boolean>(false);
    const startAudioVisualizer = async () => {
        startRecording();
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        streamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        source.connect(analyser);

        startTimer();
        Draw();
        setVoiceMessage(true);
        setVisual(true);
    };
    const AnotherRecord = () => {
        setTime(duration);
        setRecordingStopped(false)
        startAudioVisualizer();
    };

    const stopAudioVisualizer = (audioCancel: boolean) => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        stopRecording(audioCancel);
        // setVoiceMessage(false);
        stopTimer();
        setDuration(time);
        setVisual(false);
        setCurrPosition(0);
        console.log("duration: " + time);
        setPlaying(false);
        setBuffer([]);
        setRecordingStopped(true);
    };
    const lastUpdateTimeRef = useRef<number>(Date.now());
    const Draw = () => {
        animationFrameIdRef.current = requestAnimationFrame(Draw);
        const now = Date.now();
        const elapsed = now - lastUpdateTimeRef.current;

        if (elapsed < 100) return;

        lastUpdateTimeRef.current = now;
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        if (analyser && dataArray) {
            analyser.getByteTimeDomainData(dataArray);
            const volume =
                dataArray.reduce(
                    (sum, value) => sum + Math.abs(value - 128),
                    0
                ) / dataArray.length;

            setBuffer((prev) => {
                const newPrev = [...prev, volume];
                if (newPrev.length > 20) {
                    newPrev.shift();
                }
                return newPrev;
            });
        }
    };
    const formatTime = (milliseconds: number) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
        return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
    };
    const startTimer = () => {
        if (timerIdRef.current === null) {
            timerIdRef.current = window.setInterval(() => {
                setTime((prev) => prev + 100);
            }, 100);
        }
    };
    const stopTimer = useCallback(() => {
        if (timerIdRef.current !== null) {
            clearInterval(timerIdRef.current);
            timerIdRef.current = null;
        }
    }, []);
    useEffect(() => {
        if (currPosition >= 100) {
            stopTimer();
            setPlaying(false);
            setCurrPosition(0);
        } else if (playing) {
            setCurrPosition((time / duration) * 100);
        }
    }, [duration, playing, time, stopTimer, currPosition]);
    const cancelRecording = () => {
        setVoiceMessage(false);
        setTime(0);
        setDuration(0);
        stopAudioVisualizer(true);
        setRecordingStopped(false);
    };
    return (
        <div className="flex gap-10">
            <div className="flex items-center bg-slate-900 rounded-lg shadow-[0_0_1px_black]">
                {!voiceMessage && (
                    <button onClick={startAudioVisualizer}>
                        <img
                            src={voice}
                            alt=""
                            className="h-8 invert px-1"
                            onClick={() => setVoiceMessage(true)}
                        />
                    </button>
                )}
                {voiceMessage && (
                    <div className="flex items-center py-1">
                        <button onClick={cancelRecording}>
                            <img
                                src={cancel}
                                alt=""
                                className="h-4 mx-3 invert"
                            />
                        </button>
                        <span className="mx-1 text-white text-sm flex justify-center w-10">
                            {formatTime(time)}
                        </span>
                        <div className="w-32 mx-4 flex h-7 justify-between items-center">
                            {visual ? (
                                buffer.map((value, index) => (
                                    <div
                                        key={index}
                                        className="w-[3px] mx-[1px] bg-sky-300 rounded-md"
                                        style={{
                                            height: `${Math.min(
                                                25,
                                                value 
                                            )}px`,
                                        }}
                                    ></div>
                                ))
                            ) : (
                                <input
                                    type="range"
                                    name=""
                                    id=""
                                    step={0.1}
                                    value={currPosition}
                                    className="bg-slate-900 appearance-none audio-track"
                                    onChange={(e) => {
                                        setCurrPosition(Number(e.target.value));
                                        setTime(
                                            Math.round(
                                                (Number(e.target.value) / 100) *
                                                    duration
                                            )
                                        );
                                        if (playing) {
                                            PauseAudio();
                                            PlayRecording(
                                                Number(e.target.value),
                                                duration
                                            );
                                        }
                                    }}
                                />
                            )}
                        </div>
                        {recordingStopped ? (
                            <button onClick={AnotherRecord}>
                                <img src={anotherRecord} alt="" className="h-6 mr-1 hover:shadow-[0_0_1px_gray] rounded-full" />
                            </button>
                        ) : (
                            <button onClick={() => stopAudioVisualizer(false)}>
                                <img
                                    src={stop}
                                    alt=""
                                    className="h-3 mx-1 mr-4 invert"
                                />
                            </button>
                        )}

                        {recordingStopped &&
                            (playing ? (
                                <button
                                    onClick={() => {
                                        PauseAudio();
                                        stopTimer();
                                        setPlaying(false);
                                    }}
                                >
                                    <img
                                        src={pause}
                                        alt=""
                                        className="h-4 mx-1 mr-3"
                                    />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (currPosition === 0) setTime(0);
                                        setPlaying(true);
                                        startTimer();
                                        PlayRecording(currPosition, duration);
                                    }}
                                >
                                    <img
                                        src={play}
                                        alt=""
                                        className="h-4 mx-1 mr-3"
                                    />
                                </button>
                            ))}
                    </div>
                )}
            </div>
            {voiceMessage && (
                <button
                    className="text-white rounded-[10px] flex justify-center items-center shadow-[0_0_1px_black] px-2 py-2 border-none cursor-pointer bg-slate-900 hover:bg-slate-950"
                    onClick={() => {
                        sendVoiceMessage(user, receiver, duration);
                        setVoiceMessage(false);
                    }}
                >
                    <img src={send} alt="" className="invert h-[20px]" />
                </button>
            )}
        </div>
    );
};

export default VoiceMessagingBox;
