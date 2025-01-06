import { socket } from "../socket";

let audioChunks: Blob[] = [];
let mediaRecorder: MediaRecorder | null = null;
let audioBlob: Blob | null = null;
let audio: HTMLAudioElement;
export const MediaRecorderCreation = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstart = () => {
        console.log("Recording has started");
    };

    mediaRecorder.onstop = () => {
        console.log("Recording has stopped");
        audioBlob = new Blob([...audioChunks], {
            type: "audio/ogg",
        });
        console.log("recorded audio blob: ", audioBlob);
        if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log("audio URL is: ", audioUrl);
            audio = new Audio(audioUrl);
        } else {
            console.log("No recording available to play");
        }
    };
    mediaRecorder.onerror = (error) => {
        console.error("Recording error", error);
    };
    console.log("Media recorder instance created");
};

export const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
        mediaRecorder.start();
    }
};
export const stopRecording = (audioCancelled: boolean) => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
    if (audioCancelled) {
        audioBlob = null;
        audioChunks = [];
        console.log("audio is cancelled");
    }
};

export const PlayRecording = (position: number, duration: number) => {
    audio.currentTime = (position * duration) / 1000 / 100;
    audio.play();
};

export const PauseAudio = () => audio.pause();

export const sendVoiceMessage = (user: string, receiver: string, duration: number) => {
    console.log(audioBlob);
    const reader = new FileReader();

    reader.onloadend = () => {
        const result = reader.result;
        if (result && typeof result === "string") { // Ensure result is a Base64 string
            const base64Audio = result.split(",")[1]; // Extract only the Base64 data part
            socket.emit("sendVoiceMessage", { user, receiver, audio: base64Audio , duration});
        } else {
            console.error("Failed to read audio data as Base64 string");
        }
    };

    // Read audioBlob as Data URL (Base64)
    reader.readAsDataURL(audioBlob as Blob);
};


export const tempPlay = (audioBlob: Blob) => {
    try {
        if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        }
    } catch (error) {
        console.error("Error playing audio: ", error);
    }
};

