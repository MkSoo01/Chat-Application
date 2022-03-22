export interface IRegisterUserData {
    username: string;
    password: string;
    email: string;
}

export interface ILoginData {
    username: string;
    password: string;
}

export interface IAddContactData {
    user: string;
    newContact: string;
}

export interface IGetUserData {
    username: string;
}
