interface VoiceMessage {
    data: string | Buffer;
    duration: number;
    mimeType: string;
}

interface Fetched {
    message: string;
    timestamp: number;
    user: string;
    notification: boolean;
    voiceMessage?: VoiceMessage;
}

// Assuming the fetch message part
export const transformVoiceMessage = (messages: Fetched[]): Fetched[] => {
    return messages.map((message) => {
        if (
            message.voiceMessage &&
            message.voiceMessage.data instanceof Buffer
        ) {
            console.log("message is indeed a Buffer");

            // Convert Buffer to Base64 string
            const base64Audio = message.voiceMessage.data.toString("base64");

            // Update the voiceMessage data to Base64 and retain MIME type
            message.voiceMessage = {
                data: base64Audio,
                duration: message.voiceMessage.duration,
                mimeType: message.voiceMessage.mimeType,
            };
        }

        return message;
    });
};
