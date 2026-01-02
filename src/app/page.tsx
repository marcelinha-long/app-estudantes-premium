"use client";

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, FileText, Target, Timer, BarChart3, 
  Users, User, Plus, Play, Pause, RotateCcw, Check, 
  Clock, TrendingUp, Award, Brain, Settings, Search,
  ChevronRight, Edit, Trash2, Star, Filter, Download,
  Upload, Link, MessageCircle, ThumbsUp, Send, Bell,
  Moon, Sun, Volume2, VolumeX, Home, CheckCircle2,
  Circle, AlertCircle, Calendar as CalendarIcon,
  ArrowRight, Zap, Activity, Focus, Menu, X, Crown, Lock
} from 'lucide-react';

// Tipos de dados
interface User {
  id: string;
  name: string;
  email: string;
  course: string;
  goals: string;
  plan: 'free' | 'premium';
  avatar?: string;
}

interface Task {
  id: string;
  userId: string;
  title: string;
  subject: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  description?: string;
  createdAt: string;
}

interface StudySession {
  id: string;
  userId: string;
  subject: string;
  duration: number;
  date: string;
  type: 'pomodoro' | 'free';
  createdAt: string;
}

interface Material {
  id: string;
  userId: string;
  title: string;
  type: 'note' | 'pdf' | 'link';
  subject: string;
  content?: string;
  url?: string;
  createdAt: string;
}

interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  category: string;
  createdAt: string;
}

// Funções de persistência
const saveToStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const loadFromStorage = (key: string, defaultValue: any = null) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }
  return defaultValue;
};

