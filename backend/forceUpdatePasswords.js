const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI  ;

async function forceUpdatePasswords() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('dca@1234', salt);
    console.log('Generated new hash for dca@1234:', hash);

    const result = await User.updateMany({}, { $set: { password: hash } });
    console.log(`Force updated ${result.modifiedCount} users directly in MongoDB bypassing hooks.`);

    // Test verify
    const anish = await User.findOne({ email: 'anish@hims.com' }).select('+password');
    if (anish) {
      const match = await bcrypt.compare('dca@1234', anish.password);
      console.log('Verify anish@hims.com match after update:', match);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

forceUpdatePasswords();
