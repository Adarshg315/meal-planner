import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { recipeTitle, videoUrl } = await req.json();

    if (!recipeTitle) {
      return NextResponse.json({ error: "Missing recipeTitle" }, { status: 400 });
    }

    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: process.env.COOK_WHATSAPP_TO!,
      body: `👩‍🍳 Today's confirmed meal is: *${recipeTitle}*\n\nWatch recipe here: ${videoUrl}`,
    });

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
