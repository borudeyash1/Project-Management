const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        const uri = "mongodb+srv://borudeyash1:%40Tatya24%40@cluster0.rx04y6n.mongodb.net/Project_management";
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    try {
        // Define minimal schemas to read data
        const ConnectedAccount = mongoose.model('ConnectedAccount', new mongoose.Schema({}, { strict: false }));
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        const targetUser = await User.findOne({ email: 'borudeyash12@gmail.com' });
        if (targetUser) {
            console.log('Target User Found:', targetUser.email);
            
             // Check connected accounts in User document
            console.log('User.connectedAccounts.mail:', JSON.stringify(targetUser.connectedAccounts?.['mail'], null, 2));

            const accounts = await ConnectedAccount.find({ userId: targetUser._id, service: 'mail' });
            console.log(`Found ${accounts.length} Mail ConnectedAccounts for user.`);
            console.log(JSON.stringify(accounts, null, 2));
        } else {
            console.log('User borudeyash12@gmail.com not found');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

run();
