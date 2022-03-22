import * as bcrypt from 'bcryptjs';
import User, { IUserInfo } from '../models/users';

const saltRounds = 10;

function registerUser(inUsername: string, inPassword: string, inEmail: string): Promise<IUserInfo> {
    return new Promise<IUserInfo>(async (resolve, reject) => {
        if (inUsername && inPassword) {
            User.findOne({ username: inUsername }).then((existingUser) => {
                if (existingUser) {
                    reject(new Error('The username already exists'));
                    return;
                }

                bcrypt.hash(inPassword, saltRounds).then((hashedPassword) => {
                    return createUser(inUsername, hashedPassword, inEmail, resolve);
                });
            });
        } else {
            reject(new Error('Invalid username or password'));
            return;
        }
    });
}

function createUser(inUsername: string, inPassword: string, inEmail: string, callback: (data: IUserInfo) => void) {
    User.create({
        username: inUsername,
        password: inPassword,
        email: inEmail,
    }).then(async (user) => {
        callback({ username: user.username, email: user.email, contacts: user.contacts });
        return;
    });
}

function login(inUsername: string, inPassword: string): Promise<IUserInfo> {
    return new Promise<IUserInfo>((resolve, reject) => {
        User.findOne({ username: inUsername }).then(async (user) => {
            if (user && (await bcrypt.compare(inPassword, user!.password))) {
                resolve({
                    username: user.username,
                    email: user.email,
                    contacts: user.contacts,
                });
                return;
            } else {
                reject(new Error('Invalid username or password'));
                return;
            }
        });
    });
}

function getUser(inUsername: string): Promise<IUserInfo> {
    return new Promise<IUserInfo>((resolve, reject) => {
        User.findOne({ username: inUsername }).then((user) => {
            if (user) {
                resolve({ username: user.username, email: user?.email, contacts: user.contacts });
                return;
            } else {
                reject(new Error('Invalid user'));
                return;
            }
        });
    });
}

function addContact(inUsername: string, inContactUsername: string): Promise<IUserInfo> {
    return new Promise<IUserInfo>(async (resolve, reject) => {
        const user = await User.findOne({ username: inUsername });
        if (user) {
            const contact = await User.findOne({ username: inContactUsername });
            if (contact) {
                if (user.contacts.includes(contact.username)) {
                    reject(new Error('The contact is already in the contact list'));
                    return;
                }

                const returnUser = await updateContacts(user, contact.username);
                await updateContacts(contact, user.username);
                resolve(returnUser);
                return;
            } else {
                reject(new Error('Invalid contact username'));
                return;
            }
        } else {
            reject(new Error('Invalid user'));
            return;
        }
    });
}

async function updateContacts(user: IUserInfo, newContact: string): Promise<IUserInfo> {
    user.contacts.push(newContact);
    await User.updateOne({ username: user.username }, { contacts: user.contacts });
    return user;
}

export default { registerUser, login, addContact, getUser };
