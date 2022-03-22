import { Query } from 'express-serve-static-core';

export interface registerUserData {
    username: string;
    password: string;
    email: string;
}

export interface loginData {
    username: string;
    password: string;
}

export interface addContactData {
    user: string;
    newContact: string;
}

export interface getUserData extends Query {
    username: string;
}
