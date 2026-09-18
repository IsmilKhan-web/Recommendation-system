 import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; // Apne User model ka sahi path check kar lein

export const seedDatabase = async () => {
  try {
    const adminEmail = "admin@bkuc.edu.pk";
    const facultyEmail = "sarah.chen@university.edu";

    // Pehle check karein ke accounts pehle se toh nahi bane hue
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcrypt.hash("bkuc123", 10);
      await User.create({
        name: "System Admin",
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
        name: "Dr. Sarah Chen",
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