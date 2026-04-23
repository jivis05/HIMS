const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://hims_user:hiJIVat26@cluster0.mxadwwa.mongodb.net/?appName=Cluster0';

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    const email = 'anish@hims.com';
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log('DB Hash:', user.password);
    
    // Test match
    const isMatch = await bcrypt.compare('dca@1234', user.password);
    console.log('Direct bcrypt.compare("dca@1234", hash):', isMatch);
    
    // Also check if matchPassword method works
    const methodMatch = await user.matchPassword('dca@1234');
    console.log('user.matchPassword("dca@1234"):', methodMatch);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verify();
