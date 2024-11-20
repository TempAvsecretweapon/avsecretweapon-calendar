import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/connect-db";
import Appointment from "@/app/models/appointment";
import moment from "moment-timezone";

export async function POST(req: { json: () => any }) {
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
      status,
      attendees,
    });

    return NextResponse.json(
      {
        message: "Appointment created successfully",
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
