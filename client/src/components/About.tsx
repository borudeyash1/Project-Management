import React, { useState } from 'react';
import { Users, Target, Zap, Shield, Award, Brain, BarChart3, Upload, Sparkles, CheckCircle2, Clock, MessageSquare, Calendar, Bell, Folder, Play, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import MagicCard from './MagicCard';
import { BentoCard, BentoGrid } from './BentoGrid';
import Marquee from './Marquee';
import { getRecentPosts } from '../data/blogData';

const About: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const problems = [
    {
      icon: Brain,
      title: 'Scattered Information',
      description: 'Teams struggle with information spread across emails, chats, and documents, making it difficult to track project progress and maintain alignment.'
    },
    {
      icon: Zap,
      title: 'Missed Deadlines',
      description: 'Without proper task tracking and notifications, important deadlines slip through the cracks, causing delays and impacting team productivity.'
    },
    {
      icon: Shield,
      title: 'Poor Collaboration',
      description: 'Traditional tools lack real-time collaboration features, leading to miscommunication, duplicate work, and frustrated team members.'
    }
  ];

  const steps = [
    {
      icon: Upload,
      title: '1. Create Your Workspace',
      description: 'Set up your workspace in minutes and invite your team members. Customize your workflow with boards, lists, and custom fields.'
    },
    {
      icon: Zap,
      title: '2. Start Collaborating',
      description: 'Create projects, assign tasks, set deadlines, and start collaborating. Use comments, attachments, and mentions to keep everyone informed.'
    },
    {
      icon: Sparkles,
      title: '3. Track & Optimize',
      description: 'Monitor progress with real-time dashboards, generate reports, and use AI-powered insights to optimize your team\'s workflow and productivity.'
    }
  ];

  const features = [
    {
      icon: Target,
      title: 'Project Management',
      description: 'Organize and track your projects with powerful tools and intuitive interfaces that scale with your team.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time updates, comments, and file sharing capabilities.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get deep insights into your team\'s performance with customizable dashboards and detailed reports.'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Monitor time spent on tasks and projects to improve productivity and billing accuracy.'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated intelligent scheduling based on comprehensive user profiles, availability, and workload patterns.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Your data is protected with enterprise-grade security, encryption, and compliance standards.'
    },
    {
      icon: Zap,
      title: 'AI Automation',
      description: 'Integrate your own AI chatbot API and leverage AI-powered automation for smarter workflows.'
    },
    {
      icon: CheckCircle2,
      title: 'Smart Attendance',
      description: 'Face and location-based attendance tracking in workspace for accurate and secure time management.'
    },
    {
      icon: MessageSquare,
      title: 'Desktop Application',
      description: 'Access your projects with our powerful native desktop application for enhanced productivity.'
    }
  ];


  const testimonials = [
    {
      name: 'Priya Deshmukh',
      role: 'Project Manager',
      company: 'TechPro Solutions',
      image: 'https://avatar.vercel.sh/priya',
      quote: 'Sartthi has transformed how our development team manages projects. The AI-powered insights help us prioritize effectively and deliver faster. A game-changer for tech teams.'
    },
    {
      name: 'Rahul Kulkarni',
      role: 'CTO',
      company: 'InfoTech Global',
      image: 'https://avatar.vercel.sh/rahul',
      quote: 'Managing multiple campaigns became effortless with Sartthi. The real-time collaboration features keep our distributed team aligned. Seeing a 50% increase in on-time delivery!'
    },
    {
      name: 'Sneha Patil',
      role: 'Founder & CEO',
      company: 'InnovateLabs Inc',
      image: 'https://avatar.vercel.sh/sneha',
      quote: 'As a startup, we need to move fast and stay organized. Sartthi\'s intuitive interface and powerful features help us manage everything from product development to marketing. Essential tool!'
    },
    {
      name: 'Amit Joshi',
      role: 'Team Lead',
      company: 'GlobalTech Systems',
      image: 'https://avatar.vercel.sh/amit',
      quote: 'The task management features are incredible. We can now track everything in one place and our team productivity has increased by 40%.'
    },
    {
      name: 'Anjali Sharma',
      role: 'Product Manager',
      company: 'ShopHub Commerce',
      image: 'https://avatar.vercel.sh/anjali',
      quote: 'Sartthi made project planning so much easier. The dashboard gives us complete visibility into our progress and helps us stay on track.'
    },
    {
      name: 'Vikram Pawar',
      role: 'Engineering Manager',
      company: 'FoodConnect Services',
      image: 'https://avatar.vercel.sh/vikram',
      quote: 'Best project management tool we\'ve used. The collaboration features are top-notch and the interface is very user-friendly.'
    },
    {
      name: 'Pooja Naik',
      role: 'Operations Head',
      company: 'QuickServe Logistics',
      image: 'https://avatar.vercel.sh/pooja',
      quote: 'Our team loves Sartthi! It has streamlined our workflow and made communication so much better. Highly recommended!'
    },
    {
      name: 'Sanjay Bhosale',
      role: 'Director',
      company: 'TechVision Solutions',
      image: 'https://avatar.vercel.sh/sanjay',
      quote: 'The analytics and reporting features are outstanding. We can now make data-driven decisions and improve our project outcomes.'
    },
    {
      name: 'Kavita Rane',
      role: 'Scrum Master',
      company: 'Digital Dynamics Corp',
      image: 'https://avatar.vercel.sh/kavita',
      quote: 'Sartthi has become an essential part of our agile workflow. The sprint planning and tracking features are exactly what we needed.'
    },
    {
      name: 'Aditya Shinde',
      role: 'Tech Lead',
      company: 'PayFlow Technologies',
      image: 'https://avatar.vercel.sh/aditya',
      quote: 'Excellent tool for managing distributed teams. The real-time updates and notifications keep everyone in sync.'
    },
    {
      name: 'Manisha Jadhav',
      role: 'VP Engineering',
      company: 'FinTech Innovations',
      image: 'https://avatar.vercel.sh/manisha',
      quote: 'We switched to Sartthi 6 months ago and haven\'t looked back. Our project delivery time has improved significantly.'
    },
    {
      name: 'Rohan Gaikwad',
      role: 'Senior Developer',
      company: 'CloudScale Systems',
      image: 'https://avatar.vercel.sh/rohan',
      quote: 'Simple, powerful, and effective. Sartthi helps us focus on what matters - building great products.'
    }
  ];

  const faqs = [
    { question: "What is Sartthi?", answer: "Sartthi is a comprehensive project management platform designed to help teams collaborate, track progress, and deliver projects efficiently. It combines task management, team collaboration, AI-powered insights, and smart attendance in one unified platform.", category: "General" },
    { question: "Is Sartthi only for SaaS web apps?", answer: "No, Sartthi is a versatile project management platform that works for any type of project - from software development to marketing campaigns, design projects, construction, and more. It's designed to adapt to your workflow regardless of your industry.", category: "General" },
    { question: "What makes Sartthi different from other project management tools?", answer: "Sartthi stands out with its AI-powered task scheduling, smart attendance with face recognition, custom cloud storage integration, and real-time AI suggestions. We combine powerful enterprise features with an intuitive interface that teams actually enjoy using.", category: "General" },
    { question: "Do I need technical knowledge to use Sartthi?", answer: "Not at all! Sartthi is designed to be user-friendly for everyone. While we offer advanced features for technical teams, the core functionality is intuitive and easy to learn. We provide comprehensive tutorials and onboarding to help you get started.", category: "General" },
    { question: "Can I try Sartthi before purchasing?", answer: "Yes! We offer a 14-day free trial with full access to all Pro features. No credit card required. You can explore all features and decide if Sartthi is right for your team before committing.", category: "General" },
    { question: "How much does Sartthi cost?", answer: "We offer three plans: Free (perfect for small teams), Pro at $12/user/month (for growing teams), and Enterprise (custom pricing for large organizations). All plans include core features, with Pro and Enterprise adding advanced capabilities.", category: "Pricing & Plans" },
    { question: "Can I change my plan later?", answer: "Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your current billing cycle, and you won't lose any data.", category: "Pricing & Plans" },
    { question: "Do you offer discounts for annual billing?", answer: "Yes! Annual billing saves you 20% compared to monthly billing. For example, Pro plan costs $9.60/user/month when billed annually instead of $12/month. Enterprise customers can discuss custom billing arrangements.", category: "Pricing & Plans" },
    { question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through industry-standard payment processors.", category: "Pricing & Plans" },
    { question: "Is there a refund policy?", answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Sartthi within the first 30 days, contact our support team for a full refund. No questions asked.", category: "Pricing & Plans" },
    { question: "What features are included in the Free plan?", answer: "The Free plan includes up to 5 team members, 10 projects, 5GB storage, basic task management, team collaboration tools, mobile apps, and email support. It's perfect for small teams getting started with project management.", category: "Features & Functionality" },
    { question: "Can I integrate Sartthi with other tools?", answer: "Yes! Sartthi integrates with 50+ popular tools including Slack, Google Drive, GitHub, Zoom, Microsoft Teams, Jira, and more. Pro and Enterprise plans also include API access for custom integrations.", category: "Features & Functionality" },
    { question: "Does Sartthi have mobile apps?", answer: "Yes, we have native mobile apps for both iOS and Android. The mobile apps include all core features like task management, team chat, file sharing, and notifications, so you can stay productive on the go.", category: "Features & Functionality" },
    { question: "Can I customize workflows in Sartthi?", answer: "Yes! Pro and Enterprise plans include custom workflows, custom fields, and automation rules. You can create workflows that match your team's unique processes and automate repetitive tasks to save time.", category: "Features & Functionality" },
    { question: "How does the AI-powered scheduling work?", answer: "Our AI analyzes your team's work patterns, task dependencies, and historical data to suggest optimal task schedules. It considers factors like team member availability, workload, and deadlines to help you plan more effectively.", category: "Features & Functionality" },
    { question: "Is my data secure with Sartthi?", answer: "Absolutely. We use bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted on secure, SOC 2 compliant servers with regular security audits and penetration testing.", category: "Security & Privacy" },
    { question: "Where is my data stored?", answer: "Your data is stored in secure data centers with multiple redundancies. We offer data residency options for Enterprise customers who need data stored in specific geographic regions for compliance purposes.", category: "Security & Privacy" },
    { question: "Do you comply with GDPR and other privacy regulations?", answer: "Yes, we're fully GDPR compliant and also meet requirements for CCPA, HIPAA (for Enterprise), and other major privacy regulations. We provide data processing agreements and can assist with compliance documentation.", category: "Security & Privacy" },
    { question: "Can I export my data?", answer: "Yes, you can export all your data at any time in standard formats (CSV, JSON, PDF). This includes tasks, projects, files, and team data. There are no lock-ins - your data is always accessible and portable.", category: "Security & Privacy" },
    { question: "Do you offer two-factor authentication (2FA)?", answer: "Yes! All plans include two-factor authentication for enhanced account security. We support authenticator apps, SMS codes, and backup codes. Enterprise plans also support SSO and advanced authentication methods.", category: "Security & Privacy" },
    { question: "What kind of customer support do you offer?", answer: "Free plan includes email support (24-48 hour response). Pro plan gets priority email support (4-hour response). Enterprise customers receive 24/7 dedicated support with phone, chat, and a dedicated account manager.", category: "Support & Updates" },
    { question: "Do I get access to future updates?", answer: "Yes! All plans include automatic updates at no extra cost. We regularly release new features, improvements, and security updates. You'll always have access to the latest version of Sartthi.", category: "Support & Updates" },
    { question: "Can I import data from other tools?", answer: "Yes, we provide import tools for popular platforms including Asana, Trello, Jira, Monday.com, and Basecamp. We also offer CSV import for custom data. Enterprise customers get dedicated migration assistance from our team.", category: "Support & Updates" },
    { question: "Do you provide training for new teams?", answer: "Yes! We offer comprehensive documentation, video tutorials, and webinars for all users. Pro customers get onboarding assistance, and Enterprise customers receive custom training sessions tailored to their workflow.", category: "Support & Updates" },
    { question: "How do I report bugs or request features?", answer: "You can submit bug reports and feature requests directly through the app or by contacting support. We actively review all feedback and regularly implement user-requested features. Enterprise customers can influence our product roadmap.", category: "Support & Updates" }
  ];

  const categories = ['General', 'Pricing & Plans', 'Features & Functionality', 'Security & Privacy', 'Support & Updates'];
  const filteredFaqs = faqs.filter(faq => faq.category === categories[activeTab]);

  const blogPosts = getRecentPosts(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <SharedNavbar />
      
      {/* Hero Section with Announcement */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto text-center">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm hover:shadow-md transition-all duration-300" style={{ backgroundColor: '#F1F4F9', borderColor: '#006397' }}>
              <span className="text-xl">🎉</span>
              <span className="text-sm font-semibold text-[#006397]">Announcement</span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Introducing Sartthi Platform</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Empower your team <br className="hidden md:block" />
            with <span className="text-[#FBBF24]">Sartthi</span>
          </h1>

          {/* Subheading */}
          <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No matter what project you have, our platform can help you manage it efficiently.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#006397] text-white hover:text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"></path>
              </svg>
              Get started for free
            </a>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              7 day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>


      {/* Problem Section */}
      <section id="problem" className="py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 pb-12">
            <h2 className="text-sm text-[#006397] font-mono font-medium tracking-wider uppercase">Problem</h2>
            <h3 className={`text-3xl md:text-5xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Managing projects shouldn't be this hard.
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {problems.map((problem, index) => (
              <MagicCard
                key={index}
                className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'border border-gray-200'} shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm`}
                style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
                gradientSize={250}
                gradientColor={isDarkMode ? '#FBBF2420' : '#FBBF2415'}
              >
                <div className="w-12 h-12 bg-[#FBBF24]/10 rounded-full flex items-center justify-center mb-4">
                  <problem.icon className="w-6 h-6 text-[#FBBF24]" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {problem.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {problem.description}
                </p>
              </MagicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 pb-12">
            <h2 className="text-sm text-[#006397] font-mono font-medium tracking-wider uppercase">Solution</h2>
            <h3 className={`text-3xl md:text-5xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Everything you need to manage projects
            </h3>
            <p className={`text-lg max-w-2xl mx-auto mt-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Powerful features designed for modern teams. From task management to real-time collaboration, we've got you covered.
            </p>
          </div>

          <BentoGrid className="mt-12">
            {/* Product Demo Video - Large Feature Card */}
            <BentoCard
              name="See Sartthi in Action"
              className="col-span-3 row-span-2"
              Icon={Play}
              description="Watch how Sartthi helps teams collaborate, manage tasks, and deliver projects faster."
              href="#"
              cta="Watch demo"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  {/* Browser-like header */}
                  <div className={`flex items-center gap-2 px-3 py-2 ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-300'}`}>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    <div className={`flex-1 mx-3 px-3 py-0.5 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}>
                      app.sartthi.com/dashboard
                    </div>
                  </div>

                  {/* Simplified Dashboard Preview */}
                  <div className="grid grid-cols-12 h-full">
                    {/* Sidebar */}
                    <div className={`col-span-3 p-2 ${isDarkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-gray-50 border-r border-gray-200'}`}>
                      <div className="space-y-1.5">
                        {['Dashboard', 'Projects', 'Tasks', 'Reports', 'Team'].map((item, idx) => (
                          <div
                            key={idx}
                            className={`px-2 py-1.5 rounded text-xs ${
                              idx === 0
                                ? 'bg-[#FBBF24]/20 text-[#FBBF24] font-medium'
                                : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            }`}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className={`col-span-9 p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                      <div className="space-y-2">
                        {[1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                          >
                            <div className={`h-2 w-3/4 rounded mb-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                            <div className={`h-1.5 w-1/2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-all duration-300 cursor-pointer group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#FBBF24] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <div className="relative w-16 h-16 bg-[#FBBF24] rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300">
                        <Play className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              }
            />

            {/* Task Management */}
            <BentoCard
              name="Smart Task Management"
              className="col-span-3 lg:col-span-2"
              Icon={CheckCircle2}
              description="Create, assign, and track tasks with ease. Set priorities, deadlines, and dependencies to keep your team on track."
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                  >
                    <source src="https://cdn.pixabay.com/video/2017/07/23/10847-226632926_large.mp4" type="video/mp4" />
                  </video>
                </div>
              }
            />

            {/* Real-time Collaboration */}
            <BentoCard
              name="Real-Time Collaboration"
              className="col-span-3 lg:col-span-1"
              Icon={MessageSquare}
              description="Chat, comment, and collaborate in real-time. Keep everyone in sync."
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                  >
                    <source src="https://media.istockphoto.com/id/2160467886/video/zoom-out-top-down-view-diverse-team-of-business-professionals-with-laptops-entering-the.mp4?s=mp4-640x640-is&k=20&c=9qq-QUfSL-T5mqNdbPk8GMikrIGq604GRGDIorVIfiU=" type="video/mp4" />
                  </video>
                </div>
              }
            />

            {/* Project Dashboard */}
            <BentoCard
              name="Project Dashboard"
              className="col-span-3 lg:col-span-1"
              Icon={BarChart3}
              description="Visualize progress with beautiful dashboards and reports."
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                  >
                    <source src="https://media.istockphoto.com/id/1744582055/video/corporate-business-presentation-in-office.mp4?s=mp4-640x640-is&k=20&c=1Gstl_HFCLaM4Bq7Lk-OZjzglkU5-tu60a_YW8c2rDc=" type="video/mp4" />
                  </video>
                </div>
              }
            />

            {/* File Management */}
            <BentoCard
              name="File Management"
              className="col-span-3 lg:col-span-2"
              Icon={Folder}
              description="Store, organize, and share files with your team. Everything in one place."
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                  >
                    <source src="https://cdn.pixabay.com/video/2021/09/01/87146-601076915_large.mp4" type="video/mp4" />
                  </video>
                </div>
              }
            />

            {/* Notifications */}
            <BentoCard
              name="Smart Notifications"
              className="col-span-3 lg:col-span-2"
              Icon={Bell}
              description="Stay updated with intelligent notifications. Never miss important updates."
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                  >
                    <source src="https://cdn.pixabay.com/video/2015/11/25/1360-147055409_large.mp4" type="video/mp4" />
                  </video>
                </div>
              }
            />

            {/* Calendar Integration */}
            <BentoCard
              name="Calendar View"
              className="col-span-3 lg:col-span-1"
              Icon={Calendar}
              description="Plan and schedule with integrated calendar views."
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                  >
                    <source src="https://cdn.pixabay.com/video/2024/01/24/197976-906217215_large.mp4" type="video/mp4" />
                  </video>
                </div>
              }
            />
          </BentoGrid>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 pb-12">
            <h2 className="text-sm text-[#006397] font-mono font-medium tracking-wider uppercase">How it works</h2>
            <h3 className={`text-3xl md:text-5xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Just 3 steps to get started
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'border border-gray-200'} shadow-lg`}
                style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#FBBF24]/10 rounded-full flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-[#FBBF24]" />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-transparent">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 pb-12">
            <h2 className="text-sm text-[#006397] font-mono font-medium tracking-wider uppercase">Features</h2>
            <h3 className={`text-3xl md:text-5xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Powerful Features for Modern Teams
            </h3>
          </div>

          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            {/* First Row - Scrolling Left */}
            <Marquee pauseOnHover className="[--duration:30s] mb-4">
              {features.slice(0, 5).map((feature, index) => (
                <figure
                  key={index}
                  className={`relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6 ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800/80 hover:bg-gray-800' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-all duration-300`}
                  style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <figcaption className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </figcaption>
                    <blockquote className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </blockquote>
                  </div>
                </figure>
              ))}
            </Marquee>

            {/* Second Row - Scrolling Right */}
            <Marquee reverse pauseOnHover className="[--duration:30s]">
              {features.slice(5).map((feature, index) => (
                <figure
                  key={index}
                  className={`relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6 ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800/80 hover:bg-gray-800' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-all duration-300`}
                  style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <figcaption className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </figcaption>
                    <blockquote className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </blockquote>
                  </div>
                </figure>
              ))}
            </Marquee>

            {/* Gradient Overlays */}
            <div className={`pointer-events-none absolute inset-y-0 left-0 w-1/4 ${isDarkMode ? 'bg-gradient-to-r from-gray-900' : 'bg-gradient-to-r from-white'}`}></div>
            <div className={`pointer-events-none absolute inset-y-0 right-0 w-1/4 ${isDarkMode ? 'bg-gradient-to-l from-gray-900' : 'bg-gradient-to-l from-white'}`}></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 pb-12">
            <h2 className="text-sm text-[#006397] font-mono font-medium tracking-wider uppercase">Testimonials</h2>
            <h3 className={`text-3xl md:text-5xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              What our customers are saying
            </h3>
          </div>

          {/* Vertical Marquee Testimonials */}
          <div className="relative flex h-[500px] w-full flex-row items-center justify-center gap-4 overflow-hidden">
            {/* Column 1 */}
            <Marquee pauseOnHover vertical className="[--duration:25s]">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <figure
                  key={index}
                  className={`relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6 ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800/80 hover:bg-gray-800' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-all duration-300`}
                  style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
                >
                  <div className="flex flex-row items-center gap-3 mb-4">
                    <img className="rounded-full w-12 h-12" alt={testimonial.name} src={testimonial.image} />
                    <div className="flex flex-col">
                      <figcaption className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {testimonial.name}
                      </figcaption>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-[#FBBF24]">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                </figure>
              ))}
            </Marquee>

            {/* Column 2 - Reverse */}
            <Marquee reverse pauseOnHover vertical className="[--duration:25s]">
              {testimonials.slice(3, 6).map((testimonial, index) => (
                <figure
                  key={index}
                  className={`relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6 ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800/80 hover:bg-gray-800' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-all duration-300`}
                  style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
                >
                  <div className="flex flex-row items-center gap-3 mb-4">
                    <img className="rounded-full w-12 h-12" alt={testimonial.name} src={testimonial.image} />
                    <div className="flex flex-col">
                      <figcaption className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {testimonial.name}
                      </figcaption>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-[#FBBF24]">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                </figure>
              ))}
            </Marquee>

            {/* Column 3 */}
            <Marquee pauseOnHover vertical className="[--duration:25s]">
              {testimonials.slice(6, 9).map((testimonial, index) => (
                <figure
                  key={index}
                  className={`relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6 ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800/80 hover:bg-gray-800' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-all duration-300`}
                  style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
                >
                  <div className="flex flex-row items-center gap-3 mb-4">
                    <img className="rounded-full w-12 h-12" alt={testimonial.name} src={testimonial.image} />
                    <div className="flex flex-col">
                      <figcaption className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {testimonial.name}
                      </figcaption>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-[#FBBF24]">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                </figure>
              ))}
            </Marquee>

            {/* Column 4 - Reverse */}
            <Marquee reverse pauseOnHover vertical className="[--duration:25s]">
              {testimonials.slice(9, 12).map((testimonial, index) => (
                <figure
                  key={index}
                  className={`relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6 ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800/80 hover:bg-gray-800' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-all duration-300`}
                  style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
                >
                  <div className="flex flex-row items-center gap-3 mb-4">
                    <img className="rounded-full w-12 h-12" alt={testimonial.name} src={testimonial.image} />
                    <div className="flex flex-col">
                      <figcaption className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {testimonial.name}
                      </figcaption>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-[#FBBF24]">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                </figure>
              ))}
            </Marquee>

            {/* Gradient Overlays */}
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-1/4 ${isDarkMode ? 'bg-gradient-to-b from-gray-900/80' : 'bg-gradient-to-b from-white/80'}`}></div>
            <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-1/4 ${isDarkMode ? 'bg-gradient-to-t from-gray-900/80' : 'bg-gradient-to-t from-white/80'}`}></div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Category Filters - From LandingPage */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header with Get In Touch Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className={`text-4xl md:text-5xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Frequently asked questions
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Answers to common queries about Sartthi.
              </p>
            </div>
            <button className="px-8 py-3 bg-[#006397] text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap">
              Get In Touch
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 overflow-x-auto pb-2">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-2.5 rounded-lg border font-medium transition-all whitespace-nowrap ${
                  activeTab === index
                    ? isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-900'
                    : isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    : 'bg-[#F5F8FD] border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}</div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <h3 className={`text-lg font-semibold pr-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className={`px-6 pb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 pb-12">
            <h2 className="text-sm text-[#006397] font-mono font-medium tracking-wider uppercase">Blog</h2>
            <h3 className={`text-3xl md:text-5xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Latest Articles
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'border border-gray-200'} shadow-lg hover:shadow-xl transition-all duration-300`}
                style={{ backgroundColor: isDarkMode ? undefined : '#F1F4F9' }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-[#006397] text-white rounded">
                      {post.category}
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {post.readTime}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {post.date}
                  </p>
                  <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {post.title}
                  </h4>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {post.excerpt}
                  </p>
                  <a
                    href={`/blog/${post.id}`}
                    className="text-[#006397] hover:text-blue-700 font-semibold inline-flex items-center"
                  >
                    Read more
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to get started?
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Start your free trial today.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#006397] text-white hover:text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect width="7" height="7" x="14" y="3" rx="1"></rect>
              <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"></path>
            </svg>
            Get started for free
          </a>
        </div>
      </section>

      {/* Large Gradient SARTTHI Text Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-5xl md:text-9xl lg:text-[18rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 dark:from-neutral-950 to-neutral-200 dark:to-neutral-800 inset-x-0">
            SARTTHI
          </p>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default About;
