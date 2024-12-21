import React, { useEffect, useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { QueryEditor } from './components/QueryEditor';
import { ResultsTable } from './components/ResultsTable';
import { Database } from 'lucide-react';
import { initializeDuckDB, registerParquetFile, executeQuery } from './lib/duckdb';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tableName, setTableName] = useState<string | null>(null);

  useEffect(() => {
    initializeDuckDB().catch(console.error);
  }, []);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const name = await registerParquetFile(file);
      setTableName(name);
    } catch (err) {
      setError('Error loading Parquet file. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteQuery = async (query: string) => {
    if (!tableName) {
      setError('Please upload a Parquet file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const queryResults = await executeQuery(query);
      setResults(queryResults);
    } catch (err) {
      setError('Error executing query. Please check your SQL syntax.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Parquet SQL Explorer
          </h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">1. Upload Parquet File</h2>
          <FileUploader onFileSelect={handleFileSelect} />
          {tableName && (
            <p className="mt-2 text-sm text-green-600">
              File loaded as table: {tableName}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">2. Execute SQL Query</h2>
          <QueryEditor
            onExecuteQuery={handleExecuteQuery}
            isLoading={isLoading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <ResultsTable results={results} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;