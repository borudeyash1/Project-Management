console.log('🧪 Testing Razorpay Payment Integration...\n');

// Test 1: Check if server is running
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Server is running:', data);
    
    // Test 2: Check payment endpoint (will fail with 401 - expected)
    return fetch('http://localhost:5000/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planKey: 'pro',
        billingCycle: 'monthly'
      })
    });
  })
  .then(res => {
    console.log('📡 Payment endpoint status:', res.status, res.statusText);
    return res.json();
  })
  .then(data => {
    console.log('📦 Payment endpoint response:', data);
    if (data.message === 'User not authenticated') {
      console.log('✅ Payment endpoint is working! (401 Unauthorized is expected without auth token)');
    }
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
