import Api from './api';
import { IMessage } from '../models/message';
import { IGetMessagesData } from '../request';
import queryString from 'query-string';
import { GET_MESSAGES_API } from './CONSTANTS';

const getMessages = (inUsername: string): Promise<IMessage[]> => {
    return new Promise<IMessage[]>((resolve, reject) => {
        if (inUsername) {
            const getMessagesData: IGetMessagesData = {
                username: inUsername,
            };
            const query = '?' + queryString.stringify(getMessagesData);
            return Api.get(GET_MESSAGES_API + query)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(new Error(err.response.data.error));
                });
        }

        reject(new Error('Username is required'));
        return;
    });
};

export default { getMessages };
