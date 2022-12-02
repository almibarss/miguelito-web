import {
  CreateBucketCommand,
  GetBucketLocationCommand,
  GetBucketTaggingCommand,
  PutBucketTaggingCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import mime from "mime-types";
import S3SyncClient from "s3-sync-client";

import { logAwsCommand } from "../utils/exec.js";
import { log } from "../utils/log.js";

const client = new S3Client({});
const { sync } = new S3SyncClient({ client });

export const s3 = {
  async getBucketTag(bucket, tag) {
    return (await getBucketTags(bucket)).find((t) => t.Key === tag)?.Value;
  },
  async setBucketTag(bucket, tag, value) {
    const newTagSet = (await getBucketTags(bucket))
      .filter((t) => t.Key !== tag)
      .concat({ Key: tag, Value: value });
    await logAwsCommand(
      `aws s3api put-bucket-tagging --bucket ${bucket} --tagging ${JSON.stringify(
        newTagSet
      )}`,
      client,
      new PutBucketTaggingCommand({
        Bucket: bucket,
        Tagging: {
          TagSet: newTagSet,
        },
      })
    );
  },
  async removeBucketTag(bucket, tag) {
    const newTagSet = (await getBucketTags(bucket)).filter(
      (t) => t.Key !== tag
    );
    await logAwsCommand(
      `aws s3api put-bucket-tagging --bucket ${bucket} --tagging ${JSON.stringify(
        newTagSet
      )}`,
      client,
      new PutBucketTaggingCommand({
        Bucket: bucket,
        Tagging: {
          TagSet: newTagSet,
        },
      })
    );
  },
  async syncFromBucketToBucket(from, to) {
    const explain = `aws s3 sync s3://${from} s3://${to} --acl public-read --delete`;
    try {
      const data = await syncWithOptions(`s3://${from}`, `s3://${to}`);
      log.append(`$ ${explain}`);
      log.append(JSON.stringify(data, null, 2));
    } catch (e) {
      log.append(`(!!) $ ${explain}`);
      log.append(e);
      throw e;
    }
  },
  async syncFromDirToBucket(dir, bucket) {
    const explain = `aws s3 sync ${dir} s3://${bucket} --acl public-read --delete`;
    try {
      const data = await syncWithOptions(dir, `s3://${bucket}`);
      log.append(`$ ${explain}`);
      log.append(JSON.stringify(data, null, 2));
    } catch (e) {
      log.append(`(!!) $ ${explain}`);
      log.append(e);
      throw e;
    }
  },
  async getWebsiteEndpoint(bucket) {
    // https://stackoverflow.com/a/39468126/13166837
    const data = await logAwsCommand(
      `aws s3api get-bucket-location --bucket ${bucket}`,
      client,
      new GetBucketLocationCommand({ Bucket: bucket })
    );
    const bucketRegion = data.LocationConstraint ?? "us-east-1";
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html
    return `${bucket}.s3-website-${bucketRegion}.amazonaws.com`;
  },
  async createBucketIfRequired(bucket) {
    try {
      await logAwsCommand(
        `aws s3 mb s3://${bucket}`,
        client,
        new CreateBucketCommand({ Bucket: bucket })
      );
    } catch (e) {
      if (e.name === "BucketAlreadyExists") {
        throw `can't create bucket ${bucket} because it's already taken!`;
      }
      if (e.name !== "BucketAlreadyOwnedByYou") {
        throw e;
      }
    }
  },
};

async function getBucketTags(bucket) {
  try {
    return (
      await logAwsCommand(
        `aws s3api get-bucket-tagging --bucket ${bucket}`,
        client,
        new GetBucketTaggingCommand({ Bucket: bucket })
      )
    ).TagSet;
  } catch (e) {
    if (e.name === "NoSuchTagSet") {
      return [];
    }
    if (e.name === "NoSuchBucket") {
      throw `bucket ${bucket} not found!`;
    }
    throw `can't get tag set for bucket ${bucket}`;
  }
}

async function syncWithOptions(from, to) {
  return await sync(from, to, {
    del: true,
    commandInput: {
      ACL: "public-read",
      ContentType: (syncCommandInput) =>
        mime.lookup(syncCommandInput.Key) || "text/html",
    },
  });
}
