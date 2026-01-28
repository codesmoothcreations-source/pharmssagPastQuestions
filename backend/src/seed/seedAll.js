import { config } from 'dotenv';
config();

console.log('🚀 Starting PHAMSAG database seeding...');
console.log('═══════════════════════════════════════\n');

try {
    // Run admin seed first
    console.log('1. Seeding admin user...');
    const seedAdmin = await import('./seedAdmin.js');
    await seedAdmin.default();
    
    console.log('\n2. Seeding courses...');
    const seedCourses = await import('./seedCourses.js');
    await seedCourses.default();
    
    console.log('\n🎉 All seeding completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('📊 Database now contains:');
    console.log('   👑 1 Admin user');
    console.log('   📚 25 Courses');
    console.log('   👥 3 Test users (in development)');
    console.log('\n✅ Ready to use PHAMSAG! 🚀');
    
} catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
}