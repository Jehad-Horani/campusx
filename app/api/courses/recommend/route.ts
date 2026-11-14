import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { CourseRecommendationGroup } from '@/types/campusx';

function buildIntelligentFallback(
  courses: Array<{ courseCode: string; courseName: string; syllabus?: string }>
): CourseRecommendationGroup[] {
  const now = new Date().toISOString().split('T')[0];

  return courses.map((c) => {
    const query = encodeURIComponent(c.courseName);
    const lower = `${c.courseCode} ${c.courseName}`.toLowerCase();

    if (lower.includes('distributed') || lower.includes('cloud') || lower.includes('cs412')) {
      return {
        courseCode: c.courseCode,
        courseName: c.courseName,
        generatedAt: now,
        duringSemester: [
          {
            title: 'MIT 6.824 Distributed Systems Lectures & Raft Explained',
            provider: 'MIT OpenCourseWare / YouTube',
            level: 'Intermediate',
            duration: '12 hours',
            reason: 'Visual, step-by-step mastery of Raft consensus and fault tolerance.',
            url: `https://www.coursera.org/search?query=${query}`,
          },
          {
            title: 'Cloud Computing Concepts (Part 1 & 2)',
            provider: 'Coursera — University of Illinois',
            level: 'Practical',
            duration: '14 hours',
            reason: 'Strengthens distributed synchronization and cloud architecture fundamentals.',
            url: 'https://www.coursera.org/learn/cloud-computing',
          },
        ],
        postSemester: [
          {
            title: 'Designing Data-Intensive Applications Deep Dive & Kubernetes',
            provider: 'Udemy / CNCF',
            level: 'Advanced',
            duration: '28 hours',
            reason: 'Production-grade distributed data systems & Kubernetes orchestration.',
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

    if (lower.includes('architecture') || lower.includes('software') || lower.includes('se320')) {
      return {
        courseCode: c.courseCode,
        courseName: c.courseName,
        generatedAt: now,
        duringSemester: [
          {
            title: 'Design Patterns in Object-Oriented Programming (SOLID & Clean Code)',
            provider: 'Refactoring Guru / Coursera',
            level: 'Intermediate',
            duration: '10 hours',
            reason: 'Hands-on mastery of SOLID principles and software design patterns.',
            url: 'https://refactoring.guru/design-patterns',
          },
          {
            title: 'Software Architecture & Clean Design',
            provider: 'Coursera — University of Alberta',
            level: 'Intermediate',
            duration: '16 hours',
            reason: 'Covers layered architecture, UML, and microservice boundaries.',
            url: 'https://www.coursera.org/learn/software-architecture',
          },
        ],
        postSemester: [
          {
            title: 'Domain-Driven Design & Microservices at Scale',
            provider: 'Udemy / Pluralsight',
            level: 'Advanced',
            duration: '24 hours',
            reason: 'Deep specialization in DDD, Event Sourcing, and CQRS.',
            url: `https://www.udemy.com/courses/search/?q=${query}`,
          },
        ],
      };
    }

    if (lower.includes('deep') || lower.includes('ai') || lower.includes('neural')) {
      return {
        courseCode: c.courseCode,
        courseName: c.courseName,
        generatedAt: now,
        duringSemester: [
          {
            title: 'Neural Networks and Deep Learning',
            provider: 'DeepLearning.AI (Coursera)',
            level: 'Foundational',
            duration: '18 hours',
            reason: 'Crystal-clear walkthrough of backpropagation and neural nets.',
            url: 'https://www.coursera.org/learn/neural-networks-deep-learning',
          },
          {
            title: 'PyTorch for Deep Learning Bootcamp',
            provider: 'freeCodeCamp / YouTube',
            level: 'Hands-on',
            duration: '10 hours',
            reason: 'Rapid practical PyTorch training for lab assignments.',
            url: 'https://www.freecodecamp.org/news/tag/pytorch/',
          },
        ],
        postSemester: [
          {
            title: 'Generative AI with Large Language Models & Transformers',
            provider: 'DeepLearning.AI & AWS',
            level: 'Advanced',
            duration: '22 hours',
            reason: 'Advanced exploration of LLM architectures, LoRA, and RLHF.',
            url: 'https://www.coursera.org/learn/generative-ai-with-llms',
          },
        ],
      };
    }

    // Generic intelligent fallback for ANY faculty / course (Nursing, Pharmacy, Business, Law, Dentistry, etc.)
    return {
      courseCode: c.courseCode,
      courseName: c.courseName,
      generatedAt: now,
      duringSemester: [
        {
          title: `${c.courseName} — Core Concepts & Exam Mastery`,
          provider: 'Coursera / Khan Academy',
          level: 'Semester Support',
          duration: '8-12 hours',
          reason: `Targeted review of foundational concepts for ${c.courseCode} quizzes & midterms.`,
          url: `https://www.coursera.org/search?query=${query}`,
        },
        {
          title: `Practical Workshops & Case Studies in ${c.courseCode}`,
          provider: 'edX / YouTube Academic',
          level: 'Practical',
          duration: '6 hours',
          reason: `Solved exercises and real-world case studies aligned with ${c.courseName}.`,
          url: `https://www.edx.org/search?q=${query}`,
        },
      ],
      postSemester: [
        {
          title: `Advanced Specialization in ${c.courseName}`,
          provider: 'Coursera / Udemy Professional',
          level: 'Post-Semester Deep Dive',
          duration: '25+ hours',
          reason: `Comprehensive specialization to build career-ready depth after finishing ${c.courseCode}.`,
          url: `https://www.udemy.com/courses/search/?q=${query}`,
        },
      ],
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courses = [] } = body as {
      courses: Array<{ courseCode: string; courseName: string; syllabus?: string }>;
    };

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        recommendations: buildIntelligentFallback(courses),
        source: 'offline-fallback',
      });
    }

    const prompt = `You are an expert academic advisor at Applied Science Private University (ASU).
For each of the student's uploaded courses below, recommend real, well-known external online courses (from Coursera, edX, Udemy, MIT OCW, DeepLearning.AI, freeCodeCamp, Khan Academy, Cisco Networking Academy, etc.).

Split recommendations into TWO clear categories for EACH course:
1. "duringSemester": 2 practical courses/tutorials to strengthen the student and help them excel DURING this semester.
2. "postSemester": 2 deeper, advanced courses or certifications to specialize further AFTER this semester finishes.

Courses:
${courses.map((c, idx) => `${idx + 1}. ${c.courseCode} - ${c.courseName}${c.syllabus ? ` (${c.syllabus})` : ''}`).join('\n')}

Respond strictly in JSON matching this schema:
{
  "recommendations": [
    {
      "courseCode": "string",
      "courseName": "string",
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

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    const now = new Date().toISOString().split('T')[0];

    const recommendations: CourseRecommendationGroup[] = (parsed.recommendations || []).map(
      (item: CourseRecommendationGroup) => ({
        ...item,
        generatedAt: now,
      })
    );

    if (!recommendations.length) {
      return NextResponse.json({
        recommendations: buildIntelligentFallback(courses),
        source: 'fallback',
      });
    }

    return NextResponse.json({ recommendations, source: 'gemini' });
  } catch (error) {
    console.error('AI Course recommendation error:', error);
    return NextResponse.json({
      recommendations: [],
      error: 'Failed to generate recommendations',
    }, { status: 200 });
  }
}
