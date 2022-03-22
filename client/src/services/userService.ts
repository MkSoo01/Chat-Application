import Api from './api';
import { IUserInfo } from '../models/user';
import { IAddContactData, IGetUserData, ILoginData, IRegisterUserData } from '../request';
import { ACCESS_TOKEN, ADD_CONTACT_API, GET_USER_API, LOGIN_API, REGISTER_API, USERNAME } from './CONSTANTS';
import queryString from 'query-string';

const registerUser = (inUsername: string, inPassword: string, inEmail: string): Promise<IUserInfo> => {
    return new Promise<IUserInfo>(async (resolve, reject) => {
        if (inUsername && inPassword) {
            const userToRegister: IRegisterUserData = {
                username: inUsername,
                password: inPassword,
                email: inEmail,
            };
            return Api.post(REGISTER_API, userToRegister)
                .then((res) => {
                    if (res.data.token && res.data.username) {
                        localStorage.setItem(ACCESS_TOKEN, res.data.token);
                        localStorage.setItem(USERNAME, res.data.username);
                    }

                    resolve(res.data);
                })
                .catch((err) => {
                    reject(new Error(err.response.data.error));
                });
        }

        reject(new Error('Invalid username or password'));
        return;
    });
};

const login = (inUsername: string, inPassword: string): Promise<IUserInfo> => {
    return new Promise<IUserInfo>(async (resolve, reject) => {
        if (inUsername && inPassword) {
            const userToLogin: ILoginData = {
                username: inUsername,
                password: inPassword,
            };
            return Api.post(LOGIN_API, userToLogin)
                .then((res) => {
                    if (res.data.token && res.data.username) {
                        localStorage.setItem(ACCESS_TOKEN, res.data.token);
                        localStorage.setItem(USERNAME, res.data.username);
                    }

                    resolve(res.data);
                })
                .catch((err) => {
                    reject(new Error(err.response.data.error));
                });
        }

        reject(new Error('Invalid username or password'));
        return;
    });
};

const getUser = (inUsername: string): Promise<IUserInfo> => {
    return new Promise<IUserInfo>(async (resolve, reject) => {
        if (inUsername) {
            const getUserData: IGetUserData = { username: inUsername };
            const query = '?' + queryString.stringify(getUserData);
            return Api.get(GET_USER_API + query)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(new Error(err.response.data.error));
                });
        }

        reject(new Error('Invalid username'));
    });
};

const addContact = (inUsername: string, inNewContact: string): Promise<IUserInfo> => {
    return new Promise<IUserInfo>(async (resolve, reject) => {
        if (inUsername && inNewContact) {
            const addContactData: IAddContactData = {
                user: inUsername,
                newContact: inNewContact,
            };
            return Api.post(ADD_CONTACT_API, addContactData)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(new Error(err.response.data.error));
                });
        }

        if (inUsername) {
            reject(new Error('Invalid contact'));
            return;
        }

        reject(new Error('Invalid user'));
        return;
    });
};

export default { registerUser, login, addContact, getUser };
