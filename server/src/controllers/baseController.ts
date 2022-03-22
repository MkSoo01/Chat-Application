import express from 'express';
import jwt from 'jsonwebtoken';

export default class BaseController {
    protected async exec<T extends express.Request>(
        req: T,
        res: express.Response,
        functionToExec: (req: T, res: express.Response) => Promise<void>,
        needAuthorization: boolean = true
    ): Promise<void> {
        try {
            if (needAuthorization) {
                await this.authorizeRequest(req);
            }

            await functionToExec(req, res);
        } catch (err: any) {
            if (err instanceof Error) {
                res.status(400).send({ error: err.message });
            } else if (err.statusCode && err.message) {
                res.status(err.statusCode).send({ error: err.message });
            }
        }
    }

    protected async authorizeRequest(req: express.Request) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
                if (err) {
                    throw { statusCode: 403, message: 'Permission Denied' };
                }
            });
        } else {
            throw { statusCode: 401, message: 'Access token Required' };
        }
    }
}
