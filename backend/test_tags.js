const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
let authToken = '';

// Test data
const testTags = [
  {
    name: 'javascript',
    color: '#F59E0B',
    description: 'JavaScript related content',
    isDefault: false,
    isPublic: false,
    autoSuggest: true,
    aiKeywords: ['js', 'javascript', 'frontend']
  },
  {
    name: 'react',
    color: '#61DAFB',
    description: 'React framework content',
    isDefault: false,
    isPublic: true,
    autoSuggest: true,
    aiKeywords: ['react', 'frontend', 'ui']
  },
  {
    name: 'work',
    color: '#3B82F6',
    description: 'Work-related content',
    isDefault: true,
    isPublic: false,
    autoSuggest: false,
    aiKeywords: ['work', 'job', 'career']
  }
];

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    authToken = response.data.token;
    console.log('✅ Login successful');
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testCreateTags() {
  console.log('\n🧪 Testing tag creation...');
  
  for (const tagData of testTags) {
    try {
      const response = await axios.post(`${API_URL}/tags/create`, tagData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Created tag: ${response.data.tag.name}`);
    } catch (error) {
      console.error(`❌ Failed to create tag ${tagData.name}:`, error.response?.data || error.message);
    }
  }
}

async function testGetTags() {
  console.log('\n🧪 Testing tag retrieval...');
  
  try {
    const response = await axios.get(`${API_URL}/tags`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 10 }
    });
    console.log(`✅ Retrieved ${response.data.data.tags.length} tags`);
    console.log('Tags:', response.data.data.tags.map(t => t.name));
  } catch (error) {
    console.error('❌ Failed to get tags:', error.response?.data || error.message);
  }
}

async function testTagSuggestions() {
  console.log('\n🧪 Testing tag suggestions...');
  
  try {
    const response = await axios.get(`${API_URL}/tags/suggestions`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { query: 'js', limit: 5 }
    });
    console.log(`✅ Retrieved ${response.data.suggestions.length} suggestions`);
    console.log('Suggestions:', response.data.suggestions.map(s => s.name));
  } catch (error) {
    console.error('❌ Failed to get tag suggestions:', error.response?.data || error.message);
  }
}

async function testUpdateTag() {
  console.log('\n🧪 Testing tag update...');
  
  try {
    // First get a tag to update
    const getResponse = await axios.get(`${API_URL}/tags`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 1 }
    });
    
    if (getResponse.data.data.tags.length > 0) {
      const tag = getResponse.data.data.tags[0];
      const updateData = {
        description: 'Updated description for testing',
        color: '#EF4444'
      };
      
      const response = await axios.put(`${API_URL}/tags/${tag._id}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Updated tag: ${response.data.tag.name}`);
    }
  } catch (error) {
    console.error('❌ Failed to update tag:', error.response?.data || error.message);
  }
}

async function testSearchAndFilter() {
  console.log('\n🧪 Testing search and filtering...');
  
  try {
    // Test search
    const searchResponse = await axios.get(`${API_URL}/tags`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { search: 'javascript', limit: 5 }
    });
    console.log(`✅ Search found ${searchResponse.data.data.tags.length} tags`);
    
    // Test filtering by default
    const filterResponse = await axios.get(`${API_URL}/tags`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { isDefault: true, limit: 5 }
    });
    console.log(`✅ Default filter found ${filterResponse.data.data.tags.length} tags`);
    
    // Test sorting
    const sortResponse = await axios.get(`${API_URL}/tags`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { sortBy: 'name', sortOrder: 'asc', limit: 5 }
    });
    console.log(`✅ Sorted tags: ${sortResponse.data.data.tags.map(t => t.name).join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to test search and filtering:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Tag Management API Tests\n');
  
  await login();
  await testCreateTags();
  await testGetTags();
  await testTagSuggestions();
  await testUpdateTag();
  await testSearchAndFilter();
  
  console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
