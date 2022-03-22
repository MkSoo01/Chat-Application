import { Schema, model } from 'mongoose';

export interface IUserInfo {
    username: string;
    email: string;
    contacts: string[];
}

interface IUser extends IUserInfo {
    password: string;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        trim: true,
        unique: true,
        index: true,
    },
    password: String,
    email: {
        type: String,
        trim: true,
    },
    contacts: [
        {
            type: String,
        },
    ],
});

const User = model<IUser>('User', UserSchema);

export default User;
