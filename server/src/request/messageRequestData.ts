import { Query } from 'express-serve-static-core';

export interface getMessagesData extends Query {
    username: string;
}
