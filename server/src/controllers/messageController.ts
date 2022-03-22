import express from 'express';
import { getMessagesData, TypedRequestBody, TypedRequestQuery } from '../request';
import messageService from '../services/messageService';
import Controller from '../utils/controllerDecorator';
import { Get } from '../utils/handlersDecorator';
import BaseController from './baseController';

@Controller('/messages')
export default class MessageController extends BaseController {
    @Get('')
    public async getMessages(req: TypedRequestQuery<getMessagesData>, res: express.Response): Promise<void> {
        await this.exec(req, res, this.tryGetMessages);
    }

    private async tryGetMessages(req: TypedRequestQuery<getMessagesData>, res: express.Response) {
        const messages = await messageService.getMessages(req.query.username);
        res.status(200).send(messages);
    }
}
