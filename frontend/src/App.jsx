import React, { useState } from 'react';
import InsertUI from './components/InsertUI';
import SearchUI from './components/SearchUI';
import { Database, Search } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen font-sans max-w-5xl mx-auto p-4 md:p-8">
      <header className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Endee <span className="text-blue-600">TalentLens</span>
          </h1>
          <p className="text-sm text-slate-500">AI-powered candidate discovery</p>
        
        <div className="mt-6 sm:mt-0 flex gap-2 bg-slate-200/60 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'search' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search size={16} /> Search
          </button>
          <button 
            onClick={() => setActiveTab('insert')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'insert' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database size={16} /> Insert
          </button>
        </div>
      </header>

      <main className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[500px]">
        {activeTab === 'search' ? <SearchUI /> : <InsertUI />}
      </main>
      
      <footer className="mt-12 text-center text-sm text-slate-400">
        Built with React, TailwindCSS, and Spring Boot
      </footer>
    </div>
  );
}

export default App;
