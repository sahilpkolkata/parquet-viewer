import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface QueryEditorProps {
  onExecuteQuery: (query: string) => void;
  isLoading: boolean;
}

export function QueryEditor({ onExecuteQuery, isLoading }: QueryEditorProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onExecuteQuery(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-32 p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your SQL query here..."
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute bottom-4 right-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 mr-2" />
          Run Query
        </button>
      </div>
    </form>
  );
}