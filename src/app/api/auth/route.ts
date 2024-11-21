import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
);

export const getAccessToken = async () => {
  const { refreshToken } = process.env;  // Assume you save this somewhere secure

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const response = await oauth2Client.refreshAccessToken();
    const accessToken = response?.credentials?.access_token;
    return {
      accessToken,
    };
  } catch (error) {
    console.error("Error refreshing access token: ", error);
    throw error;
  }
};
