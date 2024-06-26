import { Logger, type LogLevel, HashMap, Array } from "effect";
import { DateTime } from "luxon";

function getLogMethod(logLevel: LogLevel.LogLevel) {
  switch (logLevel._tag) {
    case "Fatal":
    case "Error":
      return console.error;
    case "Warning":
      return console.warn;
    case "Info":
      return console.info;
    case "Debug":
    case "Trace":
      return console.debug;
    case "All":
    case "None":
    default:
      return console.log;
  }
}

export const CustomLogger = Logger.make(
  ({ annotations, message, logLevel, date }) => {
    let annotationsString = "";
    if (HashMap.size(annotations) > 0) {
      annotationsString = Array.fromIterable(annotations)
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .map(([key, value]) => `[${key}: ${value}]`)
        .join(" ");
      annotationsString = `%c${annotationsString}%c`;
    }

    const logMethod = getLogMethod(logLevel);
    const formattedDate = DateTime.fromJSDate(date).toFormat("h:mm:ss a");
    const datePrefix = `%c[${formattedDate}]%c`;

    if (Array.isArray(message)) {
      logMethod(
        datePrefix + annotationsString,
        "color: #2ecc71; font-weight: bold",
        "",
        "color: #3498db; font-weight: bold",
        "",
        ...message,
      );
    } else {
      logMethod(
        datePrefix + annotationsString,
        "color: #2ecc71; font-weight: bold",
        "",
        "color: #3498db; font-weight: bold",
        "",
        message,
      );
    }
  },
);

export const CustomLoggerLive = Logger.replace(
  Logger.defaultLogger,
  CustomLogger,
);
