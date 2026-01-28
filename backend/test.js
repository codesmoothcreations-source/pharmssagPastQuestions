// In Node.js REPL or add a route to 

import mongoose from 'mongoose';
import Course from './src/models/course.model.js';

async function checkCourses() {
  const courses = await Course.find({});
  console.log('Total courses in DB:', courses.length);
  courses.forEach(c => {
    console.log(`ID: ${c._id}, Name: "${c.name}", Code: "${c.code}"`);
  });
  
  // Check if the specific course exists
  const targetCourse = await Course.findById('6960c248a659216a84b50d13');
  console.log('Target course exists?', targetCourse ? 'YES' : 'NO');
}

checkCourses();