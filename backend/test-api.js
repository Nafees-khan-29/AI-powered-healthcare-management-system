// Test the check-role API endpoint
async function testAPI() {
  try {
    console.log('\n🧪 Testing check-role API endpoint');
    console.log('=' .repeat(60));
    
    const response = await fetch('http://localhost:3000/api/auth/check-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'michael.chen@healthcare.com' }),
    });

    console.log('\n📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);

    const data = await response.json();
    console.log('\n📥 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.user.role === 'doctor') {
      console.log('\n✅ API is working correctly!');
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Name: ${data.user.name}`);
      console.log(`   Specialization: ${data.user.specialization}`);
    } else {
      console.log('\n❌ API returned unexpected data');
    }

    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message);
  }
}

testAPI();
