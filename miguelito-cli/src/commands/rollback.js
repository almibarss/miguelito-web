import chalk from "chalk";
import ora from "ora";

import { s3 } from "../aws/s3.js";
import { failSpinner } from "../utils/spinner.js";
import { createInvalidation } from "./deploy.js";

export async function rollback() {
  await replaceDeployWithBackup();
  await createInvalidation();
}

async function replaceDeployWithBackup() {
  const spinner = ora(`Replacing deployed version with backup`).start();
  try {
    const backupVersion = await getBackupVersion();
    await s3.syncFromBucketToBucket(global.backupBucket, global.webBucket);
    await s3.setBucketTag(global.webBucket, "version", backupVersion);
    spinner.succeed(
      `Rolled back to version ${chalk.greenBright(backupVersion)}`
    );
  } catch (e) {
    failSpinner(spinner, e);
    throw e;
  }
}

async function getBackupVersion() {
  const backupVersion = await s3.getBucketTag(global.backupBucket, "version");
  if (!backupVersion) {
    throw `tag version not found for bucket ${global.backupBucket}!`;
  }
  return backupVersion;
}
