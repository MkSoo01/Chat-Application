import userService from '../../src/services/userService';
import Api from '../../src/services/api';
import { IUserInfo } from '../../src/models/user';
import { IGetUserData, ILoginData, IRegisterUserData } from '../../src/request';
import {
    ACCESS_TOKEN,
    GET_USER_API,
    USERNAME,
    REGISTER_API,
    LOGIN_API,
    ADD_CONTACT_API,
} from '../../src/services/CONSTANTS';

const localStorageMock: any = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
};

global.localStorage = localStorageMock;

describe('register user', () => {
    const registerUser: IRegisterUserData = {
        username: 'registerUsername',
        password: 'registerPassword',
        email: 'registerEmail',
    };
    const accessToken = 'accessToken';

    it('success', async () => {
        const mockedUser: IUserInfo = { username: registerUser.username, email: registerUser.email, contacts: [] };
        const responseData = { ...mockedUser, token: accessToken };
        const responseStatus = 200;
        const mockedResponse = { status: responseStatus, data: responseData };
        jest.spyOn(Api, 'post').mockResolvedValue(mockedResponse);

        await expect(
            userService.registerUser(registerUser.username, registerUser.password, registerUser.email)
        ).resolves.toBe(responseData);

        expect(Api.post).toHaveBeenCalledWith(REGISTER_API, registerUser);
        expect(localStorage.setItem).toHaveBeenCalledWith(ACCESS_TOKEN, accessToken);
        expect(localStorage.setItem).toHaveBeenNthCalledWith(2, USERNAME, registerUser.username);
    });

    it('error (empty username)', async () => {
        const emptyUsername = '';
        const expectedError = new Error('Invalid username or password');
        jest.spyOn(Api, 'post').mockResolvedValue(null);

        await expect(
            userService.registerUser(emptyUsername, registerUser.password, registerUser.email)
        ).rejects.toStrictEqual(expectedError);

        expect(Api.post).not.toHaveBeenCalled();
    });

    it('error (empty password)', async () => {
        const emptyPassword = '';
        const expectedError = new Error('Invalid username or password');
        jest.spyOn(Api, 'post').mockResolvedValue(null);

        await expect(
            userService.registerUser(registerUser.username, emptyPassword, registerUser.email)
        ).rejects.toStrictEqual(expectedError);

        expect(Api.post).not.toHaveBeenCalled();
    });

    it('error from server response', async () => {
        const expectedError = new Error('Failed to create user');
        const responseData = { error: expectedError.message };
        const responseStatus = 400;
        const mockedErrorResponse = { response: { status: responseStatus, data: responseData } };
        jest.spyOn(Api, 'post').mockRejectedValue(mockedErrorResponse);

        await expect(
            userService.registerUser(registerUser.username, registerUser.password, registerUser.email)
        ).rejects.toStrictEqual(expectedError);

        expect(Api.post).toHaveBeenCalledWith(REGISTER_API, registerUser);
    });
});

describe('login', () => {
    const loginUser: ILoginData = {
        username: 'loginUsername',
        password: 'loginPassword',
    };
    const userEmail = 'loginUserEmail';
    const accessToken = 'accessToken';

    it('success', async () => {
        const mockedUser: IUserInfo = { username: loginUser.username, email: userEmail, contacts: [] };
        const responseData = { ...mockedUser, token: accessToken };
        const responseStatus = 200;
        const mockedResponse = { status: responseStatus, data: responseData };
        jest.spyOn(Api, 'post').mockResolvedValue(mockedResponse);

        await expect(userService.login(loginUser.username, loginUser.password)).resolves.toBe(responseData);

        expect(Api.post).toHaveBeenCalledWith(LOGIN_API, loginUser);
        expect(localStorage.setItem).toHaveBeenCalledWith(ACCESS_TOKEN, accessToken);
        expect(localStorage.setItem).toHaveBeenNthCalledWith(2, USERNAME, loginUser.username);
    });

    it('error (empty username)', async () => {
        const emptyUsername = '';
        const expectedError = new Error('Invalid username or password');
        jest.spyOn(Api, 'post').mockResolvedValue(null);

        await expect(userService.login(emptyUsername, loginUser.password)).rejects.toStrictEqual(expectedError);

        expect(Api.post).not.toHaveBeenCalled();
    });

    it('error (empty password)', async () => {
        const emptyPassword = '';
        const expectedError = new Error('Invalid username or password');
        jest.spyOn(Api, 'post').mockResolvedValue(null);

        await expect(userService.login(loginUser.username, emptyPassword)).rejects.toStrictEqual(expectedError);

        expect(Api.post).not.toHaveBeenCalled();
    });

    it('error from server response', async () => {
        const expectedError = new Error('Failed to login user');
        const responseData = { error: expectedError.message };
        const responseStatus = 400;
        const mockedErrorResponse = { response: { status: responseStatus, data: responseData } };
        jest.spyOn(Api, 'post').mockRejectedValue(mockedErrorResponse);

        await expect(userService.login(loginUser.username, loginUser.password)).rejects.toStrictEqual(expectedError);

        expect(Api.post).toHaveBeenCalledWith(LOGIN_API, loginUser);
    });
});

