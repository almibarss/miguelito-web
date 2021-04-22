function filterStatusOk(response) {
  if (response.ok) {
    return Promise.resolve(response);
  } else if (response.status >= 400 && response.status < 500) {
    response.json().then(failWithMessage);
  } else {
    return Promise.reject(new Error("unexpected error ¯\\_(ツ)_/¯"));
  }
}

function failWithMessage(error) {
  return Promise.reject(new Error(error.message));
}

function toJson(response) {
  return response.json();
}

function buildUrl(path) {
  return `${window.location.protocol}//${window.location.host}/${path}`;
}

export function shorten(apiUrl, inputUrl, customPath) {
  return fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({ url: inputUrl, custom_path: customPath }),
  })
    .then(filterStatusOk)
    .then(toJson)
    .then(buildUrl);
}
