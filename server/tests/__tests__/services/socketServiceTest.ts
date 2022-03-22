import socketService, { SOCKET_CONTEXT } from '../../../src/services/socketService';
import messageService from '../../../src/services/messageService';
import * as Event from '../../../src/event';
import Socket, { ISocket } from '../../../src/models/sockets';
import sinon from 'sinon';
import SocketIO from 'socket.io';

jest.mock('socket.io', () => {
    function Socket(socketId: any, client: any, auth: any) {
        Socket.prototype.id = socketId;
    }
    Socket.prototype.on = jest.fn();
    Socket.prototype.emit = jest.fn();
    Socket.prototype.to = jest.fn();
    Socket.prototype.join = jest.fn();

    function Server() {}
    Server.prototype.on = jest.fn();

    return {
        Socket: Socket,
        Server: Server,
    };
});

beforeEach(() => {
    sinon.restore();
});

afterEach(async () => {
    sinon.verify();
});

describe('create socket', () => {
    const newSocketId = 'newSocketId';
    const newSocket = { socketId: newSocketId };

    it('success', async () => {
        sinon.mock(Socket).expects('create').withArgs(newSocket).resolves(newSocket);

        await expect(socketService.createSocket(newSocketId)).resolves.toBe(true);
    });

    it('error (empty socket id)', async () => {
        jest.spyOn(Socket, 'create');
        const invalidSocketId = '';
        const expectedError = new Error("Socket id can't be empty");

        await expect(socketService.createSocket(invalidSocketId)).rejects.toStrictEqual(expectedError);
        expect(Socket.create).not.toHaveBeenCalled();
    });
});

describe('delete socket', () => {
    const socketId = 'socketId';
    const deleteSocket = { socketId: socketId };

    it('success', async () => {
        sinon.mock(Socket).expects('deleteOne').withArgs(deleteSocket).resolves(true);

        await expect(socketService.deleteSocket(socketId)).resolves.toBe(true);
    });

    it('error (empty socket id)', async () => {
        jest.spyOn(Socket, 'deleteOne');
        const invalidSocketId = '';
        const expectedError = new Error("Socket id can't be empty");

        await expect(socketService.deleteSocket(invalidSocketId)).rejects.toStrictEqual(expectedError);
        expect(Socket.deleteOne).not.toHaveBeenCalled();
    });
});

