import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

const ASU_KNOWLEDGE_PROMPT = `
You are the official CampusX AI University Assistant for Applied Science Private University (ASU) located in Amman, Jordan.
Your tone is intelligent, helpful, concise, modern, and supportive.
Respond strictly in clear, helpful English.

Key Facts about ASU & CampusX:
- Location: Al-Arab Street, Shafa Badran, Amman, Jordan.
- Logo & Brand: CampusX ("Your entire university life. One intelligent experience.").
- Faculties: Faculty of Information Technology (IT), Faculty of Engineering & Technology, Faculty of Pharmacy, Faculty of Arts & Sciences, Faculty of Nursing, Faculty of Allied Medical Sciences, Faculty of Law, Faculty of Business, Faculty of Art & Design.
- Campus Buildings:
  * Building 1: Admission & Registration Directorate, Finance, Dean of Student Affairs, Academic Advisory. Classroom format: e.g. 1B12 (Building 1 Basement Hall 12), 1-101.
  * Building 2: Faculty of Information Technology (Computer Science, Software Engineering, AI, Cybersecurity, Data Science), Advanced Computing Labs. Classroom format: e.g. 2-104, 2-205, Cisco Lab, AI Sandbox.
  * Building 3: Faculty of Engineering and Technology (Civil, Mechanical, Electrical, Computer Engineering, Mechatronics).
  * Building 4: Faculty of Pharmacy & Health Sciences, Clinical simulation labs, Drug analysis labs.
  * Building 5: ASU Central Library, Digital Research Center, quiet study lounges, collaborative spaces.
  * Student Union & ASU Arena: Sports tournaments, graduation ceremonies, cafeteria, extracurricular clubs.
  * University Clinic: Primary emergency care, university doctor and nursing staff (ext. 999).
  * Psychological Counseling Center: Free, confidential counseling for students (Dean of Students, 2nd floor, Room 214).
- Academic Calendar & Rules:
  * Registration & Add/Drop: Occurs via the online student portal during the designated week prior to and at start of semester.
  * GPA System: 4.0 scale (A: 4.0, A-: 3.75, B+: 3.5, B: 3.0, B-: 2.75, C+: 2.5, C: 2.0, D: 1.5, F: 0.0). Minimum cumulative GPA for good academic standing is 2.0.
  * Community Service: ASU requires 60 hours of approved community service points for undergraduate graduation.
  * Student Perks: Official student email (@asu.edu.jo) includes free Microsoft 365, 1TB OneDrive, GitHub Student Developer Pack, and discounts on public transport and tech subscriptions.
  * Campus Mode: The signature CampusX feature calculating estimated walking time between current location (e.g. library, main gate) and next lecture classroom with ON TIME / TIGHT / LATE arrival alerts.
  * Offline Mode: Local storage caching of schedule and classrooms so students can navigate with no internet connection.

Rules:
- Never fabricate official university policies or exam results.
- If unsure, provide the official registration or department contact info (e.g., Admission ext. 1200, IT Helpdesk ext. 1111).
- Keep answers structured with short bullet points and clear steps.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], studentContext } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let contextualPrompt = ASU_KNOWLEDGE_PROMPT;
    if (studentContext) {
      contextualPrompt += `\n\n--- CURRENT AUTHENTICATED STUDENT CONTEXT ---
