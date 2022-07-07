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

const apiName = "miguelito";

export const API = {
  shorten: async (url, customPath) => {
    const requestBody = { url };
    const withCustomPath = !(customPath ?? "").trim().isEmpty();
    if (withCustomPath) {
      requestBody.custom_path = customPath;
    }

    return RestAPI.post(
      apiName,
      await shortenApiPath(),
      await requestOptionsWithBody(requestBody)
    )
      .then((data) => data.path)
      .then(buildUrl)
      .catch(handleError);
  },
  list: async () => {
    return RestAPI.get(apiName, "/urls", await requestOptions())
      .then((data) => data.urls)
      .then((urls) => urls.sort(byCreationDate).reverse())
      .then((urls) => urls.map(augmentWithShortenedUrl))
      .catch(handleError);
  },
  remove: async (path) => {
    return RestAPI.del(apiName, `/urls/${path}`, await requestOptions()).catch(
      handleError
    );
  },
  update: async (oldPath, newData) => {
    return RestAPI.patch(
      apiName,
      `/urls/${oldPath}`,
      await requestOptionsWithBody(newData)
    ).catch(handleError);
  },
};

function shortenApiPath() {
  return currentUser()
    .then(() => "/urls")
    .catch(() => "/public/urls");
}

function augmentWithShortenedUrl(url) {
  return { ...url, shortened_url: buildUrl(url.path) };
}

async function requestOptionsWithBody(body) {
  return { ...(await requestOptions()), body };
}

async function requestOptions() {
  return {
    headers: {
      ...(await authHeader()),
    },
  };
}

function authHeader() {
  return currentUser()
    .then((user) => ({
      Authorization: `Bearer ${user.jwtToken}`,
    }))
    .catch(noop);
}

function buildUrl(path) {
  return `${window.location.origin}/${path}`;
}

function handleError(error) {
  console.error(error);
  const { response } = error;
  if (response?.status === 400) {
    throw new ApiError(response.data.message);
  } else {
    throw new UnknownError();
  }
}

function byCreationDate(url1, url2) {
  return Date.parse(url1.created_at) - Date.parse(url2.created_at);
}

function noop() {}
