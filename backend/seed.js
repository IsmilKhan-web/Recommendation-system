 import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import ResearchArea from './models/ResearchArea.js';
import FacultyResearchArea from './models/FacultyResearchArea.js';
import FacultySlot from './models/FacultySlot.js';
import AuthorizedUser from './models/AuthorizedUser.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/supervisor_match';

const RESEARCH_AREAS = [
  { name: 'Machine Learning', category: 'Artificial Intelligence', description: 'Algorithms that learn patterns from data including deep learning, reinforcement learning, and representation learning.' },
  { name: 'Computer Vision', category: 'Artificial Intelligence', description: 'Processing and understanding visual information from images and video.' },
  { name: 'Natural Language Processing', category: 'Artificial Intelligence', description: 'Understanding, generating, and translating human language with computational models.' },
  { name: 'Speech Processing', category: 'Artificial Intelligence', description: 'Speech recognition, synthesis, speaker identification, and audio analysis.' },
  { name: 'Cybersecurity', category: 'Security', description: 'Protecting systems, networks, and data from digital attacks and unauthorized access.' },
  { name: 'Cryptography', category: 'Security', description: 'Mathematical techniques for secure communication and data protection.' },
  { name: 'Distributed Systems', category: 'Systems', description: 'Design and analysis of systems spanning multiple machines with shared state.' },
  { name: 'Cloud Computing', category: 'Systems', description: 'On-demand delivery of compute, storage, and applications over the network.' },
  { name: 'Database Systems', category: 'Systems', description: 'Storage, querying, transaction processing, and data management at scale.' },
  { name: 'Internet of Things', category: 'Networks', description: 'Interconnected physical devices that collect and exchange data.' },
  { name: 'Networking', category: 'Networks', description: 'Protocols, architectures, and performance of communication networks.' },
  { name: 'Human-Computer Interaction', category: 'Human-Centric', description: 'Design and study of how people interact with computing systems.' },
  { name: 'Software Engineering', category: 'Software', description: 'Methods, tools, and practices for building reliable software.' },
  { name: 'Programming Languages', category: 'Software', description: 'Design, semantics, and implementation of programming languages.' },
  { name: 'Algorithms & Complexity', category: 'Theory', description: 'Algorithm design, computational complexity, and theoretical foundations.' },
  { name: 'Bioinformatics', category: 'Interdisciplinary', description: 'Computational approaches to biological and genomic data.' },
  { name: 'Robotics', category: 'Interdisciplinary', description: 'Perception, control, and autonomy for physical robots.' },
  { name: 'Quantum Computing', category: 'Emerging', description: 'Quantum algorithms, hardware, and information theory.' },
  { name: 'Blockchain & Web3', category: 'Emerging', description: 'Decentralized ledgers, consensus, and smart contracts.' },
  { name: 'Data Science', category: 'Data', description: 'Statistical learning, data pipelines, and analytics at scale.' },
  { name: 'Graphics & Visualization', category: 'Human-Centric', description: 'Rendering, modeling, and visual exploration of data.' },
  { name: 'Audio Processing', category: 'Artificial Intelligence', description: 'Digital signal processing, audio classification, and acoustic analysis.' },
];

