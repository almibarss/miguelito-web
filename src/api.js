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
  shorten: async (url, backhalf) => {
    const requestBody = { origin: url };
    const isCustom = !(backhalf ?? "").trim().isEmpty();
    if (isCustom) {
      requestBody.backhalf = backhalf;
    }

    return RestAPI.post(
      apiName,
      await shortenApiPath(),
      await requestOptionsWithBody(requestBody)
    )
      .then((data) => data.backhalf)
      .then(buildUrl)
      .catch(handleError);
  },
  list: async () => {
    return RestAPI.get(apiName, "/links", await requestOptions())
      .then((data) => data.data)
      .then((links) => links.sort(byUpdateDate).reverse())
      .then((links) => links.map(augmentWithShortenedUrl))
      .catch(handleError);
  },
  remove: async (backhalf) => {
    return RestAPI.del(
      apiName,
      `/links/${backhalf}`,
      await requestOptions()
    ).catch(handleError);
  },
  update: async (backhalf, newData) => {
    return RestAPI.patch(
      apiName,
      `/links/${backhalf}`,
      await requestOptionsWithBody(newData)
    ).catch(handleError);
  },
};

function shortenApiPath() {
  return currentUser()
    .then(() => "/links")
    .catch(() => "/public/links");
}

function augmentWithShortenedUrl(link) {
  return { ...link, shortened_url: buildUrl(link.backhalf) };
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

function byUpdateDate(url1, url2) {
  return (
    Date.parse(url1.updated_at ?? url1.created_at) -
    Date.parse(url2.updated_at ?? url2.created_at)
  );
}

function noop() {}
