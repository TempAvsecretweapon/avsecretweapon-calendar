import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/connect-db";
import Appointment from "@/app/models/appointment";
import Technician from "@/app/models/technician";
import { google } from "googleapis";
import oauth2Client from "@/app/lib/google-oauth";

// Function to get the access token using the refresh token
async function getAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const tokens = await oauth2Client.refreshAccessToken();
  return tokens.credentials.access_token;
}

// Function to insert event into the primary Google Calendar
async function insertGoogleCalendarEvent(
  accessToken: string,
  appointmentData: any
) {
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const startTime = `${appointmentData.date}T${appointmentData.startTime}:00`;
  const endTime = `${appointmentData.date}T${appointmentData.endTime}:00`;

  const primaryCalendarId = process.env.GOOGLE_PRIMARY_CALENDAR_ID;

  if (!primaryCalendarId) {
    throw new Error("Primary calendar ID not set in environment variables");
  }

  // Fetch technicians to include their names in the event
  const technicianDetails = await Technician.find({
    _id: { $in: appointmentData.attendees },
  });

  if (!technicianDetails || technicianDetails.length === 0) {
    throw new Error("No technicians found for the provided attendees");
  }

  const event: any = {
    summary: `${appointmentData.name} - ${appointmentData.resource}`,
    description: `Appointment Details:
- Client Name: ${appointmentData.name}
- Resource: ${appointmentData.resource}
- Description: ${appointmentData.description || "N/A"}
- Technicians: ${technicianDetails.map((tech: any) => tech.name).join(", ")}`,
    start: {
      dateTime: startTime,
      timeZone: "America/Chicago",
    },
    end: {
      dateTime: endTime,
      timeZone: "America/Chicago",
    },
  };

  try {
    const res = await calendar.events.insert({
      calendarId: primaryCalendarId,
      requestBody: event,
    });
    return res.data;
  } catch (error) {
    console.error("Error inserting event into Google Calendar:", error);
    throw new Error("Failed to insert event into Google Calendar");
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      name,
      email,
      resource,
      date,
      startTime,
      endTime,
      duration,
      description,
      status,
      attendees,
    } = body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !resource ||
      !date ||
      !startTime ||
      !endTime ||
      !duration ||
      !status ||
      !Array.isArray(attendees)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new appointment
    const newAppointment = await Appointment.create({
      name,
      email,
      resource,
      date,
      startTime,
      endTime,
      duration,
      description,
      status,
      attendees,
    });

    // Get the access token using the refresh token
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!refreshToken) {
      throw new Error(
        "Google Refresh Token is not set in environment variables"
      );
    }

    const accessToken = await getAccessToken(refreshToken);

    // Insert event into the primary calendar
    await insertGoogleCalendarEvent(accessToken || "", {
      name,
      email,
      date,
      startTime,
      endTime,
      resource,
      description,
      attendees,
    });

    return NextResponse.json(
      {
        message:
          "Appointment created successfully and added to Google Calendar",
        appointment: newAppointment,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Error creating appointment:", e);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await connectDB();

    // Fetch all appointments
    const appointments = await Appointment.find().populate("attendees");

    return NextResponse.json(appointments, { status: 200 });
  } catch (e) {
    console.error("Error fetching appointments:", e);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
