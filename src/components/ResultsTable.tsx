import React from 'react';

interface ResultsTableProps {
  results: any[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (!results.length) return null;

  const columns = Object.keys(results[0]);

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-6 py-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr
              key={index}
              className="bg-white border-b hover:bg-gray-50"
            >
              {columns.map((column) => (
                <td key={column} className="px-6 py-4">
                  {row[column]?.toString() ?? 'NULL'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}