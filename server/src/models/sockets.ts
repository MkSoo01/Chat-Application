import { Schema, model } from 'mongoose';

export interface ISocket {
    socketId: string;
    username: string;
}

const SocketSchema = new Schema<ISocket>({
    socketId: {
        type: String,
        unique: true,
    },
    username: String,
});

const Socket = model<ISocket>('Socket', SocketSchema);

export default Socket;
