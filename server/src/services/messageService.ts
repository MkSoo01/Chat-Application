import Message, { IMessage } from '../models/messages';
import User from '../models/users';

function saveMessage(sender: string, receiver: string, message: string): Promise<boolean> {
    return new Promise<boolean>((resolve, rejects) => {
        User.findOne({ username: sender }).then((user) => {
            if (user && user.contacts.includes(receiver)) {
                return createMessage(sender, receiver, message, resolve);
            } else {
                if (!user) {
                    rejects(new Error('Invalid user'));
                    return;
                }

                rejects(new Error('Invalid receiver'));
                return;
            }
        });
    });
}

function createMessage(sender: string, receiver: string, message: string, callback: (data: boolean) => void) {
    Message.create({ from: sender, to: receiver, messageText: message, createdTime: new Date() }).then(() => {
        callback(true);
        return;
    });
}

function getMessages(user: string): Promise<IMessage[]> {
    return new Promise<IMessage[]>((resolve, rejects) => {
        return Message.find({ $or: [{ from: user }, { to: user }] })
            .then((messages) => resolve(messages))
            .catch((err) => rejects(err));
    });
}

export default { saveMessage, getMessages };
