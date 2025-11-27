class Logger {
    constructor() {
        this.enabled = true;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    log(level, message, data = null) {
        if (!this.enabled) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        // Console logging
        switch(level) {
            case 'INFO':
                console.log(`[${timestamp}] INFO: ${message}`, data || '');
                break;
            case 'WARN':
                console.warn(`[${timestamp}] WARN: ${message}`, data || '');
                break;
            case 'ERROR':
                console.error(`[${timestamp}] ERROR: ${message}`, data || '');
                break;
            case 'DEBUG':
                console.debug(`[${timestamp}] DEBUG: ${message}`, data || '');
                break;
        }

        // In a real application, you would also send logs to a server
        this.sendToServer(logEntry);
    }

    info(message, data = null) {
        this.log('INFO', message, data);
    }

    warn(message, data = null) {
        this.log('WARN', message, data);
    }

    error(message, data = null) {
        this.log('ERROR', message, data);
    }

    debug(message, data = null) {
        this.log('DEBUG', message, data);
    }

    sendToServer(logEntry) {
        try {
        } catch (error) {
            console.error('Failed to send log to server:', error);
        }
    }
}

// Create global logger instance
const logger = new Logger();
