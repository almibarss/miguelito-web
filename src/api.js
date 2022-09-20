import { RestAPI } from "@aws-amplify/api-rest";
import Amplify from "@aws-amplify/core";
import awsconfig from "awsconfig";

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
  init: async () => {
    const { base_url: baseUrl } = await API.info();
    const ev = new CustomEvent("baseUrlReceived", {
      detail: new URL(baseUrl),
    });
    document.dispatchEvent(ev);
    localStorage.setItem("baseUrl", baseUrl);
  },
  info: async () => {
    return RestAPI.get(apiName, "/info", {}).catch(handleError);
  },
  shorten: async (url, backhalf) => {
    const requestBody = { origin: url };
    if (backhalf !== undefined) {
      requestBody.backhalf = backhalf;
    }

    return RestAPI.post(
      apiName,
      await shortenApiPath(),
      await requestOptionsWithBody(requestBody)
    ).catch(handleError);
  },
  list: async () => {
    return RestAPI.get(apiName, "/links", await requestOptions())
      .then((data) => data.data)
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

function handleError(error) {
  console.error(error);
  const { response } = error;
  if (response?.status === 400) {
    throw new ApiError(response.data.message);
  } else {
    throw new UnknownError();
  }
}

function noop() {}
