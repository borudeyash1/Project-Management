
const articles = const getMockDocumentation = (): DocArticle[] => {
    return ;

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
