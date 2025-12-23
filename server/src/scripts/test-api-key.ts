/**
 * Simple test to check DeepSeek API key validity
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const apiKey = process.env.DEEPSEEK_API_KEY;

console.log('🔑 Testing DeepSeek API Key...\n');
console.log('API Key (first 15 chars):', apiKey?.substring(0, 15) + '...');
console.log('API Key length:', apiKey?.length);

async function testAPI() {
    try {
        const response = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: 'Say "Hello, I am DeepSeek V3!" if you can read this.',
                    },
                ],
                max_tokens: 50,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                timeout: 30000,
            }
        );

        console.log('\n✅ API Key is VALID!');
        console.log('Response:', response.data.choices[0].message.content);
        console.log('\n✨ DeepSeek V3 is working correctly!\n');
    } catch (error: any) {
        console.log('\n❌ API Key test FAILED!\n');

        if (error.response) {
            console.log('Status Code:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 401) {
                console.log('\n💡 The API key is invalid or unauthorized.');
            } else if (error.response.status === 402) {
                console.log('\n💡 Payment required - the API key may not have credits or is not activated.');
            } else if (error.response.status === 429) {
                console.log('\n💡 Rate limit exceeded.');
            }
        } else {
            console.log('Error:', error.message);
        }
    }
}

testAPI();
