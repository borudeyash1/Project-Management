import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle, Star, Users, Shield, 
  Clock, Target, Sparkles, ChevronRight,
  BarChart3, Calendar, Zap, TrendingUp, Award,
  Code, Palette, Globe, Smartphone,
  Play, Pause, ChevronDown
} from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import FlowingMenu from './FlowingMenu';
import Marquee from './Marquee';
import PricingCards from './shared/PricingCards';
import { getRecentPosts } from '../data/blogData';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [adminFeatureTab, setAdminFeatureTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Video intersection observer with proper async handling
  useEffect(() => {
    let isPlayingRef = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting && videoRef.current && !isPlayingRef) {
            try {
              await videoRef.current.play();
              isPlayingRef = true;
              setIsVideoPlaying(true);
            } catch (error) {
              // Ignore play interruption errors
              console.debug('Video play interrupted:', error);
            }
          } else if (!entry.isIntersecting && videoRef.current && isPlayingRef) {
            try {
              videoRef.current.pause();
              isPlayingRef = false;
              setIsVideoPlaying(false);
            } catch (error) {
              // Ignore pause errors
              console.debug('Video pause error:', error);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentVideo = videoRef.current;
    if (currentVideo) {
      observer.observe(currentVideo);
    }

    return () => {
      if (currentVideo) {
        observer.unobserve(currentVideo);
      }
    };
  }, []);

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Project Management",
      description: "Organize and track your projects with powerful tools and intuitive interfaces that scale with your team."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates, comments, and file sharing capabilities."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Get deep insights into your team's performance with customizable dashboards and detailed reports."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Time Tracking",
      description: "Monitor time spent on tasks and projects to improve productivity and billing accuracy."
    },
      {
        icon: <Calendar className="w-6 h-6" />,
        title: "Smart Scheduling",
        description: "Automated intelligent scheduling based on comprehensive user profiles, availability, and workload patterns."
      },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Your data is protected with enterprise-grade security, encryption, and compliance standards."
    },
      {
        icon: <Zap className="w-6 h-6" />,
        title: "AI Automation",
        description: "Integrate your own AI chatbot API and leverage AI-powered automation for smarter workflows."
      },
      {
        icon: <Code className="w-6 h-6" />,
        title: "Smart Attendance",
        description: "Face and location-based attendance tracking in workspace for accurate and secure time management."
      },
      {
        icon: <Smartphone className="w-6 h-6" />,
        title: "Desktop Application",
        description: "Access your projects with our powerful native desktop application for enhanced productivity."
      }
  ];

  const metrics = [
    { value: "1K+", label: "Active Users", icon: <Users className="w-8 h-8" /> },
    { value: "99.5%", label: "Uptime", icon: <TrendingUp className="w-8 h-8" /> },
    { value: "10+", label: "Countries", icon: <Globe className="w-8 h-8" /> },
    { value: "4.7/5", label: "User Rating", icon: <Star className="w-8 h-8" /> }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Project Manager",
      company: "Tech Solutions India",
      content: "Sartthi has transformed how we manage projects. The intuitive interface and powerful features have increased our team's productivity by 40%. The task management and AI insights are exceptional.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=006397&color=fff&size=150"
    },
    {
      name: "Rajesh Kumar",
      role: "CEO",
      company: "StartupHub Bangalore",
      content: "The best project management tool we've used. It's helped us scale from 5 to 50 team members without missing a beat. The smart attendance and collaboration features are game-changers.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=006397&color=fff&size=150"
    },
    {
      name: "Ananya Patel",
      role: "Team Lead",
      company: "Design Studio Mumbai",
      content: "Collaboration has never been easier. Our remote team feels more connected than ever before. The real-time updates and file sharing capabilities have revolutionized our workflow.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Ananya+Patel&background=006397&color=fff&size=150"
    },
    {
      name: "Vikram Singh",
      role: "CTO",
      company: "Innovation Labs Delhi",
      content: "The AI-powered insights and custom API integration capabilities are outstanding. We've connected all our tools seamlessly, creating a unified workflow that our entire team loves.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Vikram+Singh&background=006397&color=fff&size=150"
    },
    {
      name: "Sneha Reddy",
      role: "Operations Director",
      company: "Global Services Hyderabad",
      content: "Security and compliance were our top priorities, and Sartthi exceeded all expectations. The face recognition attendance and enterprise features are robust and reliable.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Sneha+Reddy&background=006397&color=fff&size=150"
    },
    {
      name: "Arjun Mehta",
      role: "Product Manager",
      company: "Digital Agency Pune",
      content: "The analytics and reporting features give us insights we never had before. The AI-powered predictions and smart scheduling have made data-driven decisions effortless.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Arjun+Mehta&background=006397&color=fff&size=150"
    },
    {
      name: "Kavya Nair",
      role: "Marketing Head",
      company: "Creative Solutions Chennai",
      content: "The collaboration tools and real-time updates have streamlined our marketing campaigns. Our team productivity has increased significantly, and the interface is incredibly user-friendly.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Kavya+Nair&background=006397&color=fff&size=150"
    },
    {
      name: "Rohan Gupta",
      role: "Founder",
      company: "TechStart Gurgaon",
      content: "As a startup, we needed a solution that could grow with us. Sartthi's scalability and affordable pricing made it the perfect choice. The desktop app is a game-changer for our team.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Rohan+Gupta&background=006397&color=fff&size=150"
    },
    {
      name: "Meera Iyer",
      role: "HR Manager",
      company: "Enterprise Corp Bangalore",
      content: "The smart attendance system with face recognition has eliminated all our time-tracking issues. It's accurate, secure, and our employees love how easy it is to use.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Meera+Iyer&background=006397&color=fff&size=150"
    },
    {
      name: "Aditya Joshi",
      role: "Development Lead",
      company: "Code Factory Noida",
      content: "The GitHub integration and custom API support are fantastic. We've automated our entire development workflow, and the AI suggestions have helped us catch potential issues early.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Aditya+Joshi&background=006397&color=fff&size=150"
    },
    {
      name: "Divya Kapoor",
      role: "Design Director",
      company: "UX Studio Jaipur",
      content: "The file sharing and feedback tools are perfect for our design team. We can collaborate on projects in real-time, and the version control keeps everything organized.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Divya+Kapoor&background=006397&color=fff&size=150"
    },
    {
      name: "Karthik Menon",
      role: "Business Analyst",
      company: "Analytics Pro Kochi",
      content: "The reporting and analytics dashboards provide exactly the insights we need. The AI-powered predictions have helped us make better business decisions and optimize our workflows.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Karthik+Menon&background=006397&color=fff&size=150"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and small teams getting started",
      features: [
        "Up to 5 team members",
        "5 projects",
        "Basic analytics",
        "Community support",
        "1GB storage",
        "Mobile apps",
        "Basic integrations"
      ],
      highlighted: false,
      popular: false
    },
    {
      name: "Pro",
      price: "$12",
      period: "per user/month",
      description: "For growing teams and businesses that need more power",
      features: [
        "Unlimited team members",
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "50GB storage",
        "Custom integrations",
        "Advanced security",
        "Time tracking",
        "Custom workflows",
        "API access"
      ],
      highlighted: true,
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations with specific requirements",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom training",
        "SLA guarantee",
        "Unlimited storage",
        "Advanced permissions",
        "SSO integration",
        "Custom branding",
        "Audit logs",
        "24/7 phone support"
      ],
      highlighted: false,
      popular: false
    }
  ];

  const integrations = [
    { name: "Slack", logo: "https://img.icons8.com/?size=100&id=19978&format=png&color=000000", category: "Communication" },
    { name: "Google Drive", logo: "https://img.icons8.com/?size=100&id=13630&format=png&color=000000", category: "Cloud Storage" },
    { name: "GitHub", logo: "https://img.icons8.com/?size=100&id=12599&format=png&color=000000", category: "Development" },
    { name: "Custom AI API", logo: "https://img.icons8.com/?size=100&id=GVghUo9qfGPW&format=png&color=000000", category: "AI Integration" },
    { name: "Zoom", logo: "https://img.icons8.com/?size=100&id=7csVZvHoQrLW&format=png&color=000000", category: "Meeting Links" },
    { name: "Dropbox", logo: "https://img.icons8.com/?size=100&id=13657&format=png&color=000000", category: "Cloud Storage" },
    { name: "Microsoft Teams", logo: "https://img.icons8.com/?size=100&id=GcSqCxRXjzNd&format=png&color=000000", category: "Communication" },
    { name: "OneDrive", logo: "https://img.icons8.com/?size=100&id=117559&format=png&color=000000", category: "Cloud Storage" },
    { name: "Jira", logo: "https://img.icons8.com/?size=100&id=oROcPah5ues6&format=png&color=000000", category: "Project Management" },
    { name: "Google Meet", logo: "https://img.icons8.com/?size=100&id=pE97I4t7Il9M&format=png&color=000000", category: "Meeting Links" },
    { name: "Notion", logo: "https://img.icons8.com/?size=100&id=HDd694003FZa&format=png&color=000000", category: "Documentation" },
    { name: "OpenAI", logo: "https://img.icons8.com/?size=100&id=Nts60kQIvGqe&format=png&color=000000", category: "AI Integration" }
  ];

  const useCases = [
    {
      title: "Software Development",
      description: "Manage sprints, track bugs, and collaborate on code with integrated development tools.",
      icon: <Code className="w-12 h-12" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Remote Teams",
      description: "Keep distributed teams aligned with real-time collaboration, smart attendance, and seamless communication.",
      icon: <Users className="w-12 h-12" />,
      color: "from-purple-600 to-indigo-600"
    },
    {
      title: "Design & Creative",
      description: "Collaborate on design projects with feedback tools, asset management, and creative workflows.",
      icon: <Target className="w-12 h-12" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Product Management",
      description: "Coordinate cross-functional teams, track milestones, and deliver successful product launches.",
      icon: <Star className="w-12 h-12" />,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const faqs = [
    // General Questions
    {
      question: "What is Sartthi?",
      answer: "Sartthi is a comprehensive project management platform designed to help teams collaborate, track progress, and deliver projects efficiently. It combines task management, team collaboration, AI-powered insights, and smart attendance in one unified platform.",
      category: "General"
    },
    {
      question: "Is Sartthi only for SaaS web apps?",
      answer: "No, Sartthi is a versatile project management platform that works for any type of project - from software development to marketing campaigns, design projects, construction, and more. It's designed to adapt to your workflow regardless of your industry.",
      category: "General"
    },
    {
      question: "What makes Sartthi different from other project management tools?",
      answer: "Sartthi stands out with its AI-powered task scheduling, smart attendance with face recognition, custom cloud storage integration, and real-time AI suggestions. We combine powerful enterprise features with an intuitive interface that teams actually enjoy using.",
      category: "General"
    },
    {
      question: "Is Sartthi suitable for both developers and designers?",
      answer: "Absolutely! Sartthi is built for cross-functional teams. Developers can track sprints and bugs, designers can manage design projects and feedback, managers can oversee workload, and everyone works in one unified platform with role-based access control.",
      category: "General"
    },
    {
      question: "Can remote teams use Sartthi effectively?",
      answer: "Yes! Sartthi is perfect for remote and distributed teams with features like real-time collaboration, smart attendance tracking with location verification, video integration, and asynchronous communication tools.",
      category: "General"
    },
    
    // Pricing & Plans
    {
      question: "What is the difference between the Free and Pro plans?",
      answer: "Free plan includes 1 project with 5 members and limited task types. Pro plan ($29/month) offers 5 workspaces with 5 projects each, 20 employees per project, AI access with limited tokens, desktop application, and no ads. See our pricing page for full details.",
      category: "Pricing & Plans"
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes! You can start with our Free plan immediately with no credit card required. For Pro features, we offer a 14-day free trial. Enterprise customers can schedule a personalized demo with our team.",
      category: "Pricing & Plans"
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your current billing cycle, and you'll retain access to paid features until then.",
      category: "Pricing & Plans"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. Enterprise customers can also pay via wire transfer or purchase orders.",
      category: "Pricing & Plans"
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with Sartthi for any reason, contact our support team within 30 days of purchase for a full refund, no questions asked.",
      category: "Pricing & Plans"
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees! The price you see is what you pay. All features listed in your plan are included. Additional costs only apply if you choose optional add-ons like extra storage or premium integrations.",
      category: "Pricing & Plans"
    },
    {
      question: "Do you offer discounts for non-profits or educational institutions?",
      answer: "Yes! We offer special pricing for non-profit organizations and educational institutions. Contact our sales team with proof of your organization's status to learn about available discounts.",
      category: "Pricing & Plans"
    },

    // Features & Functionality
    {
      question: "Can I use Sartthi for multiple projects?",
      answer: "Yes! Free plan allows 1 project, Pro plan includes 5 workspaces with 5 projects each (25 total), and Enterprise plan offers 10 workspaces with 20 projects each (200 total). Each project can have its own team and settings.",
      category: "Features & Functionality"
    },
    {
      question: "How does the AI-powered task scheduling work?",
      answer: "Our AI analyzes your team's working history, current workload, deadlines, and dependencies to automatically suggest optimal task schedules. It learns from patterns and helps project managers make data-driven decisions about resource allocation.",
      category: "Features & Functionality"
    },
    {
      question: "What is Smart Attendance and how does it work?",
      answer: "Smart Attendance uses face recognition technology and location tracking to verify team member presence. It automatically generates attendance reports, supports workspace verification, and integrates with your project timelines for accurate time tracking.",
      category: "Features & Functionality"
    },
    {
      question: "Can I integrate Sartthi with other tools?",
      answer: "Yes! Sartthi integrates with popular tools including Slack, Microsoft Teams, Google Drive, Dropbox, GitHub, Jira, Zoom, and more. Enterprise plans also support custom API integrations and private cloud storage.",
      category: "Features & Functionality"
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes! Sartthi is available on web, desktop (Windows, Mac, Linux), and mobile (iOS and Android). All platforms sync in real-time, so you can work from anywhere.",
      category: "Features & Functionality"
    },
    {
      question: "Can I customize workflows and task types?",
      answer: "Absolutely! Pro and Enterprise plans allow you to create custom workflows, task types, and statuses. You can also set up automation rules, custom fields, and templates to match your team's unique processes.",
      category: "Features & Functionality"
    },

    // Security & Privacy
    {
      question: "How secure is my data on Sartthi?",
      answer: "We take security seriously. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use industry-standard security practices, regular security audits, and comply with GDPR, SOC 2, and other major compliance frameworks.",
      category: "Security & Privacy"
    },
    {
      question: "Where is my data stored?",
      answer: "Data is stored in secure, redundant data centers with automatic backups. Enterprise customers can choose their preferred data region and even use custom cloud storage integration with their private infrastructure.",
      category: "Security & Privacy"
    },
    {
      question: "Who can access my project data?",
      answer: "Only team members you explicitly invite can access your projects. We implement role-based access control, so you can define exactly what each team member can see and do. Your data is never shared with third parties.",
      category: "Security & Privacy"
    },
    {
      question: "Do you offer two-factor authentication (2FA)?",
      answer: "Yes! All plans include two-factor authentication for enhanced account security. We support authenticator apps, SMS codes, and backup codes. Enterprise plans also support SSO and advanced authentication methods.",
      category: "Security & Privacy"
    },

    // Support & Updates
    {
      question: "What kind of customer support do you offer?",
      answer: "Free plan includes email support (24-48 hour response). Pro plan gets priority email support (4-hour response). Enterprise customers receive 24/7 dedicated support with phone, chat, and a dedicated account manager.",
      category: "Support & Updates"
    },
    {
      question: "Do I get access to future updates?",
      answer: "Yes! All plans include automatic updates at no extra cost. We regularly release new features, improvements, and security updates. You'll always have access to the latest version of Sartthi.",
      category: "Support & Updates"
    },
    {
      question: "Can I import data from other tools?",
      answer: "Yes, we provide import tools for popular platforms including Asana, Trello, Jira, Monday.com, and Basecamp. We also offer CSV import for custom data. Enterprise customers get dedicated migration assistance from our team.",
      category: "Support & Updates"
    },
    {
      question: "Do you provide training for new teams?",
      answer: "Yes! We offer comprehensive documentation, video tutorials, and webinars for all users. Pro customers get onboarding assistance, and Enterprise customers receive custom training sessions tailored to their workflow.",
      category: "Support & Updates"
    },
    {
      question: "How do I report bugs or request features?",
      answer: "You can submit bug reports and feature requests directly through the app or by contacting support. We actively review all feedback and regularly implement user-requested features. Enterprise customers can influence our product roadmap.",
      category: "Support & Updates"
    }
  ];

  // Filter FAQs based on selected category
  const categories = ['General', 'Pricing & Plans', 'Features & Functionality', 'Security & Privacy', 'Support & Updates'];
  const filteredFaqs = faqs.filter(faq => faq.category === categories[activeTab]);

  const companyLogos = [
    "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Spotify", "Uber", "Airbnb", "Tesla"
  ];

  const blogPosts = getRecentPosts(3);

  return (
    <div className="min-h-screen bg-[#F5F8FD] overflow-hidden">
      <SharedNavbar />
      
      {/* Hero Section with Advanced Animations */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div 
            className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          ></div>
          <div 
            className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          ></div>
          <div 
            className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 font-medium mb-6 animate-bounce-slow border border-blue-200 shadow-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-semibold">New: AI-Powered Project Insights</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            
            {/* Main Headline with Gradient */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Projects Like
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#006397] via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                  Never Before
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 5, 100 2, 150 3C200 4, 250 7, 298 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#9333EA" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Sartthi is the all-in-one project management platform that helps teams collaborate, 
              track progress, and deliver exceptional results faster than ever before.
            </p>
            
            {/* CTA Buttons with Animations */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-[#006397] text-white hover:text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/docs"
                className="group px-8 py-4 bg-[#F5F8FD] text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-[#F5F8FD] px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F5F8FD] px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F5F8FD] px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          {/* Hero Video/Image with Parallax Effect */}
          <div className={`mt-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative mx-auto max-w-6xl" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFC700] to-[#FFD700] rounded-3xl blur-3xl opacity-30 animate-pulse-slow"></div>
              <div className="relative bg-[#F5F8FD] rounded-2xl shadow-2xl p-2 border-4 border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative group">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    poster="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=675&fit=crop"
                  >
                    <source src="/demo-video.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all">
                    <button 
                      onClick={async () => {
                        if (videoRef.current) {
                          try {
                            if (isVideoPlaying) {
                              videoRef.current.pause();
                              setIsVideoPlaying(false);
                            } else {
                              await videoRef.current.play();
                              setIsVideoPlaying(true);
                            }
                          } catch (error) {
                            console.debug('Video toggle error:', error);
                          }
                        }
                      }}
                      className="w-20 h-20 bg-[#F5F8FD] rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform"
                    >
                      {isVideoPlaying ? (
                        <Pause className="w-8 h-8 text-[#006397]" />
                      ) : (
                        <Play className="w-8 h-8 text-[#006397] ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-yellow-400 rounded-2xl shadow-lg transform rotate-12 animate-float"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-pink-400 rounded-full shadow-lg animate-float animation-delay-2000"></div>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {['Task Management', 'Team Collaboration', 'Real-time Updates', 'Project Analytics', 'Workspace Management', 'File Sharing'].map((tech, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-[#F5F8FD] rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-sm font-medium text-gray-700">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-[#F5F8FD] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-8 font-semibold uppercase tracking-wider">
            Trusted by leading companies worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section with Animated Counters */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-110 transition-transform duration-300"
              >
                <div className="flex justify-center mb-4 text-[#FFC700]">
                  {metric.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#FFC700] to-[#FFD700] bg-clip-text text-transparent">
                  {metric.value}
                </div>
                <div className="text-gray-300 font-medium">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Grid Layout */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F8FD] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-[#006397] rounded-full text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help your team work smarter, not harder.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-[#F5F8FD] rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#006397] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Use Cases
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Every Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From software development to marketing, Sartthi adapts to your workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="group relative bg-[#F5F8FD] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-600">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Integrations
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Connects With Your Favorite Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrate with the tools you already use and love.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <div
        key={index}
        className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-blue-200"
      >
        <div className="flex items-center justify-center mb-3 h-16 w-16 mx-auto group-hover:scale-110 transition-transform">
          <img src={integration.logo} alt={integration.name} className="w-full h-full object-contain" />
        </div>
        <div className="text-sm font-semibold text-gray-700 text-center">
          {integration.name}
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">
          {integration.category}
        </div>
      </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={() => {
                const token = localStorage.getItem('token');
                if (token) {
                  window.location.href = '/home';
                } else {
                  window.location.href = '/login';
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#006397] text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              View All Integrations
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
      {/* Endless Possibilities Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Endless possibilities
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage projects, collaborate with teams, and deliver results efficiently.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">500<span className="text-3xl">+</span></div>
              <div className="text-gray-600 font-medium">Projects Managed</div>
            </div>
            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">50<span className="text-3xl">+</span></div>
              <div className="text-gray-600 font-medium">Team Members</div>
            </div>
            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">10K<span className="text-3xl">+</span></div>
              <div className="text-gray-600 font-medium">Tasks Completed</div>
            </div>
            <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">40<span className="text-3xl">%</span></div>
              <div className="text-gray-600 font-medium">Productivity Boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored for Every Industry Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tailored for every industry
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              From startups to enterprises, Sartthi adapts to your workflow and helps teams across industries manage projects efficiently.
            </p>
          </div>

          {/* Industry Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              'Software Development',
              'Marketing & Advertising',
              'Design & Creative',
              'Finance & Accounting',
              'Healthcare & Medical',
              'Education & Training',
              'Real Estate',
              'Manufacturing',
              'Consulting Services',
              'E-commerce & Retail',
              'Legal Services',
              'Construction',
              'Media & Entertainment',
              'Non-Profit Organizations',
              'Research & Development'
            ].map((industry, index) => (
              <span
                key={index}
                className="px-6 py-3 bg-[#F5F8FD] rounded-full text-gray-800 font-medium hover:shadow-md transition-all cursor-pointer"
              >
                {industry}
              </span>
            ))}
          </div>

          {/* Documentation Button */}
          <div className="text-center">
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white hover:text-white transition-all shadow-lg hover:shadow-xl hover:opacity-90"
              style={{ backgroundColor: '#006397' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documentation
            </Link>
          </div>
        </div>
      </section>


      {/* Powerful Admin Interface Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful admin interface
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Manage data, users, and workflows effortlessly with intuitive, customizable admin controls and features.
            </p>
          </div>

          {/* Feature Selector */}
          <div className="flex justify-center mb-16">
            <div className="radio-inputs">
              <label className="radio">
                <input 
                  type="radio" 
                  name="admin-feature" 
                  checked={adminFeatureTab === 0}
                  onChange={() => setAdminFeatureTab(0)}
                />
                <span className="name">Task Management</span>
              </label>
              <label className="radio">
                <input 
                  type="radio" 
                  name="admin-feature"
                  checked={adminFeatureTab === 1}
                  onChange={() => setAdminFeatureTab(1)}
                />
                <span className="name">Team Collaboration</span>
              </label>
              <label className="radio">
                <input 
                  type="radio" 
                  name="admin-feature"
                  checked={adminFeatureTab === 2}
                  onChange={() => setAdminFeatureTab(2)}
                />
                <span className="name">AI-Powered Insights</span>
              </label>
              <label className="radio">
                <input 
                  type="radio" 
                  name="admin-feature"
                  checked={adminFeatureTab === 3}
                  onChange={() => setAdminFeatureTab(3)}
                />
                <span className="name">Smart Attendance</span>
              </label>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Dashboard Preview */}
            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="p-8">
                {/* Dynamic Feature UI Mockup */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6">
                  {/* Task Management UI */}
                  {adminFeatureTab === 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Project Board</h3>
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {['To Do', 'In Progress', 'Done'].map((status, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-gray-600 mb-2">{status}</div>
                            <div className="space-y-2">
                              {[1, 2].map((item) => (
                                <div key={item} className="bg-white p-2 rounded shadow-sm border-l-2" style={{ borderColor: idx === 0 ? '#FFC700' : idx === 1 ? '#006397' : '#10B981' }}>
                                  <div className="text-xs font-medium text-gray-900">Task {item}</div>
                                  <div className="text-xs text-gray-500 mt-1">Due: Dec {20 + item}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Collaboration UI */}
                  {adminFeatureTab === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Team Chat</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-gray-600">5 Online</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { name: 'John Doe', msg: 'Updated the design files', time: '10:30 AM', avatar: 'JD' },
                          { name: 'Sarah Smith', msg: 'Meeting at 2 PM today?', time: '10:45 AM', avatar: 'SS' },
                          { name: 'Mike Johnson', msg: 'Task completed ✓', time: '11:00 AM', avatar: 'MJ' }
                        ].map((chat, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#006397' }}>
                              {chat.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">{chat.name}</span>
                                <span className="text-xs text-gray-500">{chat.time}</span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg p-2">{chat.msg}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI-Powered Insights UI */}
                  {adminFeatureTab === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">AI Analytics Dashboard</h3>
                        <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">AI Powered</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {[
                          { label: 'Productivity', value: '87%', trend: '+12%' },
                          { label: 'On-Time Delivery', value: '94%', trend: '+5%' }
                        ].map((stat, idx) => (
                          <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600">{stat.label}</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
                            <div className="text-xs text-green-600 mt-1">{stat.trend}</div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs font-semibold text-gray-600 mb-3">Project Timeline Prediction</div>
                        <div className="h-24 relative">
                          <svg className="w-full h-full" viewBox="0 0 300 80">
                            <defs>
                              <linearGradient id="aiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#006397" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#006397" stopOpacity="0"/>
                              </linearGradient>
                            </defs>
                            <polyline points="0,60 60,45 120,50 180,30 240,35 300,20" fill="url(#aiGradient)" stroke="#006397" strokeWidth="2"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Smart Attendance UI */}
                  {adminFeatureTab === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Attendance Tracker</h3>
                        <div className="text-xs text-gray-600">Today: Dec 19, 2025</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-600">Check-in Status</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">8:45 AM</div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-xs text-green-700">Face Verified</span>
                            </div>
                          </div>
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                            <div className="text-3xl">👤</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-600 mb-2">Team Status</div>
                        {[
                          { name: 'Alice Brown', status: 'Present', time: '8:30 AM', location: 'Office' },
                          { name: 'Bob Wilson', status: 'Present', time: '8:45 AM', location: 'Remote' },
                          { name: 'Carol Davis', status: 'Absent', time: '-', location: '-' }
                        ].map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${member.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.location}</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600">{member.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Features */}
            <div>
              <div className="mb-8">
                {(() => {
                  const features = [
                    {
                      icon: '📋',
                      title: 'Task Management',
                      heading: 'Organize and track tasks effortlessly',
                      description: 'Comprehensive task management with priorities, deadlines, and progress tracking',
                      items: ['Kanban boards', 'Task dependencies', 'Priority levels', 'Progress tracking'],
                      image: 'https://via.placeholder.com/600x400/006397/FFFFFF?text=Task+Management+Dashboard'
                    },
                    {
                      icon: '👥',
                      title: 'Team Collaboration',
                      heading: 'Work together seamlessly in real-time',
                      description: 'Enable your team to collaborate effectively with real-time updates and communication tools',
                      items: ['Real-time updates', 'Team chat', 'File sharing', 'Activity feeds'],
                      image: 'https://via.placeholder.com/600x400/006397/FFFFFF?text=Team+Collaboration+View'
                    },
                    {
                      icon: '🤖',
                      title: 'AI-Powered Insights',
                      heading: 'Smart analytics with custom AI integration',
                      description: 'Integrate your own AI API for intelligent project insights and automated recommendations',
                      items: ['Custom AI API integration', 'Predictive analytics', 'Smart scheduling', 'Automated reports'],
                      image: 'https://via.placeholder.com/600x400/006397/FFFFFF?text=AI+Analytics+Dashboard'
                    },
                    {
                      icon: '📍',
                      title: 'Smart Attendance',
                      heading: 'Face and location-based attendance tracking',
                      description: 'Advanced attendance system with face recognition and location verification for secure workspace management',
                      items: ['Face recognition', 'Location tracking', 'Attendance reports', 'Workspace verification'],
                      image: 'https://via.placeholder.com/600x400/006397/FFFFFF?text=Smart+Attendance+System'
                    }
                  ];
                  const current = features[adminFeatureTab];
                  return (
                    <>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full mb-6">
                        <span className="text-2xl">{current.icon}</span>
                        <span className="font-semibold text-gray-900">{current.title}</span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        {current.heading}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {current.description}
                      </p>

                      {/* Feature List */}
                      <div className="space-y-4 mb-8">
                        {current.items.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006397' }}>
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}

                {/* Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 rounded-full font-semibold transition-all hover:opacity-90"
                    style={{ borderColor: '#006397', color: '#006397' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Docs
                  </Link>
                  <Link
                    to="/demo"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white hover:text-white transition-all shadow-lg hover:shadow-xl hover:opacity-90"
                    style={{ backgroundColor: '#006397' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section with Vertical Marquee */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-full mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What our customers are saying
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers have to say about Sartthi.
            </p>
          </div>
          
          {/* Vertical Marquee Testimonials */}
          <div className="relative flex h-[500px] w-full flex-row items-center justify-center gap-4 overflow-hidden">
            {/* Column 1 */}
            <Marquee pauseOnHover vertical className="[--duration:25s]">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <figure
                  key={index}
                  className="relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border border-gray-200 hover:bg-gray-50 p-6 transition-all duration-300"
                  style={{ backgroundColor: '#F1F4F9' }}
                >
                  <div className="flex flex-row items-center gap-3 mb-4">
                    <img className="rounded-full w-12 h-12" alt={testimonial.name} src={testimonial.avatar} />
                    <div className="flex flex-col">
                      <figcaption className="text-sm font-semibold text-gray-900">
                        {testimonial.name}
                      </figcaption>
                      <p className="text-xs text-gray-600">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-[#FBBF24]">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-sm text-gray-700">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex gap-1 mt-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
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
                  className="relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border border-gray-200 hover:bg-gray-50 p-6 transition-all duration-300"
                  style={{ backgroundColor: '#F1F4F9' }}
                >
                  <div className="flex flex-row items-center gap-3 mb-4">
                    <img className="rounded-full w-12 h-12" alt={testimonial.name} src={testimonial.avatar} />
                    <div className="flex flex-col">
                      <figcaption className="text-sm font-semibold text-gray-900">
                        {testimonial.name}
                      </figcaption>
                      <p className="text-xs text-gray-600">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-[#FBBF24]">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-sm text-gray-700">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex gap-1 mt-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
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
                  className="relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border border-gray-200 hover:bg-gray-50 p-6 transition-all duration-300"
                  style={{ backgroundColor: '#F1F4F9' }}
                >
                  <div className="flex flex-row items-center gap-3 mb-4">
                    <img className="rounded-full w-12 h-12" alt={testimonial.name} src={testimonial.avatar} />
                    <div className="flex flex-col">
                      <figcaption className="text-sm font-semibold text-gray-900">
                        {testimonial.name}
                      </figcaption>
                      <p className="text-xs text-gray-600">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-[#FBBF24]">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-sm text-gray-700">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex gap-1 mt-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
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
                  className="relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border border-gray-200 hover:bg-gray-50 p-6 transition-all duration-300"
                  style={{ backgroundColor: '#F1F4F9' }}
                >
                  <div className="flex flex-row items-center gap-3 mb-4">
                    <img className="rounded-full w-12 h-12" alt={testimonial.name} src={testimonial.avatar} />
                    <div className="flex flex-col">
                      <figcaption className="text-sm font-semibold text-gray-900">
                        {testimonial.name}
                      </figcaption>
                      <p className="text-xs text-gray-600">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-[#FBBF24]">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-sm text-gray-700">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex gap-1 mt-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                </figure>
              ))}
            </Marquee>

            {/* Gradient Overlays */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-blue-50/80"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-purple-50/80"></div>
          </div>
        </div>
      </section>


      {/* Why Choose Sartthi Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Sartthi?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The all-in-one project management platform designed for modern teams. Boost productivity, streamline workflows, and achieve your goals faster.
            </p>
          </div>



          {/* FlowingMenu */}
          <div style={{ height: '600px', position: 'relative', marginBottom: '4rem' }}>
            <FlowingMenu items={[
              { 
                link: '#task-management', 
                text: 'Task Management', 
                description: 'Organize tasks with Kanban boards • Set priorities and deadlines • Track progress in real-time • Manage dependencies',
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop'
              },
              { 
                link: '#team-collaboration', 
                text: 'Team Collaboration', 
                description: 'Real-time chat and updates • Share files instantly • Activity feeds • Work together seamlessly from anywhere',
                image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop'
              },
              { 
                link: '#ai-insights', 
                text: 'AI-Powered Insights', 
                description: 'Custom AI API integration • Predictive analytics • Smart scheduling • Automated reports and recommendations',
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop'
              },
              { 
                link: '#smart-attendance', 
                text: 'Smart Attendance', 
                description: 'Face recognition technology • Location tracking • Automated attendance reports • Secure workspace verification',
                image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&h=400&fit=crop'
              }
            ]} />
          </div>

          {/* Feature Highlights */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Features List */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-8">
                  Everything You Need in One Platform
                </h3>
                <div className="space-y-6">
                  {[
                    { icon: '📋', title: 'Task Management', desc: 'Kanban boards, priorities, and dependencies' },
                    { icon: '👥', title: 'Team Collaboration', desc: 'Real-time chat, file sharing, and updates' },
                    { icon: '📊', title: 'Analytics & Reports', desc: 'AI-powered insights and predictions' },
                    { icon: '📍', title: 'Smart Attendance', desc: 'Face recognition and location tracking' }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{feature.title}</div>
                        <div className="text-sm text-gray-600">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - CTA Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-6xl mb-6">🚀</div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Get Started?
                  </h4>
                  <p className="text-gray-600 mb-8">
                    Join thousands of teams already using Sartthi to manage their projects more efficiently.
                  </p>
                  <div className="space-y-4">
                    <Link
                      to="/pricing"
                      className="block w-full py-4 px-6 rounded-full font-semibold text-white hover:text-white transition-all shadow-lg hover:shadow-xl hover:opacity-90"
                      style={{ backgroundColor: '#006397' }}
                    >
                      Start Free Trial
                    </Link>
                    <Link
                      to="/login"
                      className="block w-full py-4 px-6 border-2 rounded-full font-semibold transition-all hover:bg-gray-50"
                      style={{ borderColor: '#006397', color: '#006397' }}
                    >
                      Sign In
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500 mt-6">
                    No credit card required • Free 14-day trial
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section - Reference Design */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your team's needs. All plans include core features.
            </p>
          </div>
          
          {/* Pricing Cards */}
          <PricingCards />
        </div>
      </section>


      {/* Blog/Resources Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#FFF3CD', color: '#856404' }}>
              Resources
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tips, insights, and best practices for project management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-gray-900 text-xs font-semibold rounded-full" style={{ backgroundColor: '#FFC700' }}>
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#006397] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center gap-2 text-[#006397] font-semibold hover:gap-3 transition-all"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#006397] via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#F5F8FD] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F5F8FD] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Join thousands of teams already using Sartthi to manage their projects better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group px-8 py-4 bg-[#F5F8FD] text-[#006397] rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 bg-transparent text-white rounded-xl font-bold text-lg border-2 border-white hover:bg-[#F5F8FD] hover:text-[#006397] transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
          <p className="mt-8 text-blue-100 text-sm">
            ✨ No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* FAQ Section with Category Filters */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header with Get In Touch Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Frequently asked questions
              </h2>
              <p className="text-lg text-gray-600">
                Answers to common queries about Sartthi.
              </p>
            </div>
            <Link
              to="/contact"
              className="px-8 py-3 bg-[#006397] text-white hover:text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Get In Touch
            </Link>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 overflow-x-auto pb-2">
            {['General', 'Pricing & Plans', 'Features & Functionality', 'Security & Privacy', 'Support & Updates'].map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-2.5 rounded-lg border font-medium transition-all whitespace-nowrap ${
                  activeTab === index
                    ? 'bg-gray-100 border-gray-300 text-gray-900'
                    : 'bg-[#F5F8FD] border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 transition-all duration-300"
                style={{ backgroundColor: '#F1F4F9' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold pr-8 text-gray-900">
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 text-gray-600 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Gradient Text Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-5xl md:text-9xl lg:text-[18rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 dark:from-neutral-950 to-neutral-200 dark:to-neutral-800 inset-x-0">
            SARTTHI
          </p>
        </div>
      </section>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Segmented Radio Button Selector */
        .radio-inputs {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          border-radius: 0.5rem;
          background-color: #eee;
          box-sizing: border-box;
          box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
          padding: 0.25rem;
          width: auto;
          max-width: 800px;
          font-size: 14px;
        }

        .radio-inputs .radio {
          flex: 1 1 auto;
          text-align: center;
        }

        .radio-inputs .radio input {
          display: none;
        }

        .radio-inputs .radio .name {
          display: flex;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          border: none;
          padding: 0.75rem 1.5rem;
          color: rgba(51, 65, 85, 1);
          transition: all 0.15s ease-in-out;
        }

        .radio-inputs .radio input:checked + .name {
          background-color: #fff;
          font-weight: 600;
        }

        .radio-inputs .radio:hover .name {
          background-color: rgba(255, 255, 255, 0.5);
        }

        .radio-inputs .radio input:checked + .name {
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          animation: select 0.3s ease;
        }

        @keyframes select {
          0% {
            transform: scale(0.95);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .radio-inputs .radio input:checked + .name::before,
        .radio-inputs .radio input:checked + .name::after {
          content: "";
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #006397;
          opacity: 0;
          animation: particles 0.5s ease forwards;
        }

        .radio-inputs .radio input:checked + .name::before {
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          --direction: -10px;
        }

        .radio-inputs .radio input:checked + .name::after {
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          --direction: 10px;
        }

        @keyframes particles {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(var(--direction));
          }
        }
        }
      `}</style>
      
      <SharedFooter />
    </div>
  );
};

export default LandingPage;
