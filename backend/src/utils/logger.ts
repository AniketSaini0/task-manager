// const {
//   createLogger,
//   format,
//   transports,
// } = require("winston");
// const { combine, timestamp, json, colorize } =
//   format;

// // Custom format for console logging with colors
// const consoleLogFormat = format.combine(
//   format.colorize(),
//   format.printf(
//     ({ level , message, timestamp }) => {
//       return `${level}: ${message}`;
//     }
//   )
// );

// // Create a Winston logger
// const logger = createLogger({
//   level: "info",
//   format: combine(
//     colorize(),
//     timestamp(),
//     json()
//   ),
//   transports: [
//     new transports.Console({
//       format: consoleLogFormat,
//     }),
//     new transports.File({ filename: "app.log" }),
//   ],
// });

// module.exports = logger;

import {
  createLogger,
  format,
  transports,
  Logger,
} from "winston";

const {
  combine,
  timestamp,
  printf,
  colorize,
  json,
} = format;

// Define the log format for console output
const consoleLogFormat = combine(
  colorize(),
  printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

// Create a Winston logger
const logger: Logger = createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }), // Console logging with colors
    new transports.File({
      filename: "logs/app.log",
    }), // Logs to a file
  ],
});

// Export the logger
export default logger;
