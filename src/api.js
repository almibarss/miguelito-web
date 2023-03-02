import { RestAPI } from "@aws-amplify/api-rest";
import { Amplify } from "@aws-amplify/core";
import awsconfig from "awsconfig";

import { Auth } from "./auth";

const apiName = "miguelito";

Amplify.configure(awsconfig);

export const Api = {
  async init() {
    const { base_url: baseUrl } = await Api.info();
    const ev = new CustomEvent("baseUrlReceived", {
      detail: new URL(baseUrl),
    });
    document.dispatchEvent(ev);
    localStorage.setItem("baseUrl", baseUrl);
  },
  info() {
    return RestAPI.get(apiName, "/info", {}).catch(handleError);
  },
  async shorten(url, backhalf) {
    const requestBody = { origin: url };
    if (backhalf !== undefined) {
      requestBody.backhalf = backhalf;
    }

    return RestAPI.post(
      apiName,
      "/links",
      await requestOptionsWithBody(requestBody)
    ).catch(handleError);
  },
  async list() {
    return RestAPI.get(apiName, "/links", await requestOptions())
      .then((data) => data.data)
      .catch(handleError);
  },
  async remove(backhalf) {
    return RestAPI.del(
      apiName,
      `/links/${backhalf}`,
      await requestOptions()
    ).catch(handleError);
  },
  async update(backhalf, newData) {
    return RestAPI.patch(
      apiName,
      `/links/${backhalf}`,
      await requestOptionsWithBody(newData)
    ).catch(handleError);
  },
};

export class AuthError extends Error {}

export class ApiError extends Error {}

export class UnknownError extends Error {
  constructor() {
    super("unexpected error ¯\\_(ツ)_/¯");
  }
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

async function authHeader() {
  const { jwtToken } = await Auth.currentUser();
  return {
    Authorization: `Bearer ${jwtToken}`,
  };
}

function handleError(error) {
  const { response } = error;
  if (response?.status == 400) {
    throw new ApiError(response.data.message);
  } else if (response?.status == 403) {
    throw new AuthError();
  } else {
    throw new UnknownError();
  }
}
