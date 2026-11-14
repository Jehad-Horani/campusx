import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "hurt myself",
  "self harm",
  "self-harm",
  "no reason to live",
  "better off dead",
];

const MENTAL_HEALTH_INSTRUCTION = `
You are the CampusX Emotional Support Companion for students at Applied Science Private University (ASU), Jordan.
Your persona: Warm, empathetic, non-judgmental, active listener, gentle, and respectful.
Language: Respond strictly in clear, comforting English.

CRITICAL ETHICAL & CLINICAL BOUNDARIES:
- You are an emotional support companion, NOT a licensed doctor, psychiatrist, or medical provider.
- Never diagnose any medical or psychological condition (e.g. do not say "You have clinical depression").
- Validate their feelings (e.g., "It makes total sense that exam stress feels overwhelming right now").
- Offer grounding techniques (e.g., 4-7-8 breathing, 5-4-3-2-1 sensory grounding, taking a mindful walk around the ASU pine garden).
- Gently remind them that confidential human counselors at the ASU Psychological Counseling Center (Deanship of Student Affairs, 2nd floor) are available free of charge for students.
- Keep messages comforting, calm, concise, and easy to read. Avoid long walls of text.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const lower = message.toLowerCase();
    const isCrisis = CRISIS_KEYWORDS.some((kw) => lower.includes(kw));

    if (isCrisis) {
      return NextResponse.json({
        isCrisis: true,
        text:
          "I hear how much pain you are experiencing right now, and I want you to know that you are not alone and your life matters deeply. Because your safety is the absolute priority, please connect immediately with a caring human specialist who can help right now:\n\n" +
          "• **Jordan National Mental Health & Crisis Hotline**: Call **110** (Free, 24/7, Confidential)\n" +
          "• **ASU Psychological Counseling Center**: Dean of Student Affairs Building, 2nd Floor (Direct Emergency: Ext. 999 / Direct Line: +962 6 560 9999)\n" +
          "• **University Health Clinic**: 24/7 on-campus emergency assistance\n\n" +
          "We can also immediately send a confidential priority request to the university counselor with one tap below. Please reach out to someone who cares.",
        escalationData: {
          emergencyHotline: "110",
          asuCounselorOffice: "Dean of Student Affairs, Room 214",
          phone: "+962 6 560 9999",
        },
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      const reply = getOfflineEmpatheticReply();
      return NextResponse.json({ text: reply, isCrisis: false, isDemo: true });
    }

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (history && Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents,
      config: {
        systemInstruction: MENTAL_HEALTH_INSTRUCTION,
      },
    });

    const text =
      response.text ||
      "I am right here with you. Take a slow, gentle breath. What feels most heavy on your mind today?";

    return NextResponse.json({ text, isCrisis: false, isDemo: false });
  } catch (error: unknown) {
    console.error("Mental health assistant error:", error);
    const errMsg = error instanceof Error ? error.message : "Service fallback triggered";
    return NextResponse.json({
      text: getOfflineEmpatheticReply(),
      isCrisis: false,
      isDemo: true,
      error: errMsg,
    });
  }
}

function getOfflineEmpatheticReply(): string {
  return "I'm listening and I'm here for you. College life and academic demands can feel genuinely overwhelming at times, and whatever you are feeling right now is valid. Take a moment, breathe deeply. Would you like to share what is weighing on you most today? Remember, you can also book a free, completely confidential appointment with an ASU university counselor anytime.";
}
