import { IUserInfo } from '../../../src/models/users';
import { registerUserData, loginData, addContactData, TypedRequestBody, getUserData } from '../../../src/request';
import userService from '../../../src/services/userService';
import userController from '../../../src/controllers/userController';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config;

describe('register user', () => {
    const registerUsername = 'registerUsername';
    const registerPassword = 'registerPassword';
    const registerEmail = 'registerEmail';
    type UserRequest = {
        body: registerUserData;
    };
    const userControllerInstance = new userController();
    const mockedToken = 'mockedToken';

    beforeEach(() => {
        jwt.sign = jest.fn().mockResolvedValue(mockedToken);
    });

    it('success', async () => {
        const user: IUserInfo = { username: registerUsername, email: registerEmail, contacts: [] };
        jest.spyOn(userService, 'registerUser').mockResolvedValue(user);
        const mReq: UserRequest = {
            body: {
                username: registerUsername,
                password: registerPassword,
                email: registerEmail,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await userControllerInstance.registerUser(mReq as any, mRes);
        expect(userService.registerUser).toBeCalledWith(registerUsername, registerPassword, registerEmail);
        expect(mRes.status).toBeCalledWith(200);
        expect(mRes.send).toBeCalledWith({ ...user, token: mockedToken });
    });

    it('error', async () => {
        const invalidUsername = '';
        const expectedError = new Error('Invalid username or password');
        const expectedResponse = { error: expectedError.message };

        jest.spyOn(userService, 'registerUser').mockRejectedValue(expectedError);
        const mReq: UserRequest = {
            body: {
                username: invalidUsername,
                password: registerPassword,
                email: registerEmail,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await userControllerInstance.registerUser(mReq as any, mRes);
        expect(userService.registerUser).toBeCalledWith(invalidUsername, registerPassword, registerEmail);
        expect(mRes.status).toBeCalledWith(400);
        expect(mRes.send).toBeCalledWith(expectedResponse);
    });
});

describe('login', () => {
    const loginUsername = 'loginUsername';
    const loginPassword = 'loginPassword';
    const email = 'email';
    type UserRequest = {
        body: loginData;
    };
    const userControllerInstance = new userController();
    const mockedToken = 'mockedToken';

    beforeEach(() => {
        jwt.sign = jest.fn().mockResolvedValue(mockedToken);
    });

    it('success', async () => {
        const user: IUserInfo = { username: loginUsername, email: email, contacts: [] };
        jest.spyOn(userService, 'login').mockResolvedValue(user);
        const mReq: UserRequest = {
            body: {
                username: loginUsername,
                password: loginPassword,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await userControllerInstance.login(mReq as any, mRes);
        expect(userService.login).toBeCalledWith(loginUsername, loginPassword);
        expect(mRes.status).toBeCalledWith(200);
        expect(mRes.send).toBeCalledWith({ ...user, token: mockedToken });
    });

    it('error', async () => {
        const invalidPassword = 'invalidPassword';
        const expectedError = new Error('Invalid username or password');
        const expectedResponse = { error: expectedError.message };

        jest.spyOn(userService, 'login').mockRejectedValue(expectedError);
        const mReq: UserRequest = {
            body: {
                username: loginUsername,
                password: invalidPassword,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await userControllerInstance.login(mReq as any, mRes);
        expect(userService.login).toHaveBeenCalledWith(loginUsername, invalidPassword);
        expect(mRes.status).toHaveBeenCalledWith(400);
        expect(mRes.send).toHaveBeenCalledWith(expectedResponse);
        expect(jwt.sign).not.toHaveBeenCalled();
    });
});

describe('get user', () => {
    const expectedUser: IUserInfo = {
        username: 'Username',
        email: 'Email',
        contacts: ['someContacts'],
    };
    type UserRequest = {
        headers: {
            authorization: string;
        };
        query: getUserData;
    };
    const accessToken = 'token';
    const authorizationHeader = {
        headers: {
            authorization: 'Bearer ' + accessToken,
        },
    };
    const userControllerInstance = new userController();

    beforeEach(() => {
        jest.spyOn(jwt, 'verify').mockReturnValue();
    });

    it('success', async () => {
        jest.spyOn(userService, 'getUser').mockResolvedValue(expectedUser);
        const mReq: UserRequest = {
            ...authorizationHeader,
            query: {
                username: expectedUser.username,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await userControllerInstance.getUser(mReq as any, mRes);

        expect(userService.getUser).toBeCalledWith(expectedUser.username);
        expect(mRes.status).toBeCalledWith(200);
        expect(mRes.send).toBeCalledWith(expectedUser);
    });

    it('error', async () => {
        const invalidUsername = '';
        const expectedError = new Error('Invalid user');
        const expectedResponse = { error: expectedError.message };

        jest.spyOn(userService, 'getUser').mockRejectedValue(expectedError);
        const mReq: UserRequest = {
            ...authorizationHeader,
            query: {
                username: invalidUsername,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await userControllerInstance.getUser(mReq as any, mRes);
        expect(userService.getUser).toBeCalledWith(invalidUsername);
        expect(mRes.status).toBeCalledWith(400);
        expect(mRes.send).toBeCalledWith(expectedResponse);
    });
});

describe('add contact', () => {
    const user = 'username';
    const newContact = 'contactUsername';
    type UserRequest = {
        headers: {
            authorization: string;
        };
        body: addContactData;
    };
    const accessToken = 'token';
    const authorizationHeader = {
        headers: {
            authorization: 'Bearer ' + accessToken,
        },
    };
    const userControllerInstance = new userController();

    beforeEach(() => {
        jest.spyOn(jwt, 'verify').mockReturnValue();
    });

    it('success', async () => {
        const userEmail = 'userEmail';
        const expectedUser: IUserInfo = { username: user, email: userEmail, contacts: [newContact] };
        jest.spyOn(userService, 'addContact').mockResolvedValue(expectedUser);
        const mReq: UserRequest = {
            ...authorizationHeader,
            body: {
                user: user,
                newContact: newContact,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await userControllerInstance.addContact(mReq as any, mRes);
        expect(userService.addContact).toBeCalledWith(user, newContact);
        expect(mRes.status).toBeCalledWith(200);
        expect(mRes.send).toBeCalledWith(expectedUser);
    });

    it('error', async () => {
        const invalidUsername = '';
        const expectedError = new Error('Invalid user');
        const expectedResponse = { error: expectedError.message };

        jest.spyOn(userService, 'addContact').mockRejectedValue(expectedError);
        const mReq: UserRequest = {
            ...authorizationHeader,
            body: {
                user: invalidUsername,
                newContact: newContact,
            },
        };
        const mRes: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await userControllerInstance.addContact(mReq as any, mRes);
        expect(userService.addContact).toBeCalledWith(invalidUsername, newContact);
        expect(mRes.status).toBeCalledWith(400);
        expect(mRes.send).toBeCalledWith(expectedResponse);
    });
});
