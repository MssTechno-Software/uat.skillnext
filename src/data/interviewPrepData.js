// Local interview-preparation prompts and transparent, topic-based review guidance.
// Connect the approved Skill Next interview API here when its endpoint contract is available.

export const INTERVIEW_QUESTION_COUNT = 10;

const mixedDifficultySequence = [
  "Easy",
  "Medium",
  "Hard",
  "Easy",
  "Medium",
  "Hard",
  "Medium",
  "Hard",
  "Easy",
  "Medium",
];

const questionTemplates = [
  {
    focus: "Core understanding",
    easy: (topic, course) => `In your own words, what is ${topic}, and what is its main purpose in ${course}?`,
    medium: (topic, course) => `Explain the main idea behind ${topic}. How does it contribute to a successful ${course} task or service?`,
    hard: (topic, course) => `A team member believes ${topic} is a minor detail in ${course}. How would you explain its wider impact and justify the attention it deserves?`,
  },
  {
    focus: "Key elements and principles",
    easy: (topic) => `What are the most important elements or principles of ${topic}? Briefly explain each one.`,
    medium: (topic) => `Choose the key elements of ${topic} and explain how they work together during a real task.`,
    hard: (topic) => `If one important element of ${topic} is missing or incorrect, what other parts of the work could be affected? Explain the relationship.`,
  },
  {
    focus: "Preparation and planning",
    easy: (topic) => `What should a beginner check or prepare before starting work involving ${topic}?`,
    medium: (topic) => `Describe how you would prepare for a task involving ${topic}, including the information, tools or materials you would verify first.`,
    hard: (topic) => `You have limited time and incomplete information before a task involving ${topic}. How would you prioritise the checks and decide whether it is safe and appropriate to proceed?`,
  },
  {
    focus: "Working process",
    easy: (topic) => `Talk through the main steps you would follow when carrying out ${topic}.`,
    medium: (topic) => `Describe a complete working sequence for ${topic}. Explain why the order of the steps matters.`,
    hard: (topic) => `A normal workflow for ${topic} is interrupted halfway through. How would you stabilise the situation, reassess the work and continue without skipping essential controls?`,
  },
  {
    focus: "Practical application",
    easy: (topic) => `Give one practical workplace example where knowledge of ${topic} would be useful.`,
    medium: (topic) => `Imagine you are responsible for a real ${topic} task. Explain what you would do and how you would communicate your decisions to another person.`,
    hard: (topic) => `Describe a realistic, complex workplace situation involving ${topic}. Explain your decisions, the alternatives you considered and the outcome you would aim for.`,
  },
  {
    focus: "Mistakes and prevention",
    easy: (topic) => `Name one common mistake people make with ${topic}. How can it be avoided?`,
    medium: (topic) => `What are two likely mistakes in ${topic}, what causes them and how would you prevent them?`,
    hard: (topic) => `A repeated problem has occurred during ${topic}. How would you investigate the root cause rather than only correcting the visible symptom?`,
  },
  {
    focus: "Quality and standards",
    easy: (topic) => `How would you recognise whether work involving ${topic} has been completed properly?`,
    medium: (topic) => `What checks or evidence would you use to confirm that a ${topic} task meets the expected quality standard?`,
    hard: (topic) => `Two results from a ${topic} task appear acceptable, but one has a hidden weakness. What checks would help you identify the stronger result and why?`,
  },
  {
    focus: "Safety and professional judgement",
    easy: (topic) => `What is one important safety or professional responsibility to remember when working with ${topic}?`,
    medium: (topic) => `How would you respond if a safety, client or quality concern appeared while you were working on ${topic}?`,
    hard: (topic) => `A supervisor asks you to continue a ${topic} task even though an important control or approval is missing. How would you handle the situation professionally?`,
  },
  {
    focus: "Problem solving",
    easy: (topic) => `If something does not go as expected during ${topic}, what would you check first?`,
    medium: (topic) => `A task involving ${topic} produces an unexpected result. Explain the checks you would perform to identify the cause and decide the next action.`,
    hard: (topic) => `You have ruled out the obvious causes of a failure involving ${topic}, but the problem continues. How would you structure a deeper investigation and document your findings?`,
  },
  {
    focus: "End-to-end explanation",
    easy: (topic) => `Summarise the main things a new learner should remember about ${topic}.`,
    medium: (topic) => `Give an end-to-end explanation of ${topic}, from preparation and execution through final checks and communication.`,
    hard: (topic) => `You are mentoring a new colleague who must independently handle ${topic}. How would you teach the complete process, check their understanding and decide when they are ready to work independently?`,
  },
];


