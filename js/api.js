const BASE_URL = "https://07c9kiq712.execute-api.eu-west-1.amazonaws.com/dev";

class ApiError extends Error {}
class UnknownError extends Error {
  constructor() {
    super("unexpected error ¯\\_(ツ)_/¯");
  }
}

function filterStatusOk(response) {
  if (response.ok) {
    return response;
  } else if (response.status >= 400 && response.status < 500) {
    return response.json().then((error) => {
      throw new ApiError(error.message);
    });
  } else {
    throw "whoops";
  }
}

function toJson(response) {
  return response.json();
}

function buildUrl(response) {
  return `${window.location.protocol}//${window.location.host}/${response.path}`;
}

export function shorten(longUrl, customPath) {
  return fetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({ url: longUrl, custom_path: customPath }),
  })
    .then(filterStatusOk)
    .then(toJson)
    .then(buildUrl)
    .catch((error) => {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error(error);
      throw new UnknownError();
    });
}
