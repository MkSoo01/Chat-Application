import { Schema, model } from 'mongoose';

export interface IMessage {
    from: string;
    to: string;
    messageText: string;
    createdTime: Date;
}

const MessageSchema = new Schema<IMessage>({
    from: String,
    to: String,
    messageText: {
        type: String,
        trim: true,
    },
    createdTime: Date,
});

const Message = model<IMessage>('Message', MessageSchema);

export default Message;
