#!/usr/bin/env bash

if [ $# -lt 2 ]; then
   echo "usage: deploy.sh bucket_name <bucket_prefix>"
   exit
fi

BUNDLE_PATH=dist
BUCKET_NAME=$1
AWS_REGION=eu-west-1
if [ $# -gt 1 ]; then
  BUCKET_PREFIX=$2
fi

has_index_changed() {
  aws s3 sync --dryrun ${BUNDLE_PATH} "s3://${BUCKET_NAME}${BUCKET_PREFIX}" \
    | grep -q "\<upload\>.*\<${BUNDLE_PATH}/index.html\>"
}

create_cloudfront_invalidation() {
  echo '❗️ Entry point `index.html` was modified. Creating CloudFront invalidation...'

  local -r website_endpoint="${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
  local -r cloudfront_id=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[*].{id:Id,domains:Origins.Items[*].DomainName}[?contains(domains, '${website_endpoint}')].id" \
    --output text)
  if [[ -z $cloudfront_id ]]; then
    echo "No CloudFront distribution for origin \`${website_endpoint}\`" >&2
    exit 1
  fi
  echo "CloudFront distribution id: $cloudfront_id"

  local -r invalidation_id=$(aws cloudfront create-invalidation \
      --distribution-id ${cloudfront_id} \
      --query 'Invalidation.Id' \
      --paths "/index.html" \
      --output text)
  if (( $? != 0)) || [[ -z ${invalidation_id} ]]; then
    exit 1
  fi
  echo 'Invalidation created for `index.html`. Use the following command to query its status:'
  echo "👉 aws cloudfront get-invalidation --distribution-id ${cloudfront_id} --id ${invalidation_id}"
}

sync_web_bucket() {
  echo "Uploading assets to S3 web bucket..."
	aws s3 sync ${BUNDLE_PATH} "s3://${BUCKET_NAME}${BUCKET_PREFIX}" --acl public-read --exclude "*.txt" --delete
}

if has_index_changed; then
  create_cloudfront_invalidation
fi
sync_web_bucket