import shell from "shelljs";

import { log } from "./log.js";

export const logExec = (command) => {
  return new Promise((resolve, reject) => {
    shell.exec(command, { silent: true }, function (code, stdout, stderr) {
      log.append(`${code !== 0 ? "(!!) " : ""}$ ${command}`);
      log.append(stderr);
      log.append(stdout);
      code === 0 ? resolve(stdout) : reject();
    });
  });
};

export const logAwsCommand = async (explain, client, command) => {
  try {
    const data = await client.send(command);
    log.append(`$ ${explain}`);
    log.append(JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    log.append(`(!!) $ ${explain}`);
    log.append(e);
    throw e;
  }
};
