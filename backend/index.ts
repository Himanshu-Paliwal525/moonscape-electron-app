import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";
import { mongoURI, PORT } from "./config";
import { setupSocketHandlers } from "./sockets";
import mongoose from "mongoose";
if (mongoURI) mongoose.connect(mongoURI);
else console.log("mongoDB is not available");
const io = new Server({
    cors: {
        origin: "http://localhost:5173",
    },
    transports: ["websocket"],
    allowEIO3: true,
    
});

setupSocketHandlers(io);

io.listen(Number(PORT));
console.log(`Server is running on port ${PORT}`);
