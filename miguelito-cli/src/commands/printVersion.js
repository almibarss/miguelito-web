import { s3 } from "../aws/s3.js";

export async function printVersion() {
  try {
    const deployedVersion = await s3.getBucketTag(global.webBucket, "version");
    console.log(deployedVersion ?? "unversioned");
  } catch (e) {
    console.error(e);
    throw e;
  }
}
