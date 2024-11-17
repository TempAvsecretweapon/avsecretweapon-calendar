import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/connect-db";
import Resource from "@/app/models/resource";

export async function GET() {
  try {
    await connectDB();
    const resources = await Resource.find({});
    return NextResponse.json(resources, { status: 200 });
  } catch (e) {
    console.error("Error fetching resources:", e);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectDB();
    const resource = await Resource.create(body);
    return NextResponse.json(resource, { status: 201 });
  } catch (e) {
    console.error("Error creating resource:", e);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 400 });
  }
}
