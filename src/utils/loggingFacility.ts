import { LogContextKeys, loggingContext } from '../standardisedLogger';

export const prepareForExceptionLogging = (errorCode: string) => {
  if (errorCode) {
    loggingContext.set(LogContextKeys.ERROR_CODE, errorCode);
  }
};
