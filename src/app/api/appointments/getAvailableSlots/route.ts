import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/connect-db";
import Appointment from "@/app/models/appointment";
import Technician from "@/app/models/technician";
import moment from "moment-timezone";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Invalid month format" },
        { status: 400 }
      );
    }

    const startOfMonth = moment(month, "YYYY-MM").startOf('month');
    const endOfMonth = moment(month, "YYYY-MM").endOf('month');

    const daysInMonth = [];
    for (let day = startOfMonth; day <= endOfMonth; day.add(1, 'days')) {
      daysInMonth.push(day.format("YYYY-MM-DD"));
    }

    // Fetch all appointments for the next 30 days
    const appointments = await Appointment.find({
      date: { $in: daysInMonth },
    }).populate("attendees");

    // Get all technicians
    const technicians = await Technician.find();

    // Initialize tech availability slots for each day
    const techAvailability: any = {};
    daysInMonth.forEach((date) => {
      techAvailability[date] = {};
      technicians.forEach((tech) => {
        techAvailability[date][tech._id] = Array(24).fill(true); // 24 slots of 30 mins
      });
    });

    // Mark unavailable slots based on appointments
    appointments.forEach((appt) => {
      const date = appt.date;
      appt.attendees.forEach((attendee: { _id: string | number }) => {
        const startSlot = Math.floor(
          (parseInt(appt.startTime.split(":")[0], 10) - 7) * 2 +
            parseInt(appt.startTime.split(":")[1], 10) / 30
        );
        const endSlot = Math.floor(
          (parseInt(appt.endTime.split(":")[0], 10) - 7) * 2 +
            parseInt(appt.endTime.split(":")[1], 10) / 30
        );

        for (let i = startSlot; i < endSlot; i++) {
          techAvailability[date][attendee._id][i] = false; // Mark slot as unavailable
        }
      });
    });

    const today = moment().format("YYYY-MM-DD");
    daysInMonth.forEach((date) => {
      if (moment(date).isBefore(today, "day") || date === today) {
        technicians.forEach((tech) => {
          techAvailability[date][tech._id] = Array(24).fill(false); // Mark all slots as unavailable for past days
        });
      }
    });

    // Format the response
    const response = daysInMonth.map((date) => ({
      date,
      technicians: technicians.map((tech) => ({
        technician: tech,
        availableSlots: techAvailability[date][tech._id],
      })),
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    console.error("Error fetching available slots:", e);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
