// 30-Day Do or Die — Emergency Crash Course Engine
// Stores diagnostic results, weakness data, spaced repetition queue

const STORAGE_KEY = 'agni_crash';

const getStore = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } 
  catch { return {}; }
};
const setStore = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export const EXAM_SYLLABUS = {
  neet: {
    label: 'NEET',
    subjects: {
      physics: {
        label: 'Physics',
        topics: [
          { id: 'mechanics', name: 'Mechanics', weight: 12, difficulty: 'Medium' },
          { id: 'thermo', name: 'Thermodynamics', weight: 6, difficulty: 'Medium' },
          { id: 'electrostatics', name: 'Electrostatics', weight: 8, difficulty: 'Hard' },
          { id: 'current', name: 'Current Electricity', weight: 7, difficulty: 'Medium' },
          { id: 'magnetics', name: 'Magnetism', weight: 5, difficulty: 'Medium' },
          { id: 'optics', name: 'Optics', weight: 8, difficulty: 'Hard' },
          { id: 'modern', name: 'Modern Physics', weight: 6, difficulty: 'Easy' },
          { id: 'waves', name: 'Waves & Sound', weight: 4, difficulty: 'Medium' },
          { id: 'semiconductor', name: 'Semiconductors', weight: 3, difficulty: 'Easy' },
        ]
      },
      chemistry: {
        label: 'Chemistry',
        topics: [
          { id: 'organic', name: 'Organic Chemistry', weight: 14, difficulty: 'Hard' },
          { id: 'inorganic', name: 'Inorganic Chemistry', weight: 10, difficulty: 'Medium' },
          { id: 'physical', name: 'Physical Chemistry', weight: 8, difficulty: 'Hard' },
          { id: 'biomolecules', name: 'Biomolecules', weight: 4, difficulty: 'Easy' },
          { id: 'polymers', name: 'Polymers', weight: 3, difficulty: 'Easy' },
          { id: 'chemical_bonding', name: 'Chemical Bonding', weight: 6, difficulty: 'Medium' },
          { id: 'equilibrium', name: 'Chemical Equilibrium', weight: 5, difficulty: 'Medium' },
        ]
      },
      biology: {
        label: 'Biology',
        topics: [
          { id: 'genetics', name: 'Genetics & Evolution', weight: 12, difficulty: 'Hard' },
          { id: 'ecology', name: 'Ecology', weight: 8, difficulty: 'Easy' },
          { id: 'human_physio', name: 'Human Physiology', weight: 14, difficulty: 'Medium' },
          { id: 'plant_physio', name: 'Plant Physiology', weight: 6, difficulty: 'Medium' },
          { id: 'cell_bio', name: 'Cell Biology', weight: 8, difficulty: 'Medium' },
          { id: 'reproduction', name: 'Reproduction', weight: 6, difficulty: 'Easy' },
          { id: 'biotech', name: 'Biotechnology', weight: 5, difficulty: 'Easy' },
          { id: 'microbes', name: 'Microbes', weight: 4, difficulty: 'Easy' },
        ]
      }
    }
  },
  jee: {
    label: 'JEE',
    subjects: {
      physics: {
        label: 'Physics',
        topics: [
          { id: 'mechanics', name: 'Mechanics', weight: 14, difficulty: 'Hard' },
          { id: 'electro', name: 'Electrodynamics', weight: 10, difficulty: 'Hard' },
          { id: 'optics', name: 'Optics & Waves', weight: 8, difficulty: 'Medium' },
          { id: 'modern', name: 'Modern Physics', weight: 6, difficulty: 'Medium' },
          { id: 'thermo', name: 'Thermodynamics', weight: 7, difficulty: 'Medium' },
        ]
      },
      chemistry: {
        label: 'Chemistry',
        topics: [
          { id: 'organic', name: 'Organic Chemistry', weight: 12, difficulty: 'Hard' },
          { id: 'inorganic', name: 'Inorganic Chemistry', weight: 8, difficulty: 'Medium' },
          { id: 'physical', name: 'Physical Chemistry', weight: 10, difficulty: 'Hard' },
        ]
      },
      maths: {
        label: 'Mathematics',
        topics: [
          { id: 'calculus', name: 'Calculus', weight: 14, difficulty: 'Hard' },
          { id: 'algebra', name: 'Algebra', weight: 10, difficulty: 'Medium' },
          { id: 'coordinate', name: 'Coordinate Geometry', weight: 8, difficulty: 'Medium' },
          { id: 'trigonometry', name: 'Trigonometry', weight: 6, difficulty: 'Medium' },
          { id: 'vectors', name: 'Vectors & 3D', weight: 5, difficulty: 'Medium' },
          { id: 'probability', name: 'Probability & Statistics', weight: 4, difficulty: 'Easy' },
        ]
      }
    }
  },
  upsc: {
    label: 'UPSC',
    subjects: {
      gs: {
        label: 'General Studies',
        topics: [
          { id: 'polity', name: 'Indian Polity', weight: 15, difficulty: 'Medium' },
          { id: 'economy', name: 'Indian Economy', weight: 12, difficulty: 'Medium' },
          { id: 'history', name: 'History', weight: 12, difficulty: 'Medium' },
          { id: 'geography', name: 'Geography', weight: 10, difficulty: 'Easy' },
          { id: 'science', name: 'Science & Tech', weight: 8, difficulty: 'Easy' },
          { id: 'environment', name: 'Environment', weight: 8, difficulty: 'Easy' },
          { id: 'current', name: 'Current Affairs', weight: 15, difficulty: 'Medium' },
          { id: 'ethics', name: 'Ethics', weight: 6, difficulty: 'Medium' },
        ]
      }
    }
  },
  tnpsc: {
    label: 'TNPSC',
    subjects: {
      gs: {
        label: 'General Studies',
        topics: [
          { id: 'tn_history', name: 'TN History & Culture', weight: 12, difficulty: 'Medium' },
          { id: 'polity', name: 'Indian Polity', weight: 10, difficulty: 'Medium' },
          { id: 'geography', name: 'Geography', weight: 8, difficulty: 'Easy' },
          { id: 'economy', name: 'Economy', weight: 8, difficulty: 'Medium' },
          { id: 'science', name: 'General Science', weight: 10, difficulty: 'Easy' },
          { id: 'aptitude', name: 'Aptitude & Reasoning', weight: 10, difficulty: 'Medium' },
          { id: 'current', name: 'Current Affairs', weight: 12, difficulty: 'Medium' },
          { id: 'tamil', name: 'Tamil Language', weight: 8, difficulty: 'Easy' },
        ]
      }
    }
  },
  placement: {
    label: 'IT Placement',
    subjects: {
      technical: {
        label: 'Technical',
        topics: [
          { id: 'dsa', name: 'Data Structures & Algorithms', weight: 20, difficulty: 'Hard' },
          { id: 'os', name: 'Operating Systems', weight: 8, difficulty: 'Medium' },
          { id: 'dbms', name: 'DBMS', weight: 8, difficulty: 'Medium' },
          { id: 'cn', name: 'Computer Networks', weight: 6, difficulty: 'Medium' },
          { id: 'oops', name: 'OOPs Concepts', weight: 6, difficulty: 'Easy' },
        ]
      },
      aptitude: {
        label: 'Aptitude',
        topics: [
          { id: 'quant', name: 'Quantitative Aptitude', weight: 12, difficulty: 'Medium' },
          { id: 'logical', name: 'Logical Reasoning', weight: 10, difficulty: 'Medium' },
          { id: 'verbal', name: 'Verbal Ability', weight: 8, difficulty: 'Easy' },
        ]
      }
    }
  }
};

