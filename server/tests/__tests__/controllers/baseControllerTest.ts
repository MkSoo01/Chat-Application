import express from 'express';
import jwt from 'jsonwebtoken';
import BaseController from '../../../src/controllers/baseController';
import dotenv from 'dotenv';
dotenv.config;

class TestingBaseController extends BaseController {
    public override authorizeRequest(req: express.Request): Promise<void> {
        return super.authorizeRequest(req);
    }

    public override exec<T extends express.Request>(
        req: T,
        res: express.Response,
        functionToExec: (req: T, res: express.Response) => Promise<void>,
        needAuthorization?: boolean
    ): Promise<void> {
        return super.exec(req, res, functionToExec, needAuthorization);
    }
}

describe('exec', () => {
    const baseControllerInstance = new TestingBaseController();

    describe('no authorization', () => {
        let mReq: any, mRes: any;

        beforeEach(() => {
            mReq = { body: jest.fn() };
            mRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        });

        it('success', async () => {
            jest.spyOn(TestingBaseController.prototype, 'authorizeRequest');
            const mFuncToExec = jest.fn();

            await baseControllerInstance.exec(mReq, mRes, mFuncToExec, false);

            expect(TestingBaseController.prototype.authorizeRequest).not.toHaveBeenCalled();
            expect(mFuncToExec).toHaveBeenCalledWith(mReq, mRes);
        });

        it('error', async () => {
            jest.spyOn(TestingBaseController.prototype, 'authorizeRequest');
            const expectedError = new Error('err');
            const mFuncToExec = jest.fn().mockRejectedValue(expectedError);
            const expectedResponseCode = 400;
            const expectedErrorMessage = { error: expectedError.message };

            await baseControllerInstance.exec(mReq, mRes, mFuncToExec, false);

            expect(TestingBaseController.prototype.authorizeRequest).not.toHaveBeenCalled();
            expect(mFuncToExec).toHaveBeenCalledWith(mReq, mRes);
            expect(mRes.status).toHaveBeenCalledWith(expectedResponseCode);
            expect(mRes.send).toHaveBeenCalledWith(expectedErrorMessage);
        });
    });

    describe('with authorization', () => {
        let mReq: any, mRes: any, mFuncToExec: any;

        beforeEach(() => {
            mReq = { body: jest.fn() };
            mRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            mFuncToExec = jest.fn();
        });

        it('success', async () => {
            jest.spyOn(TestingBaseController.prototype, 'authorizeRequest').mockResolvedValue();

            await baseControllerInstance.exec(mReq, mRes, mFuncToExec, true);

            expect(TestingBaseController.prototype.authorizeRequest).toHaveBeenCalledWith(mReq);
            expect(mFuncToExec).toHaveBeenCalledWith(mReq, mRes);
        });

        it('authorization error', async () => {
            const error = { statusCode: 403, message: 'Permission Denied' };
            const expectedErrorMessage = { error: error.message };
            jest.spyOn(TestingBaseController.prototype, 'authorizeRequest').mockRejectedValue(error);

            await baseControllerInstance.exec(mReq, mRes, mFuncToExec, true);

            expect(TestingBaseController.prototype.authorizeRequest).toHaveBeenCalledWith(mReq);
            expect(mFuncToExec).not.toHaveBeenCalled();
            expect(mRes.status).toHaveBeenCalledWith(error.statusCode);
            expect(mRes.send).toHaveBeenCalledWith(expectedErrorMessage);
        });
    });
});

describe('authorization verification', () => {
    const baseControllerInstance = new TestingBaseController();

    type request = {
        headers: {
            authorization: string;
        };
    };

    it('success', async () => {
        const accessToken = 'token';
        const mReq: request = {
            headers: {
                authorization: 'Bearer ' + accessToken,
            },
        };
        jest.spyOn(jwt, 'verify').mockReturnValue();

        await baseControllerInstance.authorizeRequest(mReq as any);

        expect(jwt.verify).toHaveBeenCalledWith(accessToken, process.env.TOKEN_SECRET, expect.anything());
    });

    it('authorization error (no token)', async () => {
        const mReq: request = {
            headers: {
                authorization: 'Bearer ',
            },
        };
        const expectedError = { statusCode: 401, message: 'Access token Required' };
        let actualError;

        try {
            await baseControllerInstance.authorizeRequest(mReq as any);
        } catch (err) {
            actualError = err;
        }

        expect(actualError).toStrictEqual(expectedError);
    });

    it('authorization error (invalid token)', async () => {
        jest.spyOn(jwt, 'verify').mockImplementation((token, secret, handler: any) => {
            handler(new Error());
        });

        const invalidToken = 'invalidToken';
        const mReq: request = {
            headers: {
                authorization: 'Bearer ' + invalidToken,
            },
        };
        const expectedError = { statusCode: 403, message: 'Permission Denied' };
        let actualError;

        try {
            await baseControllerInstance.authorizeRequest(mReq as any);
        } catch (err) {
            actualError = err;
        }

        expect(jwt.verify).toHaveBeenCalledWith(invalidToken, process.env.TOKEN_SECRET, expect.anything());
        expect(actualError).toStrictEqual(expectedError);
    });
});
