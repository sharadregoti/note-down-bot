import winston, { LoggerOptions } from 'winston';

const level = () => {
    const env = process.env.NODE_ENV || 'development'
    const isDevelopment = env === 'development'
    return isDevelopment ? 'debug' : 'warn'
}

// Define your severity levels. 
// With them, You can create log files, 
// see or hide levels based on the running ENV.
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  }

// Define different colors for each level. 
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

// Tell winston that you want to link the colors 
// defined above to the severity levels.
winston.addColors(colors)

const logConfiguration: LoggerOptions = {
    levels: levels,
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.cli(),
};

const logger = winston.createLogger(logConfiguration);

export default logger