// Diagnostic results manager
export const crashCourseManager = {
  init(exam, level) {
    const store = getStore();
    store.exam = exam;
    store.level = level; // beginner or intermediate
    store.startDate = new Date().toISOString();
    store.day = 1;
    store.diagnosticDone = false;
    store.topicScores = {};
    store.weakTopics = [];
    store.strongTopics = [];
    store.dailyProgress = {};
    store.spacedQueue = [];
    store.totalStudyMins = 0;
    store.questionsAttempted = 0;
    store.questionsCorrect = 0;
    store.xp = 0;
    store.playerLevel = 1;
    store.badges = [];
    setStore(store);
    return store;
  },

  getData() { return getStore(); },

  addXP(amount) {
    const store = getStore();
    store.xp = (store.xp || 0) + amount;
    const newLevel = Math.floor(store.xp / 100) + 1; // 100 XP = 1 Level
    if (newLevel > (store.playerLevel || 1)) {
        store.playerLevel = newLevel;
        if (!store.badges) store.badges = [];
        store.badges.push(`Level ${newLevel} Achiever`);
    }
    setStore(store);
    return store;
  },

  saveDiagnostic(topicScores) {
    const store = getStore();
    store.diagnosticDone = true;
    store.topicScores = topicScores;

    // For beginner, all topics start weak automatically except those explicitly maxed
    if (store.level === 'beginner') {
       Object.keys(topicScores).forEach(id => {
          if (topicScores[id] < 80) topicScores[id] = 20; // reset to 20%
       });
    }

    // Classify topics
    const syllabus = EXAM_SYLLABUS[store.exam];
    const allTopics = [];
    Object.values(syllabus.subjects).forEach(sub => {
      sub.topics.forEach(t => {
        const score = topicScores[t.id] || 0;
        allTopics.push({ ...t, score, priority: (t.weight * (100 - score)) / 100 });
      });
    });

    allTopics.sort((a, b) => b.priority - a.priority);
    store.weakTopics = allTopics.filter(t => t.score < 40).map(t => t.id);
    store.strongTopics = allTopics.filter(t => t.score >= 70).map(t => t.id);
    store.priorityOrder = allTopics.map(t => t.id);
    
    // Add weak topics to spaced queue initially
    store.weakTopics.forEach(id => {
       if (!store.spacedQueue.find(q => q.topicId === id)) {
           store.spacedQueue.push({ topicId: id, dueDay: 1, attempts: 0 });
       }
    });

    setStore(store);
    return store;
  },

  recordAnswer(topicId, correct) {
    const store = getStore();
    store.questionsAttempted = (store.questionsAttempted || 0) + 1;
    if (correct) {
      store.questionsCorrect = (store.questionsCorrect || 0) + 1;
      this.addXP(15); // +15 XP for correct answer
    }

    if (!store.topicScores[topicId]) store.topicScores[topicId] = 0;
    const delta = correct ? 8 : -4;
    store.topicScores[topicId] = Math.max(0, Math.min(100, store.topicScores[topicId] + delta));

    // Handle spaced repetition logic
    if (!store.spacedQueue) store.spacedQueue = [];
    
    const existingIdx = store.spacedQueue.findIndex(q => q.topicId === topicId);
    
    if (correct) {
       // If correct, push it further into the future
       if (existingIdx !== -1) {
           store.spacedQueue[existingIdx].dueDay = (store.day || 1) + 2 + store.spacedQueue[existingIdx].attempts;
           store.spacedQueue[existingIdx].attempts += 1;
       }
    } else {
       // If wrong, ask it again tomorrow
       if (existingIdx !== -1) {
           store.spacedQueue[existingIdx].dueDay = (store.day || 1) + 1;
           store.spacedQueue[existingIdx].attempts = 0;
       } else {
           store.spacedQueue.push({ topicId, dueDay: (store.day || 1) + 1, attempts: 0 });
       }
    }

    // Reclassify
    store.weakTopics = Object.entries(store.topicScores)
      .filter(([, s]) => s < 50).map(([id]) => id);
    store.strongTopics = Object.entries(store.topicScores)
      .filter(([, s]) => s >= 80).map(([id]) => id);

    setStore(store);
    return store;
  },

  markDayComplete(day, mins) {
    const store = getStore();
    if (!store.dailyProgress) store.dailyProgress = {};
    store.dailyProgress[day] = { completed: true, mins, date: new Date().toISOString() };
    store.day = day + 1;
    store.totalStudyMins = (store.totalStudyMins || 0) + mins;
    setStore(store);
    return store;
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },

  isActive() {
    const store = getStore();
    return !!store.exam;
  }
};
