const config = require('../config');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

class Logger {
    constructor() {
        this.level = levels[config.logLevel] || levels.info;
    }

    getTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    log(level, message, ...args) {
        if (levels[level] < this.level) return;

        const timestamp = this.getTimestamp();
        let color = colors.white;
        let prefix = level.toUpperCase();

        switch (level) {
            case 'debug':
                color = colors.cyan;
                break;
            case 'info':
                color = colors.green;
                break;
            case 'warn':
                color = colors.yellow;
                break;
            case 'error':
                color = colors.red;
                break;
        }

        console.log(
            `${colors.dim}[${timestamp}]${colors.reset} ${color}${prefix}${colors.reset}:`,
            message,
            ...args
        );
    }

    debug(message, ...args) {
        this.log('debug', message, ...args);
    }

    info(message, ...args) {
        this.log('info', message, ...args);
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }
}

module.exports = new Logger();
