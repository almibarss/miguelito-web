import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";

import { cloudfront } from "../aws/cloudfront.js";
import { s3 } from "../aws/s3.js";
import { logExec } from "../utils/exec.js";
import { git } from "../utils/git.js";
import { npm } from "../utils/npm.js";
import { failSpinner } from "../utils/spinner.js";

export async function deploy(flags) {
  checkCwd();
  let buildOutputDir;
  try {
    const newVersion = await resolveNewVersion(flags);
    await validateNewVersion(newVersion, flags);
    buildOutputDir = flags.tag
      ? await runBuildForTag(flags.tag)
      : await runBuild();
    await makeBackup();
    await upload(buildOutputDir, newVersion);
    await tagCurrentDeploy(newVersion);
    await createInvalidation();
  } finally {
    if (buildOutputDir) {
      logExec(`rm -rf ${buildOutputDir}`);
    }
  }
}

export async function createInvalidation() {
  const spinner = ora(`Creating invalidations in CloudFront`).start();
  try {
    const websiteEndpoint = await s3.getWebsiteEndpoint(global.webBucket);
    const distributionId = await cloudfront.getDistributionIdForDomainOrigin(
      websiteEndpoint
    );
    const invalidationId = await cloudfront.createInvalidation(
      distributionId,
      "/index.html"
    );
    spinner.succeed(`${spinner.text} (invalidation ID: ${invalidationId})`);
  } catch (e) {
    failSpinner(spinner, e);
    throw e;
  }
}

function checkCwd() {
  if (!containsBuildScript(process.cwd())) {
    die("no build script found in the current dir");
  }
}

function containsBuildScript(dir) {
  try {
    const data = fs.readFileSync(path.join(dir, "package.json"));
    return JSON.parse(data).name === "miguelito-web";
  } catch (e) {
    return false;
  }
}

async function resolveNewVersion(flags) {
  const spinner = ora(`Checking new version`).start();
  try {
    if (flags.tag) {
      await checkTag(flags.tag);
      spinner.succeed(`${spinner.text}: ${chalk.yellow(flags.tag)}`);
      return flags.tag;
    } else if (!(await git.isDirty())) {
      const head = await git.getHead();
      spinner.succeed(`${spinner.text}: ${chalk.yellow(head)} (HEAD)`);
      return head;
    } else {
      spinner.warn(
        `${spinner.text}: ${chalk.dim("unversioned")} (changes detected)`
      );
      return undefined;
    }
  } catch (e) {
    failSpinner(spinner, e);
    throw e;
  }
}

async function checkTag(tag) {
  if (!(await git.revExists(tag))) {
    throw `tag ${tag} not found!`;
  }
}

async function validateNewVersion(newVersion, flags) {
  const spinner = ora(`Checking deployed version`).start();
  try {
    const deployedVersion = await s3.getBucketTag(global.webBucket, "version");
    if (deployedVersion) {
      spinner.succeed(`${spinner.text}: ${chalk.yellow(deployedVersion)}`);
    } else {
      spinner.warn(`${spinner.text}: ${chalk.dim("unversioned")}`);
    }
    if (
      newVersion &&
      deployedVersion &&
      newVersion === deployedVersion &&
      !flags.force
    ) {
      await confirmDeploy("Deployed version matches new version. Continue?");
    }
    if (!newVersion && !flags.force) {
      await confirmDeploy("Uncommitted changes detected. Continue?");
    }
  } catch (e) {
    failSpinner(spinner, e);
    throw e;
  }
}

async function confirmDeploy(message) {
  const questions = [
    {
      type: "confirm",
      name: "continue",
      message,
      default: true,
    },
  ];
  const answer = await inquirer.prompt(questions);
  if (!answer.continue) {
    exit("Confirmation denied. Not deploying today");
  }
}

async function runBuildForTag(tag) {
  console.error(`Running build`);
  let spinner = ora({
    text: `Checking out project at tag ${tag}`,
    indent: 2,
  }).start();
  let checkoutDir;
  try {
    checkoutDir = await git.checkoutTag(tag);
    await copyAwsConfigTo(checkoutDir);
    spinner.succeed();
    spinner = ora({ text: `Installing dependencies`, indent: 2 }).start();
    await npm.install(checkoutDir);
    spinner.succeed();
    spinner = ora({ text: `Building`, indent: 2 }).start();
    const buildOutputDir = await npm.runBuild(checkoutDir);
    spinner.succeed();
    return buildOutputDir;
  } catch (e) {
    failSpinner(spinner, e);
    throw e;
  } finally {
    if (checkoutDir) {
      logExec(`rm -rf ${checkoutDir}`);
    }
  }
}

function copyAwsConfigTo(dir) {
  const copyCommand = `cp ${global.awsConfig} ${dir}`;
  return logExec(copyCommand).catch(() => {
    throw `can't find ${global.awsConfig}!`;
  });
}

async function runBuild() {
  const spinner = ora(`Running build`).start();
  try {
    const buildOutputDir = await npm.runBuild();
    spinner.succeed();
    return buildOutputDir;
  } catch (e) {
    failSpinner(spinner, e);
    throw e;
  }
}

async function makeBackup() {
  const spinner = ora(`Storing backup in S3`).start();
  try {
    const deployedVersion = await s3.getBucketTag(global.webBucket, "version");
    if (!deployedVersion) {
      spinner.warn("Current deployment has no version. Backup skipped.");
      return;
    }
    await s3.createBucketIfRequired(global.backupBucket);
    await s3.syncFromBucketToBucket(global.webBucket, global.backupBucket);
    await s3.setBucketTag(global.backupBucket, "version", deployedVersion);
    spinner.succeed();
  } catch (e) {
    failSpinner(spinner, e);
    throw e;
  }
}

async function upload(buildOutputDir, deployVersion) {
  const spinner = ora(`Uploading files to S3`).start();
  try {
    await s3.syncFromDirToBucket(buildOutputDir, `${global.webBucket}/dist`);
    if (deployVersion) {
      await s3.setBucketTag(global.webBucket, "version", deployVersion);
    } else {
      await s3.removeBucketTag(global.webBucket, "version");
    }
    spinner.succeed();
  } catch (e) {
    failSpinner(spinner, e);
    throw e;
  }
}

async function tagCurrentDeploy(newVersion) {
  if (!newVersion) {
    return;
  }
  const spinner = ora(`Tagging current deploy`).start();
  try {
    await git.setTag("current", newVersion);
    spinner.succeed();
  } catch (e) {
    failSpinner(spinner, e);
    // do not fail here as this is an optional step
  }
}

function exit(err, exitCode = 0) {
  console.log(err);
  process.exit(exitCode);
}

function die(err, exitCode = 1) {
  console.error(`fatal: ${err}`);
  process.exit(exitCode);
}
