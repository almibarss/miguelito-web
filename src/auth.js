import Auth from "@aws-amplify/auth";

export async function signin() {
  return await Auth.federatedSignIn({ provider: "Google" });
}

export async function signout() {
  return await Auth.deleteUser();
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
