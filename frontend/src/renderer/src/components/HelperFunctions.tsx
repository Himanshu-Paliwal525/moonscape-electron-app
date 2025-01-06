interface Fetched {
    message: string;
    timestamp: number;
    user: string;
    notification: boolean;
    voiceMessage?: {
        data: string | null;
        mimeType: string | null;
        duration: number;
    };
}

export const groupMessages = (messages: Fetched[]) => {
    // Handle empty input
    if (!messages || messages.length === 0) return [];

    const grouped: {
        user: string;
        messages: {
            message: string;
            timestamp: number;
            notification: boolean;
            voiceMessage?: {
                data: string | null;
                mimeType: string | null;
                duration: number;
            }
        }[];
    }[] = [];

    let temp: {
        message: string;
        timestamp: number;
        notification: boolean;
        voiceMessage?: {
            data: string | null;
            mimeType: string | null;
            duration: number;
        };
    }[] = [];

    let currentUser = messages[0]?.user;
    let lastDate = new Date(messages[0]?.timestamp).toDateString();

    messages.forEach((msg, i) => {
        const currentDate = new Date(msg.timestamp).toDateString();

        if (
            msg.notification ||
            (msg.user === currentUser && currentDate === lastDate)
        ) {
            temp.push({
                message: msg.message,
                timestamp: msg.timestamp,
                notification: msg.notification,
                voiceMessage: msg.voiceMessage,
            });
        } else {
            grouped.push({ user: currentUser, messages: temp });

            currentUser = msg.user;
            lastDate = currentDate;
            temp = [
                {
                    message: msg.message,
                    timestamp: msg.timestamp,
                    notification: msg.notification,
                    voiceMessage: msg.voiceMessage,
                },
            ];
        }

        // Always add the last group
        if (i === messages.length - 1) {
            grouped.push({ user: currentUser, messages: temp });
        }
    });

    // Handle grouped merging
    if (grouped.length === 0) return [];
    const merged: typeof grouped = [];
    let prev = grouped[0];

    for (let i = 1; i < grouped.length; i++) {
        const curr = grouped[i];

        if (
            prev.user === curr.user &&
            new Date(prev.messages[0].timestamp).toDateString() ===
                new Date(curr.messages[0].timestamp).toDateString()
        ) {
            prev = {
                ...prev,
                messages: [...prev.messages, ...curr.messages],
            };
        } else {
            merged.push(prev);
            prev = curr;
        }
    }

    merged.push(prev);
    return merged;
};


export const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const weekDays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    if (now.getFullYear() !== date.getFullYear()) {
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    } else if (now.getTime() - date.getTime() > 7 * 24 * 60 * 60 * 1000) {
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    } else {
        if (now.getDay() - date.getDay() === 1) return "Yesterday";
        else if (now.getDay() - date.getDay() === 0) return "Today";
        else return weekDays[date.getDay()];
    }
};
