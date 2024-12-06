import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import oauth2Client from "@/app/lib/google-oauth";
import { connectDB } from "@/app/lib/connect-db";
import SyncToken from "@/app/models/syncToken";
import Appointment from "@/app/models/appointment";
import Technician from "@/app/models/technician";

let lastMessageNumber: number = -1;

interface RequestParams {
  calendarId: string;
  maxResults: number;
  singleEvents: boolean;
  syncToken?: string;
  pageToken?: string;
}

const getSyncToken = async () => {
  const record: any = await SyncToken.findById("globalSyncToken").lean();
  const syncToken = record ? record.syncToken : null;
  return syncToken;
};

const saveSyncToken = async (syncToken: string | null | undefined) => {
  try {
    const result = await SyncToken.findByIdAndUpdate(
      "globalSyncToken",
      { syncToken },
      { upsert: true, new: true, runValidators: true }
    );
    return result;
  } catch (error) {
    console.error("Error saving syncToken:", error);
    throw new Error("Error saving syncToken");
  }
};

// Function to get the access token using the refresh token
async function getAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const tokens = await oauth2Client.refreshAccessToken();
  return tokens.credentials.access_token;
}

const getEvents = async () => {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error("Google Refresh Token is not set in environment variables");
  }

  const accessToken = await getAccessToken(refreshToken);
  oauth2Client.setCredentials({ access_token: accessToken });
  const calendarClient = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  const requestParams: RequestParams = {
    calendarId: "primary",
    maxResults: 10,
    singleEvents: true,
  };

  const syncToken = await getSyncToken();

  if (syncToken) {
    requestParams.syncToken = syncToken;
  }

  let allEvents: any[] = [];
  let pageToken = null;

  do {
    // console.log("pageToken", pageToken);
    if (pageToken) {
      requestParams.pageToken = pageToken;
    }

    const response = await calendarClient.events.list(requestParams);
    allEvents = allEvents.concat(response.data.items);

    pageToken = response.data.nextPageToken;
    if (!pageToken) {
      const newSyncToken = response.data.nextSyncToken;
      await saveSyncToken(newSyncToken);
    }
  } while (pageToken);

  return allEvents;
};

const handleEvents = async (allEvents: any[]) => {
  for (const event of allEvents) {

    const { id, status } = event;
    if (status === "cancelled") {
      const existingAppointment = await Appointment.findOne({
        googleEventId: id,
      });
      if (existingAppointment) {
        await existingAppointment.deleteOne();
        console.log(`Deleted appointment for cancelled event: ${id}`);
      }
      continue;
    }

    const { summary, start, end, attendees } = event;
    console.log("event", { id, summary, start, end, attendees });

    const startDate = start.dateTime ? start.dateTime : start.date;
    const endDate = end.dateTime ? end.dateTime : end.date;

    // Calculate the duration in 1 hour intervals
    const duration = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (60 * 60 * 1000)
    );

    // Extract start and end times in the format "HH:MM"
    const startTime = new Date(startDate).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Ensure no AM/PM
      timeZone: "America/Chicago",
    });

    const endTime = new Date(endDate).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Ensure no AM/PM
      timeZone: "America/Chicago",
    });
    const date = new Date(startDate).toISOString().split("T")[0]; // Format as "YYYY-MM-DD"

    // Look for the appointment by Google Event ID (if already exists)
    const existingAppointment = await Appointment.findOne({
      googleEventId: id,
    });

    // Prepare data for the appointment
    const appointmentData: any = {
      name: summary || "No Title",
      email: event.organizer?.email || "",
      date,
      startTime,
      endTime,
      duration,
      description: "manual",
      resource: "manual",
      status: event.status || "confirmed",
      googleEventId: id,
      attendees: [],
    };

    // Find the technicians based on attendees' email
    if (attendees) {
      const technicianIds = await Promise.all(
        attendees.map(async (attendee: any) => {
          const technician = await Technician.findOne({
            email: attendee.email,
          });
          return technician ? technician._id : null;
        })
      );

      appointmentData.attendees = technicianIds.filter((id) => id !== null); // Only include valid IDs
    }

    console.log("appointmentData", appointmentData);

    if (existingAppointment) {
      // Update existing appointment if times or attendees differ
      if (
        existingAppointment.startTime !== startTime ||
        existingAppointment.endTime !== endTime ||
        existingAppointment.duration !== duration ||
        existingAppointment.date !== date ||
        !arraysAreEqual(
          existingAppointment.attendees,
          appointmentData.attendees
        )
      ) {
        existingAppointment.startTime = startTime;
        existingAppointment.endTime = endTime;
        existingAppointment.duration = duration;
        existingAppointment.date = date;
        existingAppointment.attendees = appointmentData.attendees;
        await existingAppointment.save();

        console.log(`Updated appointment for event: ${id}`);
      } else {
        console.log("An appointment with the same details already exists.");
      }
    } else {
      // Create a new appointment if none exists
      const newAppointment = new Appointment(appointmentData);
      await newAppointment.save();
      console.log(`Created new appointment for event: ${id}`);
    }
  }
};

const arraysAreEqual = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;

  // Sort both arrays before comparing
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i].toString() !== sortedB[i].toString()) return false;
  }
  return true;
};

export async function POST(req: NextRequest) {
  try {
    const { headers } = req;

    // Extract necessary details from headers
    const changeType = headers.get("x-goog-resource-state");
    const messageNumber = headers.get("x-goog-message-number");
    const messageNumberAsNumber = Number(messageNumber);

    if (isNaN(messageNumberAsNumber)) {
      console.error("Missing channel or changeType in notification.");
      return NextResponse.json(
        { error: "Invalid notification format" },
        { status: 400 }
      );
    }

    if (lastMessageNumber >= messageNumberAsNumber) {
      console.log("Duplicate message received.");
      return NextResponse.json(
        { error: "Invalid notification format" },
        { status: 400 }
      );
    }

    lastMessageNumber = messageNumberAsNumber;

    if (changeType === "sync") {
      console.log(`The calendar webhook has been successfully synced.`);
      return NextResponse.json({
        status: "success",
        message: "The calendar webhook forhas been successfully synced.",
      });
    }

    if (
      changeType === "exists" ||
      changeType === "updated" ||
      changeType === "created"
    ) {
      await connectDB();

      const allEvents = await getEvents();
      handleEvents(allEvents);
    }

    return NextResponse.json({ status: "success" });
  } catch (e) {
    console.error("Error handling calendar notification:", e);
    return NextResponse.json(
      { error: "Failed to handle calendar notification" },
      { status: 500 }
    );
  }
}
