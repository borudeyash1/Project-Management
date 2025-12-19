import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import { getBlogPost, getRecentPosts } from '../data/blogData';
import ReactMarkdown from 'react-markdown';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = id ? getBlogPost(id) : undefined;
  const recentPosts = getRecentPosts(3).filter(p => p.id !== id);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SharedNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#006397] text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
        <SharedFooter />
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareTitle = post.title;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SharedNavbar />
      
      {/* Hero Section */}
      <article className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#006397] font-semibold hover:gap-3 transition-all mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-4 py-2 text-gray-900 text-sm font-semibold rounded-full" style={{ backgroundColor: '#FFC700' }}>
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-4 pb-8 border-b border-gray-200 mb-8">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <div className="font-bold text-gray-900 text-lg">{post.author.name}</div>
              <div className="text-gray-600">{post.author.role}</div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl overflow-hidden mb-12">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                a: ({ node, ...props }) => <a className="text-[#006397] hover:underline" {...props} />,
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-[#006397] pl-4 italic text-gray-600 my-4" {...props} />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Share Section */}
          <div className="border-t border-b border-gray-200 py-6 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <Share2 className="w-5 h-5" />
                <span>Share this article</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-[#006397] to-purple-600 rounded-2xl p-8 text-white text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6">
              Experience the power of Sartthi's project management platform.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-[#006397] rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {recentPosts.length > 0 && (
          <div className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {recentPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-gray-900 text-xs font-semibold rounded-full" style={{ backgroundColor: '#FFC700' }}>
                          {relatedPost.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>{relatedPost.date}</span>
                        <span>•</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#006397] transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>

      <SharedFooter />
    </div>
  );
};

export default BlogPost;
