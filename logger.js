const winston = require("winston");

const cloudwatchAgentLogPath = "/var/logs/amazon-cloudwatch-agent.log";
const webAppLogPath = "/opt/webapp/csye6225.log";

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: cloudwatchAgentLogPath }),
    new winston.transports.File({ filename: webAppLogPath }),
  ],
});

module.exports = logger;
