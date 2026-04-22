const mongoose = require('mongoose');
const User = require('./backend/models/User.model');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

async function testLogin() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'admin@stjude.com';
  const password = 'Test@1234';
  
  const user = await User.findOne({ email }).select('+password');
  console.log('User found:', user ? user.email : 'No user found');
  if (user) {
    console.log('Hashed Password in DB:', user.password);
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);
  }
  process.exit(0);
}
testLogin().catch(console.error);
