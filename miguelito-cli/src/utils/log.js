import fs from "fs";
import * as os from "os";
import path from "path";

const { EOL } = os;

export const log = {
  filename: "miguelito-cli.log",
  append(msg) {
    if (msg) {
      logStream.write(`${msg}${EOL}`);
    }
  },
  close() {
    return new Promise((resolve) => logStream.end(resolve));
  },
};

const logStream = fs.createWriteStream(path.join(process.cwd(), log.filename), {
  flags: "w",
});
