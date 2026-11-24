import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required fields (Name, Email, Subject, Message)." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const newEnquiry = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      status: "new",
    });

    return NextResponse.json({
      ok: true,
      message: "Your message has been received. Our team will get back to you shortly.",
      id: newEnquiry._id.toString(),
      data: newEnquiry,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send message.";
    console.error("Contact API Error:", error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({
      ok: true,
      messages,
      count: messages.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch messages.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
