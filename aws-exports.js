/* eslint-disable */
import Auth from "@aws-amplify/auth";

const awsconfig = {
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_v1Na5QJZt",
    userPoolWebClientId: "3kfh1rbtndqb7oqqpeeu3iqqpb",
    oauth: {
      domain: "auth-dev-migueli-to.auth.eu-west-1.amazoncognito.com",
      scope: ["openid"],
      redirectSignIn: "http://localhost:8080/",
      redirectSignOut: "http://localhost:8080/",
      responseType: "code",
    },
  },
};

export default awsconfig;