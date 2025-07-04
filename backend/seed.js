require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const User = require('./src/modules/User/User.js'); 

const seedManager = {
  name: "Zubair Manager",
  email: "manager@test.com",
  password: "manager123", 
  role: "MANAGER",
  seniority: "senior",
  skills: ["management"],
  maxCapacity: 100
};

const seedEngineers = [
  {
    name: "Senior Engineer",
    email: "senior@test.com",
    password: "engineer123", 
    role: "ENGINEER",
    seniority: "senior",
    skills: ["node", "react"],
    maxCapacity: 90
  },
  {
    name: "Junior Engineer",
    email: "junior@test.com",
    password: "engineer123", 
    role: "ENGINEER",
    seniority: "junior",
    skills: ["javascript"],
    maxCapacity: 70
  }
];

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URL) {
      console.error('❌ MONGODB_URL not found in .env file.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

  
    const createdManager = await User.create(seedManager);
    console.log(`👔 Created manager: ${createdManager.email}`);

    
    await User.create(seedEngineers);
    console.log(`👷 Created ${seedEngineers.length} engineers`);

    console.log('✅ Database seeding complete!');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seedDatabase();

