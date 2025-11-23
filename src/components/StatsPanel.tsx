import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Star, Download } from 'lucide-react';
import { analyticsManager } from '../utils/analyticsManager';

const StatsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [popular, setPopular] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsData, popularData, recsData] = await Promise.all([
        analyticsManager.getUsageStats(30),
        analyticsManager.getPopularElements(undefined, 10),
        analyticsManager.generateRecommendations()
      ]);
      setStats(statsData);
      setPopular(popularData);
      setRecommendations(recsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const report = await analyticsManager.generateReport(30);
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`导出失败：${error.message}`);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="统计分析"
      >
        <BarChart3 size={18} />
        <span className="font-medium text-gray-700 dark:text-gray-300">统计</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">统计分析</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">使用统计和智能推荐</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Download size={16} />
              导出报告
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">加载中...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 总体统计 */}
              {stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">总生成次数</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalGenerations}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">日均生成</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.averagePerDay.toFixed(1)}</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">最活跃时段</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.mostActiveHour}:00</div>
                  </div>
                </div>
              )}

              {/* 热门元素 */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  <TrendingUp size={20} />
                  热门元素 TOP 10
                </h3>
                <div className="space-y-2">
                  {popular.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800 dark:text-white">{item.item}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white">{item.count} 次</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 智能推荐 */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  <Star size={20} />
                  智能推荐
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-white">{rec.title}</h4>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">
                          {(rec.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
