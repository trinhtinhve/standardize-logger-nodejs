export * from './applicationLog';
export * from './StandardisedLogger';
export * from './constants';
export * from './interceptors';
export * from './types';

import alsWrapper from './alsWrapper';

export const loggingContext = {
    get: alsWrapper.get,
    set: alsWrapper.set,
    append: alsWrapper.append
};
