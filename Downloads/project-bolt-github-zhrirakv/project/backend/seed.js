import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import AuthorizedUser from './models/AuthorizedUser.js';
import FacultyResearchArea from './models/FacultyResearchArea.js';
import FacultySlot from './models/FacultySlot.js';
import ResearchArea from './models/ResearchArea.js';

const RESEARCH_AREAS = [
  { name: 'Artificial Intelligence', category: 'Computing', description: 'General AI techniques, reasoning, and problem-solving.' },
  { name: 'Machine Learning', category: 'Computing', description: 'Supervised, unsupervised, and reinforcement learning.' },
  { name: 'Deep Learning', category: 'Computing', description: 'Neural networks, CNNs, RNNs, transformers.' },
  { name: 'Natural Language Processing', category: 'Computing', description: 'Text analysis, language models, sentiment analysis.' },
  { name: 'Computer Vision', category: 'Computing', description: 'Image recognition, object detection, video analysis.' },
  { name: 'Data Science', category: 'Computing', description: 'Data mining, analytics, statistical modeling.' },
  { name: 'Big Data Analytics', category: 'Computing', description: 'Large-scale data processing, Spark, Hadoop.' },
  { name: 'Cloud Computing', category: 'Computing', description: 'Distributed systems, virtualization, edge computing.' },
  { name: 'Cybersecurity', category: 'Computing', description: 'Network security, cryptography, threat detection.' },
  { name: 'Blockchain', category: 'Computing', description: 'Distributed ledgers, smart contracts, consensus.' },
  { name: 'Internet of Things', category: 'Computing', description: 'Sensor networks, embedded systems, IoT protocols.' },
  { name: 'Software Engineering', category: 'Computing', description: 'Development methodologies, testing, architecture.' },
  { name: 'Human-Computer Interaction', category: 'Computing', description: 'UX design, usability, accessibility.' },
  { name: 'Bioinformatics', category: 'Interdisciplinary', description: 'Computational biology, genomics, protein analysis.' },
  { name: 'Quantum Computing', category: 'Computing', description: 'Quantum algorithms, qubits, quantum cryptography.' },
  { name: 'Robotics', category: 'Engineering', description: 'Autonomous systems, motion planning, perception.' },
  { name: 'Information Retrieval', category: 'Computing', description: 'Search engines, ranking algorithms, recommender systems.' },
  { name: 'Distributed Systems', category: 'Computing', description: 'Consensus, fault tolerance, microservices.' },
  { name: 'Database Systems', category: 'Computing', description: 'SQL, NoSQL, query optimization, data warehousing.' },
  { name: 'Game Development', category: 'Computing', description: 'Game engines, graphics programming, real-time rendering.' },
];

