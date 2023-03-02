const awsconfig = {
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_UhSJz7ahQ",
    userPoolWebClientId: "5dcfv1qheg2ea8g4vub01min37",
    authenticationFlowType: "USER_PASSWORD_AUTH",
    oauth: {
      domain: "auth-dev-migueli-to.auth.eu-west-1.amazoncognito.com",
      scope: ["openid", "aws.cognito.signin.user.admin"],
      redirectSignIn: "http://localhost:8080/",
      redirectSignOut: "http://localhost:8080/",
      responseType: "code",
    },
  },
  API: {
    endpoints: [
      {
        name: "miguelito",
        endpoint: "https://api.migueli.to/dev",
      },
    ],
  },
};

export default awsconfig;
