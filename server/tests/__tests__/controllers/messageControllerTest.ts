import messageController from '../../../src/controllers/messageController';
import { IMessage } from '../../../src/models/messages';
import { getMessagesData, TypedRequestQuery } from '../../../src/request';
import messageService from '../../../src/services/messageService';
import jwt from 'jsonwebtoken';

describe('getMessage', () => {
    const user = 'username';
    const mockedMessage1: IMessage = { from: user, to: 'receiver', messageText: 'message1', createdTime: new Date() };
    const mockedMessage2: IMessage = Object.assign({}, mockedMessage1, { messageText: 'message2' });
    const messages: IMessage[] = [mockedMessage1, mockedMessage2];
    const messageControllerInstance = new messageController();
    type MessageRequest = { query: getMessagesData };
    const accessToken = 'token';
    const authorizationHeader = {
        headers: {
            authorization: 'Bearer ' + accessToken,
        },
    };

    beforeEach(() => {
        jest.spyOn(jwt, 'verify').mockReturnValue();
    });

    it('success', async () => {
        jest.spyOn(messageService, 'getMessages').mockResolvedValue(messages);
        const mReq: MessageRequest = {
            ...authorizationHeader,
            query: {
                username: user,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await messageControllerInstance.getMessages(mReq as any, mRes);
        expect(messageService.getMessages).toBeCalledWith(user);
        expect(mRes.status).toBeCalledWith(200);
        expect(mRes.send).toBeCalledWith(messages);
    });

    it('error', async () => {
        const expectedError = new Error('Error');
        const expectedResponse = { error: expectedError.message };

        jest.spyOn(messageService, 'getMessages').mockRejectedValue(expectedError);
        const mReq: MessageRequest = {
            ...authorizationHeader,
            query: {
                username: user,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await messageControllerInstance.getMessages(mReq as any, mRes);
        expect(messageService.getMessages).toBeCalledWith(user);
        expect(mRes.status).toBeCalledWith(400);
        expect(mRes.send).toBeCalledWith(expectedResponse);
    });
});
