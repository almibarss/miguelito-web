import Auth from "@aws-amplify/auth";

export function login() {
  Auth.federatedSignIn({ provider: "Google" });
}

export function logout() {
  Auth.signOut();
}

export function currentUser() {
  return Auth.currentSession().then((user) => {
    const idToken = user.getIdToken();
    return {
      name: idToken.payload.given_name,
      jwtToken: idToken.getJwtToken(),
    };
  });
}
