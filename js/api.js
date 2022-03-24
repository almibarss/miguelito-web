import { RestAPI } from "@aws-amplify/api-rest";

class ApiError extends Error {}
class UnknownError extends Error {
  constructor() {
    super("unexpected error ¯\\_(ツ)_/¯");
  }
}

export function shorten(longUrl, customPath) {
  const useCustomPath = !customPath.trim().isEmpty();
  const apiName = "miguelito";
  const path = useCustomPath ? "/shorten-custom" : "/shorten";
  const myInit = {
    response: true,
    body: {
      url: longUrl,
    },
  };
  if (useCustomPath) {
    myInit.body["custom_path"] = customPath;
  }

  return RestAPI.post(apiName, path, myInit).then(buildUrl).catch(handleError);
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
