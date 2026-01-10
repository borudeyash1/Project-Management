import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Star, Users, Shield,
  Clock, Target, Sparkles, ChevronRight,
  BarChart3, Calendar, Zap, TrendingUp,
  Code, Globe, Smartphone,
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
  const [adminFeatureTab, setAdminFeatureTab] = useState<number>(0);

  // Live mockup states for animations
  const [liveTaskIndex, setLiveTaskIndex] = useState(0);
  const [liveChatIndex, setLiveChatIndex] = useState(0);
  const [liveProgress, setLiveProgress] = useState(87);
  const [liveTime, setLiveTime] = useState(new Date());
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

  // Live mockup animations
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTaskIndex(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveChatIndex(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveProgress(prev => {
        const newProgress = prev + 1;
        return newProgress > 100 ? 85 : newProgress;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Project Management",
      description: "Organize and track your projects with powerful tools and intuitive interfaces that scale with your team.",
      image: "/projects_view_ui_1764317804293.png"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates, comments, and file sharing capabilities.",
      image: "/collaboration_ui_1764317298899.png"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Get deep insights into your team's performance with customizable dashboards and detailed reports.",
      image: "/analytics_ui_1764317315064.png"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Time Tracking",
      description: "Monitor time spent on tasks and projects to improve productivity and billing accuracy.",
      image: "/task_management_ui_1764317282097.png"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Scheduling",
      description: "Automated intelligent scheduling based on comprehensive user profiles, availability, and workload patterns.",
      image: "/tasks_board_ui_1764317826607.png"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Your data is protected with enterprise-grade security, encryption, and compliance standards.",
      image: "/hero_dashboard_mockup_1764317223182.png"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI Automation",
      description: "Integrate your own AI chatbot API and leverage AI-powered automation for smarter workflows.",
      image: "/home_dashboard_ui_1764317785275.png"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Smart Attendance",
      description: "Face and location-based attendance tracking in workspace for accurate and secure time management.",
      image: "/hero_dashboard_mockup_1764317223182.png"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Desktop Application",
      description: "Access your projects with our powerful native desktop application for enhanced productivity.",
      image: "/desktop1.jpeg"
    }
  ];

  // Metrics section is hidden - keeping data for potential future use
  // const metrics = [
  //   { value: "1K+", label: "Active Users", icon: <Users className="w-8 h-8" /> },
  //   { value: "99.5%", label: "Uptime", icon: <TrendingUp className="w-8 h-8" /> },
  //   { value: "10+", label: "Countries", icon: <Globe className="w-8 h-8" /> },
  //   { value: "4.7/5", label: "User Rating", icon: <Star className="w-8 h-8" /> }
  // ];

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

  // Pricing plans - keeping data for potential future use
  /* const pricingPlans = [
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
  ]; */

  const integrations = [
    // ✅ FULLY WORKING INTEGRATIONS
    { name: "GitHub", logo: "https://img.icons8.com/?size=100&id=12599&format=png&color=000000", category: "Development" },
    { name: "Dropbox", logo: "https://img.icons8.com/?size=100&id=13657&format=png&color=000000", category: "Cloud Storage" },
    { name: "Notion", logo: "https://img.icons8.com/?size=100&id=F6H2fsqXKBwH&format=png&color=000000", category: "Documentation" },
    { name: "Spotify", logo: "https://img.icons8.com/?size=100&id=G9XXzb9XaEKX&format=png&color=000000", category: "Music" },

    // 🔜 PENDING INTEGRATIONS (Have API Keys)
    { name: "Slack", logo: "https://img.icons8.com/?size=100&id=19978&format=png&color=000000", category: "Communication" },
    { name: "Jira", logo: "https://img.icons8.com/?size=100&id=oROcPah5ues6&format=png&color=000000", category: "Project Management" },
    { name: "Figma", logo: "https://img.icons8.com/?size=100&id=zfHRZ6i1Wg0U&format=png&color=000000", category: "Design" },
    { name: "Zendesk", logo: "https://img.icons8.com/?size=100&id=0IW4VY2jfCIg&format=png&color=000000", category: "Support" },
    { name: "Linear", logo: "https://img.icons8.com/?size=100&id=6ASD5XtjsJc6&format=png&color=000000", category: "Project Management" },
    { name: "Discord", logo: "https://img.icons8.com/?size=100&id=30998&format=png&color=000000", category: "Communication" },
    { name: "Vercel", logo: "https://img.icons8.com/?size=100&id=2xFS7aynbwiR&format=png&color=000000", category: "Deployment" }
  ];

  const useCases = [
    {
      title: "Software Development",
      description: "Manage sprints, track bugs, and collaborate on code with integrated development tools.",
      icon: <Code className="w-12 h-12" />,
      color: "from-blue-500 to-cyan-500",
      image: "/projects_view_ui_1764317804293.png"
    },
    {
      title: "Remote Teams",
      description: "Keep distributed teams aligned with real-time collaboration, smart attendance, and seamless communication.",
      icon: <Users className="w-12 h-12" />,
      color: "from-purple-600 to-indigo-600",
      image: "/collaboration_ui_1764317298899.png"
    },
    {
      title: "Design & Creative",
      description: "Collaborate on design projects with feedback tools, asset management, and creative workflows.",
      icon: <Target className="w-12 h-12" />,
      color: "from-orange-500 to-red-500",
      image: "/home_dashboard_ui_1764317785275.png"
    },
    {
      title: "Product Management",
      description: "Coordinate cross-functional teams, track milestones, and deliver successful product launches.",
      icon: <Star className="w-12 h-12" />,
      color: "from-green-500 to-emerald-500",
      image: "/analytics_ui_1764317315064.png"
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

  // Company logos section is hidden - keeping data for potential future use
  // const companyLogos = [
  //   "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Spotify", "Uber", "Airbnb", "Tesla"
  // ];

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
                  <path d="M2 10C50 5, 100 2, 150 3C200 4, 250 7, 298 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
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

      {/* Trusted By Section - HIDDEN */}
      {/* <section className="py-12 bg-[#F5F8FD] border-y border-gray-200">
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
      </section> */}


      {/* Metrics Section with Animated Counters - HIDDEN */}
      {/* <section className="py-20 relative overflow-hidden" style={{ backgroundColor: 'rgb(245, 248, 253)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-110 transition-transform duration-300"
              >
                <div className="flex justify-center mb-4 text-[#006397]">
                  {metric.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#006397] to-[#0088CC] bg-clip-text text-transparent">
                  {metric.value}
                </div>
                <div className="text-gray-600 font-medium">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}


      {/* Features Section with Grid Layout */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F8FD] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[rgba(0,99,151,0.1)] text-[#006397] rounded-full text-sm font-semibold mb-4">
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
                className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-8 pb-0 flex-1 relative z-10">
                  {/* Icon & Text */}
                  <div className="w-12 h-12 bg-[#006397]/10 rounded-xl flex items-center justify-center text-[#006397] mb-6 group-hover:bg-[#006397] group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">{feature.description}</p>
                </div>

                {/* Mockup Image Area */}
                <div className="relative h-56 w-full mt-auto overflow-hidden bg-gray-50 border-t border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="absolute top-6 left-6 w-[110%] h-[110%] object-cover object-left-top rounded-tl-xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.2)] transform transition-transform duration-700 group-hover:translate-x-[-10px] group-hover:translate-y-[-10px] group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[rgba(0,99,151,0.1)] text-[rgb(0,99,151)] rounded-full text-sm font-semibold mb-4">
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
                className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-[480px]"
              >
                <div className="p-8 flex-1 relative z-10 flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <div className="transform scale-75">
                      {useCase.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{useCase.description}</p>
                </div>

                {/* Skewed Image Mockup */}
                <div className="relative h-56 w-full mt-auto">
                  <div className={`absolute inset-0 bg-gradient-to-t ${useCase.color.split(' ')[0]} opacity-5`}></div>
                  <img
                    src={useCase.image}
                    alt={useCase.title}
                    className="absolute top-8 left-8 w-[120%] h-full object-cover object-left-top rounded-tl-2xl shadow-xl transform -rotate-6 transition-transform duration-700 group-hover:rotate-0 group-hover:translate-x-[-10px] group-hover:translate-y-[-10px] group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[rgba(0,99,151,0.1)] text-[rgb(0,99,151)] rounded-full text-sm font-semibold mb-4">
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
          <div className="flex justify-center mb-16 overflow-x-auto">
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
              <label className="radio">
                <input
                  type="radio"
                  name="admin-feature"
                  checked={adminFeatureTab === 4}
                  onChange={() => setAdminFeatureTab(4)}
                />
                <span className="name">Integration Setup</span>
              </label>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Dashboard Preview */}
            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#F1F4F9' }}>
              <div className="p-8">
                {/* Dynamic Feature UI Mockup */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6" style={{ minHeight: '520px' }}>
                  {/* Task Management UI */}
                  {adminFeatureTab === 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-base">Task Management</h3>
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 status-bounce"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        </div>
                      </div>

                      {/* View Tabs */}
                      <div className="flex gap-2 mb-4">
                        {[
                          { name: 'Kanban', icon: '📋' },
                          { name: 'Timeline', icon: '📅' },
                          { name: 'List', icon: '📝' }
                        ].map((view, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${liveTaskIndex === idx
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            <span className="mr-1">{view.icon}</span>
                            {view.name}
                          </div>
                        ))}
                      </div>

                      {/* Kanban Board View */}
                      {liveTaskIndex === 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {['To Do', 'In Progress', 'Done'].map((status, idx) => {
                            // Diverse task types with icons, labels, and assignees
                            const allTasks = [
                              {
                                id: 1,
                                title: 'Fix Login Bug',
                                type: 'bug',
                                due: 'Dec 21',
                                priority: 'high',
                                dots: 3,
                                assignee: 'JD',
                                assigneeColor: '#EF4444',
                                label: 'Backend',
                                labelColor: 'bg-red-100 text-red-700'
                              },
                              {
                                id: 2,
                                title: 'API Integration',
                                type: 'feature',
                                due: 'Dec 22',
                                priority: 'medium',
                                dots: 2,
                                assignee: 'SM',
                                assigneeColor: '#3B82F6',
                                label: 'Feature',
                                labelColor: 'bg-blue-100 text-blue-700'
                              },
                              {
                                id: 3,
                                title: 'Homepage Design',
                                type: 'design',
                                due: 'Dec 23',
                                priority: 'low',
                                dots: 1,
                                assignee: 'AK',
                                assigneeColor: '#8B5CF6',
                                label: 'Design',
                                labelColor: 'bg-purple-100 text-purple-700'
                              },
                              {
                                id: 4,
                                title: 'Database Setup',
                                type: 'code',
                                due: 'Dec 24',
                                priority: 'high',
                                dots: 3,
                                assignee: 'MJ',
                                assigneeColor: '#10B981',
                                label: 'DevOps',
                                labelColor: 'bg-green-100 text-green-700'
                              },
                              {
                                id: 5,
                                title: 'User Testing',
                                type: 'test',
                                due: 'Dec 25',
                                priority: 'medium',
                                dots: 2,
                                assignee: 'LC',
                                assigneeColor: '#F59E0B',
                                label: 'QA',
                                labelColor: 'bg-yellow-100 text-yellow-700'
                              },
                              {
                                id: 6,
                                title: 'Code Review',
                                type: 'code',
                                due: 'Dec 26',
                                priority: 'low',
                                dots: 1,
                                assignee: 'RP',
                                assigneeColor: '#EC4899',
                                label: 'Review',
                                labelColor: 'bg-pink-100 text-pink-700'
                              }
                            ];

                            // Rotate tasks through columns
                            const getTasksForColumn = () => {
                              return idx === 0 ? [allTasks[0], allTasks[1]] : idx === 1 ? [allTasks[2], allTasks[3]] : [allTasks[4], allTasks[5]];
                            };

                            const columnTasks = getTasksForColumn();

                            // Task type icons
                            const getTaskIcon = (type: string) => {
                              switch (type) {
                                case 'bug':
                                  return (
                                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  );
                                case 'feature':
                                  return (
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                  );
                                case 'design':
                                  return (
                                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                  );
                                case 'code':
                                  return (
                                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                  );
                                case 'test':
                                  return (
                                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                  );
                                default:
                                  return null;
                              }
                            };

                            return (
                              <div
                                key={idx}
                                className="bg-gray-50 rounded-xl p-3 transition-all duration-500 fade-in-up"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="text-xs font-bold text-gray-700">{status}</div>
                                  <div className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                                    {columnTasks.length}
                                  </div>
                                </div>
                                <div className="space-y-2.5">
                                  {columnTasks.map((task, taskIdx) => (
                                    <div
                                      key={task.id}
                                      className="task-card-animated bg-white p-3 rounded-lg shadow-sm border-l-4 transition-all hover:shadow-lg cursor-move group"
                                      style={{
                                        borderColor: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#10B981',
                                        animationDelay: `${taskIdx * 0.15}s`
                                      }}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-1.5 flex-1">
                                          {getTaskIcon(task.type)}
                                          <div className="text-xs font-semibold text-gray-900">{task.title}</div>
                                        </div>
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500 status-bounce' :
                                          task.priority === 'medium' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                          }`}></div>
                                      </div>

                                      <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${task.labelColor}`}>
                                        {task.label}
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          {task.due}
                                        </div>
                                        <div
                                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                          style={{ backgroundColor: task.assigneeColor }}
                                        >
                                          {task.assignee}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Timeline View */}
                      {liveTaskIndex === 1 && (
                        <div className="space-y-3 fade-in-up">
                          <div className="text-xs font-semibold text-gray-600 mb-3">December 2025</div>
                          {[
                            { date: '21', day: 'Mon', tasks: [{ title: 'Fix Login Bug', color: '#EF4444', progress: 75 }] },
                            { date: '22', day: 'Tue', tasks: [{ title: 'API Integration', color: '#3B82F6', progress: 45 }] },
                            { date: '23', day: 'Wed', tasks: [{ title: 'Homepage Design', color: '#8B5CF6', progress: 90 }] },
                            { date: '24', day: 'Thu', tasks: [{ title: 'Database Setup', color: '#10B981', progress: 30 }, { title: 'User Testing', color: '#F59E0B', progress: 60 }] }
                          ].map((day, idx) => (
                            <div key={idx} className="flex gap-3 fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                              <div className="flex flex-col items-center w-12 flex-shrink-0">
                                <div className="text-xs font-semibold text-gray-500">{day.day}</div>
                                <div className="text-2xl font-bold text-gray-900">{day.date}</div>
                              </div>
                              <div className="flex-1 space-y-2">
                                {day.tasks.map((task, taskIdx) => (
                                  <div key={taskIdx} className="bg-white rounded-lg p-3 shadow-sm border-l-4 hover:shadow-md transition-all" style={{ borderColor: task.color }}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-xs font-semibold text-gray-900">{task.title}</div>
                                      <div className="text-xs font-bold" style={{ color: task.color }}>{task.progress}%</div>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full transition-all duration-1000"
                                        style={{
                                          width: `${task.progress}%`,
                                          backgroundColor: task.color
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* List View */}
                      {liveTaskIndex === 2 && (
                        <div className="space-y-2 fade-in-up">
                          {[
                            { title: 'Fix Login Bug', status: 'In Progress', priority: 'High', assignee: 'JD', color: '#EF4444', progress: 75 },
                            { title: 'API Integration', status: 'To Do', priority: 'Medium', assignee: 'SM', color: '#3B82F6', progress: 45 },
                            { title: 'Homepage Design', status: 'Done', priority: 'Low', assignee: 'AK', color: '#8B5CF6', progress: 100 },
                            { title: 'Database Setup', status: 'In Progress', priority: 'High', assignee: 'MJ', color: '#10B981', progress: 30 },
                            { title: 'User Testing', status: 'To Do', priority: 'Medium', assignee: 'LC', color: '#F59E0B', progress: 60 },
                            { title: 'Code Review', status: 'Done', priority: 'Low', assignee: 'RP', color: '#EC4899', progress: 100 }
                          ].map((task, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-lg p-3 shadow-sm border-l-4 hover:shadow-md transition-all fade-in-up"
                              style={{
                                borderColor: task.color,
                                animationDelay: `${idx * 0.08}s`
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: task.color }}
                                  >
                                    {task.assignee}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-gray-900 mb-0.5">{task.title}</div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs px-2 py-0.5 rounded ${task.status === 'Done' ? 'bg-green-100 text-green-700' :
                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                          'bg-gray-100 text-gray-700'
                                        }`}>
                                        {task.status}
                                      </span>
                                      <span className={`text-xs font-medium ${task.priority === 'High' ? 'text-red-600' :
                                        task.priority === 'Medium' ? 'text-yellow-600' :
                                          'text-green-600'
                                        }`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full transition-all duration-500"
                                      style={{
                                        width: `${task.progress}%`,
                                        backgroundColor: task.color
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-bold text-gray-600 w-8 text-right">{task.progress}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Team Collaboration UI */}
                  {adminFeatureTab === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <h3 className="font-bold text-gray-900 text-base">Quick Chat</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                          <div className="w-2 h-2 rounded-full bg-green-500 status-bounce"></div>
                          <span className="text-xs text-green-700 font-medium">{3 + liveChatIndex} Online</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(() => {
                          const allMessages = [
                            {
                              name: 'Sarah Chen',
                              msg: 'Task "Homepage Redesign" assigned to you',
                              type: 'notification',
                              time: '02:58 PM',
                              avatar: 'SC',
                              color: '#10B981',
                              isRead: true,
                              icon: '📋'
                            },
                            {
                              name: 'John Doe',
                              msg: 'Uploaded design-mockup-v2.fig',
                              type: 'file',
                              time: '02:59 PM',
                              avatar: 'JD',
                              color: '#006397',
                              isRead: true,
                              icon: '📎',
                              fileSize: '2.4 MB'
                            },
                            {
                              name: 'Mike Johnson',
                              msg: 'Great work on the API integration! 🎉',
                              type: 'message',
                              time: '03:00 PM',
                              avatar: 'MJ',
                              color: '#F59E0B',
                              isRead: false,
                              reactions: ['👍', '🔥']
                            },
                            {
                              name: 'Emma Wilson',
                              msg: 'Meeting starts in 15 minutes',
                              type: 'notification',
                              time: '03:01 PM',
                              avatar: 'EW',
                              color: '#8B5CF6',
                              isRead: false,
                              icon: '🔔'
                            },
                            {
                              name: 'Alex Chen',
                              msg: 'Code review completed ✓',
                              type: 'message',
                              time: '03:02 PM',
                              avatar: 'AC',
                              color: '#EC4899',
                              isRead: false,
                              reactions: ['✅']
                            }
                          ];

                          // Show 3 messages at a time, rotating based on liveChatIndex
                          const visibleMessages = [
                            allMessages[liveChatIndex % allMessages.length],
                            allMessages[(liveChatIndex + 1) % allMessages.length],
                            allMessages[(liveChatIndex + 2) % allMessages.length]
                          ];

                          return visibleMessages.map((chat, idx) => (
                            <div
                              key={`${chat.avatar}-${idx}`}
                              className={`fade-in-up flex items-start gap-3 p-2.5 rounded-lg transition-all hover:bg-gray-50 cursor-pointer ${idx === visibleMessages.length - 1 ? 'bg-blue-50 continuous-pulse ring-1 ring-blue-200' : ''
                                }`}
                              style={{ animationDelay: `${idx * 0.15}s` }}
                            >
                              <div className="relative flex-shrink-0">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                                  style={{ backgroundColor: chat.color }}
                                >
                                  {chat.avatar}
                                </div>
                                {idx === visibleMessages.length - 1 && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white status-bounce"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-900 truncate">{chat.name}</span>
                                  <span className="text-xs text-gray-400 flex-shrink-0">{chat.time}</span>
                                  {chat.isRead && (
                                    <span className="text-xs text-blue-500 ml-auto">✓✓</span>
                                  )}
                                </div>
                                <div className={`text-sm rounded-lg px-3 py-2 shadow-sm border ${chat.type === 'notification' ? 'bg-purple-50 border-purple-200 text-purple-900' :
                                  chat.type === 'file' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                                    'bg-white border-gray-100 text-gray-700'
                                  }`}>
                                  {chat.icon && <span className="mr-1">{chat.icon}</span>}
                                  {chat.msg}
                                  {chat.fileSize && (
                                    <div className="text-xs text-blue-600 mt-1 font-medium">{chat.fileSize}</div>
                                  )}
                                  {chat.reactions && chat.reactions.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                      {chat.reactions.map((reaction, rIdx) => (
                                        <span key={rIdx} className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                          {reaction}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                        {/* Typing indicator */}
                        <div className="flex items-start gap-3 p-2.5 opacity-60 fade-in-up" style={{ animationDelay: '0.45s' }}>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"></div>
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-400 italic mt-2">Someone is typing...</div>
                          </div>
                        </div>
                      </div>
                      {/* Quick actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Message
                        </button>
                        <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI-Powered Insights UI */}
                  {adminFeatureTab === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-base">AI Analytics Dashboard</h3>
                        <div className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs font-semibold continuous-pulse flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 7H7v6h6V7z" />
                            <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                          </svg>
                          AI Powered
                        </div>
                      </div>

                      {/* Metrics Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Productivity', value: liveProgress, trend: '+12%', color: 'blue' },
                          { label: 'On-Time Delivery', value: 94, trend: '+5%', color: 'green' }
                        ].map((stat, idx) => (
                          <div
                            key={idx}
                            className="continuous-pulse bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-medium text-gray-500">{stat.label}</div>
                              <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {stat.trend}
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}%</div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${stat.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                                  }`}
                                style={{
                                  width: `${stat.value}%`,
                                  boxShadow: `0 0 10px ${stat.color === 'blue' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Timeline Prediction Chart */}
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-semibold text-gray-700">Project Timeline Prediction</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Predicted
                          </div>
                        </div>
                        <div className="h-28 relative">
                          <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="aiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#006397" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#006397" stopOpacity="0" />
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                  <feMergeNode in="coloredBlur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>
                            {/* Area fill */}
                            <path
                              d="M0,70 L50,55 L100,60 L150,40 L200,45 L250,30 L300,25 L300,100 L0,100 Z"
                              fill="url(#aiGradient)"
                              className="fade-in-up"
                            />
                            {/* Line */}
                            <path
                              d="M0,70 L50,55 L100,60 L150,40 L200,45 L250,30 L300,25"
                              fill="none"
                              stroke="#006397"
                              strokeWidth="3"
                              filter="url(#glow)"
                              className="task-card-animated"
                            />
                            {/* Data points */}
                            {[
                              { x: 0, y: 70 },
                              { x: 50, y: 55 },
                              { x: 100, y: 60 },
                              { x: 150, y: 40 },
                              { x: 200, y: 45 },
                              { x: 250, y: 30 },
                              { x: 300, y: 25 }
                            ].map((point, idx) => (
                              <circle
                                key={idx}
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="#006397"
                                className="continuous-pulse"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                              />
                            ))}
                          </svg>
                          {/* Trend indicator */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-xs font-semibold text-green-700">Improving</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 continuous-pulse">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 mb-1">AI Recommendation</div>
                            <div className="text-xs text-gray-600">
                              Based on current trends, consider allocating more resources to high-priority tasks to maintain {liveProgress}% productivity.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Smart Attendance UI */}
                  {adminFeatureTab === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-base">Attendance Tracker</h3>
                        <div className="text-xs text-gray-500">
                          Today: {liveTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Check-in Status Card with Face Scan */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-600 mb-1">Check-in Status</div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                              {liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 status-bounce"></div>
                              <span className="text-xs font-semibold text-green-700">Face Verified</span>
                            </div>
                          </div>

                          {/* Animated Face Scan */}
                          <div className="relative w-20 h-20">
                            {/* Face Icon with Pulse */}
                            <div className="absolute inset-0 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-green-200 continuous-pulse">
                              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>

                            {/* Scanning Ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-green-500 opacity-50" style={{
                              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                            }}></div>

                            {/* Scanning Line */}
                            <div className="absolute inset-0 overflow-hidden rounded-full">
                              <div
                                className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"
                                style={{
                                  animation: 'scan-vertical 3s ease-in-out infinite',
                                  boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
                                }}
                              ></div>
                            </div>

                            {/* Detection Points */}
                            {[
                              { top: '20%', left: '30%' },
                              { top: '25%', right: '30%' },
                              { top: '45%', left: '25%' },
                              { top: '45%', right: '25%' },
                              { top: '65%', left: '50%', transform: 'translateX(-50%)' }
                            ].map((pos, idx) => (
                              <div
                                key={idx}
                                className="absolute w-1.5 h-1.5 bg-green-500 rounded-full"
                                style={{
                                  ...pos,
                                  animation: `pulse 2s ease-in-out infinite`,
                                  animationDelay: `${idx * 0.2}s`,
                                  boxShadow: '0 0 4px rgba(34, 197, 94, 0.8)'
                                }}
                              ></div>
                            ))}

                            {/* Corner Brackets */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
                              <path d="M10,20 L10,10 L20,10" stroke="#10B981" strokeWidth="2" fill="none" className="continuous-pulse" />
                              <path d="M60,10 L70,10 L70,20" stroke="#10B981" strokeWidth="2" fill="none" className="continuous-pulse" />
                              <path d="M10,60 L10,70 L20,70" stroke="#10B981" strokeWidth="2" fill="none" className="continuous-pulse" />
                              <path d="M60,70 L70,70 L70,60" stroke="#10B981" strokeWidth="2" fill="none" className="continuous-pulse" />
                            </svg>

                            {/* Verification Checkmark */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg status-bounce">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Biometric Details */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-green-200">
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-xs text-gray-500 mb-1">Confidence</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                  style={{ width: `${Math.min(liveProgress + 2, 99)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-green-700">{Math.min(liveProgress + 2, 99)}%</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-xs text-gray-500 mb-1">Match Score</div>
                            <div className="text-sm font-bold text-gray-900">{(Math.min(liveProgress + 2, 99) / 100).toFixed(3)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Team Status */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-3">Team Status</div>
                        <div className="space-y-2">
                          {(() => {
                            const allMembers = [
                              { name: 'Alice Brown', status: 'Office', time: '8:30 AM', color: '#10B981', avatar: 'AB' },
                              { name: 'Bob Wilson', status: 'Remote', time: '8:45 AM', color: '#3B82F6', avatar: 'BW' },
                              { name: 'Carol Davis', status: 'Absent', time: '-', color: '#EF4444', avatar: 'CD' },
                              { name: 'David Lee', status: 'Office', time: '9:00 AM', color: '#10B981', avatar: 'DL' },
                              { name: 'Emma White', status: 'Remote', time: '8:15 AM', color: '#3B82F6', avatar: 'EW' }
                            ];

                            const visibleMembers = [
                              allMembers[liveChatIndex % allMembers.length],
                              allMembers[(liveChatIndex + 1) % allMembers.length],
                              allMembers[(liveChatIndex + 2) % allMembers.length]
                            ];

                            return visibleMembers.map((member, idx) => (
                              <div
                                key={`${member.avatar}-${idx}`}
                                className={`fade-in-up flex items-center justify-between bg-white rounded-lg p-3 border transition-all hover:shadow-md ${member.status === 'Absent' ? 'border-red-200 bg-red-50' :
                                  member.status === 'Office' ? 'border-green-200' :
                                    'border-blue-200'
                                  }`}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                                    style={{ backgroundColor: member.color }}
                                  >
                                    {member.avatar}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Office' ? 'bg-green-500 status-bounce' :
                                        member.status === 'Remote' ? 'bg-blue-500 status-bounce' :
                                          'bg-red-500'
                                        }`}></div>
                                      <span className={`text-xs font-medium ${member.status === 'Office' ? 'text-green-700' :
                                        member.status === 'Remote' ? 'text-blue-700' :
                                          'text-red-700'
                                        }`}>
                                        {member.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs font-medium text-gray-600">{member.time}</div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Enhanced Location Verification */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 continuous-pulse">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 mb-1">Location Verified</div>
                            <div className="text-xs text-gray-600 mb-2">Workspace: Main Office, Floor 3</div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 status-bounce"></div>
                              <span className="text-xs text-green-700 font-medium">Within 50m radius</span>
                            </div>
                          </div>
                        </div>

                        {/* GPS Details */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-200">
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-xs text-gray-500 mb-0.5">Latitude</div>
                            <div className="text-xs font-mono font-semibold text-gray-900">19.0760° N</div>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-xs text-gray-500 mb-0.5">Longitude</div>
                            <div className="text-xs font-mono font-semibold text-gray-900">72.8777° E</div>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-xs text-gray-500 mb-0.5">Accuracy</div>
                            <div className="text-xs font-semibold text-blue-700">±{15 + (liveProgress % 10)}m</div>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-xs text-gray-500 mb-0.5">Signal</div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4].map((bar) => (
                                <div
                                  key={bar}
                                  className={`w-1 rounded-sm ${bar <= 3 ? 'bg-green-500' : 'bg-gray-300'}`}
                                  style={{ height: `${bar * 3}px` }}
                                ></div>
                              ))}
                              <span className="text-xs font-semibold text-green-700 ml-1">Strong</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Integration Setup UI */}
                  {adminFeatureTab === 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-base">Connect Integrations</h3>
                        <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Easy Setup</div>
                      </div>

                      {/* Setup Steps */}
                      <div className="space-y-2">
                        {(() => {
                          // Determine step status based on liveProgress
                          const getStepStatus = (step: number) => {
                            if (liveProgress >= 95) return 'complete';
                            if (step === 1) return 'complete';
                            if (step === 2 && liveProgress >= 90) return 'complete';
                            if (step === 2) return 'active';
                            return 'pending';
                          };

                          return [
                            { step: 1, title: 'Choose Integration', desc: 'Select from 11+ integrations', icon: '🔌' },
                            { step: 2, title: 'Authorize Access', desc: 'One-click OAuth connection', icon: '🔐' },
                            { step: 3, title: 'Configure Settings', desc: 'Customize your preferences', icon: '⚙️' }
                          ].map((item, idx) => {
                            const status = getStepStatus(item.step);
                            return (
                              <div
                                key={idx}
                                className={`fade-in-up flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${status === 'complete' ? 'bg-green-50 border-green-300' :
                                  status === 'active' ? 'bg-blue-50 border-blue-400 shadow-md continuous-pulse' :
                                    'bg-gray-50 border-gray-200 opacity-60'
                                  }`}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${status === 'complete' ? 'bg-green-500 text-white' :
                                  status === 'active' ? 'bg-blue-500 text-white' :
                                    'bg-gray-300 text-gray-600'
                                  }`}>
                                  {status === 'complete' ? '✓' : item.step}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                                  <div className="text-xs text-gray-600 mt-0.5">{item.desc}</div>
                                </div>
                                <div className="text-xl flex-shrink-0">{item.icon}</div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {/* OAuth Authorization - Rotating Integrations */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
                        <div className="text-xs font-semibold text-gray-700 mb-3">OAuth Authorization</div>
                        {(() => {
                          const allIntegrations = [
                            {
                              name: 'GitHub',
                              desc: 'Code Repository',
                              color: 'bg-gray-900',
                              icon: (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                              )
                            },
                            {
                              name: 'Slack',
                              desc: 'Team Communication',
                              color: 'bg-purple-600',
                              icon: (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                                </svg>
                              )
                            },
                            {
                              name: 'Dropbox',
                              desc: 'Cloud Storage',
                              color: 'bg-blue-600',
                              icon: (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 1.807L0 5.629l6 3.822 6-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6-3.822-6-3.822L0 13.274zm12 0l6 3.822 6-3.822-6-3.822-6 3.822zM6 18.371l6 3.822 6-3.822-6-3.822-6 3.822z" />
                                </svg>
                              )
                            }
                          ];

                          const currentIntegration = allIntegrations[liveChatIndex % allIntegrations.length];
                          const connectionProgress = Math.min(liveProgress, 100);

                          return (
                            <div className="bg-white rounded-lg p-3 shadow-sm fade-in-up">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg ${currentIntegration.color} flex items-center justify-center flex-shrink-0 continuous-pulse`}>
                                    {currentIntegration.icon}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">{currentIntegration.name}</div>
                                    <div className="text-xs text-gray-500">{currentIntegration.desc}</div>
                                  </div>
                                </div>
                                {connectionProgress >= 95 ? (
                                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-green-500 rounded-full status-bounce"></div>
                                    Connected
                                  </div>
                                ) : (
                                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                    Connecting...
                                  </div>
                                )}
                              </div>
                              {/* Connection Progress */}
                              {connectionProgress < 95 && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Authorization Progress</span>
                                    <span className="font-semibold text-blue-700">{connectionProgress}%</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                      style={{ width: `${connectionProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Available Integrations */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-3">Available Integrations</div>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            {
                              name: 'GitHub', color: 'bg-gray-900', icon: (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                              )
                            },
                            {
                              name: 'Dropbox', color: 'bg-blue-600', icon: (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 1.807L0 5.629l6 3.822 6-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6-3.822-6-3.822L0 13.274zm12 0l6 3.822 6-3.822-6-3.822-6 3.822zM6 18.371l6 3.822 6-3.822-6-3.822-6 3.822z" />
                                </svg>
                              )
                            },
                            {
                              name: 'Spotify', color: 'bg-green-500', icon: (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                </svg>
                              )
                            },
                            {
                              name: 'Notion', color: 'bg-gray-800', icon: (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
                                </svg>
                              )
                            }
                          ].map((integration, idx) => (
                            <div
                              key={idx}
                              className="fade-in-up flex flex-col items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                              style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                              <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center shadow-sm`}>
                                {integration.icon}
                              </div>
                              <div className="text-xs text-gray-700 font-medium text-center">{integration.name}</div>
                              <div className="w-2 h-2 bg-green-500 rounded-full status-bounce"></div>
                            </div>
                          ))}
                        </div>
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
                    },
                    {
                      icon: '🔌',
                      title: 'Integration Setup',
                      heading: 'Connect your favorite tools effortlessly',
                      description: 'Seamlessly integrate with 11+ popular tools using simple OAuth connections',
                      items: ['One-click OAuth', '11+ integrations', 'GitHub, Dropbox, Spotify', 'Easy configuration'],
                      image: 'https://via.placeholder.com/600x400/006397/FFFFFF?text=Integration+Setup'
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
            <span className="inline-block px-4 py-2 bg-[rgba(0,99,151,0.1)] text-[rgb(0,99,151)] rounded-full text-sm font-semibold mb-4">
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


      {/* Why Choose Sartthi Section - HIDDEN */}
      {/* <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Sartthi?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The all-in-one project management platform designed for modern teams. Boost productivity, streamline workflows, and achieve your goals faster.
            </p>
          </div>



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

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
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
      </section> */}
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
            <span className="inline-block px-4 py-2 bg-[rgba(0,99,151,0.1)] text-[rgb(0,99,151)] rounded-full text-sm font-semibold mb-4">
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
              className="px-8 py-3 bg-[#006397] text-white hover:text-white rounded-lg font-semibold hover:bg-[#005080] transition-all shadow-md hover:shadow-lg whitespace-nowrap"
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
                className={`px-6 py-2.5 rounded-lg border font-medium transition-all whitespace-nowrap ${activeTab === index
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
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 text-gray-600 ${openFaq === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'
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

        /* ========== LIVE MOCKUP ANIMATIONS ========== */
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(0, 99, 151, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 99, 151, 0.6), 0 0 30px rgba(0, 99, 151, 0.4);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes fillProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .task-card-animated {
          animation: slideInFromLeft 0.6s ease-out forwards;
        }

        .continuous-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .continuous-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .typing-dot {
          animation: typing 1.4s ease-in-out infinite;
        }

        .status-bounce {
          animation: bounce 2s ease-in-out infinite;
        }

        .fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .progress-fill {
          animation: fillProgress 2s ease-out forwards;
        }

        @keyframes scan-vertical {
          0% {
            top: 0;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
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
          flex-wrap: nowrap;
          border-radius: 0.5rem;
          background-color: #eee;
          box-sizing: border-box;
          box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
          padding: 0.25rem;
          width: auto;
          max-width: 1000px;
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