const FACULTY = [
  {
    name: 'Dr. Sarah Chen', email: 'sarah.chen@university.edu', dept: 'Computer Science',
    bio: 'Researcher in deep learning, computer vision, and multimodal AI. Leading the Vision & Language Lab.',
    officeHours: 'Mon 2-4pm, Wed 10am-12pm, Room CS-301',
    courses: ['CS 445: Deep Learning', 'CS 589: Computer Vision', 'CS 621: Multimodal AI'],
    publications: [
      'Chen, S. et al. "Self-Supervised Representation Learning for Visual-Speech Recognition" — CVPR 2024',
      'Chen, S. & Kim, J. "Multimodal Transformers for Audio-Visual Scene Understanding" — NeurIPS 2023',
      'Chen, S. "Adversarial Robustness in Vision-Language Models" — ICML 2023',
    ],
    keywords: ['deep learning', 'computer vision', 'speech processing', 'audio classification', 'machine learning', 'multimodal', 'transformers', 'representation learning'],
    areas: [{ name: 'Machine Learning', w: 5 }, { name: 'Computer Vision', w: 5 }, { name: 'Natural Language Processing', w: 4 }, { name: 'Speech Processing', w: 4 }, { name: 'Data Science', w: 3 }],
    total: 3, taken: 1,
  },
  {
    name: 'Dr. Marcus Johnson', email: 'marcus.johnson@university.edu', dept: 'Computer Science',
    bio: 'Works on distributed systems, cloud infrastructure, and fault-tolerant storage.',
    officeHours: 'Tue 1-3pm, Thu 3-5pm, Room CS-215',
    courses: ['CS 451: Distributed Systems', 'CS 555: Cloud Computing', 'CS 630: Advanced Storage Systems'],
    publications: [
      'Johnson, M. et al. "Conflict-Free Replicated Data Types at Scale" — OSDI 2024',
      'Johnson, M. & Lee, K. "Erasure Coding for Geo-Distributed Storage" — SOSP 2023',
      'Johnson, M. "Byzantine Fault Tolerance in Practice" — DSN 2022',
    ],
    keywords: ['distributed systems', 'cloud computing', 'fault tolerance', 'storage', 'consensus', 'replication', 'scalability', 'byzantine'],
    areas: [{ name: 'Distributed Systems', w: 5 }, { name: 'Cloud Computing', w: 5 }, { name: 'Database Systems', w: 4 }, { name: 'Networking', w: 3 }],
    total: 2, taken: 0,
  },
  {
    name: 'Dr. Priya Patel', email: 'priya.patel@university.edu', dept: 'Information Technology',
    bio: 'Cryptography and network security. Focused on post-quantum protocols and zero-trust architectures.',
    officeHours: 'Mon 9-11am, Fri 2-4pm, Room IT-102',
    courses: ['IT 410: Network Security', 'IT 520: Applied Cryptography', 'IT 615: Post-Quantum Security'],
    publications: [
      'Patel, P. et al. "Lattice-Based Signatures for IoT Constrained Devices" — EUROCRYPT 2024',
      'Patel, P. & Nguyen, T. "Zero-Trust Architecture for Enterprise Networks" — IEEE S&P 2023',
      'Patel, P. "Quantum-Resistant Key Exchange Protocols" — CCS 2022',
    ],
    keywords: ['cryptography', 'cybersecurity', 'post-quantum', 'network security', 'zero-trust', 'lattice', 'IoT security', 'blockchain'],
    areas: [{ name: 'Cybersecurity', w: 5 }, { name: 'Cryptography', w: 5 }, { name: 'Networking', w: 4 }, { name: 'Blockchain & Web3', w: 3 }],
    total: 2, taken: 2,
  },
  {
    name: "Dr. James O'Brien", email: 'james.obrien@university.edu', dept: 'Software Engineering',
    bio: 'Programming languages, static analysis, and developer tooling. PL geek.',
    officeHours: 'Wed 1-4pm, Room SE-220',
    courses: ['SE 420: Programming Language Concepts', 'SE 530: Static Analysis', 'SE 610: Compiler Construction'],
    publications: [
      "O'Brien, J. et al. \"Type-Guided Refactoring for Legacy Codebases\" — PLDI 2024",
      "O'Brien, J. & Smith, R. \"Interprocedural Dataflow Analysis at Scale\" — POPL 2023",
      "O'Brien, J. \"Gradual Typing in Practice: Performance and Adoption\" — OOPSLA 2022",
    ],
    keywords: ['programming languages', 'static analysis', 'compilers', 'type systems', 'software engineering', 'code quality', 'refactoring', 'developer tools'],
    areas: [{ name: 'Programming Languages', w: 5 }, { name: 'Software Engineering', w: 5 }, { name: 'Algorithms & Complexity', w: 4 }],
    total: 4, taken: 1,
  },
  {
    name: 'Dr. Elena Rodriguez', email: 'elena.rodriguez@university.edu', dept: 'Data Science',
    bio: 'Statistical learning, data visualization, and bioinformatics applications.',
    officeHours: 'Tue 10am-12pm, Thu 10am-12pm, Room DS-105',
    courses: ['DS 410: Statistical Learning', 'DS 505: Data Visualization', 'DS 620: Computational Biology'],
    publications: [
      'Rodriguez, E. et al. "Interpretable Deep Learning for Genomic Sequence Prediction" — Nature Methods 2024',
      'Rodriguez, E. & Chen, L. "Dimensionality Reduction for Single-Cell RNA Sequencing" — Bioinformatics 2023',
      'Rodriguez, E. "Visual Analytics for High-Dimensional Biological Data" — IEEE VIS 2022',
    ],
    keywords: ['data science', 'statistical learning', 'bioinformatics', 'data visualization', 'genomics', 'machine learning', 'computational biology', 'RNA sequencing'],
    areas: [{ name: 'Data Science', w: 5 }, { name: 'Machine Learning', w: 4 }, { name: 'Bioinformatics', w: 5 }, { name: 'Graphics & Visualization', w: 3 }],
    total: 3, taken: 3,
  },
  {
    name: 'Dr. Wei Zhang', email: 'wei.zhang@university.edu', dept: 'Artificial Intelligence',
    bio: 'Robotics perception, IoT systems, and edge computing for autonomous platforms.',
    officeHours: 'Mon 3-5pm, Wed 3-5pm, Room AI-401',
    courses: ['AI 430: Robotics Perception', 'AI 540: Edge AI & IoT', 'AI 650: Autonomous Systems'],
    publications: [
      'Zhang, W. et al. "Real-Time Object Detection on Edge Devices for Autonomous Robots" — ICRA 2024',
      'Zhang, W. & Kumar, A. "Federated Learning for Heterogeneous IoT Networks" — IPSN 2023',
      'Zhang, W. "Sensor Fusion for Indoor SLAM with Low-Cost Hardware" — IROS 2022',
    ],
    keywords: ['robotics', 'IoT', 'edge computing', 'computer vision', 'sensor fusion', 'autonomous systems', 'federated learning', 'SLAM'],
    areas: [{ name: 'Robotics', w: 5 }, { name: 'Internet of Things', w: 5 }, { name: 'Computer Vision', w: 4 }, { name: 'Distributed Systems', w: 3 }],
    total: 0, taken: 0,
  },
  {
    name: 'Dr. Aisha Mahmoud', email: 'aisha.mahmoud@university.edu', dept: 'Artificial Intelligence',
    bio: 'Natural language processing, speech processing, and Arabic language technology. Specializes in Quranic and religious text computational analysis.',
    officeHours: 'Sun 11am-1pm, Tue 2-4pm, Room AI-310',
    courses: ['AI 415: Natural Language Processing', 'AI 520: Speech Processing', 'AI 635: Arabic NLP & Computational Linguistics'],
    publications: [
      'Mahmoud, A. et al. "Deep Learning for Quranic Audio Recitation Classification" — INTERSPEECH 2024',
      'Mahmoud, A. & Hassan, M. "Transformer-Based Arabic Dialect Identification" — ACL 2023',
      'Mahmoud, A. "Speech Recognition for Classical Arabic Using Adaptive Acoustic Models" — IEEE TASLP 2023',
      'Mahmoud, A. et al. "Keyword Spotting in Low-Resource Religious Audio Corpora" — ICASSP 2022',
    ],
    keywords: ['natural language processing', 'speech processing', 'audio classification', 'machine learning', 'deep learning', 'Arabic NLP', 'Quranic audio', 'speech recognition', 'transformers', 'acoustic modeling', 'keyword spotting', 'classical Arabic'],
    areas: [{ name: 'Natural Language Processing', w: 5 }, { name: 'Speech Processing', w: 5 }, { name: 'Machine Learning', w: 4 }, { name: 'Audio Processing', w: 5 }],
    total: 3, taken: 0,
  },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB — seeding...');

  // 1. Clear Research Areas
  await ResearchArea.deleteMany({});
  const areaDocs = await ResearchArea.insertMany(RESEARCH_AREAS);
  const areaMap = new Map(areaDocs.map((a) => [a.name, a._id]));
  console.log(`Seeded ${areaDocs.length} research areas`);

  // 2. Clear Collections
  await User.deleteMany({ role: { $in: ['faculty', 'admin'] } });
  await User.deleteMany({ role: { $nin: ['student', 'faculty', 'admin'] } });
  await AuthorizedUser.deleteMany({});
  await FacultyResearchArea.deleteMany({});
  await FacultySlot.deleteMany({});

  // 3. CREATE MASTER ADMIN ACCOUNT
  const adminHashedPassword = await bcrypt.hash('bkuc123', 10);
  const adminEmail = 'admin@bkuc.edu.pk';

  await User.create({
    full_name: 'System Master Admin',
    email: adminEmail,
    password: adminHashedPassword,
    role: 'admin',
    department: 'Administration',
  });

  await AuthorizedUser.create({ 
    email: adminEmail, 
    role: 'admin' 
  });
  console.log(` Created Master Admin: ${adminEmail}`);

  // 4. CREATE FACULTY MEMBERS
  const hashed = await bcrypt.hash('DemoFaculty2026!', 10);

  for (const f of FACULTY) {
    const user = await User.create({
      full_name: f.name,
      email: f.email,
      password: hashed,
      role: 'faculty',
      department: f.dept,
      bio: f.bio,
      office_hours: f.officeHours,
      courses: f.courses,
      publications: f.publications,
      research_keywords: f.keywords,
    });

    const fraDocs = f.areas.map((a) => ({
      faculty_id: user._id,
      research_area_id: areaMap.get(a.name),
      weight: a.w,
    }));
    await FacultyResearchArea.insertMany(fraDocs);

    await FacultySlot.create({
      faculty_id: user._id,
      total_slots: f.total,
      taken_slots: f.taken,
      term: 'Fall 2026',
    });
    console.log(` Created faculty: ${f.name}`);
    await AuthorizedUser.create({ email: f.email, role: 'faculty' });
  }

  // 5. CREATE DEMO STUDENT
  const studentHashed = await bcrypt.hash('DemoStudent2026!', 10);
  const existingStudent = await User.findOne({ email: 'student@university.edu' });
  if (!existingStudent) {
    await User.create({
      full_name: 'Demo Student',
      email: 'student@university.edu',
      password: studentHashed,
      role: 'student',
      department: 'Computer Science',
    });
    console.log(' Created student: student@university.edu');
  }

  console.log('\n=============================================');
  console.log('SEED PROCESS COMPLETED SUCCESSFULLY!');
  console.log('=============================================');
  console.log('Admin Sign-In:   admin@university.edu / AdminPassword123!');
  console.log('Faculty Sign-In: sarah.chen@university.edu / DemoFaculty2026!');
  console.log('Student Sign-In: student@university.edu / DemoStudent2026!');
  console.log('=============================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});