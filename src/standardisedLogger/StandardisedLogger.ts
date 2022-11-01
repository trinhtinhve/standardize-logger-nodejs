import { merge } from 'lodash';
import { LogContextKeys, Module, Severity } from './constants';
import { ApplicationLog } from './applicationLog';
import { RawData, RawDataItem } from './types';
import als from './alsWrapper';

export interface AddLogToDB {
    (applicationLog: ApplicationLog): Promise<void>;
}

export interface LoggerInteface {
    error(message: string, anyData: any): void;
    warn(message: string, anyData: any): void;
    info(message: string, anyData: any): void;
    debug(message: string, anyData: any): void;
}

export interface IStandardisedLogger {
    error(message: string, error?: Error, ...rawDataItems: RawDataItem[]): IStandardisedLogger;
    error(message: string, rawDataItem?: RawDataItem, ...rawDataItems: RawDataItem[]): IStandardisedLogger;
    warn(message: string, rawDataItem?: RawDataItem, ...rawDataItems: RawDataItem[]): IStandardisedLogger;
    warn(message: string, error?: Error, ...rawDataItems: RawDataItem[]): IStandardisedLogger;
    info(message: string, rawDataItem?: RawDataItem, ...rawDataItems: RawDataItem[]): IStandardisedLogger;
    info(message: string, error?: Error, ...rawDataItems: RawDataItem[]): IStandardisedLogger;
    debug(message: string, rawDataItem?: RawDataItem, ...rawDataItems: RawDataItem[]): IStandardisedLogger;
    debug(message: string, error?: Error, ...rawDataItems: RawDataItem[]): IStandardisedLogger;
}

export class StandardisedLogger implements IStandardisedLogger {
    private module: Module;
    private loggerInterface: LoggerInteface;
    private addLogToDB: AddLogToDB;

    constructor(module: Module, loggerInferface: LoggerInteface, addLogToDB?: AddLogToDB) {
        this.module = module;
        this.loggerInterface = loggerInferface;
        this.addLogToDB = addLogToDB;
    }

    public setAddLogToDB(addLogDB: AddLogToDB) {
        this.addLogToDB = addLogDB;
    }

    private formmatMessage(message: string, errorMessage: string): string {
        let result = '';

        if (message) {
            if (typeof message === 'object') {
                message = JSON.stringify(message);
            }

            result += message;
        }

        if (errorMessage) {
            if (result) {
                result += ' - ' + errorMessage;
            } else {
                result = errorMessage;
            }
        }

        return result;
    }

    private processRawDataItems(
        errorOrRawDataItem: Error | RawDataItem | undefined | null,
        rawDataItems: RawDataItem[]
    ): { errorMessage: string; stack: string; rawData: RawData } {

        let errorMessage: string = '';
        let stack: string = '';
        let rawData: RawData = {};

        if (errorOrRawDataItem !== undefined && errorOrRawDataItem !== null) {

            if (errorOrRawDataItem instanceof Error) {
                errorMessage = errorOrRawDataItem.message;
                stack = errorOrRawDataItem.stack || '';
            } else if (typeof errorOrRawDataItem === 'object') {
                rawData = { ...errorOrRawDataItem };
            }
        }
        
        rawData = merge(rawData, ...rawDataItems);

        return {
            errorMessage,
            stack,
            rawData
        };
    }

    private buildApplicationLog(severity: Severity, message: string, processingData: { errorMessage: string; stack: string; rawData: RawData }): ApplicationLog {
        const applicationLog = new ApplicationLog();

        applicationLog.message = this.formmatMessage(message, processingData.errorMessage);
        applicationLog.ownerId = als.get(LogContextKeys.OWNER_ID) || '';
        applicationLog.roomId = als.get(LogContextKeys.ROOM_ID) || '';
        applicationLog.module = this.module;
        applicationLog.requestId = als.get(LogContextKeys.REQUEST_ID) || '';
        applicationLog.errorCode = als.get(LogContextKeys.ERROR_CODE) || '';        
        applicationLog.trace = processingData.stack;
        applicationLog.data = als.get(LogContextKeys.DATA) || {};
        applicationLog.rawData = processingData.rawData;
        applicationLog.clientIp = als.get(LogContextKeys.CLIENT_IP) || '';
        applicationLog.severity = severity;
        applicationLog.env = als.get(LogContextKeys.ENV) || '';
        applicationLog.createdTimestamp = new Date().toISOString();
        
        return applicationLog;
    }

    private log(
        doLog: (message: string, anyData: any) => void,
        severity: Severity,
        message: string,
        errorOrRawDataItem: Error | RawDataItem | undefined | null,
        rawDataItems: RawDataItem[]
    ): void {
        
        const processingData = this.processRawDataItems(errorOrRawDataItem, rawDataItems);
        const applicationLog = this.buildApplicationLog(severity, message, processingData);

        const logObject = applicationLog.buildLogObject();
        doLog(applicationLog.message, logObject);

        if (this.addLogToDB) {
            this.addLogToDB(applicationLog);
        }
    }

    public error(message: string, errorOrRawDataItem?: Error | RawDataItem, ...rawDataItems: RawDataItem[]): StandardisedLogger {
        this.log(this.loggerInterface.error.bind(this.loggerInterface), Severity.ERROR, message, errorOrRawDataItem, rawDataItems);
        return this;
    }

    public warn(message: string, errorOrRawDataItem?: Error | RawDataItem, ...rawDataItems: RawDataItem[]): StandardisedLogger {
        this.log(this.loggerInterface.warn.bind(this.loggerInterface), Severity.WARNING, message, errorOrRawDataItem, rawDataItems);
        return this;
    }

    public info(message: string, errorOrRawDataItem?: Error | RawDataItem, ...rawDataItems: RawDataItem[]): StandardisedLogger {
        this.log(this.loggerInterface.info.bind(this.loggerInterface), Severity.INFO, message, errorOrRawDataItem, rawDataItems);
        return this;
    }

    public debug(message: string, errorOrRawDataItem?: Error | RawDataItem, ...rawDataItems: RawDataItem[]): StandardisedLogger {
        this.log(this.loggerInterface.debug.bind(this.loggerInterface), Severity.DEBUG, message, errorOrRawDataItem, rawDataItems);
        return this;
    }
}
