import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Mail, 
  Trash2, 
  Copy, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Car,
  DollarSign,
  Fuel,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  HelpCircle,
  ExternalLink,
  History,
  User,
  Shield,
  Upload,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  type?: 'text' | 'dashboard';
  html?: string;    // ← ADD THIS (line 67)
  csv?: string;
  timestamp: Date;
  title?: string;
}

type Tab = 'dashboard' | 'history' | 'analytics' | 'settings' | 'help';

// --- Mock Data for Analytics ---
const brandData = [
  { name: 'Toyota', value: 450 },
  { name: 'Honda', value: 380 },
  { name: 'Ford', value: 320 },
  { name: 'BMW', value: 280 },
  { name: 'Mercedes', value: 250 },
];

const fuelData = [
  { name: 'Petrol', value: 1200 },
  { name: 'Diesel', value: 600 },
  { name: 'Electric', value: 150 },
  { name: 'Hybrid', value: 109 },
];

const priceTrends = [
  { year: '2018', price: 28000 },
  { year: '2019', price: 29500 },
  { year: '2020', price: 31000 },
  { year: '2021', price: 34000 },
  { year: '2022', price: 32500 },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, collapsed = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group",
      active ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" : "text-brand-muted hover:bg-brand-border hover:text-brand-text"
    )}
  >
    <Icon size={20} className={cn("shrink-0", active ? "text-white" : "group-hover:text-brand-accent")} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
);

