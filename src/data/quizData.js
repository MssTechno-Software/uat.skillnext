import { courseCategories, myLearningCoursePath, technologies } from "./studentLearningData";

// Technology quizzes. One quiz per technology; each question has one correct answer.
// q(question, [options], correctIndex, explanation)
const q = (question, options, correct, explanation) => ({ question, options, answer: options[correct], explanation });

const build = (slug, technologyId, title, description, items) => ({
  slug,
  technologyId,
  title,
  description,
  questions: items.map((item, i) => ({ id: `${slug}-q${i + 1}`, ...item })),
});

export const quizzes = [
  build("react", "react", "React Knowledge Check", "Components, JSX, props, state and hooks.", [
    q("Which React feature lets a component receive data from its parent?", ["Props", "State", "Effect", "Ref"], 0, "Props are read-only inputs passed from a parent component to a child."),
    q("Which hook adds a state variable to a function component?", ["useMemo", "useState", "useRef", "useContext"], 1, "useState returns the current value and a setter function."),
    q("What does JSX allow you to write?", ["SQL inside CSS", "HTML-like syntax in JavaScript", "Python inside HTML", "Only JSON objects"], 1, "JSX is a syntax extension that lets you describe UI with HTML-like tags in JavaScript."),
    q("Why do list items rendered with map() need a key?", ["To style them", "So React can track items between renders", "To make them clickable", "To sort them"], 1, "Keys give each item a stable identity so React updates the right elements."),
    q("When does useEffect(() => {...}, []) run?", ["On every render", "Only after the first render", "Before every render", "Never"], 1, "An empty dependency array means the effect runs once after the component first renders."),
  ]),
  build("python", "python", "Python Knowledge Check", "Syntax, loops, collections and functions.", [
    q("What does Python use to define a block of code?", ["Curly braces", "Indentation", "Semicolons", "Parentheses"], 1, "Indentation is part of Python's syntax and marks which lines belong together."),
    q("Which data type does input() always return?", ["int", "float", "str", "bool"], 2, "input() returns text. Convert it with int() or float() when you need a number."),
    q("What does range(1, 4) produce?", ["1, 2, 3, 4", "0, 1, 2, 3", "1, 2, 3", "2, 3, 4"], 2, "range(start, stop) stops before the stop value, so you get 1, 2, 3."),
    q("Which collection stores unique values only?", ["list", "tuple", "set", "str"], 2, "A set automatically removes duplicates."),
    q("What does a function return if it has no return statement?", ["0", "Empty string", "None", "An error"], 2, "Python functions return None by default."),
  ]),
  build("javascript", "javascript", "JavaScript Knowledge Check", "Variables, functions, scope and async code.", [
    q("Which keyword declares a variable that cannot be reassigned?", ["var", "let", "const", "static"], 2, "const creates a binding that cannot be reassigned."),
    q("What is the result of 5 === \"5\"?", ["true", "false", "undefined", "Error"], 1, "Strict equality compares type as well as value, and number and string differ."),
    q("What is a closure?", ["A way to close the browser", "A function that remembers variables from its outer scope", "A loop that never ends", "A syntax error"], 1, "Closures keep access to outer variables even after the outer function returns."),
    q("Which keyword pauses an async function until a promise settles?", ["pause", "yield", "await", "stop"], 2, "await waits for the promise inside an async function."),
    q("What does [1, 2, 3].map((n) => n * 2) return?", ["[1, 2, 3]", "[2, 4, 6]", "6", "undefined"], 1, "map() returns a new array with each item transformed."),
  ]),
  build("java", "java", "Java Knowledge Check", "JVM, OOP and the Collections Framework.", [
    q("Which component actually runs Java bytecode?", ["JDK", "JVM", "javac", "IDE"], 1, "The Java Virtual Machine executes compiled bytecode."),
    q("What is the result of 7 / 2 when both are int?", ["3.5", "3", "4", "2"], 1, "Integer division drops the decimal part."),
    q("Which keyword is used for inheritance in Java?", ["implements", "inherits", "extends", "super"], 2, "A child class uses extends to inherit from a parent class."),
    q("Which collection does NOT allow duplicate elements?", ["ArrayList", "LinkedList", "HashSet", "Vector"], 2, "A Set stores unique elements only."),
    q("Which Map method returns the value for a given key?", ["fetch()", "get()", "read()", "find()"], 1, "map.get(key) returns the value stored for that key."),
  ]),
  build("sql", "sql", "SQL Knowledge Check", "SELECT, joins and aggregate functions.", [
    q("Which clause filters rows before they are grouped?", ["HAVING", "WHERE", "ORDER BY", "LIMIT"], 1, "WHERE filters individual rows; HAVING filters groups afterwards."),
    q("Which JOIN keeps all rows from the left table?", ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"], 1, "LEFT JOIN returns every left-table row and fills unmatched right-side columns with NULL."),
    q("Which statement sorts results from highest to lowest?", ["ORDER BY col ASC", "SORT BY col", "ORDER BY col DESC", "GROUP BY col"], 2, "DESC sorts in descending order."),
    q("What does COUNT(*) return?", ["Sum of a column", "Number of rows", "Largest value", "Number of columns"], 1, "COUNT(*) counts the rows in the result."),
    q("Which clause filters the results of GROUP BY?", ["WHERE", "HAVING", "FILTER", "UNIQUE"], 1, "HAVING applies conditions to aggregated groups."),
  ]),
  build("html-css", "html-css", "HTML & CSS Knowledge Check", "Semantic HTML, the box model and Flexbox.", [
    q("Which tag is best for the main navigation links of a page?", ["<div>", "<nav>", "<section>", "<span>"], 1, "<nav> is the semantic element for navigation."),
    q("In the CSS box model, which space is OUTSIDE the border?", ["Padding", "Content", "Margin", "Outline-offset"], 2, "Margin is the space outside the border; padding is inside."),
    q("Which declaration turns an element into a flex container?", ["display: flex", "flex: container", "position: flex", "layout: flex"], 0, "display: flex enables Flexbox on the element's children."),
    q("What does a media query like @media (min-width: 600px) do?", ["Loads a new page", "Applies styles only when the screen is at least 600px wide", "Hides the page", "Sets the font size to 600px"], 1, "Media queries apply CSS only when their condition is true."),
    q("Which attribute connects a <label> to an <input>?", ["name", "id + for", "class", "href"], 1, "The label's for attribute must match the input's id."),
  ]),
];

// Course-unit assessments. Each vocational module and each existing IT topic has
// its own 10-question quiz. A 15-question final assignment is generated per course
// track from the same approved learning points.
const questionStems = [
  (title) => `Which statement is an essential principle of ${title}?`,
  (title) => `A learner is reviewing ${title}. Which point should they remember?`,
  (title) => `Which practice best supports safe and effective ${title}?`,
  (title) => `Which statement correctly describes a key part of ${title}?`,
  (title) => `What is the most appropriate approach when applying ${title}?`,
  (title) => `Which option reflects the recommended process for ${title}?`,
  (title) => `Which fact should guide a beginner working with ${title}?`,
  (title) => `Which statement is accurate about ${title}?`,
  (title) => `Which action is consistent with the learning objectives for ${title}?`,
  (title) => `Which point is important when checking understanding of ${title}?`,
];

const fallbackDistractors = [
  "Ignore the service or machine instructions and choose settings by guesswork.",
  "Skip preparation and check the result only after the work is finished.",
  "Use the same method for every situation without checking the requirements.",
  "Change the approved process without recording or authorisation.",
  "Treat safety, accuracy and client or product requirements as optional.",
  "Continue even when the work area or equipment appears unsuitable.",
];

function uniqueFacts(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function createQuestions({ idPrefix, title, facts, count = 10 }) {
  const sourceFacts = uniqueFacts(facts);
  const safeFacts = sourceFacts.length ? sourceFacts : [`Follow the approved learning guidance for ${title}.`];

  return Array.from({ length: count }, (_, index) => {
    const correctFact = safeFacts[index % safeFacts.length];
    const distractors = [0, 1, 2].map((offset) =>
      fallbackDistractors[(index + offset) % fallbackDistractors.length]
    );

    const correctPosition = index % 4;
    const options = [...distractors];
    options.splice(correctPosition, 0, correctFact);
    return {
      id: `${idPrefix}-q${index + 1}`,
      question: questionStems[index % questionStems.length](title),
      options,
      answer: correctFact,
      explanation: correctFact,
    };
  });
}

function topicFacts(topic) {
  const lessonItems = topic.lessonItems || [];
  const facts = [
    topic.summary,
    topic.tip,
    ...lessonItems.flatMap((lesson) => lesson.points || []),
    ...lessonItems.map((lesson) => `${lesson.title}: ${(lesson.text || "").split(/[.!?]/)[0]}.`),
  ];
  return uniqueFacts(facts).filter((fact) => fact.length > 12);
}

function moduleQuiz(course, module, nextModule) {
  const slug = `${course.id}-${module.id}-quiz`;
  return {
    slug,
    title: `${module.title} – Topic Quiz`,
    description: `Answer 10 questions about ${module.title}. Review the feedback for every answer; any score completes this topic.`,
    courseId: course.id,
    courseName: course.name,
    moduleId: module.id,
    assessmentType: "module",
    nextPath: nextModule
      ? `/student/topics/${course.id}/topic/${nextModule.id}`
      : myLearningCoursePath(course.id),
    questions: createQuestions({
      idPrefix: slug,
      title: module.title,
      facts: module.learningPoints || [module.overview, module.description],
      count: 10,
    }),
  };
}

function technologyTopicQuiz(technology, topic, nextTopic) {
  const slug = `${technology.id}-${topic.id}-quiz`;
  const facts = topicFacts(topic);
  return {
    slug,
    title: `${topic.title} – Topic Quiz`,
    description: `10 questions based on the ${technology.name} topic you have just studied.`,
    courseId: technology.id,
    courseName: technology.name,
    technologyId: technology.id,
    topicId: topic.id,
    assessmentType: "topic",
    nextPath: nextTopic
      ? `/student/topics/${technology.id}/topic/${nextTopic.id}`
      : myLearningCoursePath(null, technology.id),
    questions: createQuestions({
      idPrefix: slug,
      title: topic.title,
      facts,
      count: 10,
    }),
  };
}

function finalAssignment(courseId, courseName, units) {
  const slug = `${courseId}-final-assignment`;
  const unitQuestions = units.map((unit) => unit.questions || []);
  const selected = Array.from({ length: 15 }, (_, index) => {
    const unitIndex = Math.floor((index * unitQuestions.length) / 15);
    const questions = unitQuestions[unitIndex] || [];
    const questionIndex = Math.floor(index / Math.max(1, unitQuestions.length)) % Math.max(1, questions.length);
    const sourceQuestion = questions[questionIndex] || questions[0];
    return sourceQuestion
      ? { ...sourceQuestion, id: `${slug}-q${index + 1}` }
      : null;
  }).filter(Boolean);

  return {
    slug,
    title: `${courseName} – Final Assignment`,
    description: "Complete the 15-question final assignment. A score of 80% or higher is required to complete this course.",
    courseId,
    courseName,
    assessmentType: "final",
    isFinalAssignment: true,
    passPercentage: 80,
    nextPath: "/student/my-learning",
    questions: selected,
  };
}

const courseModuleQuizzes = [];
const technologyTopicQuizzes = [];
const finalAssignments = [];

courseCategories.filter((course) => course.type === "vocational").forEach((course) => {
  const moduleQuizzes = course.modules.map((module, index) =>
    moduleQuiz(course, module, course.modules[index + 1])
  );
  courseModuleQuizzes.push(...moduleQuizzes);
  finalAssignments.push(finalAssignment(course.id, course.name, moduleQuizzes));
});

technologies.forEach((technology) => {
  const topicQuizzes = technology.topics.map((topic, index) =>
    technologyTopicQuiz(technology, topic, technology.topics[index + 1])
  );
  technologyTopicQuizzes.push(...topicQuizzes);
  // Each IT technology is an independently enrolled course with its own
  // final assignment; the IT Courses directory itself is never assessed.
  finalAssignments.push(finalAssignment(technology.id, technology.name, topicQuizzes));
});

export const courseUnitQuizzes = [...courseModuleQuizzes, ...technologyTopicQuizzes];
export const courseFinalAssignments = finalAssignments;
export const allLearningAssessments = [...courseUnitQuizzes, ...courseFinalAssignments];

export const getQuiz = (slug) => {
  // "react-basics" was the earlier sample slug – keep it working.
  const normalised = slug === "react-basics" ? "react" : slug;
  return (
    allLearningAssessments.find((quiz) => quiz.slug === normalised) ||
    quizzes.find((quiz) => quiz.slug === normalised)
  );
};

export const getQuizForTechnology = (technologyId) =>
  quizzes.find((quiz) => quiz.technologyId === technologyId);

export const getQuizForTopic = (technologyId, topicId) =>
  technologyTopicQuizzes.find((quiz) => quiz.technologyId === technologyId && quiz.topicId === topicId);

export const getQuizForCourseModule = (courseId, moduleId) =>
  courseModuleQuizzes.find((quiz) => quiz.courseId === courseId && quiz.moduleId === moduleId);

export const getFinalAssignmentForCourse = (courseId) =>
  finalAssignments.find((quiz) => quiz.courseId === courseId);
