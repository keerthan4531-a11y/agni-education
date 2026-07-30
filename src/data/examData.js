// Data store: syllabus, exams, questions, resources

export const EXAM_CATEGORIES = [
  {
    id: 'entrance',
    label: 'Entrance Exams',
    color: 'orange',
    exams: [
      { id: 'neet', name: 'NEET', subjects: ['Physics', 'Chemistry', 'Biology'], questions: 180 },
      { id: 'jee', name: 'JEE Main', subjects: ['Physics', 'Chemistry', 'Mathematics'], questions: 90 },
      { id: 'jee_adv', name: 'JEE Advanced', subjects: ['Physics', 'Chemistry', 'Mathematics'], questions: 54 },
      { id: 'cuet', name: 'CUET', subjects: ['English', 'Domain Subject', 'General Test'], questions: 175 },
      { id: 'bitsat', name: 'BITSAT', subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'LR'], questions: 130 },
    ],
  },
  {
    id: 'govt',
    label: 'Government Exams',
    color: 'blue',
    exams: [
      { id: 'upsc', name: 'UPSC CSE', subjects: ['GS Paper I', 'GS Paper II', 'GS Paper III', 'GS Paper IV', 'Essay'], questions: null },
      { id: 'tnpsc', name: 'TNPSC', subjects: ['General Tamil', 'General English', 'General Studies', 'Aptitude & Mental Ability'], questions: 200 },
      { id: 'ssc_cgl', name: 'SSC CGL', subjects: ['Quantitative Aptitude', 'English', 'Reasoning', 'General Awareness'], questions: 100 },
      { id: 'ibps', name: 'IBPS PO', subjects: ['Reasoning', 'Quantitative', 'English', 'Computer', 'GK'], questions: 100 },
    ],
  },
  {
    id: 'placement',
    label: 'Placement & Company',
    color: 'purple',
    exams: [
      { id: 'tcs', name: 'TCS NQT', subjects: ['Verbal', 'Reasoning', 'Numerical', 'Coding'], questions: 88 },
      { id: 'infosys', name: 'Infosys', subjects: ['Logical Reasoning', 'Verbal Ability', 'Quantitative Aptitude'], questions: 80 },
      { id: 'wipro', name: 'Wipro NLTH', subjects: ['Quantitative', 'Logical', 'Verbal', 'Coding'], questions: 60 },
      { id: 'product', name: 'Product Companies', subjects: ['DSA', 'System Design', 'CS Fundamentals', 'Behavioral'], questions: null },
    ],
  },
];

export const SYLLABUS_LINKS = {
  neet: [
    { name: 'NEET 2024 Full Syllabus PDF', url: 'https://nta.ac.in/Download/Syllabus', subject: 'All Subjects' },
    { name: 'NTA NEET Physics Syllabus', url: 'https://nta.ac.in', subject: 'Physics' },
    { name: 'NTA NEET Chemistry Syllabus', url: 'https://nta.ac.in', subject: 'Chemistry' },
    { name: 'NTA NEET Biology Syllabus', url: 'https://nta.ac.in', subject: 'Biology' },
  ],
  jee: [
    { name: 'JEE Main 2024 Syllabus PDF', url: 'https://jeemain.nta.nic.in', subject: 'All Subjects' },
    { name: 'JEE Advanced 2024 Syllabus', url: 'https://jeeadv.ac.in', subject: 'All Subjects' },
  ],
  upsc: [
    { name: 'UPSC CSE Prelims Syllabus', url: 'https://upsc.gov.in', subject: 'Prelims' },
    { name: 'UPSC CSE Mains Syllabus', url: 'https://upsc.gov.in', subject: 'Mains' },
  ],
  tnpsc: [
    { name: 'TNPSC Group 1 Syllabus', url: 'https://www.tnpsc.gov.in', subject: 'Group 1' },
    { name: 'TNPSC Group 2/2A Syllabus', url: 'https://www.tnpsc.gov.in', subject: 'Group 2' },
  ],
};

export const PYQ_LINKS = {
  neet: [
    { year: '2024', url: 'https://nta.ac.in', label: 'NEET 2024 Question Paper' },
    { year: '2023', url: 'https://nta.ac.in', label: 'NEET 2023 Question Paper' },
    { year: '2022', url: 'https://nta.ac.in', label: 'NEET 2022 Question Paper' },
    { year: '2021', url: 'https://nta.ac.in', label: 'NEET 2021 Question Paper' },
    { year: '2020', url: 'https://nta.ac.in', label: 'NEET 2020 Question Paper' },
  ],
  jee: [
    { year: '2024 Session 1', url: 'https://jeemain.nta.nic.in', label: 'JEE Main 2024 S1' },
    { year: '2024 Session 2', url: 'https://jeemain.nta.nic.in', label: 'JEE Main 2024 S2' },
    { year: '2023', url: 'https://jeemain.nta.nic.in', label: 'JEE Main 2023' },
    { year: '2022', url: 'https://jeemain.nta.nic.in', label: 'JEE Main 2022' },
  ],
  upsc: [
    { year: '2024', url: 'https://upsc.gov.in', label: 'UPSC Prelims 2024' },
    { year: '2023', url: 'https://upsc.gov.in', label: 'UPSC Prelims 2023' },
    { year: '2022', url: 'https://upsc.gov.in', label: 'UPSC Prelims 2022' },
  ],
};

