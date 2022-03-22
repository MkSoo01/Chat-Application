import Socket from '../models/sockets';
import SocketIO from 'socket.io';
import messageService from '../services/messageService';
import * as Event from '../event';

export const SOCKET_CONTEXT = 'socketContext';

function createSocket(inSocketId: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, rejects) => {
        if (inSocketId) {
            return Socket.create({ socketId: inSocketId }).then(() => {
                resolve(true);
            });
        }

        rejects(new Error("Socket id can't be empty"));
        return;
    });
}

function deleteSocket(inSocketId: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, rejects) => {
        if (inSocketId) {
            return Socket.deleteOne({ socketId: inSocketId }).then(() => {
                resolve(true);
            });
        }

        rejects(new Error("Socket id can't be empty"));
        return;
    });
}

function init(io: SocketIO.Server) {
    io.on(Event.CONNECTION, async (socket: SocketIO.Socket) => {
        setupSendPrivateMessageEvent(socket);
        setupSetUserSocketEvent(socket);
        setupDisconnectEvent(socket);
    });
}

function setupSendPrivateMessageEvent(socket: SocketIO.Socket) {
    socket.on(Event.SEND_PRIVATE_MESSAGE, async (data: Event.sendPrivateMessageEventData, cb: any) => {
        let error: any = null;
        try {
            if (data) {
                await messageService.saveMessage(data.from, data.to, data.message);
                const eventData: Event.getPrivateMessageEventData = {
                    from: data.from,
                    to: data.to,
                    message: data.message,
                };

                const receiverSocket = await Socket.find({
                    socketId: { $ne: socket.id },
                    username: { $in: [data.from, data.to] },
                });

                if (receiverSocket && receiverSocket.length) {
                    socket
                        .to(receiverSocket.map((socket) => socket.socketId))
                        .emit(Event.GET_PRIVATE_MESSAGE, eventData);
                }
            } else {
                throw new Error('Data is null');
            }
        } catch (err) {
            error = err;
        }

        if (cb) {
            cb(error);
        }
    });
}

function setupDisconnectEvent(socket: SocketIO.Socket) {
    socket.on(Event.DISCONNECT, async () => {
        await Socket.deleteOne({ socketId: socket.id });
    });
}

function setupSetUserSocketEvent(socket: SocketIO.Socket) {
    socket.on(Event.SET_USER_SOCKET, async (data: Event.setUserSocketData, cb: any) => {
        let error: any = null;
        try {
            if (data) {
                const existingSocket = await Socket.findOne({ socketId: socket.id });
                if (!existingSocket) {
                    await Socket.create({ socketId: socket.id, username: data.username }).catch((err) => (error = err));
                }
            } else {
                throw new Error('Data is null');
            }
        } catch (err) {
            error = err;
        }

        if (cb) {
            cb(error);
        }
    });
}

export default {
    createSocket,
    deleteSocket,
    setupSendPrivateMessageEvent,
    setupDisconnectEvent,
    init,
    setupSetUserSocketEvent,
};
