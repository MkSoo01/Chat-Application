import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

const connect = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const mongooseOpts = {
        minPoolSize: 10,
    };
    await mongoose.connect(uri, mongooseOpts);
};

const closeDatabase = async () => {
    let conn = mongoose.connection;
    if (conn) {
        await conn.db.dropDatabase();
        await conn.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};

const clearDatabase = async () => {
    let conn = mongoose.connection;
    if (conn) {
        const collections = conn.collections;

        for (const key in collections) {
            const collection = collections[key];
            try {
                if (collection) {
                    await collection.drop();
                }
            } catch (err) {
                const t = err;
            }
        }
    }
};

export { connect, closeDatabase, clearDatabase };
