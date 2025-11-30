import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StockData } from '../types';

interface StockChartProps {
  data: StockData;
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    // Simulate intraday 5-minute intervals
    // We start from a calculated "Open" based on the change percent
    const points = 50;
    const result = [];
    const currentPrice = data.price;
    const changeFactor = 1 + (data.changePercent / 100);
    const openPrice = currentPrice / changeFactor; // Approximate open

    let runningPrice = openPrice;
    const volatility = currentPrice * 0.005; // 0.5% volatility per step

    for (let i = 0; i < points; i++) {
      // Create a random walk that trends towards the current price
      const progress = i / points;
      const targetTrend = openPrice + (currentPrice - openPrice) * progress;
      const noise = (Math.random() - 0.5) * volatility;
      
      // Blend trend and noise, heavily weighted to end strictly at currentPrice
      // We ease into the final price to make the chart look consistent with the big number
      let pointPrice = (targetTrend * 0.7 + runningPrice * 0.3) + noise;

      if (i === points - 1) pointPrice = currentPrice;

      result.push({
        time: `${9 + Math.floor((i * 390) / points / 60)}:${String(Math.floor((i * 390) / points) % 60).padStart(2, '0')}`,
        price: parseFloat(pointPrice.toFixed(2)),
      });
      
      runningPrice = pointPrice;
    }
    return result;
  }, [data.price, data.changePercent]);

  const isPositive = data.changePercent >= 0;
  const color = isPositive ? "#10b981" : "#ef4444"; // emerald-500 : red-500

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            interval={10}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            tickFormatter={(val) => `$${val.toFixed(2)}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;