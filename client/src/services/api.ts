import axios from 'axios';
import { ACCESS_TOKEN } from './CONSTANTS';

const client = axios.create({
    baseURL: 'http://localhost:5000',
});

client.interceptors.request.use(function (config: any) {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

client.interceptors.response.use(
    (response) => response,
    (err) => {
        const { status } = err.response;

        switch (status) {
            case 403:
                localStorage.removeItem(ACCESS_TOKEN);
                break;
            default:
                break;
        }

        return Promise.reject(err);
    }
);

export default client;
