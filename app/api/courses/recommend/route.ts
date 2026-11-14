import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { CourseRecommendationGroup } from '@/types/campusx';

interface InputCourse {
  courseCode?: string;
  courseName: string;
  syllabus?: string;
}

function buildIntelligentFallback(courses: InputCourse[]): CourseRecommendationGroup[] {
  const now = new Date().toISOString().split('T')[0];

  return courses.map((c) => {
    const cleanName = c.courseName.trim();
    const cleanCode = (c.courseCode || '').trim();
    const query = encodeURIComponent(cleanName);
    const lower = `${cleanCode} ${cleanName}`.toLowerCase();

    if (lower.includes('distributed') || lower.includes('cloud')) {
      return {
        courseCode: cleanCode,
        courseName: cleanName,
        generatedAt: now,
        duringSemester: [
          {
            title: 'MIT 6.824 Distributed Systems Lectures & Raft Explained',
            provider: 'MIT OpenCourseWare / YouTube',
            level: 'Intermediate',
            duration: '12 hours',
            reason: `Visual, step-by-step mastery of consensus and fault tolerance tailored to ${cleanName}.`,
            url: `https://www.coursera.org/search?query=${query}`,
          },
          {
            title: 'Cloud Computing Concepts (Part 1 & 2)',
            provider: 'Coursera — University of Illinois',
            level: 'Practical',
            duration: '14 hours',
            reason: `Strengthens synchronization and architecture fundamentals for ${cleanName}.`,
            url: 'https://www.coursera.org/learn/cloud-computing',
          },
        ],
        postSemester: [
          {
            title: 'Designing Data-Intensive Applications Deep Dive & Kubernetes',
            provider: 'Udemy / CNCF',
            level: 'Advanced',
            duration: '28 hours',
            reason: `Production-grade distributed data systems building on ${cleanName}.`,
            url: 'https://www.udemy.com/topic/kubernetes/',
          },
          {
            title: 'AWS Certified Solutions Architect Specialization',
            provider: 'Coursera / AWS',
            level: 'Professional',
            duration: '35 hours',
            reason: 'Prepares you for industry cloud architect certification.',
            url: 'https://www.coursera.org/specializations/aws-fundamentals',
          },
        ],
      };
    }

    if (lower.includes('architecture') || lower.includes('software')) {
      return {
        courseCode: cleanCode,
        courseName: cleanName,
        generatedAt: now,
        duringSemester: [
          {
            title: 'Design Patterns in Object-Oriented Programming (SOLID & Clean Code)',
            provider: 'Refactoring Guru / Coursera',
            level: 'Intermediate',
            duration: '10 hours',
            reason: `Hands-on mastery of SOLID principles and design patterns for ${cleanName}.`,
            url: 'https://refactoring.guru/design-patterns',
          },
          {
            title: 'Software Architecture & Clean Design',
            provider: 'Coursera — University of Alberta',
            level: 'Intermediate',
            duration: '16 hours',
            reason: `Covers layered architecture, UML, and boundaries relevant to ${cleanName}.`,
            url: 'https://www.coursera.org/learn/software-architecture',
          },
        ],
        postSemester: [
          {
            title: 'Domain-Driven Design & Microservices at Scale',
            provider: 'Udemy / Pluralsight',
            level: 'Advanced',
            duration: '24 hours',
            reason: `Deep specialization in DDD and Event Sourcing after completing ${cleanName}.`,
            url: `https://www.udemy.com/courses/search/?q=${query}`,
          },
        ],
      };
    }

    if (lower.includes('deep') || lower.includes('neural') || lower.includes('machine learning') || lower.includes('artificial intelligence')) {
      return {
        courseCode: cleanCode,
        courseName: cleanName,
        generatedAt: now,
        duringSemester: [
          {
            title: 'Neural Networks and Deep Learning',
            provider: 'DeepLearning.AI (Coursera)',
            level: 'Foundational',
            duration: '18 hours',
            reason: `Clear walkthrough of core concepts to support your progress in ${cleanName}.`,
            url: 'https://www.coursera.org/learn/neural-networks-deep-learning',
          },
          {
            title: 'PyTorch for Deep Learning Bootcamp',
            provider: 'freeCodeCamp / YouTube',
            level: 'Hands-on',
            duration: '10 hours',
            reason: `Rapid practical training for labs and projects in ${cleanName}.`,
            url: 'https://www.freecodecamp.org/news/tag/pytorch/',
          },
        ],
        postSemester: [
          {
            title: 'Generative AI with Large Language Models & Transformers',
            provider: 'DeepLearning.AI & AWS',
            level: 'Advanced',
            duration: '22 hours',
            reason: `Advanced exploration building directly on ${cleanName}.`,
            url: 'https://www.coursera.org/learn/generative-ai-with-llms',
          },
        ],
      };
    }

    return {
      courseCode: cleanCode,
      courseName: cleanName,
      generatedAt: now,
      duringSemester: [
        {
          title: `${cleanName} — Core Concepts & Exam Mastery`,
          provider: 'Coursera / Khan Academy',
          level: 'Semester Support',
          duration: '8-12 hours',
          reason: `Targeted review of foundational topics for ${cleanName} quizzes and midterms.`,
          url: `https://www.coursera.org/search?query=${query}`,
        },
        {
          title: `Practical Workshops & Problem Solving in ${cleanName}`,
          provider: 'edX / YouTube Academic',
          level: 'Practical',
          duration: '6 hours',
          reason: `Solved exercises and real-world case studies aligned with ${cleanName}.`,
          url: `https://www.edx.org/search?q=${query}`,
        },
      ],
      postSemester: [
        {
          title: `Advanced Specialization in ${cleanName}`,
          provider: 'Coursera / Udemy Professional',
          level: 'Post-Semester Deep Dive',
          duration: '25+ hours',
          reason: `Comprehensive specialization to build career-ready depth after finishing ${cleanName}.`,
          url: `https://www.udemy.com/courses/search/?q=${query}`,
        },
      ],
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCourses = (body?.courses || []) as InputCourse[];
    const courses = Array.isArray(rawCourses)
      ? rawCourses.filter((c) => c && typeof c.courseName === 'string' && c.courseName.trim().length > 0)
      : [];

    if (courses.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        recommendations: buildIntelligentFallback(courses),
        source: 'offline-fallback',
      });
    }

    const prompt = `You are an expert academic advisor at Applied Science Private University (ASU).
For EACH of the student's enrolled university courses listed below, recommend real external online courses (from Coursera, edX, Udemy, MIT OCW, DeepLearning.AI, freeCodeCamp, Khan Academy, Cisco Networking Academy, etc.).

STRICT CONSTRAINTS:
1. You MUST return recommendations ONLY for the exact ${courses.length} enrolled course(s) listed below.
2. Do NOT invent, add, substitute, rename, or remove any university course names.
3. Preserve the exact "courseName" string for every single entry in "recommendations".
4. Split each entry into:
   - "duringSemester": 2 practical external courses/tutorials to strengthen the student during this semester.
   - "postSemester": 2 deeper, advanced external courses or certifications after this semester finishes.

Student's Enrolled Courses (${courses.length}):
${courses.map((c, idx) => `${idx + 1}. ${c.courseCode ? `${c.courseCode} - ` : ''}${c.courseName.trim()}${c.syllabus ? ` (${c.syllabus})` : ''}`).join('\n')}

Respond strictly in JSON matching this schema:
{
  "recommendations": [
    {
      "courseCode": "string",
      "courseName": "string (must match exact input courseName)",
      "duringSemester": [
        {
          "title": "string",
          "provider": "string",
          "level": "string",
          "duration": "string",
          "reason": "string (write reason in clear English)",
          "url": "https://..."
        }
      ],
      "postSemester": [
        {
          "title": "string",
          "provider": "string",
          "level": "string",
          "duration": "string",
          "reason": "string (write reason in clear English)",
          "url": "https://..."
        }
      ]
    }
  ]
}`;

    let text = '';
    let usedModel = 'gemini-4-hydrogen';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      text = response.text || '{}';
    } catch {
      try {
        usedModel = 'gemini-3.1-flash-lite';
        const fallbackModelResp = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        text = fallbackModelResp.text || '{}';
      } catch (err) {
        console.warn(
          'AI Course recommendation falling back to curated advisor:',
          err instanceof Error ? err.message : 'Quota reached'
        );
        return NextResponse.json({
          recommendations: buildIntelligentFallback(courses),
          source: 'curated-fallback',
        });
      }
    }

    let parsed: { recommendations?: CourseRecommendationGroup[] } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({
        recommendations: buildIntelligentFallback(courses),
        source: 'curated-fallback',
      });
    }

    const aiList: CourseRecommendationGroup[] = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [];
    const now = new Date().toISOString().split('T')[0];
    const fallbackList = buildIntelligentFallback(courses);

    // Strictly map 1-to-1 ONLY over the student's actual enrolled courses
    const recommendations: CourseRecommendationGroup[] = courses.map((inputCourse, idx) => {
      const targetName = inputCourse.courseName.trim().toLowerCase();
      const targetCode = (inputCourse.courseCode || '').trim().toLowerCase();

      const matched =
        aiList.find(
          (item) =>
            (item.courseName && item.courseName.trim().toLowerCase() === targetName) ||
            (targetCode && item.courseCode && item.courseCode.trim().toLowerCase() === targetCode)
        ) || (aiList.length === courses.length ? aiList[idx] : undefined);

      const fallback = fallbackList[idx];

      return {
        courseCode: (inputCourse.courseCode || '').trim(),
        courseName: inputCourse.courseName.trim(),
        generatedAt: now,
        duringSemester:
          matched?.duringSemester && matched.duringSemester.length > 0
            ? matched.duringSemester
            : fallback.duringSemester,
        postSemester:
          matched?.postSemester && matched.postSemester.length > 0
            ? matched.postSemester
            : fallback.postSemester,
      };
    });

    return NextResponse.json({ recommendations, source: usedModel });
  } catch (error) {
    console.warn(
      'AI Course recommendation error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json({
      recommendations: [],
      source: 'error-fallback',
    }, { status: 200 });
  }
}
