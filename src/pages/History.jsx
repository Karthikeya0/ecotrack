import React from 'react';
import { useApp } from '../context/AppContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  TrendingDown, 
  Award, 
  AlertTriangle, 
  Calendar, 
  BarChart4, 
  Activity 
} from 'lucide-react';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const History = () => {
  const { history, dashboard } = useApp();
  const dailyBudget = dashboard?.dailyBudget || 20;

  // Process logs (sorted chronologically for graphing)
  const sortedLogs = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

  // 1. Calculations for analytics cards
  const getAnalytics = () => {
    if (sortedLogs.length === 0) {
      return { avg7Day: 0, bestDay: 'N/A', worstDay: 'N/A', monthlyTotal: 0 };
    }

    const now = new Date();
    const limit7Days = new Date();
    limit7Days.setDate(now.getDate() - 7);

    // 7-day average
    const logs7Days = sortedLogs.filter(log => new Date(log.date) >= limit7Days);
    const sum7Days = logs7Days.reduce((sum, log) => sum + log.emissions.total, 0);
    const avg7Day = logs7Days.length > 0 ? parseFloat((sum7Days / logs7Days.length).toFixed(1)) : 0;

    // Monthly total (sum of last 30 logs)
    const last30Logs = sortedLogs.slice(-30);
    const monthlyTotal = parseFloat(last30Logs.reduce((sum, log) => sum + log.emissions.total, 0).toFixed(1));

    // Best & Worst Days (lowest/highest emissions)
    let best = sortedLogs[0];
    let worst = sortedLogs[0];
    for (let log of sortedLogs) {
      if (log.emissions.total < best.emissions.total) best = log;
      if (log.emissions.total > worst.emissions.total) worst = log;
    }

    // Helper formatting: date string to readable format
    const formatDate = (dateStr) => {
      const options = { month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    return {
      avg7Day,
      bestDay: `${formatDate(best.date)} (${best.emissions.total} kg)`,
      worstDay: `${formatDate(worst.date)} (${worst.emissions.total} kg)`,
      monthlyTotal
    };
  };

  const stats = getAnalytics();

  // 2. Chart configurations (30-day Line Chart)
  const lineChartData = {
    labels: sortedLogs.slice(-30).map(log => {
      const options = { month: 'short', day: 'numeric' };
      return new Date(log.date).toLocaleDateString('en-US', options);
    }),
    datasets: [
      {
        label: 'Daily Emissions (kg CO₂)',
        data: sortedLogs.slice(-30).map(log => log.emissions.total),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointHoverRadius: 6,
        borderWidth: 2
      },
      {
        label: 'Daily Budget Limit',
        data: Array(Math.min(30, sortedLogs.length)).fill(dailyBudget),
        borderColor: 'rgba(239, 68, 68, 0.45)',
        borderWidth: 1.5,
        borderDash: [6, 6],
        fill: false,
        pointStyle: 'none',
        pointRadius: 0
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      tooltip: {
        padding: 12,
        backgroundColor: '#0f172a',
        titleFont: { family: 'Outfit', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        borderColor: '#1e293b',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.1)' },
        ticks: { color: '#64748b', font: { family: 'Inter' } },
        title: { display: true, text: 'kg CO₂e', color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter' } }
      }
    }
  };

  // 3. Stacked Bar Chart configurations (14-day Breakdown)
  const barChartData = {
    labels: sortedLogs.slice(-14).map(log => {
      const options = { month: 'short', day: 'numeric' };
      return new Date(log.date).toLocaleDateString('en-US', options);
    }),
    datasets: [
      {
        label: 'Travel',
        data: sortedLogs.slice(-14).map(log => log.emissions.breakdown.travel),
        backgroundColor: '#38bdf8' // Sky blue
      },
      {
        label: 'Food',
        data: sortedLogs.slice(-14).map(log => log.emissions.breakdown.food),
        backgroundColor: '#fbbf24' // Amber
      },
      {
        label: 'Energy',
        data: sortedLogs.slice(-14).map(log => log.emissions.breakdown.energy),
        backgroundColor: '#f43f5e' // Rose
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      tooltip: {
        padding: 12,
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        stacked: true,
        grid: { color: 'rgba(51, 65, 85, 0.1)' },
        ticks: { color: '#64748b', font: { family: 'Inter' } }
      },
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter' } }
      }
    }
  };

  // 4. Heatmap Calendar (Grid structure representing last 28 days)
  const renderHeatmap = () => {
    const squares = [];
    const now = new Date();
    
    // Generate grid items for the last 35 days (5 weeks)
    for (let i = 34; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const log = sortedLogs.find(l => l.date === dateStr);
      let colorClass = 'bg-slate-900 border-slate-950'; // Default: no log
      let tooltipText = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: No log registered`;

      if (log) {
        const emissions = log.emissions.total;
        const budgetPercent = (emissions / dailyBudget) * 100;
        
        if (budgetPercent > 100) {
          colorClass = 'bg-rose-500/80 border-rose-400/20 text-rose-100 hover:scale-110';
        } else if (budgetPercent >= 70) {
          colorClass = 'bg-amber-500/80 border-amber-400/20 text-amber-100 hover:scale-110';
        } else if (budgetPercent >= 40) {
          colorClass = 'bg-emerald-600/70 border-emerald-500/20 text-emerald-100 hover:scale-110';
        } else {
          colorClass = 'bg-emerald-500 border-emerald-400/20 text-emerald-550 hover:scale-110';
        }
        tooltipText = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${emissions.toFixed(1)} kg CO₂`;
      }

      squares.push(
        <div
          key={dateStr}
          className={`w-6 h-6 rounded border transition-all duration-200 relative group cursor-pointer ${colorClass}`}
        >
          {/* Tooltip Popup on Hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-36 hidden group-hover:block z-20">
            <div className="bg-slate-950 border border-slate-800 text-[10px] text-slate-200 font-semibold px-2 py-1.5 rounded-lg text-center shadow-xl">
              {tooltipText}
            </div>
            <div className="w-1.5 h-1.5 bg-slate-950 border-r border-b border-slate-800 transform rotate-45 mx-auto -mt-1" />
          </div>
        </div>
      );
    }
    return squares;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Emissions Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Review historical charts, categories, and calendar logs.</p>
      </div>

      {/* 4-column Stats analytics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0"><Activity className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-outfit">7-day Average</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{stats.avg7Day} kg</span>
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0"><Award className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-outfit">Best Day</span>
            <span className="text-sm font-bold text-white mt-1 block truncate max-w-[140px]" title={stats.bestDay}>
              {stats.bestDay}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0"><AlertTriangle className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-outfit">Worst Day</span>
            <span className="text-sm font-bold text-white mt-1 block truncate max-w-[140px]" title={stats.worstDay}>
              {stats.worstDay}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0"><TrendingDown className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-outfit">30-Day Sum</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{stats.monthlyTotal} kg</span>
          </div>
        </div>

      </div>

      {/* Heatmap calendar log consistency */}
      <div className="glass-panel p-6 border-slate-800/80">
        <h3 className="font-outfit font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-500" />
          <span>Calendar Heatmap (Last 35 Days)</span>
        </h3>
        
        {/* Heatmap Grid */}
        <div className="flex flex-wrap gap-2.5 items-center justify-start py-2">
          {renderHeatmap()}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center gap-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          <span>Legend:</span>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-900" /> <span>No Log</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> <span>&lt;40% Budget</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-600/70" /> <span>40-70% Budget</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500/80" /> <span>70-100% Budget</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500/80 animate-pulse" /> <span>&gt;100% Budget</span></div>
        </div>
      </div>

      {/* Chart Graphs panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line Chart */}
        <div className="glass-panel p-6 border-slate-800/80 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-outfit font-bold text-lg text-white">Daily Emissions trend</h3>
            <p className="text-slate-500 text-xs mt-0.5">Overview of CO₂ output in the last 30 logs</p>
          </div>
          <div className="h-72">
            {sortedLogs.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No historical log data available</div>
            )}
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div className="glass-panel p-6 border-slate-800/80 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-outfit font-bold text-lg text-white">Category breakdown</h3>
            <p className="text-slate-500 text-xs mt-0.5">Stacked source emissions in the last 14 logs</p>
          </div>
          <div className="h-72">
            {sortedLogs.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No historical log data available</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default History;
