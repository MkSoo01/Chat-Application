import messageService from '../../../src/services/messageService';
import Message, { IMessage } from '../../../src/models/messages';
import User, { IUserInfo } from '../../../src/models/users';
import sinon from 'sinon';
import mongoose from 'mongoose';

beforeEach(() => {
    sinon.restore();
});

afterEach(async () => {
    sinon.verify();
});

describe('Save private message - ', () => {
    const sender = { username: 'senderUsername', contacts: ['otherContact'] };
    const receiver = { username: 'contactUsername', contacts: [sender.username] };
    const message = 'a private message from sender to receiver';
    sender.contacts.push(receiver.username);

    beforeEach(() => {
        jest.spyOn(mongoose.Model, 'create').mockImplementation(async (toCreateMessage) => {
            const { from, to, messageText, createdTime } = toCreateMessage as IMessage;
            expect(from).toBe(sender.username);
            expect(to).toBe(receiver.username);
            expect(messageText).toBe(message);
            expect(createdTime).not.toBeNull();
            return Promise.resolve(true);
        });
    });

    it('success', async () => {
        const userMock = sinon.mock(User);
        userMock.expects('findOne').withArgs({ username: sender.username }).resolves(sender);

        await expect(messageService.saveMessage(sender.username, receiver.username, message)).resolves.toBe(true);
        expect(mongoose.Model.create).toHaveBeenCalled();
    });

    it('fail (wrong sender username', async () => {
        const wrongSenderUsername = 'wrongSenderUsername';
        const userMock = sinon.mock(User);
        userMock.expects('findOne').withArgs({ username: wrongSenderUsername }).resolves(null);
        const expectedError = new Error('Invalid user');

        await expect(messageService.saveMessage(wrongSenderUsername, receiver.username, message)).rejects.toThrow(
            expectedError
        );
        expect(mongoose.Model.create).not.toHaveBeenCalled();
    });

    it('fail (invalid receiver)', async () => {
        const invalidReceiverUsername = 'invalidReceiverUsername';
        const userMock = sinon.mock(User);
        userMock.expects('findOne').withArgs({ username: sender.username }).resolves(sender);
        const expectedError = new Error('Invalid receiver');

        await expect(messageService.saveMessage(sender.username, invalidReceiverUsername, message)).rejects.toThrow(
            expectedError
        );
        expect(mongoose.Model.create).not.toHaveBeenCalled();
    });
});

describe('getMessages', () => {
    const user = 'username';
    const mockedMessage1: IMessage = { from: user, to: 'receiver', messageText: 'message1', createdTime: new Date() };
    const mockedMessage2: IMessage = Object.assign({}, mockedMessage1, { messageText: 'message2' });
    const messages: IMessage[] = [mockedMessage1, mockedMessage2];

    it('success', () => {
        sinon
            .mock(Message)
            .expects('find')
            .withArgs({ $or: [{ from: user }, { to: user }] })
            .resolves(messages);

        return expect(messageService.getMessages(user)).resolves.toBe(messages);
    });

    it('error', () => {
        const expectedError = new Error('ERROR');

        sinon
            .mock(Message)
            .expects('find')
            .withArgs({ $or: [{ from: user }, { to: user }] })
            .rejects(expectedError);

        return expect(messageService.getMessages(user)).rejects.toThrow(expectedError);
    });
});