const GlassCard = ({ children, className, title }: { children: React.ReactNode, className?: string, title?: string }) => (
  <div className={cn("glass-panel p-6 rounded-2xl flex flex-col gap-4", className)}>
    {title && <h3 className="font-display font-bold text-sm uppercase tracking-widest text-brand-muted">{title}</h3>}
    {children}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [searchHistory, setSearchHistory] = useState('');
  const [emailModal, setEmailModal] = useState<{ isOpen: boolean, content: string, csv: string }>({ isOpen: false, content: '', csv: '' });
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeTab]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: data.type,
        content: data.answer,
        html: data.html,
        csv: data.csv || '',
        title: data.metadata?.title || query.substring(0, 30),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
      setHistory(prev => [assistantMsg, ...prev]);
    } catch (error) {
      showToast('Backend connection failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    showToast('Conversation deleted');
  };

  const reopenHistoryItem = (item: Message) => {
    setMessages([
      { id: 'prev-user', role: 'user', content: item.title, timestamp: item.timestamp },
      item
    ]);
    setActiveTab('dashboard');
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setHistory([]);
      showToast('All history cleared');
    }
  };

  const downloadAnalyticsData = () => {
    const data = JSON.stringify({ brandData, fuelData, priceTrends }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'axiondrive_analytics.json';
    a.click();
    showToast('Analytics data downloaded');
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim() || isSendingEmail) return;
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, html: emailModal.content, csv: emailModal.csv })
      });
      if (!res.ok) throw new Error('Failed to send email');
      showToast('Analytics report sent successfully!');
      setEmailModal({ isOpen: false, content: '' });
      setEmailInput('');
    } catch (error) {
      showToast('Failed to send email. Please try again.', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filteredHistory = history.filter(item => 
    item.title?.toLowerCase().includes(searchHistory.toLowerCase()) ||
    item.content?.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className={cn("flex h-screen w-full transition-colors duration-300", theme === 'dark' ? 'bg-brand-bg text-brand-text' : 'bg-slate-50 text-slate-900')}>
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-accent/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-brand-neon/5 blur-[120px] rounded-full" />
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        className="glass-panel border-r border-brand-border flex flex-col h-full relative z-20"
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-brand-neon rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-neon/20">
            <Car className="text-brand-bg" size={24} />
          </div>
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <h1 className="font-display font-extrabold text-lg leading-tight tracking-tighter text-brand-neon">AXIONDRIVE</h1>
              <span className="text-[10px] text-brand-muted uppercase tracking-widest font-bold">Intelligence in Motion</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={History} label="Chat History" active={activeTab === 'history'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('history')} />
          <SidebarItem icon={TrendingUp} label="Analytics" active={activeTab === 'analytics'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('analytics')} />
          <div className="my-4 border-t border-brand-border/50" />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('settings')} />
          <SidebarItem icon={HelpCircle} label="Help Center" active={activeTab === 'help'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('help')} />
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-brand-border text-brand-muted transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-brand-border flex items-center justify-between px-8 z-10 glass-panel">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl hover:bg-brand-border text-brand-muted transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-8 w-[1px] bg-brand-border mx-2" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold">World Studios</span>
                <span className="text-[10px] text-brand-muted">Pro Plan</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center font-bold text-white">
                WS
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-8 pb-40"
        >
          {activeTab === 'dashboard' && (
            <>
              {messages.length === 0 && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center gap-6">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-brand-surface border border-brand-border rounded-3xl flex items-center justify-center mb-4"
                  >
                    <Search size={40} className="text-brand-accent" />
                  </motion.div>
                  <h2 className="text-5xl font-display font-extrabold tracking-tighter">Accelerate your insights with <span className="text-brand-neon">AxionDrive</span>.</h2>
                  <p className="text-brand-muted text-lg max-w-lg">The world's most advanced AI engine for automotive data analysis.</p>
                  
                  <div className="grid grid-cols-2 gap-3 w-full mt-4">
                    {[
                      "What is the most expensive car?",
                      "Top 5 brands by car count",
                      "Average price by fuel type",
                      "Price trends for SUVs"
                    ].map((q, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSend(q)}
                        className="p-4 glass-panel rounded-2xl text-left hover:border-brand-accent transition-colors group"
                      >
                        <span className="text-sm font-medium group-hover:text-brand-accent">{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col gap-4 max-w-4xl w-full",
                      msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "p-5 rounded-2xl leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-brand-accent text-white rounded-tr-none text-base font-semibold" 
                        : "glass-panel rounded-tl-none border-l-4 border-l-brand-accent"
                    )}>
                      {msg.type === 'dashboard' && msg.html ? (
                        <div className="w-full overflow-auto">
                          <iframe 
                            srcDoc={msg.html} 
                            className="rounded-xl border border-brand-border" 
                            style={{ width: '1200px', height: '900px' }} 
                            sandbox="allow-scripts allow-same-origin" 
                            title="Dashboard"
                          />
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none prose-sm">
                          <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                        </div>
                      )}
                      
                      {msg.role === 'assistant' && (
                        <div className="mt-4 flex items-center gap-4 pt-4 border-t border-brand-border/30">
                          {msg.type === 'dashboard' && msg.csv && (
                            <button
                              onClick={() => {
                                const blob = new Blob([msg.csv || ''], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'car_data.csv';
                                a.click();
                              }}
                              className="text-brand-muted hover:text-brand-neon transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                            >
                              <Upload className="rotate-180" size={14} /> Download CSV
                            </button>
                          )}
                          <button 
                            onClick={() => msg.content && navigator.clipboard.writeText(msg.content)}
                            className="text-brand-muted hover:text-brand-accent transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                          >
                            <Copy size={14} /> Copy
                          </button>
                          <button 
                            onClick={() => setEmailModal({ isOpen: true, content: msg.html || msg.content || '', csv: msg.csv || '' })}
                            className="text-brand-muted hover:text-brand-neon transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                          >
                            <Mail size={14} /> Send to Email
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mr-auto flex flex-col gap-3"
                  >
                    <div className="glass-panel p-5 rounded-2xl rounded-tl-none flex items-center gap-4">
                      <Loader2 className="animate-spin text-brand-accent" size={20} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Analyzing dataset...</span>
                        <span className="text-[10px] text-brand-muted uppercase tracking-widest font-bold">AxionDrive AI is thinking</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-extrabold tracking-tighter">Chat History</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search conversations..."
                      value={searchHistory}
                      onChange={(e) => setSearchHistory(e.target.value)}
                      className="bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-accent w-64"
                    />
                  </div>
                  <button 
                    onClick={clearAllHistory}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-xs font-bold uppercase tracking-widest text-brand-error hover:bg-brand-error/10 transition-colors"
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-20 text-brand-muted">No conversations found.</div>
                ) : (
                  filteredHistory.map((item) => (
                    <div key={item.id} className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:border-brand-accent/50 transition-colors group">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-brand-muted">
                          <span className="flex items-center gap-1"><History size={12} /> {item.timestamp.toLocaleString()}</span>
                          <span className="px-2 py-0.5 bg-brand-border rounded-full uppercase tracking-widest font-bold text-[8px]">{item.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => reopenHistoryItem(item)}
                          className="p-2 rounded-lg bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white transition-all"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-2 rounded-lg bg-brand-error/10 text-brand-error hover:bg-brand-error hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-extrabold tracking-tighter">Dataset Analytics</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={downloadAnalyticsData}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-xs font-bold uppercase tracking-widest hover:bg-brand-border transition-colors"
                  >
                    <Upload className="rotate-180" size={14} /> Download JSON
                  </button>
                  <select className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-sm outline-none">
                    <option>All Brands</option>
                    <option>Toyota</option>
                    <option>Honda</option>
                  </select>
                  <select className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-sm outline-none">
                    <option>All Fuel Types</option>
                    <option>Petrol</option>
                    <option>Electric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard title="Top Car Brands">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={brandData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                        <XAxis dataKey="name" stroke="#6B6B80" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6B6B80" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111118', border: '1px solid #1E1E2E', borderRadius: '12px' }}
                          itemStyle={{ color: '#F0F0F5' }}
                        />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard title="Fuel Type Distribution">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fuelData}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {fuelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3B82F6', '#E8FF47', '#7C6DFF', '#F43F5E'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111118', border: '1px solid #1E1E2E', borderRadius: '12px' }}
                          itemStyle={{ color: '#F0F0F5' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard title="Price Trends by Year" className="lg:col-span-2">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceTrends}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                        <XAxis dataKey="year" stroke="#6B6B80" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6B6B80" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111118', border: '1px solid #1E1E2E', borderRadius: '12px' }}
                          itemStyle={{ color: '#F0F0F5' }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#3B82F6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard title="Top Expensive Cars" className="lg:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-brand-border">
                          <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-muted">Car Model</th>
                          <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-muted">Brand</th>
                          <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-muted">Year</th>
                          <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-brand-muted">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { model: '911 GT3', brand: 'Porsche', year: '2023', price: '$198,000' },
                          { model: 'S-Class', brand: 'Mercedes', year: '2022', price: '$110,000' },
                          { model: 'Model S Plaid', brand: 'Tesla', year: '2023', price: '$105,000' },
                          { model: 'M5 Competition', brand: 'BMW', year: '2021', price: '$103,500' },
                        ].map((car, i) => (
                          <tr key={i} className="border-b border-brand-border/50 last:border-0">
                            <td className="py-4 font-medium">{car.model}</td>
                            <td className="py-4 text-brand-muted">{car.brand}</td>
                            <td className="py-4 text-brand-muted">{car.year}</td>
                            <td className="py-4 font-bold text-brand-neon">{car.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
              <h2 className="text-3xl font-display font-extrabold tracking-tighter">Settings</h2>
              
              <div className="grid gap-6">
                <GlassCard title="Account Settings">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center font-bold text-white text-xl">WS</div>
                      <div className="flex flex-col">
                        <span className="font-bold">World Studios</span>
                        <span className="text-xs text-brand-muted">admin@worldstudios.com</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-xl border border-brand-border text-sm font-bold hover:bg-brand-border transition-colors">Edit Profile</button>
                  </div>
                </GlassCard>

                <GlassCard title="AI Configuration">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold">Response Format</span>
                        <span className="text-xs text-brand-muted">Prefer charts and dashboards over text</span>
                      </div>
                      <select className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-sm outline-none">
                        <option>Auto</option>
                        <option>Always Charts</option>
                        <option>Always Text</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold">Theme Mode</span>
                        <span className="text-xs text-brand-muted">Switch between dark and light interface</span>
                      </div>
                      <button 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-xl bg-brand-border text-brand-text"
                      >
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                      </button>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard title="Data Management">
                  <div className="flex flex-col gap-4">
                    <div className="p-8 border-2 border-dashed border-brand-border rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-brand-accent transition-colors cursor-pointer">
                      <Upload className="text-brand-muted" size={32} />
                      <div className="text-center">
                        <p className="font-bold">Upload New Dataset</p>
                        <p className="text-xs text-brand-muted">Drag and drop CSV or Excel files here</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="text-emerald-500" size={20} />
                        <span className="text-sm font-medium text-emerald-500">Current Dataset: car_inventory_v2.csv</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Active</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
              <h2 className="text-3xl font-display font-extrabold tracking-tighter">Help Center</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard title="Quick Start Guide">
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: Search, text: "Ask questions in natural language" },
                      { icon: TrendingUp, text: "View real-time charts and trends" },
                      { icon: Mail, text: "Export reports to your email" },
                      { icon: History, text: "Access your conversation history" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                          <item.icon size={16} />
                        </div>
                        <span className="text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard title="FAQ">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 bg-brand-border/50 rounded-xl">
                      <p className="text-sm font-bold mb-1">How accurate is the AI?</p>
                      <p className="text-xs text-brand-muted">The AI analyzes the specific dataset provided with 99% accuracy on numerical queries.</p>
                    </div>
                    <div className="p-3 bg-brand-border/50 rounded-xl">
                      <p className="text-sm font-bold mb-1">Can I upload my own data?</p>
                      <p className="text-xs text-brand-muted">Yes, go to Settings {'>'} Data Management to upload your CSV files.</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard title="Support Contact" className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-neon flex items-center justify-center text-brand-bg">
                        <MessageCircle size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Need more help?</span>
                        <span className="text-xs text-brand-muted">Our support team is available 24/7 for Enterprise users.</span>
                      </div>
                    </div>
                    <button className="bg-brand-neon text-brand-bg px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">Contact Support</button>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
        </div>

        {/* Input Area (Only for Dashboard) */}
        {activeTab === 'dashboard' && (
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 z-20">
            <div className="max-w-4xl mx-auto relative">
              <div className="glass-panel p-2 rounded-3xl shadow-2xl neon-shadow flex items-end gap-2">
                <button 
                  onClick={() => setMessages([])}
                  className="p-4 text-brand-muted hover:text-brand-error transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={20} />
                </button>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask AxionDrive about the car dataset..."
                  className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-sm resize-none max-h-32 custom-scrollbar"
                  rows={1}
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-4 rounded-2xl transition-all duration-200",
                    input.trim() && !isLoading 
                      ? "bg-brand-neon text-brand-bg shadow-lg shadow-brand-neon/20" 
                      : "bg-brand-border text-brand-muted cursor-not-allowed"
                  )}
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-3 flex justify-center gap-6 text-[10px] text-brand-muted font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> AI-Powered Insights</div>
                <div className="flex items-center gap-1.5"><LayoutDashboard size={12} className="text-brand-accent" /> Real-time Analytics</div>
                <div className="flex items-center gap-1.5"><ExternalLink size={12} className="text-brand-muted" /> Export Ready</div>
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        <AnimatePresence>
          {emailModal.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEmailModal({ isOpen: false, content: '' })}
                className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 shadow-2xl border border-brand-border"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-display font-extrabold tracking-tight">Send to Email</h3>
                    <p className="text-sm text-brand-muted">Enter your email address to receive this analytics report.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
                      <input 
                        type="email" 
                        placeholder="your@email.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-brand-neon transition-colors"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setEmailModal({ isOpen: false, content: '' })}
                        className="flex-1 py-4 rounded-2xl border border-brand-border font-bold text-sm hover:bg-brand-border transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSendEmail}
                        disabled={!emailInput.trim() || isSendingEmail}
                        className="flex-1 py-4 rounded-2xl bg-brand-neon text-brand-bg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSendingEmail ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        Send Report
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={cn(
                "fixed bottom-32 right-8 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border",
                toast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
              )}
            >
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
