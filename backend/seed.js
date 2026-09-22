 import bcrypt from 'bcryptjs';
import User from './models/User.js';
import AuthorizedUser from './models/AuthorizedUser.js';
import FacultyResearchArea from './models/FacultyResearchArea.js';
import FacultySlot from './models/FacultySlot.js';
import ResearchArea from './models/ResearchArea.js';

const RESEARCH_AREAS = [
  // Aapke research areas yahan hain
];

const SAMPLE_FACULTY = [
  // Aapke sample faculty members yahan hain
];

export const seedDatabase = async () => {
  try {
    // 1. Seed research areas
    const existingAreas = await ResearchArea.countDocuments();
    if (existingAreas === 0 && RESEARCH_AREAS.length > 0) {
      await ResearchArea.insertMany(RESEARCH_AREAS);
      console.log(`Seeded ${RESEARCH_AREAS.length} research areas.`);
    }

    const allAreas = await ResearchArea.find();
    const areaNameMap = new Map(allAreas.map((a) => [a.name, a]));

    // 2. Seed / Force-Update Admin
    const adminEmail = 'admin@bkuc.edu.pk';
    const hashedPassword = await bcrypt.hash('bkuc123', 10);

    await User.findOneAndUpdate(
      { role: 'admin' },
      {
        full_name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        department: 'Administration',
      },
      { upsert: true, new: true }
    );

    await AuthorizedUser.findOneAndUpdate(
      { email: adminEmail },
      { email: adminEmail, role: 'admin' },
      { upsert: true }
    );

    console.log('Admin account created/updated successfully with email:', adminEmail);

    // 3. Seed sample faculty
    for (const sf of SAMPLE_FACULTY) {
      const normalizedEmail = sf.email.toLowerCase();
      const facultyPassword = await bcrypt.hash(sf.password || 'bkuc123', 10);

      // Create or update Faculty User
      const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          full_name: sf.full_name,
          email: normalizedEmail,
          password: facultyPassword,
          role: 'faculty',
          department: sf.department,
          designation: sf.designation,
          bio: sf.bio,
          office_hours: sf.office_hours,
          research_keywords: sf.research_keywords,
          publications: sf.publications,
          courses: sf.courses,
        },
        { upsert: true, new: true }
      );

      // MANDATORY: Force insert into AuthorizedUser so login never fails
      await AuthorizedUser.findOneAndUpdate(
        { email: normalizedEmail },
        { email: normalizedEmail, role: 'faculty' },
        { upsert: true }
      );

      // Ensure Faculty Slot exists
      await FacultySlot.findOneAndUpdate(
        { faculty_id: user._id },
        {
          faculty_id: user._id,
          total_slots: sf.total_slots || 3,
          taken_slots: sf.taken_slots || 0,
        },
        { upsert: true }
      );

      // Map Faculty Research Areas
      if (sf.areas && sf.areas.length > 0) {
        await FacultyResearchArea.deleteMany({ faculty_id: user._id });
        const fraDocs = [];
        sf.areas.forEach((areaName, index) => {
          const area = areaNameMap.get(areaName);
          if (area) {
            fraDocs.push({
              faculty_id: user._id,
              research_area_id: area._id,
              weight: sf.weights?.[index] ?? 3,
            });
          }
        });
        if (fraDocs.length) await FacultyResearchArea.insertMany(fraDocs);
      }
    }

    console.log('Faculty accounts and authorized users seeded successfully.');
    return true;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};