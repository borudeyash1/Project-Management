

const apiKey = "AIzaSyBbTfMFRonuq9EWfdCl10F1TQYHKdT3jHI";

if (!apiKey) {
  console.error('GEMINI_API_KEY not found');
  process.exit(1);
}

async function listModels() {
  try {
    console.log('Fetching available models...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} ${response.statusText}`);
      console.error(errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! Available models:');
    const models = data.models;
    let output = 'Available models:\n';
    models.forEach(model => {
      if (model.supportedGenerationMethods.includes('generateContent')) {
        const line = `- ${model.name} (Version: ${model.version})`;
        console.log(line);
        output += line + '\n';
      }
    });
    const fs = require('fs');
    fs.writeFileSync('models.txt', output);
  } catch (error) {
    console.error('Error fetching models:', error.message);
  }
}

listModels();

