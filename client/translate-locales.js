const fs = require('fs');
const path = require('path');
const { Translate } = require('@google-cloud/translate').v2;

// Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || 'YOUR_API_KEY_HERE';
const SOURCE_FILE = path.join(__dirname, 'src', 'locales', 'en.json');
const LOCALES_DIR = path.join(__dirname, 'src', 'locales');

// Language mappings (ISO 639-1 codes)
const LANGUAGES = {
  ko: 'Korean',
  mr: 'Marathi',
  hi: 'Hindi',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese',
  da: 'Danish',
  nl: 'Dutch',
  fi: 'Finnish',
  no: 'Norwegian',
  sv: 'Swedish'
};

// Initialize Google Translate
const translate = new Translate({ key: GOOGLE_API_KEY });

// Delay function to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Recursively translate object values
async function translateObject(obj, targetLang, path = '') {
  const result = {};
  const entries = Object.entries(obj);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively translate nested objects
      console.log(`  Translating section: ${currentPath}`);
      result[key] = await translateObject(value, targetLang, currentPath);
    } else if (typeof value === 'string') {
      try {
        // Translate the string
        const [translation] = await translate.translate(value, targetLang);
        result[key] = translation;
        
        // Add small delay to avoid rate limiting (adjust as needed)
        await delay(100);
      } catch (error) {
        console.error(`  Error translating "${currentPath}": ${error.message}`);
        result[key] = value; // Keep original on error
      }
    } else {
      // Keep non-string values as-is
      result[key] = value;
    }
  }
  
  return result;
}

// Main translation function
async function translateLanguageFile(targetLang, langName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Starting translation for ${langName} (${targetLang})`);
  console.log('='.repeat(60));
  
  try {
    // Read source file
    const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');
    const sourceJson = JSON.parse(sourceContent);
    
    console.log(`✓ Loaded source file: ${SOURCE_FILE}`);
    console.log(`  Total keys to translate: ${JSON.stringify(sourceJson).match(/":"/g)?.length || 0}`);
    
    // Translate the entire object
    const translatedJson = await translateObject(sourceJson, targetLang);
    
    // Write translated file
    const targetFile = path.join(LOCALES_DIR, `${targetLang}.json`);
    fs.writeFileSync(
      targetFile,
      JSON.stringify(translatedJson, null, 2),
      'utf8'
    );
    
    console.log(`✓ Translation complete!`);
    console.log(`  Output file: ${targetFile}`);
    
    return true;
  } catch (error) {
    console.error(`✗ Error translating ${langName}:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🌍 Automatic Translation Script for Multilingual Support');
  console.log('='.repeat(60));
  
  // Check API key
  if (GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('\n❌ ERROR: Google Translate API key not configured!');
    console.error('\nPlease set your API key in one of these ways:');
    console.error('1. Set environment variable: GOOGLE_TRANSLATE_API_KEY=your_key_here');
    console.error('2. Edit this script and replace YOUR_API_KEY_HERE with your actual key');
    console.error('\nGet your API key from: https://cloud.google.com/translate/docs/setup');
    process.exit(1);
  }
  
  // Check source file exists
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`\n❌ ERROR: Source file not found: ${SOURCE_FILE}`);
    process.exit(1);
  }
  
  console.log(`\nSource file: ${SOURCE_FILE}`);
  console.log(`Target directory: ${LOCALES_DIR}`);
  console.log(`Languages to translate: ${Object.keys(LANGUAGES).length}`);
  console.log('\nLanguages:');
  Object.entries(LANGUAGES).forEach(([code, name]) => {
    console.log(`  - ${name} (${code})`);
  });
  
  // Confirm before starting
  console.log('\n⚠️  This will overwrite existing translation files!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  await delay(5000);
  
  // Translate each language
  const results = [];
  for (const [langCode, langName] of Object.entries(LANGUAGES)) {
    const success = await translateLanguageFile(langCode, langName);
    results.push({ code: langCode, name: langName, success });
    
    // Add delay between languages to avoid rate limiting
    if (langCode !== 'sv') { // Don't delay after last language
      console.log('\nWaiting 2 seconds before next language...');
      await delay(2000);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Translation Summary');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✓ Successful: ${successful}/${results.length}`);
  if (failed > 0) {
    console.log(`✗ Failed: ${failed}/${results.length}`);
    console.log('\nFailed languages:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name} (${r.code})`);
    });
  }
  
  console.log('\n✅ Translation process complete!\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
