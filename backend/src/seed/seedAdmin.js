import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
config();

// Import User model
const User = (await import('../models/user.model.js')).default;

const seedAdmin = async () => {
    try {
        console.log('👑 Starting admin user seeding...');
        
        // Load environment variables
        const { config } = await import('dotenv');
        config();
        
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phamsag';
        
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Connect to MongoDB
        console.log(`🔗 Connecting to MongoDB...`);
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        console.log('✅ Connected to MongoDB');

        // Admin credentials from environment or defaults
        const adminData = {
            name: process.env.ADMIN_NAME || 'System Administrator',
            email: process.env.ADMIN_EMAIL || 'admin@phamsag.edu',
            password: process.env.ADMIN_PASSWORD || 'Admin@123',
            role: 'ADMIN',
            isActive: true
        };

        // Check if admin already exists
        console.log('🔍 Checking for existing admin user...');
        const existingAdmin = await User.findOne({ 
            email: adminData.email,
            role: 'ADMIN' 
        });

        if (existingAdmin) {
            console.log(`✅ Admin user already exists: ${existingAdmin.email}`);
            
            // Update password if env variable is different
            if (adminData.password !== 'Admin@123') {
                console.log('🔄 Updating admin password...');
                existingAdmin.password = adminData.password;
                await existingAdmin.save();
                console.log('✅ Admin password updated');
            }
            
            await mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB');
            return;
        }

        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await User.create(adminData);
        
        console.log('\n🎉 Admin user created successfully!');
        console.log('═══════════════════════════════');
        console.log(`📧 Email: ${admin.email}`);
        console.log(`🔑 Password: ${adminData.password}`);
        console.log(`👤 Name: ${admin.name}`);
        console.log(`🎯 Role: ${admin.role}`);
        console.log('═══════════════════════════════');
        console.log('\n⚠️  IMPORTANT: Change these credentials in production!');

        // Create test users for development
        if (process.env.NODE_ENV === 'development') {
            console.log('\n👥 Creating test users...');
            
            const testUsers = [
                {
                    name: 'John Doe',
                    email: 'john@phamsag.edu',
                    password: 'Student@123',
                    role: 'USER'
                },
                {
                    name: 'Jane Smith',
                    email: 'jane@phamsag.edu',
                    password: 'Student@123',
                    role: 'USER'
                },
                {
                    name: 'Dr. Pharmacy',
                    email: 'pharmacist@phamsag.edu',
                    password: 'Pharmacy@123',
                    role: 'USER'
                }
            ];

            let createdCount = 0;
            for (const userData of testUsers) {
                const existingUser = await User.findOne({ email: userData.email });
                if (!existingUser) {
                    await User.create(userData);
                    console.log(`✅ Test user created: ${userData.email}`);
                    createdCount++;
                } else {
                    console.log(`⏭️  Test user already exists: ${userData.email}`);
                }
            }
            
            if (createdCount > 0) {
                console.log(`\n✅ Created ${createdCount} test users`);
            }
        }

        // Disconnect
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        console.log('✅ Admin seeding completed successfully!');

    } catch (error) {
        console.error('\n❌ Admin seeding failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Run if called directly
if (process.argv[1].includes('seedAdmin.js')) {
    seedAdmin().catch(console.error);
}

export default seedAdmin;