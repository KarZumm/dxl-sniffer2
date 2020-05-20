const winston = require('winston')

const { createLogger, format } = winston
const { timestamp, combine, colorize, printf } = format

function logObject(options) {

// { appName: }

    const myFormat = printf(({ level, message, timestamp }) => {
        return `${timestamp} => ${level}: ${message}`;
    });
    
    return logger = createLogger({
        level: 'silly',
        defaultMeta: { options },
        transports: [
            new winston.transports.Console({
                format: combine(
                    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
                    colorize(),
                    myFormat
                )
            })
        ]
    })
}

module.exports = { logObject }