describe('setup socket event', () => {
    let actualEvent: any;
    let eventListener: any;
    const socketId: any = 'userSocketId';
    const mocked: any = '';

    beforeEach(() => {
        jest.spyOn(SocketIO.Socket.prototype, 'on').mockImplementation(function (
            this: SocketIO.Socket,
            event,
            listener
        ) {
            actualEvent = event;
            eventListener = listener;
            return this;
        });
    });

    afterEach(() => {
        actualEvent = null;
        eventListener = null;
    });

    it('init', async () => {
        const socketioServer = new SocketIO.Server();
        mockSocketIOServerFunction();
        const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);

        socketService.init(socketioServer);

        expect(socketioServer.on).toHaveBeenCalled();
        expect(actualEvent).toBe(Event.CONNECTION);
        await eventListener(mockedSocket);
        assertInitEventListenerAction();
    });

    function mockSocketIOServerFunction() {
        jest.spyOn(SocketIO.Server.prototype, 'on').mockImplementation(function (
            this: SocketIO.Server,
            event,
            listener
        ) {
            actualEvent = event;
            eventListener = listener;
            return this;
        });
    }

    function assertInitEventListenerAction() {
        expect(SocketIO.Socket.prototype.on).toHaveBeenCalledWith(Event.SEND_PRIVATE_MESSAGE, expect.anything());
        expect(SocketIO.Socket.prototype.on).toHaveBeenNthCalledWith(2, Event.SET_USER_SOCKET, expect.anything());
        expect(SocketIO.Socket.prototype.on).toHaveBeenNthCalledWith(3, Event.DISCONNECT, expect.anything());
    }

    it('setupDisconnectEvent', async () => {
        const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
        sinon.mock(Socket).expects('deleteOne').withArgs({ socketId: socketId }).resolves(true);

        socketService.setupDisconnectEvent(mockedSocket);

        expect(mockedSocket.on).toHaveBeenCalled();
        expect(actualEvent).toBe(Event.DISCONNECT);

        await eventListener();
    });

    describe('setupSetUserSocketEvent', () => {
        const username = 'username';
        const setupUserSocketData: Event.setUserSocketData = { username: username };

        it('listener with data and callback', async () => {
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            sinon.mock(Socket).expects('findOne').withArgs({ socketId: socketId }).resolves(null);
            sinon.mock(Socket).expects('create').withArgs({ socketId: socketId, username: username }).resolves(true);
            const listenerCallback = jest.fn();

            socketService.setupSetUserSocketEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SET_USER_SOCKET);

            await eventListener(setupUserSocketData, listenerCallback);
            expect(listenerCallback).toHaveBeenCalled();
        });

        it('Existing socket', async () => {
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            const existingSocketInDb = { socketId: socketId };
            sinon.mock(Socket).expects('findOne').withArgs({ socketId: socketId }).resolves(existingSocketInDb);
            jest.spyOn(Socket, 'create');
            const listenerCallback = jest.fn();

            socketService.setupSetUserSocketEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SET_USER_SOCKET);

            await eventListener(setupUserSocketData, listenerCallback);
            expect(listenerCallback).toHaveBeenCalled();
            expect(Socket.create).not.toHaveBeenCalled();
        });

        it('Listener with null callback', async () => {
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            sinon.mock(Socket).expects('findOne').withArgs({ socketId: socketId }).resolves(null);
            sinon.mock(Socket).expects('create').withArgs({ socketId: socketId, username: username }).resolves(true);

            socketService.setupSetUserSocketEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SET_USER_SOCKET);
            await eventListener(setupUserSocketData, null);
        });

        it('Listener with null data', async () => {
            const expectedError = new Error('Data is null');
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            const listenerCallback = jest.fn();
            jest.spyOn(Socket, 'findOne');
            jest.spyOn(Socket, 'create');

            socketService.setupSetUserSocketEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SET_USER_SOCKET);
            await eventListener(null, listenerCallback);
            expect(listenerCallback).toHaveBeenCalledWith(expectedError);
            expect(Socket.findOne).not.toHaveBeenCalled();
            expect(Socket.create).not.toHaveBeenCalled();
        });

        it('Listener (error when create user socket)', async () => {
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            sinon.mock(Socket).expects('findOne').withArgs({ socketId: socketId }).resolves(null);
            const expectedError = new Error('Error in creating socket');
            sinon
                .mock(Socket)
                .expects('create')
                .withArgs({ socketId: socketId, username: username })
                .rejects(expectedError);
            const listenerCallback = jest.fn();

            socketService.setupSetUserSocketEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SET_USER_SOCKET);

            await eventListener(setupUserSocketData, listenerCallback);
            expect(listenerCallback).toHaveBeenCalledWith(expectedError);
        });
    });

    describe('setupSendPrivateMessageEvent', () => {
        const sender = { socketId: 'senderSocketIds', username: 'sender' };
        const receiver = { socketId: 'receiverSocketId', username: 'receiver' };
        const message = 'someMessageToSend';
        const sendPrivateMessageData: Event.sendPrivateMessageEventData = {
            from: sender.username,
            to: receiver.username,
            message: message,
        };
        const getPrivateMessageData: Event.getPrivateMessageEventData = {
            from: sender.username,
            to: receiver.username,
            message: message,
        };
        const socketId: any = sender.socketId;
        const mocked: any = '';
        const listenerCallback = jest.fn();

        it('Listener with data and callback', async () => {
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            mockForListener();

            socketService.setupSendPrivateMessageEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SEND_PRIVATE_MESSAGE);
            await eventListener(sendPrivateMessageData, listenerCallback);
            assertListenerActions();
        });

        it('Listener with null callback', async () => {
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            mockForListener();

            socketService.setupSendPrivateMessageEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SEND_PRIVATE_MESSAGE);
            await eventListener(sendPrivateMessageData, null);
            assertListenerActions(false);
        });

        function mockForListener() {
            jest.spyOn(Socket, 'find').mockResolvedValueOnce([receiver]);
            jest.spyOn(messageService, 'saveMessage').mockResolvedValue(true);
            jest.spyOn(SocketIO.Socket.prototype, 'to').mockReturnThis();
        }

        function assertListenerActions(hasListenerCallback: boolean = true) {
            expect(messageService.saveMessage).toHaveBeenCalledWith(
                sender.username,
                receiver.username,
                sendPrivateMessageData.message
            );
            expect(Socket.find).toHaveBeenCalledWith({
                socketId: { $ne: socketId },
                username: { $in: [sender.username, receiver.username] },
            });
            expect(SocketIO.Socket.prototype.to).toHaveBeenCalledWith([receiver.socketId]);
            expect(SocketIO.Socket.prototype.emit).toHaveBeenCalledWith(
                Event.GET_PRIVATE_MESSAGE,
                getPrivateMessageData
            );

            if (hasListenerCallback) {
                expect(listenerCallback).toHaveBeenCalledWith(null);
            }
        }

        it('Listener with null data', async () => {
            const expectedError = new Error('Data is null');
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            mockForListenerHandlingNullDataError();

            socketService.setupSendPrivateMessageEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SEND_PRIVATE_MESSAGE);
            await eventListener(null, listenerCallback);
            assertListenerHandlingNullDataError(expectedError);
        });

        function mockForListenerHandlingNullDataError() {
            jest.spyOn(Socket, 'find');
            jest.spyOn(messageService, 'saveMessage');
            jest.spyOn(SocketIO.Socket.prototype, 'to');
        }

        function assertListenerHandlingNullDataError(expectedError: Error) {
            expect(messageService.saveMessage).not.toHaveBeenCalled();
            expect(Socket.find).not.toHaveBeenCalled();
            expect(SocketIO.Socket.prototype.to).not.toHaveBeenCalled();
            expect(SocketIO.Socket.prototype.emit).not.toHaveBeenCalled();
            expect(listenerCallback).toHaveBeenCalledWith(expectedError);
        }

        it('Listener (receiver socket not found)', async () => {
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            mockForListenerHandlingReceiverSocketNotFound();

            socketService.setupSendPrivateMessageEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SEND_PRIVATE_MESSAGE);
            await eventListener(sendPrivateMessageData, listenerCallback);
            assertListenerHandlingSocketNotFound();
        });

        function mockForListenerHandlingReceiverSocketNotFound() {
            jest.spyOn(Socket, 'find').mockResolvedValueOnce([]);
            jest.spyOn(messageService, 'saveMessage').mockResolvedValue(true);
            jest.spyOn(SocketIO.Socket.prototype, 'to');
        }

        function assertListenerHandlingSocketNotFound() {
            expect(messageService.saveMessage).toHaveBeenCalledWith(
                sender.username,
                receiver.username,
                sendPrivateMessageData.message
            );
            expect(Socket.find).toHaveBeenCalledWith({
                socketId: { $ne: socketId },
                username: { $in: [sender.username, receiver.username] },
            });
            expect(SocketIO.Socket.prototype.to).not.toHaveBeenCalled();
            expect(SocketIO.Socket.prototype.emit).not.toHaveBeenCalled();
            expect(listenerCallback).toHaveBeenCalledWith(null);
        }

        it('Listener (save Message error)', async () => {
            const expectedError = new Error('Invalid receiver');
            const mockedSocket = new SocketIO.Socket(socketId, mocked, mocked);
            mockForListenerHandlingSaveMessageError(expectedError);

            socketService.setupSendPrivateMessageEvent(mockedSocket);

            expect(mockedSocket.on).toHaveBeenCalled();
            expect(actualEvent).toBe(Event.SEND_PRIVATE_MESSAGE);
            await eventListener(sendPrivateMessageData, listenerCallback);
            assertListenerHandlingSaveMessageError(expectedError);
        });

        function mockForListenerHandlingSaveMessageError(expectedError: Error) {
            jest.spyOn(Socket, 'findOne').mockResolvedValueOnce(receiver);
            jest.spyOn(messageService, 'saveMessage').mockRejectedValue(expectedError);
            jest.spyOn(SocketIO.Socket.prototype, 'to');
        }

        function assertListenerHandlingSaveMessageError(expectedError: Error) {
            expect(messageService.saveMessage).toHaveBeenCalledWith(
                sender.username,
                receiver.username,
                sendPrivateMessageData.message
            );
            expect(Socket.findOne).not.toHaveBeenCalled();
            expect(SocketIO.Socket.prototype.to).not.toHaveBeenCalled();
            expect(SocketIO.Socket.prototype.emit).not.toHaveBeenCalled();
            expect(listenerCallback).toHaveBeenCalledWith(expectedError);
        }
    });
});
