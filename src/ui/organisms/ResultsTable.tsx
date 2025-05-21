import React, { useState } from 'react';

import { Button } from '../atoms/Button';
import { Card } from '../molecules/Card';

// Define auction data type
export interface AuctionData {
  id: string;
  title: string;
  date: string;
  price: string;
  status: string;
  documentCount: number;
  url: string;
}

export interface ResultsTableProps {
  data: AuctionData[];
  loading?: boolean;
  onViewDetails?: (auction: AuctionData) => void;
  onAnalyze?: (auction: AuctionData) => void;
  className?: string;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  loading = false,
  onViewDetails,
  onAnalyze,
  className = '',
}) => {
  // State for sorting
  const [sortField, setSortField] = useState<keyof AuctionData>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sort click
  const handleSort = (field: keyof AuctionData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get sort indicator
  const getSortIndicator = (field: keyof AuctionData) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <Card className={className}>
      <div className="table-container">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin text-lg mr-2">⟳</div>
            <span>Loading auction data...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-secondary-500">No auction data available</div>
        ) : (
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('title')}>
                  Title {getSortIndicator('title')}
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('date')}>
                  Date {getSortIndicator('date')}
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('price')}>
                  Price {getSortIndicator('price')}
                </th>
                <th className="table-cell cursor-pointer" onClick={() => handleSort('status')}>
                  Status {getSortIndicator('status')}
                </th>
                <th
                  className="table-cell cursor-pointer"
                  onClick={() => handleSort('documentCount')}
                >
                  Docs {getSortIndicator('documentCount')}
                </th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {sortedData.map(auction => (
                <tr
                  key={auction.id}
                  className="hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  <td className="table-cell font-medium">{auction.title}</td>
                  <td className="table-cell">{auction.date}</td>
                  <td className="table-cell">{auction.price}</td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(auction.status)}`}>
                      {auction.status}
                    </span>
                  </td>
                  <td className="table-cell text-center">{auction.documentCount}</td>
                  <td className="table-cell space-x-2">
                    {onViewDetails && (
                      <Button variant="secondary" size="sm" onClick={() => onViewDetails(auction)}>
                        Details
                      </Button>
                    )}

                    {onAnalyze && (
                      <Button variant="primary" size="sm" onClick={() => onAnalyze(auction)}>
                        Analyze
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};

// Helper function to get status badge color
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'expired':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    default:
      return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-100';
  }
}

export default ResultsTable;
