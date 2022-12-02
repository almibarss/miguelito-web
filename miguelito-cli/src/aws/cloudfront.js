import {
  CloudFrontClient,
  CreateInvalidationCommand,
  ListDistributionsCommand,
} from "@aws-sdk/client-cloudfront";

import { logAwsCommand } from "../utils/exec.js";

const client = new CloudFrontClient({});

export const cloudfront = {
  async getDistributionIdForDomainOrigin(domain) {
    const data = await logAwsCommand(
      `aws cloudfront list-distributions --query "DistributionList.Items[*].{id:Id,domain:Origins.Items[*].DomainName}[?contains(domain, '${domain}')].id"`,
      client,
      new ListDistributionsCommand({})
    );
    const distributionId = data.DistributionList.Items.find((d) =>
      d.Origins.Items.find((o) => o.DomainName === domain)
    )?.Id;
    if (!distributionId) {
      throw `distribution not found for origin ${domain}`;
    }
    return distributionId;
  },
  async createInvalidation(distributionId, ...paths) {
    const data = await logAwsCommand(
      `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths ${paths}`,
      client,
      new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: new Date().toISOString(),
          Paths: {
            Items: paths,
            Quantity: paths.length,
          },
        },
      })
    );
    return data.Invalidation.Id;
  },
};
