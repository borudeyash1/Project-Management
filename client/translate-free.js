const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

// Configuration
const SOURCE_FILE = path.join(__dirname, 'src', 'locales', 'ja.json');
const LOCALES_DIR = path.join(__dirname, 'src', 'locales');

// Language mappings for translation
const LANGUAGES = {
  ko: { name: 'Korean', code: 'ko' },
  mr: { name: 'Marathi', code: 'mr' },
  hi: { name: 'Hindi', code: 'hi' },
  fr: { name: 'French', code: 'fr' },
  de: { name: 'German', code: 'de' },
  es: { name: 'Spanish', code: 'es' },
  pt: { name: 'Portuguese', code: 'pt' },
  da: { name: 'Danish', code: 'da' },
  nl: { name: 'Dutch', code: 'nl' },
  fi: { name: 'Finnish', code: 'fi' },
  no: { name: 'Norwegian', code: 'no' },
  sv: { name: 'Swedish', code: 'sv' }
};

// Delay function to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Recursively translate object values from Japanese
async function translateObject(obj, targetLang, path = '', stats = { total: 0, done: 0 }) {
  const result = {};
  const entries = Object.entries(obj);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively translate nested objects
      result[key] = await translateObject(value, targetLang, currentPath, stats);
    } else if (typeof value === 'string') {
      try {
        stats.total++;
        
        // Translate from Japanese to target language
        const res = await translate(value, { from: 'ja', to: targetLang });
        result[key] = res.text;
        
        stats.done++;
        
        // Show progress every 50 translations
        if (stats.done % 50 === 0) {
          const percentage = ((stats.done / stats.total) * 100).toFixed(1);
          console.log(`  Progress: ${stats.done}/${stats.total} (${percentage}%)`);
        }
        
        // Add delay to avoid rate limiting
        await delay(200); // 200ms delay between requests
      } catch (error) {
        console.error(`  Error translating "${currentPath}": ${error.message}`);
        result[key] = value; // Keep original Japanese on error
        await delay(1000); // Longer delay on error
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
  console.log(`Starting translation: Japanese → ${langName} (${targetLang})`);
  console.log('='.repeat(60));
  
  try {
    // Read source file (Japanese)
    const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');
    const sourceJson = JSON.parse(sourceContent);
    
    console.log(`✓ Loaded source file: ${SOURCE_FILE}`);
    
    // Count total strings
    const countStrings = (obj) => {
      let count = 0;
      for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
          count += countStrings(value);
        } else if (typeof value === 'string') {
          count++;
        }
      }
      return count;
    };
    
    const totalStrings = countStrings(sourceJson);
    console.log(`  Total strings to translate: ${totalStrings}`);
    console.log(`  Estimated time: ${Math.ceil((totalStrings * 0.2) / 60)} minutes\n`);
    
    // Translate the entire object
    const stats = { total: 0, done: 0 };
    const translatedJson = await translateObject(sourceJson, targetLang, '', stats);
    
    // Write translated file
    const targetFile = path.join(LOCALES_DIR, `${targetLang}.json`);
    fs.writeFileSync(
      targetFile,
      JSON.stringify(translatedJson, null, 2),
      'utf8'
    );
    
    console.log(`\n✓ Translation complete!`);
    console.log(`  Translated: ${stats.done}/${stats.total} strings`);
    console.log(`  Output file: ${targetFile}`);
    
    return { success: true, translated: stats.done, total: stats.total };
  } catch (error) {
    console.error(`✗ Error translating ${langName}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🌍 FREE Auto-Translation Script (Japanese → All Languages)');
  console.log('='.repeat(60));
  console.log('\nUsing: @vitalets/google-translate-api (FREE, no API key needed)');
  
  // Check source file exists
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`\n❌ ERROR: Source file not found: ${SOURCE_FILE}`);
    console.error('Make sure ja.json exists with complete translations.');
    process.exit(1);
  }
  
  console.log(`\nSource file: ${SOURCE_FILE}`);
  console.log(`Target directory: ${LOCALES_DIR}`);
  console.log(`Languages to translate: ${Object.keys(LANGUAGES).length}`);
  console.log('\nLanguages:');
  Object.entries(LANGUAGES).forEach(([code, info]) => {
    console.log(`  - ${info.name} (${code})`);
  });
  
  console.log('\n⚠️  This will overwrite existing translation files!');
  console.log('⏱️  Estimated total time: ~2-3 hours for all languages');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  await delay(5000);
  
  // Translate each language
  const results = [];
  const startTime = Date.now();
  
  for (const [langCode, langInfo] of Object.entries(LANGUAGES)) {
    const result = await translateLanguageFile(langCode, langInfo.name);
    results.push({ code: langCode, name: langInfo.name, ...result });
    
    // Add delay between languages
    if (langCode !== 'sv') {
      console.log('\n⏸️  Waiting 10 seconds before next language...');
      await delay(10000);
    }
  }
  
  const endTime = Date.now();
  const totalTime = Math.ceil((endTime - startTime) / 1000 / 60);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Translation Summary');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✓ Successful: ${successful}/${results.length}`);
  console.log(`⏱️  Total time: ${totalTime} minutes`);
  
  if (failed > 0) {
    console.log(`✗ Failed: ${failed}/${results.length}`);
    console.log('\nFailed languages:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name} (${r.code}): ${r.error}`);
    });
  }
  
  console.log('\n✅ Translation process complete!\n');
  console.log('📝 Next steps:');
  console.log('  1. Restart your dev server (npm start)');
  console.log('  2. Test language switching');
  console.log('  3. Review translations for accuracy\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
