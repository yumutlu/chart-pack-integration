'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import StockChart from '../components/StockChart';

interface StockData {
  symbol: string;
  price: number | null;
  change: number | null;
}

export default function Home() {
  const [stocksData, setStocksData] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    socket.on('stockUpdate', (data: any) => {
      if (Array.isArray(data)) {
        const validData = data.filter((stock): stock is StockData =>
          typeof stock === 'object' &&
          stock !== null &&
          typeof stock.symbol === 'string' &&
          (typeof stock.price === 'number' || stock.price === null) &&
          (typeof stock.change === 'number' || stock.change === null)
        );
        setStocksData(validData);
        setError(null);
      } else {
        console.error('Invalid data received:', data);
        setError('Invalid data received from server');
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Stock Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocksData.map((stock) => (
          <div key={stock.symbol} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{stock.symbol}</h2>
            <p className="text-lg">
              Price: {stock.price !== null ? `$${stock.price.toFixed(2)}` : 'N/A'}
            </p>
            <p className={`text-lg ${stock.change !== null ? (stock.change >= 0 ? 'text-green-500' : 'text-red-500') : ''}`}>
              Change: {stock.change !== null ? `${stock.change.toFixed(2)}%` : 'N/A'}
            </p>
            <StockChart data={stock} />
          </div>
        ))}
      </div>
    </main>
  );
}