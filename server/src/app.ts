import createError from 'http-errors';
import express, { Application, Handler } from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import { controllers } from './controllers';
import { MetadataKeys } from './utils/metadataKeys';
import { IRouter } from './utils/handlersDecorator';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import socketService from './services/socketService';
import crypto from 'crypto';

class App {
    private readonly _instance: Application;
    get instance(): Application {
        return this._instance;
    }

    constructor() {
        this._instance = express();

        this._instance.use(cors());
        this._instance.use(logger('dev'));
        this._instance.use(express.json());
        this._instance.use(express.urlencoded({ extended: false }));
        this._instance.use(cookieParser());

        this.setupMongoDB();
        const __dirname = path.resolve();
        this._instance.use(express.static(path.join(__dirname, 'public')));

        this.registerRouters();

        this._instance.use(function (req, res, next) {
            next(createError(404));
        });

        this._instance.use(function (err: any, req: any, res: any, next: any) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });
    }

    public setupSocket(httpServer: HTTPServer) {
        const io = new SocketIOServer(httpServer, {
            cors: {
                origin: 'http://localhost:3000',
            },
        });

        socketService.init(io);
    }

    private async setupMongoDB() {
        try {
            await mongoose.connect('mongodb://localhost:27017/chatapp');

            mongoose.connection.on('error', (err) => {
                // console.log('[ERR} Mongoose.connection: ' + err);
            });
        } catch (err) {
            // console.log('[ERR] setupMongoDb: ' + err);
        }
    }

    private registerRouters() {
        const info: Array<{ api: string; handler: string }> = [];
        controllers.forEach((controllerClass) => {
            const controllerInstance: { [handleName: string]: Handler } = new controllerClass() as any;

            const basePath: string = Reflect.getMetadata(MetadataKeys.BASE_PATH, controllerClass);
            const routers: IRouter[] = Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass);

            const expressRouter = express.Router();

            routers.forEach(({ httpMethod, path, handlerName }) => {
                expressRouter[httpMethod](path, controllerInstance[String(handlerName)].bind(controllerInstance));
                info.push({
                    api: `${httpMethod.toLocaleUpperCase()} ${basePath + path}`,
                    handler: `${controllerClass.name}.${String(handlerName)}`,
                });
            });

            this._instance.use(basePath, expressRouter);
        });

        console.table(info);
    }
}

export default new App();