Student Name: ${studentContext.fullName || 'Student'}
Major: ${studentContext.major || 'Software Engineering'} (Year ${studentContext.academicYear || 4})
Faculty: ${studentContext.faculty || 'Faculty of Information Technology'}
Cumulative GPA: ${studentContext.cumulativeGpa || 3.78} / 4.0 (Target: ${studentContext.targetGpa || 3.85})
Community Service Points: ${studentContext.communityPoints || '44 / 60'}
Enrolled Courses: ${studentContext.enrolledCourses?.join(', ') || 'CS412, SE320, AI401, MATH201'}
Upcoming Schedule Today: ${studentContext.todaySchedule || 'CS412 Distributed Systems at 10:00 AM (Room 2-104, Building 2)'}
Pending Deadlines & Tasks: ${studentContext.deadlines || 'MATH201 Homework 4 due Thursday, CS412 Raft lab code due Sunday'}
Academic Risk Alert: ${studentContext.academicWarnings || 'Discrete Math proof exercises need +3.5 hours weekly to maintain target GPA.'}
Use this real student data to provide personal, proactive recommendations when answering questions about their studies, deadlines, or schedule.`;
    }

    if (!process.env.GEMINI_API_KEY) {
      const reply = getOfflineFallbackAnswer(message, studentContext);
      return NextResponse.json({ text: reply, isDemo: true });
    }

    // Format chat contents
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
        systemInstruction: contextualPrompt,
      },
    });

    const text = response.text || "I am currently unable to generate a response. Please check back shortly.";
    return NextResponse.json({ text, isDemo: false });
  } catch (error: unknown) {
    console.error("Gemini Assistant error:", error);
    const errMsg = error instanceof Error ? error.message : "Service fallback triggered";
    return NextResponse.json({
      text: getOfflineFallbackAnswer(""),
      isDemo: true,
      error: errMsg,
    });
  }
}

function getOfflineFallbackAnswer(query: string, studentContext?: { fullName?: string; cumulativeGpa?: number; targetGpa?: number }): string {
  const q = query.toLowerCase();

  // English personalized queries
  if (q.includes("what should i study") || q.includes("study today") || q.includes("prioritize") || q.includes("priority")) {
    return `📚 **Personalized Study Recommendation for Today:**
- **Top Priority (High Impact):** **MATH201 (Discrete Mathematics)** — Work through Graph Induction proofs and planar graph duality exercises. AI diagnostic detected you need **+3.5 study hours** this week to secure an A-.
- **Secondary Priority:** **CS412 (Distributed Systems)** — Begin the Raft state machine replication assignment ahead of the AI401 midterm.
- **Next Lecture:** Distributed Systems at 10:00 AM in **Room 2-104 (Faculty of IT, Building 2)**.`;
  }
  if (q.includes("assignment") || q.includes("deadline") || q.includes("this week")) {
    return `📅 **Your Academic Deadlines This Week:**
1. **MATH201:** Graph Theory Problem Set 4 — Due Thursday at 11:59 PM.
2. **CS412:** Cloud Cluster RPC Implementation — Due Sunday at 11:59 PM.
3. **Upcoming Exam:** AI401 Deep Learning Midterm Exam in 10 days (Building 2, Hall 2-205).`;
  }
  if (q.includes("falling behind") || q.includes("risk") || q.includes("warning")) {
    return `⚠️ **Academic Early Warning Diagnostic:**
- **Course with Risk:** MATH201 Discrete Mathematics (Quiz average: 58%).
- **Recommended Action:** Attend Dr. Ziad Nofal's office hours in Building 1 on Monday at 12:00 PM, and complete the adaptive practice quiz in the **Adaptive Learning** tab.
- **Other Courses:** SE320 (Software Architecture) and CS412 are on a strong track (>85%).`;
  }
  if (q.includes("1b12") || q.includes("room") || q.includes("building") || q.includes("where")) {
    return "📍 **ASU Campus Navigation:**\n- **Classroom 1B12**: Located in Building 1 (Admission & Registration Building), Basement Floor, East Wing.\n- **IT Faculty Rooms (2-104, 2-205)**: Located in Building 2.\n- **Engineering Hall**: Located in Building 3.\nTip: Tap **Campus Map** to calculate your live walking countdown and arrival status!";
  }
  if (q.includes("gpa") || q.includes("grade") || q.includes("calculate")) {
    return `📊 **ASU Academic Standing & GPA:**
- Current Cumulative GPA: **${studentContext?.cumulativeGpa || '3.78'} / 4.0** (Target: **${studentContext?.targetGpa || '3.85'}**).
- Ask me anytime about your enrolled courses, schedule deadlines, or campus buildings!`;
  }

  return `Hello ${studentContext?.fullName || 'Student'}, welcome to your **Personal Academic Assistant** at Applied Science Private University! I have direct access to your enrolled courses, current schedule, and upcoming deadlines. Ask me what to study today or about any deadline!`;
}
