const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Club = require('./models/Club');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fixUser = async () => {
    await connectDB();

    const userId = "698b17efb091e38ebdf99f64";
    const clubId = "698d9aa60998c21ce6e8e084"; // ACM club

    const user = await User.findById(userId);
    if (user) {
        user.clubId = clubId;
        await user.save();
        console.log(`Updated user ${user.name} with clubId ${clubId}`);
    } else {
        console.log('User not found');
    }

    process.exit();
};

fixUser();
