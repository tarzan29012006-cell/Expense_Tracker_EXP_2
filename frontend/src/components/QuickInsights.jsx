import React from 'react';
import { Lightbulb, TrendingUp, CheckCircle2, Trophy, AlertTriangle } from 'lucide-react';

export const QuickInsights = ({ insights }) => {
  const defaultInsights = [
    {
      id: 1,
      icon: 'trending-up',
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      text: 'You spent 8% more this month compared to last month.',
    },
    {
      id: 2,
      icon: 'check-circle-2',
      color: '#10B981',
      bgColor: '#DCFCE7',
      text: 'Food expenses are 37% of your total spending.',
    },
    {
      id: 3,
      icon: 'trophy',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      text: 'Great job! You are within your budget. 🎉',
    },
  ];

  const items = insights && insights.length > 0 ? insights : defaultInsights;

  const renderIcon = (type, color) => {
    switch (type) {
      case 'trending-up':
        return <TrendingUp className="w-4 h-4" style={{ color }} />;
      case 'check-circle-2':
        return <CheckCircle2 className="w-4 h-4" style={{ color }} />;
      case 'trophy':
        return <Trophy className="w-4 h-4" style={{ color }} />;
      case 'alert-triangle':
        return <AlertTriangle className="w-4 h-4" style={{ color }} />;
      default:
        return <CheckCircle2 className="w-4 h-4" style={{ color }} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
          <Lightbulb className="w-4 h-4 stroke-[2.2] fill-amber-400/20" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Quick Insights</h2>
      </div>

      {/* Insight Items */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="flex items-start gap-3.5 group">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: item.bgColor || '#F1F5F9' }}
            >
              {renderIcon(item.icon, item.color)}
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-700 leading-snug pt-1">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
