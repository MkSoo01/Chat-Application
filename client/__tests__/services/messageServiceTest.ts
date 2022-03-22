import Api from '../../src/services/api';
import { IMessage } from '../../src/models/message';
import { IGetMessagesData } from '../../src/request';
import messageService from '../../src/services/messageService';
import { GET_MESSAGES_API } from '../../src/services/CONSTANTS';

describe('get messages', () => {
    const username = 'sender';
    const getMessagesRequestData: IGetMessagesData = { username: username };

    it('success', async () => {
        const mockedMessages: IMessage[] = [
            { from: username, to: 'receiver', messageText: 'messages', createdTime: new Date() },
        ];
        const responseStatus = 200;
        const mockedResponse = { status: responseStatus, data: mockedMessages };
        jest.spyOn(Api, 'get').mockResolvedValue(mockedResponse);

        await expect(messageService.getMessages(username)).resolves.toBe(mockedMessages);

        expect(Api.get).toHaveBeenCalledWith(GET_MESSAGES_API + '?username=' + username);
    });

    it('error (empty username)', async () => {
        const emptyUsername = '';
        const expectedError = new Error('Username is required');
        jest.spyOn(Api, 'get').mockResolvedValue(null);

        await expect(messageService.getMessages(emptyUsername)).rejects.toStrictEqual(expectedError);

        expect(Api.get).not.toHaveBeenCalled();
    });

    it('error from server response', async () => {
        const expectedError = new Error('Failed to get messages');
        const responseData = { error: expectedError.message };
        const responseStatus = 400;
        const mockedErrorResponse = { response: { status: responseStatus, data: responseData } };
        jest.spyOn(Api, 'get').mockRejectedValue(mockedErrorResponse);

        await expect(messageService.getMessages(username)).rejects.toStrictEqual(expectedError);

        expect(Api.get).toHaveBeenCalledWith(GET_MESSAGES_API + '?username=' + username);
    });
});
