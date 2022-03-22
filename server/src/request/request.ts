import express from 'express';
import { Query } from 'express-serve-static-core';

export interface TypedRequestBody<T> extends express.Request {
    body: T;
}

export interface TypedRequestQuery<T extends Query> extends express.Request {
    query: T;
}

export interface TypedRequest<T extends Query, U> extends express.Request {
    body: U;
    query: T;
}
