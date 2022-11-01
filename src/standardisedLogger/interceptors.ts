import { v1 as uuid } from 'uuid';
import als from './alsWrapper';
import { LogContextKeys } from './constants';

export const onMessageInterceptor = <T>(ws: any, fn: (message: T) => Promise<void>): (message: T) => Promise<void> => {
    const result = (message: T) => {
        return als.runAndReturn(async () => {
            als.set(LogContextKeys.REQUEST_ID, uuid());
            als.set(LogContextKeys.OWNER_ID, ws?.user?.ownerId);
            als.set(LogContextKeys.ROOM_ID, ws?.room);
            als.set(LogContextKeys.CLIENT_IP, ws?._socket?.remoteAddress);
            als.set(LogContextKeys.ENV, process.env.ENV || 'local');

            return await fn(message);
        });
    };

    return result;
};
