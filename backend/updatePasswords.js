const mongoose = require('mongoose');
const User = require('./models/User.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://hims_user:hiJIVat26@cluster0.mxadwwa.mongodb.net/?appName=Cluster0';

async function updatePasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const users = await User.find({});
    console.log(`Found ${users.length} users. Updating passwords...`);

    let updatedCount = 0;
    for (const user of users) {
      user.password = 'dca@1234';
      await user.save();
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} users' passwords to dca@1234.`);
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

updatePasswords();
