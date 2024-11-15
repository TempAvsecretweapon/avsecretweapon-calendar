import { NextResponse } from "next/server";
import { getTokensFromCode } from "@/app/lib/google-oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    const tokens = await getTokensFromCode(code);
    return NextResponse.json(tokens);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}