export function buildInterviewQuestions({ courseName, topic, difficulty = "Mixed" }) {
  const topicName = topic?.title || "the selected topic";
  const courseLabel = courseName || "your selected course";

  return questionTemplates.map((template, index) => {
    const questionDifficulty = difficulty === "Mixed"
      ? mixedDifficultySequence[index]
      : difficulty;

    return {
      id: `interview-question-${index + 1}`,
      number: index + 1,
      focus: template.focus,
      difficulty: questionDifficulty,
      text: template[questionDifficulty.toLowerCase()](topicName, courseLabel),
    };
  });
}

function getTopicReferencePoints(topic) {
  if (Array.isArray(topic?.learningPoints) && topic.learningPoints.length) {
    return topic.learningPoints.slice(0, 4);
  }

  if (Array.isArray(topic?.lessonSections) && topic.lessonSections.length) {
    return topic.lessonSections
      .flatMap((section) => [
        ...(Array.isArray(section.paragraphs) ? section.paragraphs : []),
        ...(Array.isArray(section.steps) ? section.steps.map((step) => `${step.title}: ${step.detail}`) : []),
        ...(Array.isArray(section.bullets) ? section.bullets : []),
      ])
      .filter(Boolean)
      .slice(0, 4);
  }

  const points = [];
  if (topic?.summary) points.push(topic.summary);
  if (topic?.tip) points.push(topic.tip);
  if (Array.isArray(topic?.lessonItems)) {
    topic.lessonItems.slice(0, 2).forEach((lesson) => {
      if (lesson?.title) points.push(lesson.title);
      if (lesson?.summary) points.push(lesson.summary);
    });
  }
  return points.slice(0, 4);
}

export function buildGuidedAnswerFeedback({ answer, topic, question }) {
  const cleanedAnswer = String(answer || "").trim();
  const words = cleanedAnswer ? cleanedAnswer.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const hasExample = /for example|for instance|such as|in a workplace|in a salon|in a workshop|in a store|when a client|when a customer|in practice|scenario/i.test(cleanedAnswer);
  const referencePoints = getTopicReferencePoints(topic);

  let strength;
  if (wordCount >= 45) {
    strength = `You provided a developed response with ${wordCount} words. The next step is to make the explanation easy to follow by grouping related points together.`;
  } else if (wordCount >= 20) {
    strength = `You provided a response with ${wordCount} words and have a useful starting point. Add supporting detail to make your reasoning clearer.`;
  } else {
    strength = `Your response was captured (${wordCount} words). Expand the explanation so the interviewer can understand your reasoning.`;
  }

  const improvement = hasExample
    ? "You included a practical situation. Strengthen it further by explaining the decision you made and how you checked the result."
    : "Add one realistic workplace example. Explain what you would do, why you would do it and how you would check the result.";

  return {
    title: wordCount >= 20 ? "Response captured" : "Add more detail to your answer",
    summary: `Your response to “${question?.focus || topic?.title || "this question"}” has been saved for review. This practice preview gives structure-based guidance rather than an AI accuracy score.`,
    strength,
    improvement,
    structure: [
      "Explain the concept or purpose in clear words.",
      "Describe the relevant steps, tools or decision points.",
      "Give a practical example and mention a quality or safety check.",
    ],
    referencePoints,
    wordCount,
  };
}