describe('get user', () => {
    const getUserData: IGetUserData = { username: 'username' };

    it('success', async () => {
        const mockedUser: IUserInfo = { username: getUserData.username, email: 'userEmail', contacts: [] };
        const responseStatus = 200;
        const mockedResponse = { status: responseStatus, data: mockedUser };
        jest.spyOn(Api, 'get').mockResolvedValue(mockedResponse);

        await expect(userService.getUser(getUserData.username)).resolves.toBe(mockedUser);

        expect(Api.get).toHaveBeenCalledWith(GET_USER_API + '?username=' + getUserData.username);
    });

    it('error (empty username)', async () => {
        const emptyUsername = '';
        const expectedError = new Error('Invalid username');
        jest.spyOn(Api, 'get').mockResolvedValue(null);

        await expect(userService.getUser(emptyUsername)).rejects.toStrictEqual(expectedError);

        expect(Api.get).not.toHaveBeenCalled();
    });

    it('error from server response', async () => {
        const expectedError = new Error('Failed to login user');
        const responseData = { error: expectedError.message };
        const responseStatus = 400;
        const mockedErrorResponse = { response: { status: responseStatus, data: responseData } };
        jest.spyOn(Api, 'get').mockRejectedValue(mockedErrorResponse);

        await expect(userService.getUser(getUserData.username)).rejects.toStrictEqual(expectedError);

        expect(Api.get).toHaveBeenCalledWith(GET_USER_API + '?username=' + getUserData.username);
    });
});

describe('add contact', () => {
    const user = { username: 'username', email: 'userEmail' };
    const newContact = 'contactUsername';

    it('success', async () => {
        const addContactData = { user: user.username, newContact: newContact };
        const mockedUser: IUserInfo = { username: user.username, email: user.email, contacts: [newContact] };
        const responseStatus = 200;
        const mockedResponse = { status: responseStatus, data: mockedUser };
        jest.spyOn(Api, 'post').mockResolvedValue(mockedResponse);

        await expect(userService.addContact(user.username, newContact)).resolves.toBe(mockedUser);

        expect(Api.post).toHaveBeenCalledWith(ADD_CONTACT_API, addContactData);
    });

    it('error (invalid username)', async () => {
        const invalidUsername = '';
        const expectedError = new Error('Invalid user');
        jest.spyOn(Api, 'post').mockResolvedValue(null);

        await expect(userService.addContact(invalidUsername, newContact)).rejects.toStrictEqual(expectedError);

        expect(Api.post).not.toHaveBeenCalled();
    });

    it('error (invalid contact)', async () => {
        const invalidContact = '';
        const expectedError = new Error('Invalid contact');
        jest.spyOn(Api, 'post').mockResolvedValue(null);

        await expect(userService.addContact(user.username, invalidContact)).rejects.toStrictEqual(expectedError);

        expect(Api.post).not.toHaveBeenCalled();
    });

    it('error from server response', async () => {
        const addContactData = { user: user.username, newContact: newContact };
        const expectedError = new Error('Failed to add new contact');
        const responseData = { error: expectedError.message };
        const responseStatus = 400;
        const mockedErrorResponse = { response: { status: responseStatus, data: responseData } };
        jest.spyOn(Api, 'post').mockRejectedValue(mockedErrorResponse);

        await expect(userService.addContact(user.username, newContact)).rejects.toStrictEqual(expectedError);

        expect(Api.post).toHaveBeenCalledWith(ADD_CONTACT_API, addContactData);
    });
});
