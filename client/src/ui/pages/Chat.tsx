import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useEffect, useRef } from 'react';
import { ChatAppBar } from '../components/chat/ChatAppBar';
import { UserInfoPanel } from '../components/chat/UserInfoPanel';
import Messages from '../components/chat/Messages';
import TypingMessage from '../components/chat/TypingMessage';
import ChattingArea from '../components/chat/ChattingArea';
import Contacts from '../components/chat/Contacts';
import Account from '../components/chat/Account';
import { IMessage } from '../../models/message';
import { useLocation, useNavigate } from 'react-router-dom';
import { IUserInfo } from '../../models/user';
import userService from '../../services/userService';
import { FORM_ERROR } from 'final-form';
import messageService from '../../services/messageService';
import { USERNAME } from '../../services/CONSTANTS';
import socketService from '../../services/socketService';

interface Props {
    window?: () => Window;
}

function getInitialUser(): IUserInfo {
    const location = useLocation();
    return location.state ? (location.state as IUserInfo) : { username: '', email: '', contacts: [] };
}

function getInitialSelectedContacts(user: IUserInfo): string {
    return user && user.contacts && user.contacts.length ? user.contacts[0] : '';
}

function filterMessagesBySelectedContact(messages: IMessage[], selectedContact: string): IMessage[] {
    return messages ? messages.filter((msg) => msg.from === selectedContact || msg.to === selectedContact) : [];
}

export default function Chat(props: Props) {
    const navigate = useNavigate();
    const { window } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [user, setUser] = React.useState(getInitialUser());
    const [selectedContact, setSelectedContact] = React.useState(getInitialSelectedContacts(user));
    const [messages, setMessages] = React.useState([] as IMessage[]);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    });

    useEffect(() => {
        (async () => {
            try {
                const username: any = localStorage.getItem(USERNAME);
                const getUser = await userService.getUser(username);
                if (getUser) {
                    setUser(getUser);
                    setSelectedContact(getInitialSelectedContacts(getUser));
                    socketService.setupSocketClient(getUser.username);
                    socketService.setupGetPrivateMessageEvent(setMessages);
                }

                const msg = await messageService.getMessages(username);
                if (msg) {
                    setMessages(msg);
                }
            } catch (err: any) {
                // console.log(err!.message);
            }
        })();
    }, []);

    const logoutHandler = () => {
        localStorage.clear();
        navigate('/Login', { replace: true });
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const addContactCallback = (newContact: string) => {
        return userService
            .addContact(user.username, newContact)
            .then((user) => {
                setUser(user);
                return;
            })
            .catch((err) => {
                if (err instanceof Error) {
                    return { [FORM_ERROR]: err.message };
                }
            });
    };

    const sendMessageCallback = (message: string) => {
        setMessages((messages) => [
            ...messages,
            { from: user.username, to: selectedContact, messageText: message, createdTime: new Date() },
        ]);
        socketService.sendPrivateMessage({
            from: user.username,
            to: selectedContact,
            message: message,
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <ChatAppBar title="chat App" handleDrawerToggle={handleDrawerToggle} logoutHandler={logoutHandler} />
            <UserInfoPanel window={window} handleDrawerToggle={handleDrawerToggle} mobileOpen={mobileOpen}>
                <Account username={user.username} email={user.email} />
                <Divider />
                <Contacts
                    contacts={user.contacts}
                    selectContactCallback={(selectedContact: string) => setSelectedContact(selectedContact)}
                    addContactCallback={addContactCallback}
                />
            </UserInfoPanel>
            <ChattingArea>
                <Messages
                    username={user.username}
                    messagesEndRef={messagesEndRef}
                    messages={filterMessagesBySelectedContact(messages, selectedContact)}
                />
                <Divider />
                <TypingMessage sendMessageCallback={sendMessageCallback} />
            </ChattingArea>
        </Box>
    );
}
