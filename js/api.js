import { RestAPI } from "@aws-amplify/api-rest";
import Amplify from "@aws-amplify/core";

import awsconfig from "../aws-exports";
import { currentUser } from "./auth";

Amplify.configure(awsconfig);

class ApiError extends Error {}
class UnknownError extends Error {
  constructor() {
    super("unexpected error ¯\\_(ツ)_/¯");
  }
}

export async function shorten(url, customPath) {
  const withCustomPath = !customPath.trim().isEmpty();
  const apiName = "miguelito";
  const myInit = {
    response: true,
    body: { url },
    headers: {
      ...(await authHeader()),
    },
  };
  if (withCustomPath) {
    myInit.body.custom_path = customPath;
  }

  return RestAPI.post(
    apiName,
    withCustomPath ? "/shorten-custom" : "/shorten",
    myInit
  )
    .then(buildUrl)
    .catch(handleError);
}

function authHeader() {
  return currentUser()
    .then((user) => ({
      Authorization: `Bearer ${user.jwtToken}`,
    }))
    .catch(() => {
      // ignore no current user
    });
}

function buildUrl({ data: { path } }) {
  return `${window.location.protocol}//${window.location.host}/${path}`;
}

function handleError(error) {
  console.error(error);
  const { response } = error;
  if (response && response.status < 500) {
    throw new ApiError(response.data.message);
  } else {
    throw new UnknownError();
  }
}
