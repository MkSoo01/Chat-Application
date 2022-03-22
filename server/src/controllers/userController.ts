import express from 'express';
import userService from '../services/userService';
import {
    TypedRequestBody,
    registerUserData,
    loginData,
    addContactData,
    TypedRequestQuery,
    getUserData,
} from '../request';
import Controller from '../utils/controllerDecorator';
import { Get, Post } from '../utils/handlersDecorator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import BaseController from './baseController';
dotenv.config();

@Controller('/users')
export default class UserController extends BaseController {
    @Post('/register')
    public async registerUser(req: TypedRequestBody<registerUserData>, res: express.Response): Promise<void> {
        await this.exec(req, res, this.tryRegisterUser.bind(this), false);
    }

    private async tryRegisterUser(req: TypedRequestBody<registerUserData>, res: express.Response) {
        const user = await userService.registerUser(req.body.username, req.body.password, req.body.email);
        const accessToken = await this.generateAccessToken(req.body.username);
        res.status(200).send({ token: accessToken, ...user });
    }

    @Post('/login')
    public async login(req: TypedRequestBody<loginData>, res: express.Response): Promise<void> {
        await this.exec(req, res, this.tryLogin.bind(this), false);
    }

    public async tryLogin(req: TypedRequestBody<loginData>, res: express.Response) {
        const user = await userService.login(req.body.username, req.body.password);
        const accessToken = await this.generateAccessToken(req.body.username);
        res.status(200).send({ token: accessToken, ...user });
    }

    @Get('')
    public async getUser(req: TypedRequestQuery<getUserData>, res: express.Response): Promise<void> {
        await this.exec(req, res, this.tryGetUser);
    }

    public async tryGetUser(req: TypedRequestQuery<getUserData>, res: express.Response) {
        const user = await userService.getUser(req.query.username);
        res.status(200).send(user);
    }

    @Post('/addContact')
    public async addContact(req: TypedRequestBody<addContactData>, res: express.Response): Promise<void> {
        await this.exec(req, res, this.tryAddContact);
    }

    private async tryAddContact(req: TypedRequestBody<addContactData>, res: express.Response) {
        const user = await userService.addContact(req.body.user, req.body.newContact);
        res.status(200).send(user);
    }

    private async generateAccessToken(username: string): Promise<any> {
        const secret: any = process.env.TOKEN_SECRET;
        return jwt.sign(username, secret);
    }
}
