#!/usr/bin/env node

import chalk from "chalk";
import meow from "meow";

import { deploy } from "./commands/deploy.js";
import { printVersion } from "./commands/printVersion.js";
import { rollback } from "./commands/rollback.js";
import { log } from "./utils/log.js";

async function main(cli) {
  if (cli.flags.deploy) {
    await deploy(cli.flags);
  } else if (cli.flags.rollback) {
    await rollback();
  } else if (cli.flags.version) {
    await printVersion();
  } else {
    cli.showHelp();
  }
}

const cli = meow(
  `
	${chalk.bold("Usage")}
	  $ miguelito

	${chalk.bold("Options")}
	  --deploy, -d          Build & upload bundle to S3
	  --force, -f           Force deployment even with uncommitted changes
	  --rollback, -r        Rollback to the previous deployment
	  --from-ref, -t        Deploys a specific tag or branch
	  --print-version, -p   Prints deployed version

	${chalk.bold("Examples")}
	  $ miguelito --deploy -t v1.0
	  $ miguelito --deploy --from-ref hotfix/blacklist-user
	  $ miguelito -df
	  $ miguelito --rollback
`,
  {
    importMeta: import.meta,
    autoVersion: false,
    flags: {
      deploy: {
        type: "boolean",
        alias: "d",
      },
      force: {
        type: "boolean",
        alias: "f",
      },
      tag: {
        type: "string",
        alias: "t",
      },
      rollback: {
        type: "boolean",
        alias: "r",
      },
      version: {
        type: "boolean",
        alias: "p",
      },
    },
  }
);

global.webBucket = "migueli.to-web";
global.backupBucket = "migueli.to-web-backup";
global.awsConfig = "aws-config.pro.js";

let exitCode = 0;
try {
  await main(cli);
} catch (e) {
  console.error();
  console.error(
    `Process terminated with errors. Please check out ${log.filename} for the full log`
  );
  exitCode = 1;
} finally {
  await log.close();
  process.exit(exitCode);
}