export const SAMPLE_QUESTIONS = {
  neet_physics: [
    {
      id: 1,
      question: "A particle moves in a straight line with uniform acceleration. If the velocity at time t = 0 is u and at t = T is v, then the average velocity is:",
      options: ["(u + v)/2", "(u - v)/2", "u + v", "uv/(u+v)"],
      correct: 0,
      explanation: "For uniform acceleration, average velocity = (initial velocity + final velocity) / 2 = (u+v)/2. This follows from the constant rate of change of velocity.",
      difficulty: "Medium",
      topic: "Kinematics",
    },
    {
      id: 2,
      question: "The work done by a force on a body is zero when:",
      options: ["Force and displacement are in same direction", "Force is perpendicular to displacement", "Body moves in curved path", "Body is heavy"],
      correct: 1,
      explanation: "W = F·d·cosθ. When θ = 90°, cos90° = 0, so work done = 0. This happens when force and displacement are perpendicular.",
      difficulty: "Easy",
      topic: "Work & Energy",
    },
    {
      id: 3,
      question: "Which of the following is a scalar quantity?",
      options: ["Force", "Velocity", "Acceleration", "Electric potential"],
      correct: 3,
      explanation: "Electric potential is a scalar quantity. Force, velocity, and acceleration are all vector quantities having both magnitude and direction.",
      difficulty: "Easy",
      topic: "Basic Concepts",
    },
  ],
  neet_biology: [
    {
      id: 4,
      question: "The process by which a cell engulfs large particles is called:",
      options: ["Pinocytosis", "Phagocytosis", "Exocytosis", "Osmosis"],
      correct: 1,
      explanation: "Phagocytosis (cell eating) is the process where a cell engulfs large particles like bacteria. Pinocytosis refers to engulfing liquids.",
      difficulty: "Easy",
      topic: "Cell Biology",
    },
    {
      id: 5,
      question: "Which enzyme is responsible for the replication of DNA?",
      options: ["RNA Polymerase", "DNA Polymerase III", "Helicase", "Primase"],
      correct: 1,
      explanation: "DNA Polymerase III is the main enzyme responsible for DNA replication in prokaryotes. It synthesizes new DNA strands in 5' to 3' direction.",
      difficulty: "Medium",
      topic: "Molecular Biology",
    },
  ],
  jee_maths: [
    {
      id: 6,
      question: "If f(x) = x³ - 6x² + 11x - 6, then f(x) = 0 has roots:",
      options: ["1, 2, 4", "1, 2, 3", "2, 3, 4", "-1, -2, -3"],
      correct: 1,
      explanation: "By trial: f(1)=1-6+11-6=0, f(2)=8-24+22-6=0, f(3)=27-54+33-6=0. So roots are 1, 2, 3.",
      difficulty: "Medium",
      topic: "Polynomials",
    },
  ],
  aptitude: [
    {
      id: 7,
      question: "A train 150 m long is running at a speed of 60 km/h. Time taken to pass a pole is:",
      options: ["8 sec", "9 sec", "10 sec", "11 sec"],
      correct: 1,
      explanation: "Speed = 60 km/h = 60 × (5/18) = 50/3 m/s. Time = 150 ÷ (50/3) = 150 × 3/50 = 9 seconds.",
      difficulty: "Medium",
      topic: "Speed & Distance",
    },
    {
      id: 8,
      question: "What is the next number in the series: 2, 6, 12, 20, 30, ?",
      options: ["40", "42", "44", "46"],
      correct: 1,
      explanation: "Pattern: n(n+1) → 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.",
      difficulty: "Easy",
      topic: "Series",
    },
  ],
};

export const CURRENT_AFFAIRS = [
  { date: "2026-03-17", title: "India's GDP Growth Rate for Q3 FY26", category: "Economy", summary: "India's GDP grew at 7.2% in Q3 FY2025-26, maintaining its position as the world's fastest-growing major economy." },
  { date: "2026-03-16", title: "New Education Policy 2025 Updates", category: "Education", summary: "NEP 2025 introduces vocational training from Class 6, multilingual education framework, and AI literacy curriculum." },
  { date: "2026-03-15", title: "ISRO's Next Mission Announcement", category: "Science & Tech", summary: "ISRO announces Chandrayaan-4 mission timeline for late 2026, focusing on lunar sample return capability." },
  { date: "2026-03-14", title: "Supreme Court Judgment on Forest Rights", category: "Governance", summary: "Supreme Court upholds Forest Rights Act provisions protecting tribal communities' rights over forest land." },
  { date: "2026-03-13", title: "India-Japan Strategic Partnership", category: "International Relations", summary: "India and Japan sign 5G infrastructure cooperation agreement worth $2 billion, enhancing bilateral tech ties." },
];

export const DAILY_PLAN_TEMPLATE = (goal) => ({
  entrance: {
    morning: ["Physics — 2 chapters (60 min)", "Practice 30 MCQs (30 min)"],
    afternoon: ["Chemistry — Organic (45 min)", "Biology revision (45 min)"],
    evening: ["Mock test — 40 min", "Review mistakes — 20 min"],
    night: ["Formula revision — 15 min", "Spaced repetition flashcards — 15 min"],
  },
  govt: {
    morning: ["Current Affairs — 30 min", "GS Paper I concepts — 60 min"],
    afternoon: ["Optional subject — 90 min"],
    evening: ["Answer writing practice — 60 min"],
    night: ["Previous year analysis — 30 min"],
  },
  placement: {
    morning: ["DSA — 2 problems on LeetCode (60 min)"],
    afternoon: ["Aptitude practice — 50 questions (60 min)", "Verbal ability — 30 min"],
    evening: ["Company-specific prep — 60 min"],
    night: ["CS fundamentals review — 30 min"],
  },
}[goal] || {
  morning: ["Study session 1 — 90 min"],
  afternoon: ["Practice problems — 60 min"],
  evening: ["Revision — 45 min"],
  night: ["Flashcard review — 20 min"],
});
