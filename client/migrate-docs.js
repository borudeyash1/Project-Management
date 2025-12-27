const fs = require('fs');
const path = require('path');

// Read the Docs.tsx file
const docsFile = fs.readFileSync(
  path.join(__dirname, 'src/components/Docs.tsx'),
  'utf-8'
);

// Extract the getMockDocumentation function content
const functionStart = docsFile.indexOf('const getMockDocumentation = (): DocArticle[] => {');
const functionEnd = docsFile.indexOf('};', functionStart) + 2;
const functionContent = docsFile.substring(functionStart, functionEnd);

// Extract the return array
const arrayStart = functionContent.indexOf('return [');
const arrayEnd = functionContent.lastIndexOf('];');
const arrayContent = functionContent.substring(arrayStart + 7, arrayEnd + 1);

// Write to a temporary file for processing
const tempFile = path.join(__dirname, 'temp-docs-data.js');
fs.writeFileSync(tempFile, `
const articles = ${arrayContent};

// Convert to API format
const apiArticles = articles.map(article => ({
  title: article.title,
  slug: article.slug,
  content: article.content,
  category: article.category,
  subcategory: article.subcategory,
  videoUrl: article.videoUrl,
  order: article.order,
  isPublished: article.isPublished
}));

console.log(JSON.stringify(apiArticles, null, 2));
`);

console.log('✅ Temporary file created: temp-docs-data.js');
console.log('📝 Run: node temp-docs-data.js > docs-articles.json');
console.log('🚀 Then use the JSON file to import into database');
