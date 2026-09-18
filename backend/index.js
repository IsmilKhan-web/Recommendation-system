 import bcrypt from 'bcryptjs';
import User from './models/User.js';

export const seedDatabase = async () => {
  try {
    const adminEmail = "admin@bkuc.edu.pk";
    const facultyEmail = "sarah.chen@university.edu";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcrypt.hash("bkuc123", 10);
      await User.create({
        full_name: "System Admin",
        email: adminEmail,
        password: hashedAdminPassword,
        role: "admin"
      });
      console.log("Admin account created.");
    }

    const existingFaculty = await User.findOne({ email: facultyEmail });
    if (!existingFaculty) {
      const hashedFacultyPassword = await bcrypt.hash("DemoFaculty2026!", 10);
      await User.create({
        full_name: "Dr. Sarah Chen",
        email: facultyEmail,
        password: hashedFacultyPassword,
        role: "faculty",
        department: "Computer Science"
      });
      console.log("Faculty account created.");
    }

    return true;
  } catch (error) {
    console.error("Seed error:", error);
    throw error;
  }
};