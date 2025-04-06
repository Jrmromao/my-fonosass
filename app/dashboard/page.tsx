'use client'
import React, { useState } from 'react';
import {
    Search,
    Grid3X3,
    LayoutList,
    BookOpen,
    Star,
    Clock,
    Mic,
    Volume2,
    BarChart2,
    BookmarkPlus,
    Music,
    SlidersHorizontal,
    ChevronDown,
    Calendar,
    PlusCircle,
    TrendingUp,
    CheckCircle2,
    HelpCircle,
    FileText,
    Download,
    User,
    Settings
} from 'lucide-react';

const Dashboard = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

    // Phoneme categories with enhanced data
    const phonemeCategories = [
        { id: 'plosivas', name: 'Plosivas', count: 28, icon: <Mic size={18} />, color: 'from-pink-500 to-yellow-400', usage: 65 },
        { id: 'fricativas', name: 'Fricativas', count: 36, icon: <Volume2 size={18} />, color: 'from-indigo-500 to-purple-500', usage: 82 },
        { id: 'nasais', name: 'Nasais', count: 14, icon: <Music size={18} />, color: 'from-green-400 to-cyan-500', usage: 45 },
        { id: 'liquidas', name: 'Líquidas', count: 22, icon: <Volume2 size={18} />, color: 'from-orange-400 to-pink-500', usage: 58 },
        { id: 'vogais', name: 'Vogais', count: 31, icon: <Music size={18} />, color: 'from-blue-500 to-indigo-600', usage: 73 }
    ];

    // Recent exercises with enhanced metadata
    const recentExercises = [
        {
            id: 1,
            title: 'Jogo dos Sons Sibilantes',
            description: 'Exercícios para fonemas S, Z e X',
            category: 'fricativas',
            categoryName: 'Fricativas',
            age: '3-6 anos',
            difficulty: 'Iniciante',
            views: 245,
            completions: 183,
            favorite: true,
            dateAdded: '2 dias atrás',
            icon: <Volume2 size={20} />,
            color: 'from-indigo-500 to-purple-500'
        },
        {
            id: 2,
            title: 'Rimas Divertidas com Vogais',
            description: 'Atividade para reconhecimento de vogais',
            category: 'vogais',
            categoryName: 'Vogais',
            age: '4-7 anos',
            difficulty: 'Intermediário',
            views: 187,
            completions: 142,
            favorite: false,
            dateAdded: '4 dias atrás',
            icon: <Music size={20} />,
            color: 'from-blue-500 to-indigo-600'
        },
        {
            id: 3,
            title: 'Histórias com Fonemas Líquidos',
            description: 'Narrativas para prática de R e L',
            category: 'liquidas',
            categoryName: 'Líquidas',
            age: '5-9 anos',
            difficulty: 'Avançado',
            views: 132,
            completions: 97,
            favorite: true,
            dateAdded: '1 semana atrás',
            icon: <Volume2 size={20} />,
            color: 'from-orange-400 to-pink-500'
        },
        {
            id: 4,
            title: 'Sequência de Plosivas',
            description: 'Exercício para fonemas P, B, T, D, K, G',
            category: 'plosivas',
            categoryName: 'Plosivas',
            age: '4-8 anos',
            difficulty: 'Intermediário',
            views: 98,
            completions: 76,
            favorite: false,
            dateAdded: '1 semana atrás',
            icon: <Mic size={20} />,
            color: 'from-pink-500 to-yellow-400'
        }
    ];

    // Usage stats with trend indicators
    const usageStats = [
        {
            label: 'Total de Exercícios',
            value: '136',
            trend: '+12%',
            trendUp: true,
            icon: <BookOpen size={20} className="text-white" />,
            color: 'from-pink-500 to-yellow-400'
        },
        {
            label: 'Categorias de Fonemas',
            value: '5',
            trend: '',
            trendUp: true,
            icon: <Grid3X3 size={20} className="text-white" />,
            color: 'from-indigo-500 to-purple-500'
        },
        {
            label: 'Exercícios Favoritos',
            value: '24',
            trend: '+8%',
            trendUp: true,
            icon: <Star size={20} className="text-white" />,
            color: 'from-blue-500 to-indigo-600'
        },
        {
            label: 'Adicionados Recentemente',
            value: '12',
            trend: '+4',
            trendUp: true,
            icon: <Clock size={20} className="text-white" />,
            color: 'from-emerald-500 to-teal-500'
        }
    ];

    // Suggested exercises based on usage
    const suggestedExercises = [
        {
            title: 'Trilha Fonêmica',
            category: 'Múltiplos Fonemas',
            match: '98% de match com seus perfis',
            icon: <CheckCircle2 size={16} className="text-emerald-500" />
        },
        {
            title: 'Sequências Articulatórias',
            category: 'Fricativas',
            match: '95% de match com seus perfis',
            icon: <CheckCircle2 size={16} className="text-emerald-500" />
        },
        {
            title: 'Jogo da Língua',
            category: 'Líquidas',
            match: '89% de match com seus perfis',
            icon: <CheckCircle2 size={16} className="text-emerald-500" />
        }
    ];

    const getCategoryById = (id: string) => {
        return phonemeCategories.find(category => category.id === id) ||
            { color: 'from-gray-400 to-gray-500', icon: <HelpCircle size={18} /> };
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-fuchsia-50 dark:from-indigo-950 dark:to-fuchsia-950">
            {/* Top Navigation */}
            <div className="bg-white dark:bg-indigo-900 border-b border-indigo-100 dark:border-indigo-800 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <h1 className="text-xl font-bold text-indigo-900 dark:text-white">Biblioteca Fonêmica</h1>

                            <div className="relative hidden md:block max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-indigo-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-indigo-50 dark:bg-indigo-800/50 text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Buscar exercícios, categorias, fonemas..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="w-8 h-8 flex items-center justify-center rounded-full text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800">
                                <HelpCircle size={18} />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800">
                                <Settings size={18} />
                            </button>
                            <div className="relative ml-2">
                                <button className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 flex items-center justify-center text-white">
                                        <User size={16} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-900 dark:text-white mb-1">Dashboard</h2>
                        <p className="text-indigo-600 dark:text-indigo-300 text-sm">Biblioteca de exercícios fonêmicos para fonoaudiólogos</p>
                    </div>

                    <div className="flex mt-4 md:mt-0 space-x-3">
                        <button className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 text-sm font-medium rounded-lg border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-700">
                            <FileText size={16} className="mr-2" />
                            Relatórios
                        </button>
                        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all">
                            <PlusCircle size={16} className="mr-2" />
                            Novo Exercício
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {usageStats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-indigo-900/70 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                            <div className="flex">
                                <div className={`w-3 bg-gradient-to-b ${stat.color}`}></div>
                                <div className="p-4 w-full">
                                    <div className="flex justify-between">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                            {stat.icon}
                                        </div>
                                        {stat.trend && (
                                            <div className={`flex items-center text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {stat.trendUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1 transform rotate-180" />}
                                                {stat.trend}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-bold text-indigo-900 dark:text-white mb-1">{stat.value}</h3>
                                    <p className="text-indigo-600 dark:text-indigo-400 text-sm">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filter Row - Mobile */}
                <div className="md:hidden mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-indigo-400" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-indigo-800 text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Buscar exercícios, categorias, fonemas..."
                        />
                    </div>
                </div>

                {/* Filter and View Toggle */}
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="flex flex-wrap items-center bg-white dark:bg-indigo-900/70 rounded-lg border border-indigo-100 dark:border-indigo-800 shadow-sm divide-x divide-indigo-100 dark:divide-indigo-800">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                                activeCategory === 'all'
                                    ? 'text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-800'
                                    : 'text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800/50'
                            }`}
                        >
                            Todos
                        </button>

                        {phonemeCategories.slice(0, 3).map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-4 py-2 text-sm font-medium ${
                                    activeCategory === category.id
                                        ? 'text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-800'
                                        : 'text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800/50'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}

                        <div className="relative">
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800/50 rounded-r-lg flex items-center"
                            >
                                <SlidersHorizontal size={14} className="mr-1" />
                                Filtros
                            </button>

                            {filterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-indigo-900 rounded-lg shadow-lg border border-indigo-200 dark:border-indigo-700 z-10">
                                    <div className="p-3">
                                        <h3 className="font-medium text-indigo-900 dark:text-white text-sm mb-2">Filtrar por</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">Faixa Etária</label>
                                                <select className="w-full p-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-indigo-800 text-indigo-900 dark:text-white">
                                                    <option value="">Todas as idades</option>
                                                    <option value="3-6">3-6 anos</option>
                                                    <option value="4-7">4-7 anos</option>
                                                    <option value="5-9">5-9 anos</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">Dificuldade</label>
                                                <select className="w-full p-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-indigo-800 text-indigo-900 dark:text-white">
                                                    <option value="">Todos os níveis</option>
                                                    <option value="iniciante">Iniciante</option>
                                                    <option value="intermediario">Intermediário</option>
                                                    <option value="avancado">Avançado</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">Ordenar por</label>
                                                <select className="w-full p-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-indigo-800 text-indigo-900 dark:text-white">
                                                    <option value="recent">Mais recentes</option>
                                                    <option value="popular">Mais populares</option>
                                                    <option value="az">A-Z</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800">
                                            <button className="px-3 py-1.5 text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-white rounded-lg mr-2">
                                                Limpar
                                            </button>
                                            <button className="px-3 py-1.5 text-xs bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-lg">
                                                Aplicar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid'
                                ? 'bg-gradient-to-r from-pink-500 to-yellow-400 text-white shadow-sm'
                                : 'bg-white dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'}`}
                        >
                            <Grid3X3 size={16} />
                        </button>

                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list'
                                ? 'bg-gradient-to-r from-pink-500 to-yellow-400 text-white shadow-sm'
                                : 'bg-white dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'}`}
                        >
                            <LayoutList size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {/* Exercises Display */}
                        <div className="bg-white dark:bg-indigo-900/70 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800 overflow-hidden mb-6">
                            <div className="p-4 border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900 dark:to-indigo-800 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-indigo-900 dark:text-white flex items-center">
                                    <Clock size={18} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                                    <span>Exercícios Recentes</span>
                                </h2>
                                <button className="text-indigo-600 dark:text-indigo-300 hover:text-pink-500 dark:hover:text-pink-400 text-sm font-medium flex items-center">
                                    Ver todos
                                    <ChevronDown size={16} className="ml-1 transform -rotate-90" />
                                </button>
                            </div>

                            <div className="p-4">
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                                        {recentExercises.map((exercise) => {
                                            const category = exercise.category;
                                            const categoryData = getCategoryById(category);

                                            return (
                                                <div key={exercise.id} className="group relative bg-white dark:bg-indigo-900 rounded-xl border border-indigo-100 dark:border-indigo-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                                    <div className={`h-24 bg-gradient-to-r ${categoryData.color} relative p-4 flex items-end`}>
                                                        <div className="absolute top-3 right-3 flex space-x-1">
                                                            {exercise.favorite && (
                                                                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                                </div>
                                                            )}
                                                            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-medium">
                                                                {exercise.difficulty.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
                                                        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mr-3 relative z-10">
                                                            {exercise.icon}
                                                        </div>
                                                        <h3 className="text-white font-medium relative z-10 text-sm">{exercise.categoryName}</h3>
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-semibold text-indigo-900 dark:text-white mb-1 line-clamp-1">
                                                            {exercise.title}
                                                        </h3>
                                                        <p className="text-indigo-600 dark:text-indigo-400 text-sm mb-3 line-clamp-2">
                                                            {exercise.description}
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center text-indigo-500 dark:text-indigo-300">
                                <span className="bg-indigo-50 dark:bg-indigo-800 px-2 py-0.5 rounded-full">
                                  {exercise.age}
                                </span>
                                                            </div>
                                                            <span className="text-indigo-500 dark:text-indigo-400">{exercise.dateAdded}</span>
                                                        </div>
                                                    </div>
                                                    <div className="absolute inset-0 bg-indigo-900/5 dark:bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentExercises.map((exercise) => {
                                            const category = exercise.category;
                                            const categoryData = getCategoryById(category);

                                            return (
                                                <div key={exercise.id} className="flex items-stretch bg-white dark:bg-indigo-900 rounded-lg border border-indigo-100 dark:border-indigo-800 overflow-hidden hover:shadow-sm transition-shadow">
                                                    <div className={`w-2 bg-gradient-to-b ${categoryData.color}`}></div>
                                                    <div className="p-3 flex items-center flex-grow">
                                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryData.color} flex items-center justify-center text-white mr-4 flex-shrink-0`}>
                                                            {exercise.icon}
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <div className="flex items-start justify-between mb-1">
                                                                <h3 className="font-medium text-indigo-900 dark:text-white text-sm truncate mr-2">
                                                                    {exercise.title}
                                                                </h3>
                                                                {exercise.favorite && (
                                                                    <Star size={14} className="flex-shrink-0 fill-yellow-400 text-yellow-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 flex-wrap">
                                <span className="bg-indigo-50 dark:bg-indigo-800 px-1.5 py-0.5 rounded-full mr-2">
                                  {exercise.categoryName}
                                </span>
                                                                <span className="flex items-center mr-2">
                                  <Clock size={10} className="mr-1" />
                                                                    {exercise.dateAdded}
                                </span>
                                                                <span>{exercise.age}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3 ml-2 flex-shrink-0">
                                                            <div className="text-right">
                                                                <div className="text-xs font-medium text-indigo-900 dark:text-white">
                                                                    {exercise.views}
                                                                </div>
                                                                <div className="text-xs text-indigo-500 dark:text-indigo-400">
                                                                    visualizações
                                                                </div>
                                                            </div>
                                                            <button className="p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-800">
                                                                <Download size={16} className="text-indigo-500 dark:text-indigo-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <button className="w-full mt-4 p-3 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-800/70 transition-colors flex items-center justify-center">
                                    <PlusCircle size={16} className="mr-2" /> Adicionar Novo Exercício
                                </button>
                            </div>
                        </div>

                        {/* Activity Calendar */}
                        <div className="bg-white dark:bg-indigo-900/70 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                            <div className="p-4 border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900 dark:to-indigo-800">
                                <h2 className="text-lg font-semibold text-indigo-900 dark:text-white flex items-center">
                                    <Calendar size={18} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                                    <span>Calendário de Atividades</span>
                                </h2>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <button className="text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white">
                                        <ChevronDown size={18} className="transform rotate-90" />
                                    </button>
                                    <h3 className="font-medium text-indigo-900 dark:text-white">Abril 2025</h3>
                                    <button className="text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white">
                                        <ChevronDown size={18} className="transform -rotate-90" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                                    <div>DOM</div>
                                    <div>SEG</div>
                                    <div>TER</div>
                                    <div>QUA</div>
                                    <div>QUI</div>
                                    <div>SEX</div>
                                    <div>SÁB</div>
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {/* First row - Empty days from previous month */}
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">28</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">29</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">30</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">31</div>

                                    {/* April days */}
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">1</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">2</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">3</div>

                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">4</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">5</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-700">6</div>

                                    {/* Current day */}
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-yellow-400 shadow-sm">
                                        <div className="relative">
                                            7
                                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                                        </div>
                                    </div>

                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">8</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">9</div>

                                    {/* Day with activities */}
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-700 relative">
                                        <div className="relative">
                                            10
                                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                    </div>

                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">11</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">12</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-700">13</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">14</div>

                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-700 relative">
                                        <div className="relative">
                                            15
                                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                    </div>

                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">16</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">17</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">18</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">19</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-700">20</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">21</div>

                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-700 relative">
                                        <div className="relative">
                                            22
                                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                    </div>

                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">23</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">24</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">25</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">26</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-700">27</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">28</div>

                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">29</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">30</div>

                                    {/* May days */}
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">1</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">2</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">3</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">4</div>
                                    <div className="h-10 flex items-center justify-center rounded-lg text-xs text-indigo-400 dark:text-indigo-500">5</div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800 text-xs">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 mr-2"></div>
                                        <span className="text-indigo-700 dark:text-indigo-300">Hoje</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-indigo-100 dark:bg-indigo-700 mr-2"></div>
                                        <span className="text-indigo-700 dark:text-indigo-300">Exercícios Programados</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                        <span className="text-indigo-700 dark:text-indigo-300">Adicionados</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebars */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Categories Card */}
                        <div className="bg-white dark:bg-indigo-900/70 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                            <div className="p-4 border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900 dark:to-indigo-800">
                                <h2 className="text-lg font-semibold text-indigo-900 dark:text-white flex items-center">
                                    <Grid3X3 size={18} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                                    <span>Categorias de Fonemas</span>
                                </h2>
                            </div>

                            <div className="p-4">
                                <ul className="space-y-2">
                                    {phonemeCategories.map((category, index) => (
                                        <li key={index}>
                                            <a
                                                href="#"
                                                className={`flex items-center justify-between p-3 rounded-lg ${
                                                    activeCategory === category.id
                                                        ? 'bg-indigo-50 dark:bg-indigo-800 border-l-4 border-blue-500'
                                                        : 'hover:bg-indigo-50 dark:hover:bg-indigo-800/50 border-l-4 border-transparent'
                                                } transition-all`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white mr-3`}>
                                                        {category.icon}
                                                    </div>
                                                    <span className="font-medium text-indigo-900 dark:text-white text-sm">{category.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                          <span className="bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs py-0.5 px-2 rounded-full">
                            {category.count}
                          </span>
                                                    <div className="h-1.5 w-10 rounded-full bg-indigo-100 dark:bg-indigo-800 overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${category.color}`}
                                                            style={{ width: `${category.usage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>

                                <button className="w-full mt-4 p-2.5 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-800/70 transition-colors flex items-center justify-center text-sm">
                                    <PlusCircle size={14} className="mr-2" /> Nova Categoria
                                </button>
                            </div>
                        </div>

                        {/* Suggested Exercises */}
                        <div className="bg-white dark:bg-indigo-900/70 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                            <div className="p-4 border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900 dark:to-indigo-800">
                                <h2 className="text-lg font-semibold text-indigo-900 dark:text-white flex items-center">
                                    <BookmarkPlus size={18} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                                    <span>Sugestões Para Você</span>
                                </h2>
                            </div>

                            <div className="p-4">
                                <ul className="space-y-3">
                                    {suggestedExercises.map((exercise, index) => (
                                        <li key={index} className="p-3 rounded-lg bg-gradient-to-r from-indigo-50/50 to-fuchsia-50/50 dark:from-indigo-800/30 dark:to-fuchsia-900/30 border border-indigo-100 dark:border-indigo-800">
                                            <h3 className="font-medium text-indigo-900 dark:text-white text-sm mb-1">{exercise.title}</h3>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-indigo-600 dark:text-indigo-400">{exercise.category}</span>
                                                <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                          {exercise.icon}
                                                    <span className="ml-1">{exercise.match}</span>
                        </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <button className="w-full mt-4 p-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transition-shadow flex items-center justify-center text-sm">
                                    Ver Mais Sugestões
                                </button>
                            </div>
                        </div>

                        {/* Usage Stats */}
                        <div className="bg-white dark:bg-indigo-900/70 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800 overflow-hidden">
                            <div className="p-4 border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900 dark:to-indigo-800">
                                <h2 className="text-lg font-semibold text-indigo-900 dark:text-white flex items-center">
                                    <BarChart2 size={18} className="mr-2 text-indigo-500 dark:text-indigo-400" />
                                    <span>Uso por Categoria</span>
                                </h2>
                            </div>

                            <div className="p-4">
                                <div className="space-y-4">
                                    {phonemeCategories.map((category) => (
                                        <div key={category.id}>
                                            <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-indigo-900 dark:text-white flex items-center">
                          <div className={`w-3 h-3 rounded-lg bg-gradient-to-br ${category.color} mr-2`}></div>
                            {category.name}
                        </span>
                                                <span className="text-xs text-indigo-600 dark:text-indigo-400">{category.usage}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-indigo-100 dark:bg-indigo-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${category.color}`}
                                                    style={{ width: `${category.usage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Taxa de Conclusão</span>
                                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">78%</span>
                                    </div>
                                    <div className="w-full h-2 bg-indigo-100 dark:bg-indigo-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: '78%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;