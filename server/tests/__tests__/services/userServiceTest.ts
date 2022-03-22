import userService from '../../../src/services/userService';
import bcrypt from 'bcryptjs';
import User, { IUserInfo } from '../../../src/models/users';
import sinon from 'sinon';
import mongoose from 'mongoose';

beforeEach(() => {
    sinon.restore();
});

afterEach(async () => {
    sinon.verify();
});

describe('Register user', () => {
    const registerUsername = 'registerUsername';
    const registerPassword = 'registerPassword';
    const registerEmail = 'registerEmail';
    const user = { username: registerUsername, email: registerEmail, contacts: [] };

    beforeEach(() => {
        jest.spyOn(mongoose.Model, 'create').mockImplementation(async (toCreateUser) => {
            const { username, password, email } = toCreateUser as { username: string; password: string; email: string };
            expect(username).toBe(registerUsername);
            expect(await bcrypt.compare(registerPassword, password)).toBe(true);
            expect(email).toBe(registerEmail);
            return Promise.resolve(user);
        });
    });

    it('success', async () => {
        const userMock = sinon.mock(User);
        userMock.expects('findOne').withArgs({ username: registerUsername }).resolves(null);

        await expect(
            userService.registerUser(registerUsername, registerPassword, registerEmail)
        ).resolves.toStrictEqual(user);
        expect(mongoose.Model.create).toHaveBeenCalled();
    });

    it('fail (empty username)', async () => {
        const emptyUsername = '';
        const expectedError = new Error('Invalid username or password');

        await expect(userService.registerUser(emptyUsername, registerPassword, registerEmail)).rejects.toThrow(
            expectedError
        );
        expect(mongoose.Model.create).not.toHaveBeenCalled();
    });

    it('fail (empty password)', async () => {
        const emptyPassword = '';
        const expectedError = new Error('Invalid username or password');

        await expect(userService.registerUser(registerUsername, emptyPassword, registerEmail)).rejects.toThrow(
            expectedError
        );
        expect(mongoose.Model.create).not.toHaveBeenCalled();
    });

    it('fail (existing username)', async () => {
        const existingUsername = 'existingUsername';
        const expectedError = new Error('The username already exists');
        const userMock = sinon.mock(User);
        userMock
            .expects('findOne')
            .withArgs({ username: existingUsername })
            .resolves({ username: existingUsername, password: registerPassword, email: registerEmail });

        await expect(userService.registerUser(existingUsername, registerPassword, registerEmail)).rejects.toThrow(
            expectedError
        );
        expect(mongoose.Model.create).not.toHaveBeenCalled();
    });
});

describe('Login', () => {
    const logInUser = {
        username: 'logInUsername',
        password: 'logInPassword',
        email: 'logInEmail',
        contacts: ['someContacts'],
    };

    beforeEach(async () => {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(logInUser.password, saltRounds);
        const mockedUser = Object.assign({}, logInUser);
        mockedUser.password = hashedPassword;

        const userMock = sinon.mock(User);
        userMock.expects('findOne').withArgs({ username: logInUser.username }).resolves(mockedUser);
    });

    it('success', async () => {
        const { password, ...expectedUser } = logInUser;
        await expect(userService.login(logInUser.username, logInUser.password)).resolves.toStrictEqual(expectedUser);
    });

    it('fail (wrong password)', async () => {
        const expectedError = new Error('Invalid username or password');

        await expect(userService.login(logInUser.username, 'wrongPassword')).rejects.toThrow(expectedError);
    });

    it('fail (wrong username)', async () => {
        sinon.restore();
        const userMock = sinon.mock(User);
        const wrongUsername = 'wrongUsername';
        userMock.expects('findOne').withArgs({ username: wrongUsername }).resolves(null);
        const expectedError = new Error('Invalid username or password');

        await expect(userService.login(wrongUsername, logInUser.password)).rejects.toThrow(expectedError);
    });
});