const SAMPLE_FACULTY = [
  {
    full_name: 'Dr. Sarah Chen',
    email: 'sarah.chen@university.edu',
    password: 'DemoFaculty2026!',
    department: 'Computer Science',
    designation: 'Professor',
    bio: 'Leading researcher in deep learning and computer vision applications.',
    office_hours: 'Mon 2-4pm, Wed 10am-12pm, Room CS-301',
    research_keywords: ['deep learning', 'computer vision', 'image classification', 'cnn'],
    publications: ['Chen, S. et al. "Deep CNN Architectures" — ICML 2024'],
    courses: ['CS 445: Deep Learning'],
    areas: ['Deep Learning', 'Computer Vision', 'Machine Learning'],
    weights: [5, 5, 4],
    total_slots: 3,
    taken_slots: 1,
  },
  {
    full_name: 'Dr. Ahmed Khan',
    email: 'ahmed.khan@university.edu',
    password: 'DemoFaculty2026!',
    department: 'Computer Science',
    designation: 'Associate Professor',
    bio: 'NLP and language modeling researcher with focus on low-resource languages.',
    office_hours: 'Tue 1-3pm, Thu 3-5pm, Room CS-205',
    research_keywords: ['nlp', 'language models', 'text classification', 'transformers'],
    publications: ['Khan, A. "Transformer Optimization" — ACL 2024'],
    courses: ['CS 520: Natural Language Processing'],
    areas: ['Natural Language Processing', 'Machine Learning'],
    weights: [5, 4],
    total_slots: 2,
    taken_slots: 0,
  },
  {
    full_name: 'Dr. Maria Rodriguez',
    email: 'maria.rodriguez@university.edu',
    password: 'DemoFaculty2026!',
    department: 'Data Science',
    designation: 'Professor',
    bio: 'Big data analytics and distributed systems expert.',
    office_hours: 'Mon 9-11am, Fri 2-4pm, Room DS-110',
    research_keywords: ['big data', 'spark', 'distributed systems', 'data mining'],
    publications: ['Rodriguez, M. "Scalable Analytics" — VLDB 2023'],
    courses: ['DS 410: Big Data Analytics'],
    areas: ['Big Data Analytics', 'Data Science', 'Distributed Systems'],
    weights: [5, 4, 4],
    total_slots: 4,
    taken_slots: 2,
  },
  {
    full_name: 'Dr. James Wilson',
    email: 'james.wilson@university.edu',
    password: 'DemoFaculty2026!',
    department: 'Software Engineering',
    designation: 'Associate Professor',
    bio: 'Software architecture and DevOps researcher.',
    office_hours: 'Wed 1-3pm, Fri 10am-12pm, Room SE-220',
    research_keywords: ['software engineering', 'devops', 'microservices', 'testing'],
    publications: ['Wilson, J. "Microservice Patterns" — ICSE 2024'],
    courses: ['SE 430: Software Architecture'],
    areas: ['Software Engineering', 'Cloud Computing'],
    weights: [5, 3],
    total_slots: 2,
    taken_slots: 0,
  },
  {
    full_name: 'Dr. Emily Park',
    email: 'emily.park@university.edu',
    password: 'DemoFaculty2026!',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    bio: 'Cybersecurity and cryptography researcher.',
    office_hours: 'Tue 9-11am, Thu 1-3pm, Room CS-415',
    research_keywords: ['cybersecurity', 'cryptography', 'blockchain', 'threat detection'],
    publications: ['Park, E. "Zero-Knowledge Proofs" — S&P 2024'],
    courses: ['CS 460: Computer Security'],
    areas: ['Cybersecurity', 'Blockchain'],
    weights: [5, 4],
    total_slots: 3,
    taken_slots: 0,
  },
  {
    full_name: 'Dr. Robert Liu',
    email: 'robert.liu@university.edu',
    password: 'DemoFaculty2026!',
    department: 'AI',
    designation: 'Professor',
    bio: 'Robotics and autonomous systems researcher.',
    office_hours: 'Mon 10am-12pm, Wed 3-5pm, Room AI-001',
    research_keywords: ['robotics', 'autonomous systems', 'reinforcement learning', 'iot'],
    publications: ['Liu, R. "Autonomous Navigation" — ICRA 2024'],
    courses: ['AI 510: Robotics'],
    areas: ['Robotics', 'Internet of Things', 'Artificial Intelligence'],
    weights: [5, 3, 4],
    total_slots: 2,
    taken_slots: 1,
  },
];

export const seedDatabase = async () => {
  try {
    // 1. Seed research areas
    const existingAreas = await ResearchArea.countDocuments();
    if (existingAreas === 0) {
      await ResearchArea.insertMany(RESEARCH_AREAS);
      console.log(`Seeded ${RESEARCH_AREAS.length} research areas.`);
    } else {
      console.log(`Research areas already exist (${existingAreas}).`);
    }

    const allAreas = await ResearchArea.find();
    const areaNameMap = new Map(allAreas.map((a) => [a.name, a]));

    // 2. Seed admin
    const adminEmail = 'admin@bkuc.edu.pk';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        full_name: 'System Admin',
        email: adminEmail,
        password: await bcrypt.hash('bkuc123', 10),
        role: 'admin',
        department: 'Administration',
      });
      await AuthorizedUser.create({ email: adminEmail, role: 'admin' });
      console.log('Admin account created.');
    } else {
      console.log('Admin account already exists.');
    }

    // 3. Seed sample faculty
    for (const sf of SAMPLE_FACULTY) {
      const normalizedEmail = sf.email.toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        console.log(`Faculty ${sf.full_name} already exists.`);
        continue;
      }

      const user = await User.create({
        full_name: sf.full_name,
        email: normalizedEmail,
        password: await bcrypt.hash(sf.password, 10),
        role: 'faculty',
        department: sf.department,
        designation: sf.designation,
        bio: sf.bio,
        office_hours: sf.office_hours,
        research_keywords: sf.research_keywords,
        publications: sf.publications,
        courses: sf.courses,
      });

      await AuthorizedUser.create({ email: normalizedEmail, role: 'faculty' });

      // Create slot
      await FacultySlot.create({
        faculty_id: user._id,
        total_slots: sf.total_slots,
        taken_slots: sf.taken_slots,
      });

      // Link research areas
      const fraDocs = [];
      sf.areas.forEach((areaName, index) => {
        const area = areaNameMap.get(areaName);
        if (area) {
          fraDocs.push({
            faculty_id: user._id,
            research_area_id: area._id,
            weight: sf.weights[index] ?? 3,
          });
        }
      });
      if (fraDocs.length) await FacultyResearchArea.insertMany(fraDocs);

      console.log(`Faculty ${sf.full_name} created with ${fraDocs.length} research areas.`);
    }

    return true;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};
