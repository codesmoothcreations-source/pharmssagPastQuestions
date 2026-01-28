import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

// Import models using relative path
const Course = (await import('../models/course.model.js')).default;
const User = (await import('../models/user.model.js')).default;

const coursesData = [
    // LEVEL 100 — 1ST SEMESTER
    { code: 'ASTU1001', name: 'African Studies', level: 100, semester: '1st' },
    { code: 'COMP1001', name: 'Computer Literacy', level: 100, semester: '1st' },
    { code: 'COMM1001', name: 'Communication Skills I', level: 100, semester: '1st' },
    { code: 'DISP1001', name: 'Dispensing Techniques I', level: 100, semester: '1st' },
    { code: 'DISPP1001', name: 'Dispensing Techniques Practicals I', level: 100, semester: '1st' },
    { code: 'CHEM1001', name: 'Chemistry I', level: 100, semester: '1st' },
    { code: 'CHEMP1001', name: 'Chemistry Practicals I', level: 100, semester: '1st' },
    { code: 'PHYS1001', name: 'Physiology I', level: 100, semester: '1st' },
    { code: 'FAID1001', name: 'First Aid', level: 100, semester: '1st' },
    { code: 'HOSP1001', name: 'Hospital Practice I', level: 100, semester: '1st' },

    // LEVEL 100 — 2ND SEMESTER
    { code: 'DISP1002', name: 'Dispensing Techniques II', level: 100, semester: '2nd' },
    { code: 'DISPP1002', name: 'Dispensing Techniques Practicals II', level: 100, semester: '2nd' },
    { code: 'CHEM1002', name: 'Chemistry II', level: 100, semester: '2nd' },
    { code: 'CHEMP1002', name: 'Chemistry Practicals II', level: 100, semester: '2nd' },
    { code: 'PHYS1002', name: 'Physiology II', level: 100, semester: '2nd' },
    { code: 'HOSP1002', name: 'Hospital Practice II', level: 100, semester: '2nd' },
    { code: 'COMM1002', name: 'Communication Skills II', level: 100, semester: '2nd' },
    { code: 'ASTU1002', name: 'African Studies', level: 100, semester: '2nd' },

    // LEVEL 200 — 1ST SEMESTER
    { code: 'BPM2001', name: 'Basic Pharmaceutical Microbiology', level: 200, semester: '1st' },
    { code: 'BPMP2001', name: 'Basic Pharmaceutical Microbiology Practicals', level: 200, semester: '1st' },
    { code: 'THER2001', name: 'Therapeutics I', level: 200, semester: '1st' },
    { code: 'BMGT2001', name: 'Basic Management', level: 200, semester: '1st' },
    { code: 'PCHEM2001', name: 'Physical Chemistry', level: 200, semester: '1st' },
    { code: 'PCHEMP2001', name: 'Physical Chemistry Practicals', level: 200, semester: '1st' },
    { code: 'HOSP2001', name: 'Hospital Practice III', level: 200, semester: '1st' },

    // LEVEL 200 — 2ND SEMESTER
    { code: 'QCIT2002', name: 'Quality Control and Instrumentation Technology I', level: 200, semester: '2nd' },
    { code: 'QCITP2002', name: 'Quality Control and Instrumentation Technology Practicals I', level: 200, semester: '2nd' },
    { code: 'STOK2002', name: 'Store Keeping', level: 200, semester: '2nd' },
    { code: 'OCHEM2002', name: 'Organic Chemistry IV', level: 200, semester: '2nd' },
    { code: 'OCHEMP2002', name: 'Organic Chemistry Practicals IV', level: 200, semester: '2nd' },
    { code: 'THER2002', name: 'Therapeutics II', level: 200, semester: '2nd' },
    { code: 'RESM2002', name: 'Research Methodology', level: 200, semester: '2nd' },
    { code: 'STAT2002', name: 'Statistics', level: 200, semester: '2nd' }
];

const seedCourses = async () => {
    try {
        console.log('🌱 Starting course seeding...');
        
        // Load environment variables
        const { config } = await import('dotenv');
        config();
        
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phamsag';
        
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Connect to MongoDB
        console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI.split('@')[1] || MONGODB_URI}`);
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        console.log('✅ Connected to MongoDB');

        // Clear existing courses
        console.log('🧹 Clearing existing courses...');
        await Course.deleteMany({});
        console.log('✅ Cleared existing courses');

        // Find or create admin user
        console.log('👤 Looking for admin user...');
        let admin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@phamsag.edu' });
        
        if (!admin) {
            console.log('⚠️ Admin user not found. Creating one...');
            
            // Create admin user if doesn't exist
            admin = await User.create({
                name: process.env.ADMIN_NAME || 'System Administrator',
                email: process.env.ADMIN_EMAIL || 'admin@phamsag.edu',
                password: process.env.ADMIN_PASSWORD || 'Admin@123',
                role: 'ADMIN',
                isActive: true
            });
            
            console.log(`✅ Admin user created: ${admin.email}`);
        } else {
            console.log(`✅ Admin user found: ${admin.email}`);
        }

        // Add createdBy to courses
        console.log('📝 Preparing courses data...');
        const coursesWithAdmin = coursesData.map(course => ({
            code: course.code,
            name: course.name,
            level: course.level,
            semester: course.semester,
            createdBy: admin._id,
            description: `${course.name} - Pharmacy ${course.level} Level, ${course.semester} Semester`,
            credits: course.name.includes('Practicals') ? 2 : 3,
            isActive: true
        }));

        // Insert courses
        console.log('📥 Inserting courses into database...');
        const result = await Course.insertMany(coursesWithAdmin);
        
        console.log(`\n🎉 Successfully seeded ${result.length} courses!`);
        
        // Display summary
        const summary = {};
        coursesData.forEach(course => {
            if (!summary[course.level]) {
                summary[course.level] = {};
            }
            if (!summary[course.level][course.semester]) {
                summary[course.level][course.semester] = 0;
            }
            summary[course.level][course.semester]++;
        });

        console.log('\n📊 Seeding Summary:');
        console.log('═══════════════════');
        for (const level in summary) {
            console.log(`\nLevel ${level}:`);
            for (const semester in summary[level]) {
                console.log(`  ${semester} Semester: ${summary[level][semester]} courses`);
            }
        }
        console.log(`\n📚 Total: ${result.length} courses seeded`);
        console.log('\n✅ Course seeding completed successfully!');

        // Disconnect
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Run if called directly
if (process.argv[1].includes('seedCourses.js')) {
    seedCourses().catch(console.error);
}

export default seedCourses;