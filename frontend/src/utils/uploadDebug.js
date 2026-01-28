// src/utils/uploadDebug.js
export function debugFormData(formData) {
  console.log('📁 FormData Contents:')
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`)
    } else {
      console.log(`  ${key}: ${value}`)
    }
  }
}

export function testBackendUpload() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  
  // Create a test file
  const testBlob = new Blob(['Test PDF content'], { type: 'application/pdf' })
  const testFile = new File([testBlob], 'test.pdf', { type: 'application/pdf' })
  
  const formData = new FormData()
  formData.append('title', 'Test Upload')
  formData.append('course', 'Pharmacology')
  formData.append('level', '300')
  formData.append('semester', '1st')
  formData.append('academicYear', '2023/2024')
  formData.append('description', 'Test upload from frontend')
  formData.append('file', testFile)
  
  debugFormData(formData)
  
  // Test upload
  return fetch(`${baseURL}/past-questions`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
    }
  })
  .then(response => {
    console.log('Test upload response:', response.status, response.statusText)
    return response.json()
  })
  .then(data => {
    console.log('Test upload data:', data)
    return data
  })
  .catch(error => {
    console.error('Test upload error:', error)
    throw error
  })
}