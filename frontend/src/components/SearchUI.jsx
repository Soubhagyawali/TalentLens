import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { Search, Loader2, Bot, AlertCircle, Star } from 'lucide-react';

const getMatchLabel = (score) => {
  if (score > 0.8) return "🔥 Highly Relevant";
  if (score > 0.6) return "👍 Good Match";
  return "⚠️ Low Match";
};

export default function SearchUI() {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await api.post('/search', { query, topK });
      const sortedResults = (response.data || []).sort((a, b) => b.score - a.score);
      setResults(sortedResults);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to search vectors in Endee DB.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Find Your Next Star</h2>
        <p className="text-slate-500 mt-2">Go beyond keyword matching. Find candidates based on deeply aligned skills and experience.</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the ideal candidate (e.g. 'Senior Java dev who knows AWS and microservices')"
              className="w-full pl-11 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              required
            />
          </div>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full sm:w-24 px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
          >
            {[1, 3, 5, 10, 20].map(n => (
              <option key={n} value={n}>Top {n}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white py-4 px-8 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold">Search Failed</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !loading && !error && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Bot size={18} className="text-blue-500" />
              Top Matching Candidates ({results.length})
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-4 italic">Results ranked based on semantic similarity using AI embeddings</p>
          </div>
          
          {results.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <p className="text-slate-500">No matches found. Try different keywords.</p>
            </div>
          ) : (
            results.map((result, idx) => {
              const isBestMatch = idx === 0;
              return (
                <div 
                  key={idx} 
                  className={`p-5 mb-4 rounded-xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                    isBestMatch 
                      ? 'border-green-300 bg-green-50 shadow-md' 
                      : 'border-slate-200 bg-white shadow-sm hover:border-blue-300'
                  }`}
                >
                  {isBestMatch && (
                    <div className="flex items-center gap-1 text-green-700 font-bold mb-3 bg-green-100 w-fit px-3 py-1 rounded-full text-sm">
                      <Star size={16} fill="currentColor" /> Best Match
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-grow">
                      <p className={`leading-relaxed break-words ${isBestMatch ? 'text-slate-800 font-medium' : 'text-slate-700'}`}>
                        {result.text || <span className="text-slate-400 italic">No text metadata found</span>}
                      </p>
                      <div className="mt-3 inline-block">
                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                          {getMatchLabel(result.score)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 sm:mt-0 mt-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Match Score</span>
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm ${
                        result.score > 0.8 ? 'bg-green-100 text-green-700 border border-green-200' :
                        result.score > 0.6 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-orange-100 text-orange-700 border border-orange-200'
                      }`}>
                        {(result.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
