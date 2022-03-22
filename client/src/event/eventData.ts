export interface ISendPrivateMessageEventData {
    from: string;
    to: string;
    message: string;
}

export interface IGetPrivateMessageEventData {
    from: string;
    to: string;
    message: string;
}

export interface ISetUserSocketData {
    username: string;
}
