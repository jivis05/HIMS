const mongoose = require('mongoose');
const User = require('./models/User.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://hims_user:hiJIVat26@cluster0.mxadwwa.mongodb.net/?appName=Cluster0';

async function testLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found.');
      return;
    }
    const testEmail = users[0].email;
    const testPassword = 'dca@1234';

    console.log(`Testing login for ${testEmail}...`);

    const user = await User.findOne({ email: testEmail }).select('+password');
    if (!user) {
      console.log(`User not found: ${testEmail}`);
      return;
    }

    const isMatch = await user.matchPassword(testPassword);
    console.log(`Match result for ${testPassword}: ${isMatch}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testLogin();
