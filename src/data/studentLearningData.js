// Frontend data for the Skill Next LMS student portal.
// Lesson text lives in lessonContent.js and quiz questions in quizData.js.
// Replace these with the approved Skill Next backend responses when APIs are ready.

import { courseContent } from "./lessonContent";

const technologyMeta = [
  {
    id: "react",
    name: "React",
    category: "Frontend Development",
    description: "Build interactive user interfaces with components, props, state and hooks.",
    level: "Beginner to Advanced",
    accent: "teal",
    reference: "https://www.w3schools.com/react/",
  },
  {
    id: "python",
    name: "Python",
    category: "Programming",
    description: "Learn Python syntax, data structures, functions and practical programming.",
    level: "Beginner to Advanced",
    accent: "gold",
    reference: "https://www.w3schools.com/python/",
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "Web Development",
    description: "Understand modern JavaScript, asynchronous programming and browser APIs.",
    level: "Beginner to Advanced",
    accent: "gold",
    reference: "https://www.w3schools.com/js/",
  },
  {
    id: "java",
    name: "Java",
    category: "Programming",
    description: "Explore object-oriented programming, collections and core Java concepts.",
    level: "Beginner to Advanced",
    accent: "teal",
    reference: "https://www.w3schools.com/java/",
  },
  {
    id: "sql",
    name: "SQL",
    category: "Database",
    description: "Query and manage relational data using practical SQL statements.",
    level: "Beginner to Intermediate",
    accent: "teal",
    reference: "https://www.w3schools.com/sql/",
  },
  {
    id: "html-css",
    name: "HTML & CSS",
    category: "Web Design",
    description: "Structure web pages and create responsive layouts with modern CSS.",
    level: "Beginner",
    accent: "gold",
    reference: "https://www.w3schools.com/html/",
  },
];

// topic.lessons      -> array of lesson titles (used for chips and navigation)
// topic.lessonItems  -> full lesson objects (text, points, code, output)
export const technologies = technologyMeta.map((meta) => {
  const topics = (courseContent[meta.id] || []).map((topic) => ({
    id: topic.id,
    title: topic.title,
    summary: topic.summary,
    tip: topic.tip,
    lessons: topic.lessons.map((lesson) => lesson.title),
    lessonItems: topic.lessons,
  }));
  return {
    ...meta,
    topics,
    lessons: topics.reduce((total, topic) => total + topic.lessons.length, 0),
  };
});

export const sampleResources = [
  { id: "r1", title: "React Fundamentals – Study Notes", technology: "React", type: "PDF", description: "A lesson-wise revision document." },
  { id: "r2", title: "JavaScript Quick Reference", technology: "JavaScript", type: "PDF", description: "Syntax and common language patterns." },
  { id: "r3", title: "Python Fundamentals – Presentation", technology: "Python", type: "PPT", description: "A slide deck for classroom review." },
  { id: "r4", title: "SQL Practice Worksheet", technology: "SQL", type: "PDF", description: "Practice prompts for common SQL concepts." },
  { id: "r5", title: "Java OOP – Presentation", technology: "Java", type: "PPT", description: "Classes, inheritance and polymorphism slides." },
  { id: "r6", title: "HTML & CSS Cheat Sheet", technology: "HTML & CSS", type: "PDF", description: "Common tags, selectors and layout snippets." },
];

export const learningFlow = [
  "Select a technology",
  "Choose a topic",
  "Study theory & examples",
  "Review resources",
  "Attempt the quiz",
  "Practice with AI",
  "Track your progress",
];
