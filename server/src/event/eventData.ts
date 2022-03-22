export interface sendPrivateMessageEventData {
    from: string;
    to: string;
    message: string;
}

export interface getPrivateMessageEventData {
    from: string;
    to: string;
    message: string;
}

export interface setUserSocketData {
    username: string;
}
