import { RestAPI } from "@aws-amplify/api-rest";
import { currentUser } from "./auth";

class ApiError extends Error {}
class UnknownError extends Error {
  constructor() {
    super("unexpected error ¯\\_(ツ)_/¯");
  }
}

export async function shorten(longUrl, customPath) {
  const useCustomPath = !customPath.trim().isEmpty();
  const apiName = "miguelito";
  const path = useCustomPath ? "/shorten-custom" : "/shorten";
  const myInit = {
    response: true,
    body: {
      url: longUrl,
    },
    headers: {
      ...(await authHeader()),
    },
  };
  if (useCustomPath) {
    myInit.body.custom_path = customPath;
  }

  return RestAPI.post(apiName, path, myInit).then(buildUrl).catch(handleError);
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