export default function StudyApp() {
  // Estados principais
  const [currentView, setCurrentView] = useState('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // Estados do Pomodoro
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'break'>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Estados da UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Carregar dados do localStorage
  useEffect(() => {
    const storedUser = loadFromStorage('studyhub_user');
    const storedTasks = loadFromStorage('studyhub_tasks', []);
    const storedSessions = loadFromStorage('studyhub_sessions', []);
    const storedMaterials = loadFromStorage('studyhub_materials', []);
    const storedGoals = loadFromStorage('studyhub_goals', []);
    const storedPomodoroCount = loadFromStorage('studyhub_pomodoro_count', 0);

    if (storedUser) {
      setUser(storedUser);
      setCurrentView('dashboard');
    }
    setTasks(storedTasks);
    setStudySessions(storedSessions);
    setMaterials(storedMaterials);
    setGoals(storedGoals);
    setPomodoroCount(storedPomodoroCount);
  }, []);

  // Salvar dados quando mudarem
  useEffect(() => {
    if (user) saveToStorage('studyhub_user', user);
  }, [user]);

  useEffect(() => {
    saveToStorage('studyhub_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage('studyhub_sessions', studySessions);
  }, [studySessions]);

  useEffect(() => {
    saveToStorage('studyhub_materials', materials);
  }, [materials]);

  useEffect(() => {
    saveToStorage('studyhub_goals', goals);
  }, [goals]);

  useEffect(() => {
    saveToStorage('studyhub_pomodoro_count', pomodoroCount);
  }, [pomodoroCount]);

  // Timer do Pomodoro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsRunning(false);
      if (currentSession === 'work') {
        setPomodoroCount(count => count + 1);
        // Salvar sessão de estudo
        const newSession: StudySession = {
          id: Date.now().toString(),
          userId: user?.id || '',
          subject: 'Pomodoro',
          duration: 25,
          date: new Date().toISOString().split('T')[0],
          type: 'pomodoro',
          createdAt: new Date().toISOString()
        };
        setStudySessions(prev => [newSession, ...prev]);
        setPomodoroTime(5 * 60);
        setCurrentSession('break');
      } else {
        setPomodoroTime(25 * 60);
        setCurrentSession('work');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, pomodoroTime, currentSession, user]);

  // Verificar limite do plano gratuito
  const checkFreePlanLimit = (type: 'tasks' | 'materials' | 'history') => {
    if (user?.plan === 'premium') return true;
    
    if (type === 'tasks' && tasks.length >= 10) {
      setShowUpgradeModal(true);
      return false;
    }
    if (type === 'materials' && materials.length >= 5) {
      setShowUpgradeModal(true);
      return false;
    }
    if (type === 'history') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return false; // Usuário free só vê últimos 7 dias
    }
    return true;
  };

  // Filtrar histórico por plano
  const getFilteredSessions = () => {
    if (user?.plan === 'premium') return studySessions;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return studySessions.filter(s => new Date(s.date) >= sevenDaysAgo);
  };

  // Componente de Onboarding
  const OnboardingView = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      course: '',
      goals: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name && formData.email && formData.course && formData.goals) {
        const newUser: User = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          course: formData.course,
          goals: formData.goals,
          plan: 'free'
        };
        setUser(newUser);
        setCurrentView('dashboard');
      }
    };

    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#007BFF] to-[#00FF88] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">StudyHub</h1>
            <p className="text-[#B3B3B3]">Seu hub completo para estudos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Qual é o seu nome?
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-xl text-white placeholder-[#B3B3B3] focus:border-[#007BFF] focus:outline-none transition-colors"
                placeholder="Digite seu nome"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-xl text-white placeholder-[#B3B3B3] focus:border-[#007BFF] focus:outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Curso ou área de estudo
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-xl text-white placeholder-[#B3B3B3] focus:border-[#007BFF] focus:outline-none transition-colors"
                placeholder="Ex: Engenharia, Medicina, etc."
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Objetivos acadêmicos
              </label>
              <textarea
                value={formData.goals}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-xl text-white placeholder-[#B3B3B3] focus:border-[#007BFF] focus:outline-none transition-colors resize-none"
                placeholder="Descreva seus principais objetivos..."
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#007BFF] to-[#00FF88] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Começar jornada gratuita
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-[#B3B3B3] text-sm">
              Comece grátis • Sem cartão de crédito
            </p>
          </form>
        </div>
      </div>
    );
  };

  // Modal de Upgrade
  const UpgradeModal = () => {
    if (!showUpgradeModal) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade para Premium</h2>
            <p className="text-[#B3B3B3]">
              Você atingiu o limite do plano gratuito
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Tarefas ilimitadas</p>
                <p className="text-[#B3B3B3] text-sm">Crie quantas tarefas precisar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Histórico completo</p>
                <p className="text-[#B3B3B3] text-sm">Acesse todo seu histórico de estudos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Materiais ilimitados</p>
                <p className="text-[#B3B3B3] text-sm">Armazene todos seus recursos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#00FF88] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Relatórios avançados</p>
                <p className="text-[#B3B3B3] text-sm">Análises detalhadas do seu progresso</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-white mb-1">R$ 19,90<span className="text-lg text-[#B3B3B3]">/mês</span></div>
            <p className="text-[#B3B3B3] text-sm">Cancele quando quiser</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                // Simular upgrade
                if (user) {
                  setUser({...user, plan: 'premium'});
                }
                setShowUpgradeModal(false);
              }}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Fazer upgrade agora
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
            >
              Continuar com plano gratuito
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente de Header Mobile
  const MobileHeader = () => (
    <div className="md:hidden bg-[#141414] border-b border-gray-800 p-4 flex items-center justify-between">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="text-white hover:text-[#007BFF] transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-[#007BFF] to-[#00FF88] rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-white font-bold">StudyHub</h1>
        {user?.plan === 'premium' && (
          <Crown className="w-4 h-4 text-yellow-500" />
        )}
      </div>
      
      <div className="w-6" />
    </div>
  );

  // Componente de Navegação
  const Navigation = () => {
    const navItems = [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'planning', icon: Calendar, label: 'Planejamento' },
      { id: 'materials', icon: FileText, label: 'Materiais' },
      { id: 'tasks', icon: Target, label: 'Tarefas' },
      { id: 'pomodoro', icon: Timer, label: 'Foco' },
      { id: 'analytics', icon: BarChart3, label: 'Analytics' },
      { id: 'profile', icon: User, label: 'Perfil' }
    ];

    const handleNavClick = (viewId: string) => {
      setCurrentView(viewId);
      setIsSidebarOpen(false);
    };

    return (
      <>
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <nav className={`
          fixed md:static top-0 left-0 z-50 
          bg-[#141414] border-r border-gray-800 
          w-64 h-full p-4
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#007BFF] to-[#00FF88] rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">StudyHub</h1>
                <p className="text-[#B3B3B3] text-sm">Olá, {user?.name}</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {user?.plan === 'free' && (
            <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <h3 className="text-white font-medium text-sm">Plano Gratuito</h3>
              </div>
              <p className="text-[#B3B3B3] text-xs mb-3">
                Upgrade para desbloquear recursos ilimitados
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Fazer upgrade
              </button>
            </div>
          )}

          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  currentView === item.id
                    ? 'bg-[#007BFF] text-white'
                    : 'text-[#B3B3B3] hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </>
    );
  };

  // Dashboard View
  const DashboardView = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const filteredSessions = getFilteredSessions();
    const todayStudyTime = filteredSessions
      .filter(s => s.date === new Date().toISOString().split('T')[0])
      .reduce((acc, s) => acc + s.duration, 0);

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-[#B3B3B3]">Visão geral dos seus estudos</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.plan === 'premium' ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 px-3 py-2 rounded-lg">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 text-sm font-medium">Premium</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#B3B3B3]">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>

        {user?.plan === 'free' && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <div className="flex items-start gap-4">
              <Crown className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Desbloqueie todo o potencial</h3>
                <p className="text-[#B3B3B3] text-sm mb-3">
                  Você está usando o plano gratuito. Faça upgrade para acessar histórico completo, tarefas ilimitadas e muito mais.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Ver planos Premium
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#007BFF]/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-[#007BFF]" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">{completedTasks}/{totalTasks}</span>
            </div>
            <h3 className="text-white font-medium text-sm md:text-base">Tarefas Concluídas</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">
              {user?.plan === 'free' ? `Limite: 10 tarefas` : 'Ilimitado'}
            </p>
          </div>

          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#00FF88]/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#00FF88]" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">{Math.floor(todayStudyTime / 60)}h</span>
            </div>
            <h3 className="text-white font-medium text-sm md:text-base">Tempo de Estudo</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Hoje</p>
          </div>

          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">{pomodoroCount}</span>
            </div>
            <h3 className="text-white font-medium text-sm md:text-base">Pomodoros</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Hoje</p>
          </div>

          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">{filteredSessions.length}</span>
            </div>
            <h3 className="text-white font-medium text-sm md:text-base">Sessões</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">
              {user?.plan === 'free' ? 'Últimos 7 dias' : 'Total'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Próximas Tarefas</h2>
              <button 
                onClick={() => setCurrentView('tasks')}
                className="text-[#007BFF] hover:text-[#0056b3] transition-colors text-sm"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.status !== 'completed').slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">{task.title}</h3>
                    <p className="text-[#B3B3B3] text-xs">{task.subject}</p>
                  </div>
                  <span className="text-[#B3B3B3] text-xs whitespace-nowrap">
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
              {tasks.filter(t => t.status !== 'completed').length === 0 && (
                <p className="text-[#B3B3B3] text-center py-8">Nenhuma tarefa pendente</p>
              )}
            </div>
          </div>

          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Metas em Progresso</h2>
              <button 
                onClick={() => setCurrentView('tasks')}
                className="text-[#007BFF] hover:text-[#0056b3] transition-colors text-sm"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {goals.slice(0, 2).map((goal) => (
                <div key={goal.id} className="p-4 bg-[#1A1A1A] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium text-sm">{goal.title}</h3>
                    <span className="text-[#00FF88] font-bold text-sm">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-[#007BFF] to-[#00FF88] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-[#B3B3B3] text-xs">{goal.category}</p>
                </div>
              ))}
              {goals.length === 0 && (
                <p className="text-[#B3B3B3] text-center py-8">Nenhuma meta cadastrada</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tasks View com funcionalidade real
  const TasksView = () => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({
      title: '',
      subject: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      dueDate: '',
      description: ''
    });
    
    const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

    const handleAddTask = () => {
      if (!checkFreePlanLimit('tasks')) return;
      
      if (newTask.title && newTask.subject && newTask.dueDate) {
        const task: Task = {
          id: Date.now().toString(),
          userId: user?.id || '',
          title: newTask.title,
          subject: newTask.subject,
          status: 'pending',
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          description: newTask.description,
          createdAt: new Date().toISOString()
        };
        setTasks(prev => [task, ...prev]);
        setNewTask({ title: '', subject: '', priority: 'medium', dueDate: '', description: '' });
        setShowNewTaskForm(false);
      }
    };

    const handleToggleStatus = (taskId: string) => {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          if (t.status === 'pending') return { ...t, status: 'in-progress' };
          if (t.status === 'in-progress') return { ...t, status: 'completed' };
          return { ...t, status: 'pending' };
        }
        return t;
      }));
    };

    const handleDeleteTask = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Tarefas e Metas</h1>
            <p className="text-[#B3B3B3]">
              {user?.plan === 'free' ? `${tasks.length}/10 tarefas usadas` : 'Tarefas ilimitadas'}
            </p>
          </div>
          <button 
            onClick={() => setShowNewTaskForm(true)}
            className="bg-gradient-to-r from-[#007BFF] to-[#00FF88] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>

        {showNewTaskForm && (
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-white mb-4">Nova Tarefa</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título da tarefa..."
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white placeholder-[#B3B3B3] focus:border-[#007BFF] focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Matéria..."
                value={newTask.subject}
                onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white placeholder-[#B3B3B3] focus:border-[#007BFF] focus:outline-none transition-colors"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                  className="px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#007BFF] focus:outline-none transition-colors"
                >
                  <option value="low">Baixa prioridade</option>
                  <option value="medium">Média prioridade</option>
                  <option value="high">Alta prioridade</option>
                </select>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#007BFF] focus:outline-none transition-colors"
                />
              </div>
              <textarea
                placeholder="Descrição (opcional)..."
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white placeholder-[#B3B3B3] focus:border-[#007BFF] focus:outline-none transition-colors resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddTask}
                  className="flex-1 bg-[#007BFF] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#0056b3] transition-colors"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowNewTaskForm(false)}
                  className="flex-1 bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todas', count: tasks.length },
            { id: 'pending', label: 'Pendentes', count: tasks.filter(t => t.status === 'pending').length },
            { id: 'in-progress', label: 'Em Progresso', count: tasks.filter(t => t.status === 'in-progress').length },
            { id: 'completed', label: 'Concluídas', count: tasks.filter(t => t.status === 'completed').length }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                filter === filterOption.id 
                  ? 'bg-[#007BFF] text-white' 
                  : 'bg-[#141414] text-[#B3B3B3] hover:bg-[#1A1A1A]'
              }`}
            >
              <span>{filterOption.label}</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6 hover:border-[#007BFF] transition-colors">
              <div className="flex items-start gap-4">
                <button onClick={() => handleToggleStatus(task.id)} className="mt-1 flex-shrink-0">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#00FF88]" />
                  ) : task.status === 'in-progress' ? (
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-[#007BFF]" />
                  ) : (
                    <Circle className="w-5 h-5 md:w-6 md:h-6 text-[#B3B3B3]" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h3 className={`font-medium text-sm md:text-base ${task.status === 'completed' ? 'text-[#B3B3B3] line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-green-500/20 text-green-500'
                      }`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-[#B3B3B3] mb-3">
                    <span>{task.subject}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {task.description && (
                    <p className="text-[#B3B3B3] text-xs md:text-sm mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-[#B3B3B3] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-[#B3B3B3] mx-auto mb-4" />
              <p className="text-[#B3B3B3]">Nenhuma tarefa encontrada</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Pomodoro View
  const PomodoroView = () => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const resetTimer = () => {
      setIsRunning(false);
      setPomodoroTime(25 * 60);
      setCurrentSession('work');
    };

    const filteredSessions = getFilteredSessions();

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Timer de Foco</h1>
          <p className="text-[#B3B3B3]">Técnica Pomodoro para máxima produtividade</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-[#141414] border border-gray-800 rounded-3xl p-6 md:p-8 text-center">
            <div className="mb-6">
              <div className={`w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full border-8 flex items-center justify-center mb-4 ${
                currentSession === 'work' 
                  ? 'border-[#007BFF] bg-[#007BFF]/10' 
                  : 'border-[#00FF88] bg-[#00FF88]/10'
              }`}>
                <span className="text-2xl md:text-4xl font-bold text-white">
                  {formatTime(pomodoroTime)}
                </span>
              </div>
              
              <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                {currentSession === 'work' ? 'Tempo de Foco' : 'Pausa'}
              </h2>
              <p className="text-[#B3B3B3] text-sm">
                {currentSession === 'work' 
                  ? 'Concentre-se na sua tarefa atual' 
                  : 'Relaxe e descanse um pouco'
                }
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-colors ${
                  isRunning 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-[#007BFF] hover:bg-[#0056b3]'
                }`}
              >
                {isRunning ? (
                  <Pause className="w-6 h-6 md:w-8 md:h-8 text-white" />
                ) : (
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-white" />
                )}
              </button>
              
              <button
                onClick={resetTimer}
                className="w-10 h-10 md:w-12 md:h-12 bg-[#141414] border border-gray-700 rounded-full flex items-center justify-center hover:bg-[#1A1A1A] transition-colors"
              >
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-[#B3B3B3]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-[#1A1A1A] rounded-xl p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-[#007BFF] mb-1">{pomodoroCount}</div>
                <div className="text-[#B3B3B3] text-xs md:text-sm">Pomodoros Hoje</div>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-[#00FF88] mb-1">
                  {Math.floor(filteredSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h
                </div>
                <div className="text-[#B3B3B3] text-xs md:text-sm">Tempo Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Sessões Recentes</h3>
            {user?.plan === 'free' && (
              <div className="flex items-center gap-2 text-[#B3B3B3] text-sm">
                <Lock className="w-4 h-4" />
                <span>Últimos 7 dias</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {filteredSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="bg-[#141414] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    session.type === 'pomodoro' ? 'bg-[#007BFF]' : 'bg-[#00FF88]'
                  }`} />
                  <div>
                    <h4 className="text-white font-medium text-sm">{session.subject}</h4>
                    <p className="text-[#B3B3B3] text-xs">
                      {new Date(session.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium text-sm">{Math.floor(session.duration / 60)}min</div>
                  <div className="text-[#B3B3B3] text-xs capitalize">{session.type}</div>
                </div>
              </div>
            ))}
            {filteredSessions.length === 0 && (
              <p className="text-[#B3B3B3] text-center py-8">Nenhuma sessão registrada</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Profile View
  const ProfileView = () => {
    const [profileData, setProfileData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      course: user?.course || '',
      goals: user?.goals || ''
    });

    const handleProfileUpdate = (field: string, value: string) => {
      setProfileData(prev => ({ ...prev, [field]: value }));
      if (user) {
        setUser({ ...user, [field]: value });
      }
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Perfil</h1>
          <p className="text-[#B3B3B3]">Gerencie suas informações e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4">Informações Pessoais</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileUpdate('name', e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#007BFF] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">E-mail</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#007BFF] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Curso</label>
                  <input
                    type="text"
                    value={profileData.course}
                    onChange={(e) => handleProfileUpdate('course', e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#007BFF] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Objetivos</label>
                  <textarea
                    value={profileData.goals}
                    onChange={(e) => handleProfileUpdate('goals', e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#007BFF] focus:outline-none transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4">Plano Atual</h3>
              <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  {user?.plan === 'premium' ? (
                    <Crown className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <User className="w-6 h-6 text-[#B3B3B3]" />
                  )}
                  <div>
                    <h4 className="text-white font-medium">
                      {user?.plan === 'premium' ? 'Premium' : 'Gratuito'}
                    </h4>
                    <p className="text-[#B3B3B3] text-sm">
                      {user?.plan === 'premium' ? 'Recursos ilimitados' : 'Recursos limitados'}
                    </p>
                  </div>
                </div>
                {user?.plan === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Upgrade
                  </button>
                )}
              </div>
              
              {user?.plan === 'free' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#B3B3B3]">Tarefas</span>
                    <span className="text-white">{tasks.length}/10</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#B3B3B3]">Materiais</span>
                    <span className="text-white">{materials.length}/5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#B3B3B3]">Histórico</span>
                    <span className="text-white">7 dias</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#007BFF] to-[#00FF88] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg md:text-2xl">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{user?.name}</h3>
              <p className="text-[#B3B3B3] text-sm mb-2">{user?.email}</p>
              <p className="text-[#B3B3B3] text-sm mb-4">{user?.course}</p>
              {user?.plan === 'premium' && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 px-3 py-2 rounded-lg">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 text-sm font-medium">Premium</span>
                </div>
              )}
            </div>

            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4">Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#B3B3B3] text-sm">Tarefas concluídas</span>
                  <span className="text-white font-bold">{tasks.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B3B3B3] text-sm">Pomodoros hoje</span>
                  <span className="text-white font-bold">{pomodoroCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B3B3B3] text-sm">Sessões de estudo</span>
                  <span className="text-white font-bold">{studySessions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B3B3B3] text-sm">Materiais salvos</span>
                  <span className="text-white font-bold">{materials.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderização principal
  if (!user) {
    return <OnboardingView />;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col md:flex-row font-inter">
      <MobileHeader />
      <Navigation />
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'pomodoro' && <PomodoroView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'planning' && <div className="p-6 text-white">Planejamento em desenvolvimento...</div>}
        {currentView === 'materials' && <div className="p-6 text-white">Materiais em desenvolvimento...</div>}
        {currentView === 'analytics' && <div className="p-6 text-white">Analytics em desenvolvimento...</div>}
      </main>
      <UpgradeModal />
    </div>
  );
}
