import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import oauth2Client from "@/app/lib/google-oauth";

// Function to get the access token using the refresh token
async function getAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const tokens = await oauth2Client.refreshAccessToken();
  return tokens.credentials.access_token;
}

export async function GET() {
  try {
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!refreshToken) {
      throw new Error(
        "Google Refresh Token is not set in environment variables"
      );
    }

    const accessToken = await getAccessToken(refreshToken);
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendarClient = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    const response = await calendarClient.events.watch({
      calendarId: "primary",
      requestBody: {
        id: "avsecretweapone_calendar",
        type: "web_hook",
        address: process.env.WEBHOOK_URL,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (e) {
    console.error("Error watching calendar:", e);
    return NextResponse.json(
      { error: "Failed to watch calendar" },
      { status: 500 }
    );
  }
}
