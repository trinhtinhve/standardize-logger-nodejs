import { AsyncLocalStorage } from 'async_hooks';
import { merge } from 'lodash';
import { LogContextKeys } from './constants';

const asyncLocalStorage = new AsyncLocalStorage<Map<LogContextKeys, any>>();

const get = <T>(key: LogContextKeys): T => {
    return asyncLocalStorage.getStore()?.get(key);
};

const set = (key: LogContextKeys, value: any): any => {
    return asyncLocalStorage.getStore()?.set(key, value);
};

const append = (key: LogContextKeys, value: string | object): void => {
    const store = asyncLocalStorage.getStore();
    if (!store) {
        return;
    }

    const oldValue = store.get(key);

    if (typeof oldValue === 'string') {
        store.set(key, `${oldValue}, ${value}`);
    }
    
    if (typeof oldValue === 'object') {
        store.set(key, merge(oldValue, value));
    }
};

const runAndReturn = <T>(callback: () => T): T => {
    return asyncLocalStorage.run(new Map(), callback);
};

export default {
    get,
    set,
    append,
    runAndReturn
};
