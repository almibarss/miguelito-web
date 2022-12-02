import fs from "fs";
import os from "os";
import path from "path";
import shell from "shelljs";

import { logExec } from "./exec.js";

export const npm = {
  install: (dir) => {
    if (!shell.which("npm")) {
      return Promise.reject("npm not found!");
    }
    const npmCommand = `npm install --prefix ${dir}`;
    return logExec(npmCommand).catch(() => {
      throw "Install dependencies failed";
    });
  },
  runBuild: (dir) => {
    if (!shell.which("npm")) {
      return Promise.reject("npm not found!");
    }
    const appPrefix = "miguelito";
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
    const prefix = dir ? `--prefix ${dir}` : "";
    const npmCommand = `npm run ${prefix} build -- --output-path ${tmpDir}`;
    return logExec(npmCommand).then(() => tmpDir);
  },
};
