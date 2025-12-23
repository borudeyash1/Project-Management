/**
 * Test script for DeepSeek Meeting Notes API
 * Run with: ts-node src/scripts/test-deepseek-meeting.ts
 */

// Load environment variables FIRST before any imports
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Now import the service after env is loaded
import deepSeekMeetingService from '../services/deepseek-meeting';

const testTranscript = `
Meeting started at 10 AM with the product team.

John opened the discussion about the new project timeline. He mentioned that we're behind schedule 
and need to accelerate development. The team agreed to add two more developers to the project.

Sarah brought up the API documentation issue. She emphasized that we absolutely must complete 
the API documentation by Friday, as the external partners are waiting for it. This is critical.

The team had a long discussion about the frontend framework. After considering Vue and Angular, 
the team unanimously decided to use React for the frontend development due to better community 
support and team expertise.

Mike volunteered to review the design mockups. He committed to completing the review by Wednesday 
and providing detailed feedback to the design team.

The most urgent issue discussed was the login bug that's affecting production users. John assigned 
this as the highest priority task and asked the backend team to fix it immediately.

The meeting concluded at 11:30 AM with clear action items and deadlines.
`;

async function testMeetingNotes() {
    console.log('\n🧪 Testing DeepSeek Meeting Notes Service...\n');
    console.log('API Key configured:', !!process.env.DEEPSEEK_API_KEY);
    console.log('API Key (first 10 chars):', process.env.DEEPSEEK_API_KEY?.substring(0, 10) + '...');

    try {
        console.log('\n📝 Processing transcript...\n');
        const result = await deepSeekMeetingService.processMeetingTranscript(testTranscript);

        if ('error' in result) {
            console.error('❌ Error:', result.error);
            process.exit(1);
        }

        console.log('✅ Success! Meeting analysis completed:\n');
        console.log('📋 Summary:');
        console.log(result.summary);
        console.log('\n📌 Agenda Items:');
        result.agendaItems.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
        console.log('\n✔️  Decisions Made:');
        result.decisions.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
        console.log('\n⚡ Action Items:');
        result.actionItems.forEach((item, i) => {
            console.log(`  ${i + 1}. [${item.priority}] ${item.task}`);
            console.log(`     👤 Assignee: ${item.assignee}`);
        });

        console.log('\n✨ DeepSeek V3 is working correctly!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testMeetingNotes();
