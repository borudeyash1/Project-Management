import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageSquare, FileText, Zap, Shield, CheckCircle, Play } from 'lucide-react';
import SharedNavbar from './SharedNavbar';
import SharedFooter from './SharedFooter';
import ContentBanner from './ContentBanner';

const AIInformationPage: React.FC = () => {
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Interactive mockup states
  const [aiResponse, setAiResponse] = React.useState('');
  const [chartValue, setChartValue] = React.useState(3400);
  const [activeDay, setActiveDay] = React.useState(2); // Thursday
  const [showTaskInput, setShowTaskInput] = React.useState(false);
  
  // Interactive accordion state
  const [activeStep, setActiveStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  
  // Mockup animation states
  const [chatMessages, setChatMessages] = React.useState<number>(1);
  const [processingStep, setProcessingStep] = React.useState<number>(0);
  const [showResults, setShowResults] = React.useState<boolean>(false);
  
  // Security & Workspace animation states
  const [activeWorkspace, setActiveWorkspace] = React.useState<number>(0);
  const [securityScanProgress, setSecurityScanProgress] = React.useState<number>(0);

  const fullAiResponse = "Based on your calendar patterns and preferences, I recommend scheduling the team meeting for Tuesday at 2pm. This time slot has historically had the highest attendance rate, and it avoids conflicts with other recurring meetings.";

  // Typing animation for AI response
  React.useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullAiResponse.length) {
        setAiResponse(fullAiResponse.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Reset after completion
        setTimeout(() => {
          setAiResponse('');
          currentIndex = 0;
        }, 3000);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, []);

  // Chart value animation
  React.useEffect(() => {
    const chartInterval = setInterval(() => {
      setChartValue(prev => {
        const newValue = prev + Math.floor(Math.random() * 200) - 100;
        return Math.max(3000, Math.min(4000, newValue));
      });
    }, 2000);

    return () => clearInterval(chartInterval);
  }, []);

  // Calendar day cycling
  React.useEffect(() => {
    const dayInterval = setInterval(() => {
      setActiveDay(prev => (prev + 1) % 5);
    }, 3000);

    return () => clearInterval(dayInterval);
  }, []);

  // Task input toggle
  React.useEffect(() => {
    const taskInterval = setInterval(() => {
      setShowTaskInput(prev => !prev);
    }, 4000);

    return () => clearInterval(taskInterval);
  }, []);

  // Auto-advance accordion steps
  React.useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setActiveStep(current => (current + 1) % 4); // 4 steps total
          return 0;
        }
        return prev + 1.25; // Increment by 1.25% every 100ms = 8 seconds total (slower)
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  // Animate chat messages for Step 0 (slower)
  React.useEffect(() => {
    if (activeStep === 0) {
      const chatInterval = setInterval(() => {
        setChatMessages(prev => (prev % 4) + 1); // Cycle through 4 message states
      }, 3000); // Changed from 2000ms to 3000ms
      return () => clearInterval(chatInterval);
    }
  }, [activeStep]);

  // Animate processing steps for Step 1 (slower)
  React.useEffect(() => {
    if (activeStep === 1) {
      const processInterval = setInterval(() => {
        setProcessingStep(prev => (prev + 1) % 3); // Cycle through 3 processing steps
      }, 2500); // Changed from 1500ms to 2500ms
      return () => clearInterval(processInterval);
    }
  }, [activeStep]);

  // Animate results for Step 2 (slower)
  React.useEffect(() => {
    if (activeStep === 2) {
      const resultsInterval = setInterval(() => {
        setShowResults(prev => !prev); // Toggle between summary and details
      }, 5000); // Changed from 3000ms to 5000ms
      return () => clearInterval(resultsInterval);
    }
  }, [activeStep]);

  // Animate workspace tabs
  React.useEffect(() => {
    const workspaceInterval = setInterval(() => {
      setActiveWorkspace(prev => (prev + 1) % 3); // Cycle through 3 workspaces
    }, 4000);
    return () => clearInterval(workspaceInterval);
  }, []);

  // Animate security scan
  React.useEffect(() => {
    const scanInterval = setInterval(() => {
      setSecurityScanProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 120); // Complete scan in 6 seconds
    return () => clearInterval(scanInterval);
  }, []);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Navbar */}
      <div className="relative z-10">
        <SharedNavbar />
        <ContentBanner route="/ai" />
      </div>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-5xl mx-auto text-center">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm hover:shadow-md transition-all duration-300" style={{ backgroundColor: '#F1F4F9', borderColor: '#006397' }}>
              <Sparkles size={20} className="text-[#006397]" />
              <span className="text-sm font-semibold text-[#006397]">Introducing custom automations</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-gray-900 mb-6 leading-tight">
            Meet your AI Agent<br />Streamline your workflow
          </h1>
          
          {/* Subheading */}
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
            AI assistant designed to streamline your digital workflows and handle mundane tasks, so you can focus on what truly matters
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white hover:text-white transition-all shadow-lg hover:shadow-xl hover:opacity-90"
              style={{ backgroundColor: '#006397' }}
            >
              Try for Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:bg-gray-50 border-2"
              style={{ borderColor: '#006397', color: '#006397' }}
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="max-w-5xl mx-auto mt-10">
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={() => setIsVideoPlaying(false)}
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%23111827' width='1920' height='1080'/%3E%3C/svg%3E"
            >
              <source src="https://media.istockphoto.com/id/2174709311/video/business-schedule-calendar-and-agenda-gantt.mp4?s=mp4-640x640-is&k=20&c=_pfjQ_8mYZMiCE9pfIBkIfDUWkZyNjuyjqn0pqtwI78=" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Play Button Overlay - Only show when video is not playing */}
            {!isVideoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm transition-opacity duration-300">
                <div className="relative group cursor-pointer" onClick={handlePlayVideo}>
                  {/* Play Button Background Glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-t from-[#006397]/20 to-[#006397]/10 backdrop-blur-md group-hover:scale-110 transition-transform duration-200"></div>
                  </div>
                  
                  {/* Play Button */}
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-t from-[#006397] to-[#0077B5] shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Play className="w-8 h-8 fill-white text-gray-900 ml-1" style={{ filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Empower Your Workflow with AI - Bento Grid */}
      <div className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 mb-4">
              Empower Your Workflow with AI
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Ask your AI Agent for real-time collaboration, seamless integrations, and actionable insights to streamline your operations.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real-time AI Collaboration */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all relative overflow-hidden min-h-[450px] shadow-sm">
              <div className="mb-4 h-80">
                {/* Chat Interface */}
                <div className="space-y-4">
                  {/* User Message */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-gradient-to-br from-[#006397] to-[#0052CC] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-xs text-sm leading-relaxed shadow-md">
                      Hey, I need help scheduling a team meeting that works well for everyone. Any suggestions for finding an optimal time slot?
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md">U</div>
                  </div>
                
                
                {/* AI Response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#006397] to-[#0052CC] flex-shrink-0 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl rounded-tl-sm max-w-xs text-sm leading-relaxed min-h-[100px] relative shadow-sm">
                    {aiResponse}
                    {aiResponse.length < fullAiResponse.length && (
                      <span className="inline-block w-0.5 h-4 bg-[#006397] ml-0.5 animate-pulse"></span>
                    )}
                  </div>
                </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time AI Collaboration</h3>
                <p className="text-gray-600 text-sm">
                  Experience real-time assistance. Ask your AI Agent to coordinate tasks, answer questions, and maintain team alignment.
                </p>
              </div>
            </div>

            {/* Seamless Integrations */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all relative overflow-visible min-h-[450px] shadow-sm">
              <div className="mb-4 flex items-center justify-center h-72 relative">
                {/* Orbiting Circles Animation */}
                <style>{`
                  @keyframes orbit1 {
                    from { transform: rotate(0deg) translateX(80px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
                  }
                  @keyframes orbit2 {
                    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
                    to { transform: rotate(-360deg) translateX(120px) rotate(360deg); }
                  }
                `}</style>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Orbit Path Borders */}
                  <div className="absolute w-40 h-40 border border-gray-300 rounded-full"></div>
                  <div className="absolute w-60 h-60 border border-gray-300 rounded-full"></div>
                  
                  {/* Center Icon */}
                  <div className="w-16 h-16 bg-[#006397] rounded-full flex items-center justify-center shadow-lg z-10">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Inner Orbit - 5 icons */}
                  <div className="absolute" style={{ animation: 'orbit1 20s linear infinite' }}>
                    <img src="https://img.icons8.com/?size=100&id=unXm4ixWAr6H&format=png&color=000000" alt="Integration" className="w-12 h-12 rounded-full shadow-lg bg-white p-2" />
                  </div>
                  
                  <div className="absolute" style={{ animation: 'orbit1 20s linear infinite', animationDelay: '-4s' }}>
                    <img src="https://img.icons8.com/?size=100&id=PxQoyT1s0uFh&format=png&color=000000" alt="Integration" className="w-10 h-10 rounded-full shadow-lg bg-white p-2" />
                  </div>
                  
                  <div className="absolute" style={{ animation: 'orbit1 20s linear infinite', animationDelay: '-8s' }}>
                    <img src="https://img.icons8.com/?size=100&id=FBO05Dys9QCg&format=png&color=000000" alt="Integration" className="w-12 h-12 rounded-full shadow-lg bg-white p-2" />
                  </div>
                  
                  <div className="absolute" style={{ animation: 'orbit1 20s linear infinite', animationDelay: '-12s' }}>
                    <img src="https://img.icons8.com/?size=100&id=YWOidjGxCpFW&format=png&color=000000" alt="Integration" className="w-10 h-10 rounded-full shadow-lg bg-white p-2" />
                  </div>
                  
                  <div className="absolute" style={{ animation: 'orbit1 20s linear infinite', animationDelay: '-16s' }}>
                    <img src="https://img.icons8.com/?size=100&id=1G3UNEZHMjPH&format=png&color=000000" alt="Integration" className="w-11 h-11 rounded-full shadow-lg bg-white p-2" />
                  </div>
                  
                  {/* Outer Orbit - 4 icons (reverse direction) */}
                  <div className="absolute" style={{ animation: 'orbit2 15s linear infinite' }}>
                    <img src="https://img.icons8.com/?size=100&id=8QGE7uQedCwQ&format=png&color=000000" alt="Integration" className="w-10 h-10 rounded-full shadow-lg bg-white p-2" />
                  </div>
                  
                  <div className="absolute" style={{ animation: 'orbit2 15s linear infinite', animationDelay: '-3.75s' }}>
                    <img src="https://img.icons8.com/?size=100&id=5WrDC03cg9ua&format=png&color=000000" alt="Integration" className="w-12 h-12 rounded-full shadow-lg bg-white p-2" />
                  </div>
                  
                  <div className="absolute" style={{ animation: 'orbit2 15s linear infinite', animationDelay: '-7.5s' }}>
                    <img src="https://img.icons8.com/?size=100&id=unXm4ixWAr6H&format=png&color=000000" alt="Integration" className="w-10 h-10 rounded-full shadow-lg bg-white p-2" />
                  </div>
                  
                  <div className="absolute" style={{ animation: 'orbit2 15s linear infinite', animationDelay: '-11.25s' }}>
                    <img src="https://img.icons8.com/?size=100&id=PxQoyT1s0uFh&format=png&color=000000" alt="Integration" className="w-11 h-11 rounded-full shadow-lg bg-white p-2" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Integrations</h3>
                <p className="text-gray-600 text-sm">
                  Unite your favorite tools for effortless connectivity. Boost productivity through interconnected workflows.
                </p>
              </div>
            </div>

            {/* Instant Insight Reporting */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-gray-200 rounded-2xl p-6 hover:border-purple-300 transition-all relative overflow-hidden min-h-[450px] shadow-sm">
              <div className="mb-4 h-72">
                {/* Chart */}
                <svg viewBox="0 0 400 180" className="w-full h-full">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#006397" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#006397" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="0" y1="120" x2="400" y2="120" stroke="#E5E7EB" strokeWidth="1" />
                  {/* Area */}
                  <path
                    d="M 0 140 L 50 130 L 100 135 L 150 120 L 200 125 L 250 110 L 300 90 L 350 70 L 400 50 L 400 180 L 0 180 Z"
                    fill="url(#areaGradient)"
                  />
                  {/* Line */}
                  <path
                    d="M 0 140 L 50 130 L 100 135 L 150 120 L 200 125 L 250 110 L 300 90 L 350 70 L 400 50"
                    stroke="#006397"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data point */}
                  <circle cx="250" cy="110" r="6" fill="#006397" className="transition-all duration-500" />
                  <circle cx="250" cy="110" r="10" fill="#006397" opacity="0.2" className="transition-all duration-500" />
                  <line x1="250" y1="110" x2="250" y2="0" stroke="#006397" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                  {/* Value label */}
                  <rect x="225" y="70" width="70" height="28" rx="6" fill="#006397" />
                  <text x="260" y="90" fontSize="15" fill="white" textAnchor="middle" fontWeight="700" className="transition-all duration-500">
                    {chartValue.toLocaleString()}
                  </text>
                </svg>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Insight Reporting</h3>
                <p className="text-gray-600 text-sm">
                  Transform raw data into clear insights in seconds. Empower smarter decisions with real-time, always-learning intelligence.
                </p>
              </div>
            </div>

            {/* Smart Automation */}
            <div className="bg-gradient-to-br from-green-50 to-white border border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-all relative overflow-hidden min-h-[550px] shadow-sm">
              <div className="mb-4 h-96">
                {/* Calendar Header */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {['Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-xs text-gray-600 text-center font-semibold">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-5 gap-2 h-24 bg-white rounded-lg p-2 border border-gray-200">
                  {['Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={day} className="flex flex-col gap-1">
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className={`h-3 rounded-md transition-all duration-500 ${
                            i === activeDay && j === 0 ? 'bg-gradient-to-r from-[#006397] to-[#0052CC] shadow-sm' : 
                            i === activeDay && j === 2 ? 'bg-gradient-to-r from-[#006397] to-[#0052CC] shadow-sm' :
                            i === (activeDay + 1) % 5 && j === 1 ? 'bg-[#006397] opacity-40' :
                            'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Time indicator */}
                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">12:00 AM</span>
                </div>
                
                {/* Task blocks */}
                <div className="mt-4 space-y-2">
                  <div className="bg-gradient-to-r from-[#006397] to-[#0052CC] text-white text-xs px-4 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    Bento grid
                  </div>
                  <div className="bg-gradient-to-r from-[#006397] to-[#0052CC] text-white text-xs px-4 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    Landing Page
                  </div>
                  {showTaskInput ? (
                    <div className="bg-gradient-to-r from-[#006397] to-[#0052CC] text-white text-xs px-4 py-2.5 rounded-lg font-medium shadow-sm animate-pulse flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      Strategy Jukebox add upvote
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#006397] text-[#006397] text-xs px-4 py-2.5 rounded-lg font-medium bg-blue-50 flex items-center gap-2">
                      <div className="text-lg">+</div>
                      Add Task
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Automation</h3>
                <p className="text-gray-600 text-sm">
                  Set it, forget it. Your AI Agent tackles repetitive tasks so you can focus on strategy, innovation, and growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Simple. Seamless. Smart. Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 mb-4">
              Simple. Seamless. Smart.
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Discover how Sartthi AI transforms your commands into action in four easy steps
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Interactive Accordion */}
            <div className="space-y-4">
              {[
                {
                  title: "Smart Answers",
                  description: "Ask Sartthi AI anything about your projects, tasks, or team. Get instant, context-aware responses based on your workspace data and historical patterns."
                },
                {
                  title: "Smart Editor",
                  description: "Let AI help you write and edit task descriptions, project summaries, and meeting notes. Sartthi AI understands your context and maintains your team's tone."
                },
                {
                  title: "Smart Summaries",
                  description: "Get AI-generated summaries of your projects, tasks, and team activity. Sartthi AI analyzes your data and delivers actionable insights instantly."
                },
                {
                  title: "Smart Status & Fields",
                  description: "Automatically update task statuses, fill in custom fields, and maintain project data. Sartthi AI learns your workflow and adapts to your preferences."
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className={`rounded-xl overflow-hidden transition-all cursor-pointer ${
                    activeStep === index 
                      ? 'border-2 border-[#006397] shadow-lg' 
                      : 'border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: '#F1F4F9' }}
                  onClick={() => { setActiveStep(index); setProgress(0); }}
                >
                  <button className="w-full text-left px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    {activeStep === index && (
                      <>
                        <div className="h-1 bg-gray-200 rounded-full mb-3 overflow-hidden">
                          <div 
                            className="h-full bg-[#006397] rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Right Side - Dynamic Video Mockups */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl bg-white">
                {/* Step 0: Ask Your AI Agent - Animated Chat Interface */}
                {activeStep === 0 && (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col">
                    <div className="flex-1 space-y-3 overflow-hidden">
                      {/* Message 1 - Always visible */}
                      <div className="flex justify-end animate-fade-in">
                        <div className="bg-[#006397] text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[75%] text-sm">
                          Schedule a team meeting for next week
                        </div>
                      </div>
                      
                      {/* Message 2 - Appears after state 1 */}
                      {chatMessages >= 2 && (
                        <div className="flex items-start gap-2 animate-fade-in">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#006397] to-[#0052CC] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">AI</span>
                          </div>
                          <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[75%] text-sm text-gray-700">
                            I'll help you with that! What time works best?
                          </div>
                        </div>
                      )}
                      
                      {/* Message 3 - Appears after state 2 */}
                      {chatMessages >= 3 && (
                        <div className="flex justify-end animate-fade-in">
                          <div className="bg-[#006397] text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[75%] text-sm">
                            Afternoon would be ideal
                          </div>
                        </div>
                      )}
                      
                      {/* Message 4 - Appears after state 3 */}
                      {chatMessages >= 4 && (
                        <div className="flex items-start gap-2 animate-fade-in">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#006397] to-[#0052CC] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">AI</span>
                          </div>
                          <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[75%] text-sm text-gray-700">
                            Perfect! I found Tuesday at 2 PM works for everyone. Shall I send the invites?
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Input field */}
                    <div className="mt-3 flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="flex-1 text-sm text-gray-400">Type your message...</div>
                      <div className="w-8 h-8 rounded-lg bg-[#006397] flex items-center justify-center hover:bg-[#0052CC] transition-colors cursor-pointer">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Processing - Animated AI Analysis */}
                {activeStep === 1 && (
                  <div className="w-full h-full bg-gradient-to-br from-purple-50 to-white p-6 flex flex-col items-center justify-center">
                    <div className="relative w-28 h-28 mb-5">
                      <div className="absolute inset-0 border-4 border-[#006397] border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-3 border-4 border-purple-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#006397]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {processingStep === 0 && "Analyzing Your Request"}
                      {processingStep === 1 && "Finding Optimal Time"}
                      {processingStep === 2 && "Preparing Suggestions"}
                    </h4>
                    
                    <p className="text-sm text-gray-600 text-center max-w-xs mb-5">
                      {processingStep === 0 && "Understanding context and requirements..."}
                      {processingStep === 1 && "Checking team calendars and availability..."}
                      {processingStep === 2 && "Generating personalized recommendations..."}
                    </p>
                    
                    <div className="w-full max-w-xs space-y-2.5">
                      {[
                        { task: 'Analyzing request', step: 0 },
                        { task: 'Checking calendars', step: 1 },
                        { task: 'Finding optimal time', step: 2 }
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 text-sm transition-all ${processingStep >= item.step ? 'opacity-100' : 'opacity-40'}`}>
                          {processingStep > item.step ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-fade-in">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : processingStep === item.step ? (
                            <div className="w-5 h-5 rounded-full border-2 border-[#006397] border-t-transparent animate-spin"></div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                          )}
                          <span className={`${processingStep >= item.step ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {item.task}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-xs text-gray-500">
                      Processing step {processingStep + 1} of 3
                    </div>
                  </div>
                )}

                {/* Step 2: Results - Animated Dashboard */}
                {activeStep === 2 && (
                  <div className="w-full h-full bg-gradient-to-br from-green-50 to-white p-6">
                    {!showResults ? (
                      // Summary View
                      <div className="animate-fade-in">
                        <div className="bg-white border-2 border-green-500 rounded-xl p-4 mb-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900">Optimal Time Found</h4>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 font-medium">
                            Tuesday, 2:00 PM - 3:00 PM
                          </p>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span>100% team availability</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              <span>No conflicting meetings</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              <span>Preferred time zone for all</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-2xl font-bold text-blue-600">8</div>
                            <div className="text-xs text-gray-600">Attendees</div>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="text-2xl font-bold text-purple-600">60m</div>
                            <div className="text-xs text-gray-600">Duration</div>
                          </div>
                        </div>
                        <button className="w-full bg-[#006397] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#0052CC] transition-colors">
                          Send Calendar Invites
                        </button>
                      </div>
                    ) : (
                      // Detailed Analytics View
                      <div className="animate-fade-in">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-[#006397]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Meeting Analytics
                        </h4>
                        
                        <div className="space-y-2 mb-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Attendees Confirmed</div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {[1,2,3,4,5].map(i => (
                                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"></div>
                                ))}
                                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-gray-600">+3</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-2">Time Zone Coverage</div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-700">EST (New York)</span>
                                <span className="text-gray-500">3 members</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-700">PST (San Francisco)</span>
                                <span className="text-gray-500">3 members</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-700">GMT (London)</span>
                                <span className="text-gray-500">2 members</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-xs text-green-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Best time for productivity</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Continuous Learning - AI Improvement Visualization */}
                {activeStep === 3 && (
                  <div className="w-full h-full bg-gradient-to-br from-orange-50 to-white p-8 flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40 mb-6">
                      {/* Brain/Learning visualization */}
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#006397" strokeWidth="2" strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100} className="transition-all duration-100" transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="35" fill="#F3F4F6" />
                        <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold fill-[#006397]">{Math.round(progress)}%</text>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Learning from Interaction</h4>
                    <p className="text-sm text-gray-600 text-center max-w-xs mb-4">
                      Sartthi AI adapts to your preferences and improves with every interaction
                    </p>
                    <div className="w-full max-w-xs space-y-2">
                      {[
                        { label: 'Meeting Preferences', value: 95 },
                        { label: 'Team Patterns', value: 88 },
                        { label: 'Workflow Understanding', value: 92 }
                      ].map((metric, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-700">{metric.label}</span>
                            <span className="text-gray-500">{metric.value}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#006397] to-[#0052CC]" style={{ width: `${metric.value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Built for Secure Growth Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F1F4F9' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 mb-4">
              Built for Secure Growth
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Where advanced security meets seamless scalability—designed to protect your data and empower your growth.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Advanced Task Security Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-all relative overflow-hidden min-h-[400px] flex flex-col">
              {/* Security Dashboard Mockup - Real PMS Features */}
              <div className="mb-auto flex items-center justify-center h-48 relative">
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-white rounded-xl border border-gray-200 p-4 overflow-hidden">
                  {/* Security Status Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-medium text-gray-900">
                        {securityScanProgress < 100 ? 'Verifying Security...' : 'All Systems Secure'}
                      </span>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Encrypted
                    </div>
                  </div>
                  
                  {/* Security Scan Progress */}
                  {securityScanProgress < 100 && (
                    <div className="mb-3">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                          style={{ width: `${securityScanProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">{Math.round(securityScanProgress)}%</div>
                    </div>
                  )}
                  
                  {/* Security Features List - Real PMS Features */}
                  <div className="space-y-2 mb-3">
                    {[
                      { title: 'Face Recognition Attendance', status: 'Active', icon: '�' },
                      { title: 'Location Tracking', status: 'Verified', icon: '�' },
                      { title: 'Task Data Encryption', status: 'Protected', icon: '🔒' }
                    ].map((feature, i) => (
                      <div 
                        key={i} 
                        className={`bg-white border border-gray-200 rounded-lg p-2 flex items-center gap-2 transition-all ${
                          securityScanProgress >= (i + 1) * 33 ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        <div className="text-sm">{feature.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-900 truncate">{feature.title}</div>
                          <div className={`text-xs ${securityScanProgress >= (i + 1) * 33 ? 'text-green-600' : 'text-gray-400'}`}>
                            {securityScanProgress >= (i + 1) * 33 ? feature.status : 'Checking...'}
                          </div>
                        </div>
                        {securityScanProgress >= (i + 1) * 33 && (
                          <svg className="w-4 h-4 text-green-500 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Security Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-green-600">{Math.min(100, Math.round(securityScanProgress))}%</div>
                      <div className="text-xs text-gray-600">Secure</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-blue-600">0</div>
                      <div className="text-xs text-gray-600">Threats</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-purple-600">24/7</div>
                      <div className="text-xs text-gray-600">Monitor</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Task Security</h3>
                <p className="text-gray-600 text-sm">
                  Safeguard your tasks with state-of-art encryption and secure access to your workflow data.
                </p>
              </div>
            </div>

            {/* Scalable for Teams Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-all relative overflow-hidden min-h-[400px] flex flex-col">
              {/* Workspace Management Mockup */}
              <div className="mb-auto flex items-center justify-center h-48 relative">
                <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-gray-200 p-4 overflow-hidden">
                  {/* Workspace Tabs */}
                  <div className="flex gap-2 mb-3">
                    {['Marketing Team', 'Development', 'Design'].map((workspace, i) => (
                      <div 
                        key={i}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeWorkspace === i 
                            ? 'bg-[#006397] text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {workspace}
                      </div>
                    ))}
                  </div>
                  
                  {/* Team Members Grid - Different for each workspace */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {activeWorkspace === 0 && [
                      { name: 'Sarah', color: 'from-pink-400 to-purple-500', tasks: 5 },
                      { name: 'Mike', color: 'from-blue-400 to-cyan-500', tasks: 8 },
                      { name: 'Emma', color: 'from-green-400 to-emerald-500', tasks: 6 },
                      { name: 'Alex', color: 'from-orange-400 to-red-500', tasks: 4 },
                      { name: 'Lisa', color: 'from-purple-400 to-pink-500', tasks: 7 },
                      { name: 'John', color: 'from-cyan-400 to-blue-500', tasks: 5 }
                    ].map((member, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 animate-fade-in">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${member.color} mb-1.5 mx-auto`}></div>
                        <div className="text-xs text-gray-900 font-medium text-center">{member.name}</div>
                        <div className="text-xs text-gray-500 text-center">{member.tasks} tasks</div>
                      </div>
                    ))}
                    
                    {activeWorkspace === 1 && [
                      { name: 'David', color: 'from-indigo-400 to-blue-500', tasks: 12 },
                      { name: 'Sophie', color: 'from-rose-400 to-pink-500', tasks: 9 },
                      { name: 'James', color: 'from-teal-400 to-green-500', tasks: 11 },
                      { name: 'Nina', color: 'from-amber-400 to-orange-500', tasks: 7 },
                      { name: 'Ryan', color: 'from-violet-400 to-purple-500', tasks: 10 },
                      { name: 'Zoe', color: 'from-sky-400 to-cyan-500', tasks: 8 }
                    ].map((member, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 animate-fade-in">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${member.color} mb-1.5 mx-auto`}></div>
                        <div className="text-xs text-gray-900 font-medium text-center">{member.name}</div>
                        <div className="text-xs text-gray-500 text-center">{member.tasks} tasks</div>
                      </div>
                    ))}
                    
                    {activeWorkspace === 2 && [
                      { name: 'Olivia', color: 'from-fuchsia-400 to-pink-500', tasks: 6 },
                      { name: 'Liam', color: 'from-emerald-400 to-teal-500', tasks: 5 },
                      { name: 'Ava', color: 'from-orange-400 to-amber-500', tasks: 8 },
                      { name: 'Noah', color: 'from-blue-400 to-indigo-500', tasks: 4 }
                    ].map((member, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 animate-fade-in">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${member.color} mb-1.5 mx-auto`}></div>
                        <div className="text-xs text-gray-900 font-medium text-center">{member.name}</div>
                        <div className="text-xs text-gray-500 text-center">{member.tasks} tasks</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Stats Bar - Updates based on workspace */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-blue-600">3</div>
                      <div className="text-xs text-gray-600">Workspaces</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-green-600">
                        {activeWorkspace === 0 ? '35' : activeWorkspace === 1 ? '57' : '23'}
                      </div>
                      <div className="text-xs text-gray-600">Total Tasks</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {activeWorkspace === 0 ? '6' : activeWorkspace === 1 ? '6' : '4'}
                      </div>
                      <div className="text-xs text-gray-600">Members</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scalable for Teams</h3>
                <p className="text-gray-600 text-sm">
                  Grow with your team. Track tasks across multiple workspaces and all team members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Grid Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4">
              <span className="font-semibold text-sm" style={{ color: '#006397' }}>Trusted by Teams Worldwide</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Empower Your Workflow with Sartthi AI
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              See how teams are transforming their project management with AI-powered insights, smart automation, and seamless collaboration.
            </p>
          </div>

          {/* 3-Column Masonry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
              {/* Testimonial 1 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Sartthi AI's <span className="text-[#006397] font-semibold">Smart Task Management</span> has transformed how our team works. <span className="text-[#006397]">Project delivery time reduced by 40%!</span> Highly recommend for growing teams.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Priya Deshmukh</p>
                    <p className="text-gray-500 text-xs">Project Manager at TechMumbai Solutions</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  The <span className="text-[#006397] font-semibold">Face Recognition Attendance</span> feature is a game-changer. <span className="text-[#006397]">No more manual attendance tracking!</span> Our HR team loves it.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Rohan Kulkarni</p>
                    <p className="text-gray-500 text-xs">HR Director at Pune InfoTech</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Managing <span className="text-[#006397] font-semibold">multiple workspaces</span> for different clients is now effortless. <span className="text-[#006397]">Team productivity increased by 50%.</span> Perfect for agencies!
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Sneha Patil</p>
                    <p className="text-gray-500 text-xs">Founder & CEO at Digital Nagpur</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  The <span className="text-[#006397] font-semibold">AI-powered insights</span> help us make better decisions. Real-time analytics have revolutionized our workflow.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-red-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Amit Joshi</p>
                    <p className="text-gray-500 text-xs">CTO at Nashik Tech Hub</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              {/* Testimonial 5 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  <span className="text-[#006397] font-semibold">Smart Summaries</span> save us hours every week. AI-generated project reports are incredibly accurate and detailed.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Kavita Sharma</p>
                    <p className="text-gray-500 text-xs">Operations Head at Thane Enterprises</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  The <span className="text-[#006397] font-semibold">Kanban board</span> and task automation features are outstanding. <span className="text-[#006397]">Our team collaboration has never been better!</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Vikram Pawar</p>
                    <p className="text-gray-500 text-xs">Team Lead at Aurangabad IT Services</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 7 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  <span className="text-[#006397] font-semibold">Location tracking</span> and workspace verification ensure our remote team stays accountable. <span className="text-[#006397]">Security features are top-notch!</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Anjali Bhosale</p>
                    <p className="text-gray-500 text-xs">COO at Kolhapur Digital</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 8 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Sartthi AI's <span className="text-[#006397] font-semibold">Smart Editor</span> helps us write better task descriptions and meeting notes. A must-have tool!
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Rahul Shinde</p>
                    <p className="text-gray-500 text-xs">Product Manager at Solapur Innovations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
              {/* Testimonial 9 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  The <span className="text-[#006397] font-semibold">Advanced Analytics</span> dashboard gives us real-time insights into team performance. <span className="text-[#006397]">Data-driven decisions made easy!</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Manish Jadhav</p>
                    <p className="text-gray-500 text-xs">Director at Satara Tech Solutions</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 10 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  <span className="text-[#006397] font-semibold">Client management</span> and project tracking in one place. <span className="text-[#006397]">Our agency workflow is now seamless!</span> Highly efficient system.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Pooja Kale</p>
                    <p className="text-gray-500 text-xs">Creative Director at Sangli Studios</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 11 */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#F1F4F9' }}>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  With <span className="text-[#006397] font-semibold">Smart Status Updates</span> and automated workflows, our team stays synchronized. <span className="text-[#006397]">Best PMS we've ever used!</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500"></div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">Sanjay Desai</p>
                    <p className="text-gray-500 text-xs">CEO at Ratnagiri Enterprises</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Gradient Text Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-5xl md:text-9xl lg:text-[18rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200 inset-x-0">
            SARTTHI
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="relative z-10">
        <SharedFooter />
      </div>
    </div>
  );
};

export default AIInformationPage;




