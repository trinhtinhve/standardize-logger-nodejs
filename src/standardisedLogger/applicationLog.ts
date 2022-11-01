import { Module, Severity } from './constants';
import { RawData, Data } from './types';

export class ApplicationLog {
    message: string;
    ownerId: string;
    roomId: string;
    module: Module;
    requestId: string;
    errorCode: string;
    trace: string;
    data: Data;
    rawData: RawData;
    clientIp: string;
    severity: Severity;
    env: string;
    createdTimestamp: string;

    public buildLogObject() {
        const standardisedLog = {
            'message': this.message,
            'owner_id': this.ownerId,
            'room_id': this.roomId,
            'module': this.module,
            'request_id': this.requestId,
            'error_code': this.errorCode,
            'trace': this.trace,
            'data': this.data,
            'raw_data': JSON.stringify(this.rawData),
            'client_ip': this.clientIp,
            'severity': this.severity,
            'env': this.env,
            'created_timestamp': this.createdTimestamp,

        } as any;

        return standardisedLog;
    }
}