describe('get User', () => {
    const mockedUser: IUserInfo = {
        username: 'username',
        email: 'Email',
        contacts: ['someContacts'],
    };

    it('success', async () => {
        const userMock = sinon.mock(User);
        userMock.expects('findOne').withArgs({ username: mockedUser.username }).resolves(mockedUser);

        await expect(userService.getUser(mockedUser.username)).resolves.toStrictEqual(mockedUser);
    });

    it('fail (invalid user)', async () => {
        sinon.restore();
        const userMock = sinon.mock(User);
        const invalidUsername = 'invalidUsername';
        userMock.expects('findOne').withArgs({ username: invalidUsername }).resolves(null);
        const expectedError = new Error('Invalid user');

        await expect(userService.getUser(invalidUsername)).rejects.toThrow(expectedError);
    });
});

describe('Add contacts', () => {
    const existingContact = 'existingContact';
    const user: IUserInfo = { username: 'existingUsername', email: 'email', contacts: [existingContact] };
    const newContact: IUserInfo = { username: 'contactUsername', email: 'contactEmail', contacts: [] };

    beforeEach(async () => {
        jest.spyOn(mongoose.Query.prototype, 'findOne').mockImplementation((filter) => {
            const queryUsername = filter && filter!.username;

            if (queryUsername === user.username) {
                return Promise.resolve(user);
            } else if (queryUsername === newContact.username) {
                return Promise.resolve(newContact);
            } else if (queryUsername == existingContact) {
                return Promise.resolve(Object.assign({}, newContact, { username: existingContact }));
            }

            return Promise.resolve(null);
        });

        jest.spyOn(mongoose.Query.prototype, 'updateOne').mockImplementation((filter, toUpdateValues) => {
            const { contacts } = toUpdateValues as { contacts: string[] };
            if (filter!.username === user.username) {
                expect(contacts).toContain(newContact.username);
            } else {
                expect(filter!.username).toBe(newContact.username);
                expect(contacts).toContain(user.username);
            }

            return Promise.resolve(true);
        });
    });

    it('success', async () => {
        const expectedUser = Object.assign({}, user, { contacts: [existingContact, newContact.username] });

        await expect(userService.addContact(expectedUser.username, newContact.username)).resolves.toStrictEqual(
            expectedUser
        );
        expect(mongoose.Query.prototype.findOne).toHaveBeenCalledWith({ username: expectedUser.username }, undefined);
        expect(mongoose.Query.prototype.findOne).toHaveBeenLastCalledWith({ username: newContact.username }, undefined);
        expect(mongoose.Query.prototype.updateOne).toHaveBeenCalledTimes(2);
    });

    it('fail (wrong username)', async () => {
        const expectedError = new Error('Invalid user');
        const wrongUsername = 'wrongUsername';

        await expect(userService.addContact(wrongUsername, newContact.username)).rejects.toThrow(expectedError);
        expect(mongoose.Query.prototype.findOne).toHaveBeenCalledWith({ username: wrongUsername }, undefined);
        expect(mongoose.Query.prototype.updateOne).not.toHaveBeenCalled();
    });

    it('fail (wrong contactUsername)', async () => {
        const expectedError = new Error('Invalid contact username');
        const wrongContactUsername = 'wrongContactUsername';

        await expect(userService.addContact(user.username, wrongContactUsername)).rejects.toThrow(expectedError);
        expect(mongoose.Query.prototype.findOne).toHaveBeenCalledWith({ username: user.username }, undefined);
        expect(mongoose.Query.prototype.findOne).toHaveBeenLastCalledWith(
            { username: wrongContactUsername },
            undefined
        );
        expect(mongoose.Query.prototype.updateOne).not.toHaveBeenCalled();
    });

    it('fail (existing contact)', async () => {
        const expectedError = new Error('The contact is already in the contact list');

        await expect(userService.addContact(user.username, existingContact)).rejects.toThrow(expectedError);

        expect(mongoose.Query.prototype.findOne).toHaveBeenCalledWith({ username: user.username }, undefined);
        expect(mongoose.Query.prototype.findOne).toHaveBeenLastCalledWith({ username: existingContact }, undefined);
        expect(mongoose.Query.prototype.updateOne).not.toHaveBeenCalled();
    });
});
