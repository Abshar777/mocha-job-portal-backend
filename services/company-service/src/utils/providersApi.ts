import axios from "axios"

export const googleAuthProviderApi = async (token: string) => await axios.get(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
);

export const githubAuthProviderApi = async (token: string) => await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` },
});

export const facebookAuthProviderApi = async (token: string) => await axios.get(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
);

