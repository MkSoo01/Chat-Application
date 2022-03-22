import { MetadataKeys } from './metadataKeys';

export enum HTTPMethods {
    GET = 'get',
    POST = 'post',
}

export interface IRouter {
    httpMethod: HTTPMethods;
    path: string;
    handlerName: string | symbol;
}

const getHandlerDecoratorFactory = (httpMethod: HTTPMethods) => {
    return (path: string): MethodDecorator => {
        return (target, propertyKey) => {
            const controllerClass = target.constructor;
            const routers: IRouter[] = Reflect.hasMetadata(MetadataKeys.ROUTERS, controllerClass)
                ? Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass)
                : [];
            routers.push({
                httpMethod,
                path,
                handlerName: propertyKey,
            });
            Reflect.defineMetadata(MetadataKeys.ROUTERS, routers, controllerClass);
        };
    };
};

export const Get = getHandlerDecoratorFactory(HTTPMethods.GET);
export const Post = getHandlerDecoratorFactory(HTTPMethods.POST);
