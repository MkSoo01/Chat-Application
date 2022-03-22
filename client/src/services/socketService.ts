import IO, { Socket } from 'socket.io-client';
import {
    GET_PRIVATE_MESSAGE,
    IGetPrivateMessageEventData,
    ISendPrivateMessageEventData,
    ISetUserSocketData,
    SEND_PRIVATE_MESSAGE,
    SET_USER_SOCKET,
} from '../event';
import { IMessage } from '../models/message';
import { SERVER_IP } from './CONSTANTS';

let socket: Socket;

function setupSocketClient(username: string) {
    socket = IO(SERVER_IP);
    const setUserSocketData: ISetUserSocketData = { username: username };
    socket.emit(SET_USER_SOCKET, setUserSocketData);
}

function setupGetPrivateMessageEvent(setMessages: (messagesToDisplay: any) => void) {
    socket.on(GET_PRIVATE_MESSAGE, (data: IGetPrivateMessageEventData) => {
        if (data && data.from && data.message) {
            setMessages((messagesToDisplay: IMessage[]) => [
                ...messagesToDisplay,
                {
                    from: data.from,
                    to: data.to,
                    messageText: data.message,
                    createdTime: new Date(),
                },
            ]);
        }
    });
}

function sendPrivateMessage(privateMessageData: ISendPrivateMessageEventData) {
    socket.emit(SEND_PRIVATE_MESSAGE, privateMessageData);
}

export default { setupSocketClient, setupGetPrivateMessageEvent, sendPrivateMessage };
