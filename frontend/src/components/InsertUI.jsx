import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function InsertUI() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleInsert = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const response = await api.post('/insert', { text });
      setStatus({ type: 'success', message: response.data.message || 'Successfully inserted!' });
      setText('');
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to insert data into Endee DB.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Add Candidate Profile</h2>
        <p className="text-slate-500 mt-2">Convert resumes and experience into searchable AI embeddings.</p>
      </div>

      <form onSubmit={handleInsert} className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste candidate resume or describe their skills and experience here..."
            rows={5}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Processing...
            </>
          ) : (
            <>
              <Send size={18} /> Add Candidate
            </>
          )}
        </button>
      </form>

      {status && (
        <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
          ) : (
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
          )}
          <div>
            <h4 className="font-semibold">{status.type === 'success' ? 'Success' : 'Error'}</h4>
            <p className="text-sm mt-1">{status.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
