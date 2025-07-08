// js/utils/logger.js

export const LogLevel = {
  NONE: 0,    // No logs
  INFO: 1,    // Important events (e.g., "Wave 2 Started")
  DEBUG: 2,   // Detailed debugging (e.g., player health, score)
  SPAM: 3,    // Every repetitive, per-frame update
  ERROR: 4,   // Errors and warnings
};

class Logger {
  constructor() {
    // Start with only important info showing by default.
    this.currentLevel = LogLevel.INFO;
  }

  setLevel(level) {
    this.currentLevel = level;
    this.info(`Log level set to: ${Object.keys(LogLevel).find(key => LogLevel[key] === level)}`);
  }

  /**
  * Cycles through the log levels: NONE -> INFO -> DEBUG -> SPAM -> NONE
  */
  cycleLevel() {
      let newLevel = (this.currentLevel + 1) % 4; // Cycles through 0, 1, 2, 3
      this.setLevel(newLevel);
  }

  info(message) {
    if (this.currentLevel >= LogLevel.INFO) {
      console.log(`[INFO] ${message}`);
    }
  }

  debug(message) {
    if (this.currentLevel >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`);
    }
  }

  spam(message) {
    if (this.currentLevel >= LogLevel.SPAM) {
      console.log(`[SPAM] ${message}`);
    }
  }

  error(message) {
    // Errors should always be shown unless logging is completely off.
    if (this.currentLevel >= LogLevel.INFO) {
      console.error(`[ERROR] ${message}`);
    }
  }
}

// Create a single, global instance of the logger for the whole game to use.
export const logger = new Logger();