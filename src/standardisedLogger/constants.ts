export enum Severity {
    CRITICAL = 'CRITICAL',
    ERROR = 'ERROR',
    WARNING = 'WARNING',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
}

export enum LogContextKeys {
    ERROR_CODE = 'errorCode',
    DATA = 'data',
    OWNER_ID = 'ownerId',
    ROOM_ID = 'roomId',
    REQUEST_ID = 'requestId',
    CLIENT_IP = 'clientIp',
    ENV = 'env',
}

export enum Module {
    PVU_GAME_ROOM = 'PVU_GAME_ROOM',
    PVU_SERVERLESS = 'PVU_SERVERLESS',
}
