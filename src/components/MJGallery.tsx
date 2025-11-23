import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Maximize2, Loader, AlertCircle, Trash2 } from 'lucide-react';
import { mjAPI, MJTask } from '../utils/midjourneyAPI';

const MJGallery: React.FC = () => {
  const [tasks, setTasks] = useState<MJTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<MJTask | null>(null);

  useEffect(() => {
    // 初始加载任务
    const initialTasks = mjAPI.getAllTasks();
    console.log('MJGallery: Initial tasks loaded', initialTasks);
    setTasks(initialTasks);

    // 监听任务更新
    const handleTaskUpdate = (event: Event) => {
      console.log('MJGallery: Task update event received', event);
      const updatedTasks = mjAPI.getAllTasks();
      console.log('MJGallery: Updated tasks', updatedTasks);
      setTasks(updatedTasks);
    };

    window.addEventListener('mj-task-update', handleTaskUpdate as EventListener);

    return () => {
      window.removeEventListener('mj-task-update', handleTaskUpdate as EventListener);
    };
  }, []);

  const handleDownload = async (task: MJTask) => {
    if (!task.imageUrl) return;

    try {
      const response = await fetch(task.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mj-${task.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleUpscale = async (task: MJTask, index: number) => {
    try {
      await mjAPI.submitAction({
        taskId: task.id,
        action: 'UPSCALE',
        index,
      });
    } catch (error) {
      console.error('Upscale failed:', error);
      alert('放大失败：' + (error as Error).message);
    }
  };

  const handleVariation = async (task: MJTask, index: number) => {
    try {
      await mjAPI.submitAction({
        taskId: task.id,
        action: 'VARIATION',
        index,
      });
    } catch (error) {
      console.error('Variation failed:', error);
      alert('变体失败：' + (error as Error).message);
    }
  };

  const handleReroll = async (task: MJTask) => {
    try {
      await mjAPI.submitAction({
        taskId: task.id,
        action: 'REROLL',
      });
    } catch (error) {
      console.error('Reroll failed:', error);
      alert('重绘失败：' + (error as Error).message);
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有任务吗？')) {
      mjAPI.clearTasks();
      setTasks([]);
    }
  };

  const getStatusColor = (status: MJTask['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status: MJTask['status']) => {
    switch (status) {
      case 'success':
        return '完成';
      case 'failed':
        return '失败';
      case 'processing':
        return '生成中';
      default:
        return '等待中';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无绘图任务</p>
          <p className="text-sm mt-2">生成提示词后选择"自动绘图"即可开始</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          绘图画板 ({tasks.length})
        </h3>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                   hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <Trash2 size={16} />
          清空全部
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="glass-card rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Image or Placeholder */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
              {task.status === 'success' && task.imageUrl ? (
                <>
                  <img
                    src={task.imageUrl}
                    alt={task.prompt}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  />
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 
                             rounded-lg transition-colors"
                  >
                    <Maximize2 size={16} className="text-white" />
                  </button>
                </>
              ) : task.status === 'processing' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader className="animate-spin text-purple-600 mb-4" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    {task.progress ? `${task.progress}%` : '生成中...'}
                  </p>
                </div>
              ) : task.status === 'failed' ? (
                <div className="flex flex-col items-center justify-center h-full text-red-600">
                  <AlertCircle size={48} className="mb-4" />
                  <p className="text-sm px-4 text-center">{task.error || '生成失败'}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader className="animate-spin text-gray-400" size={48} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(task.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Prompt */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {task.prompt}
              </p>

              {/* Actions */}
              {task.status === 'success' && (
                <div className="space-y-2">
                  {/* U Buttons */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((index) => (
                      <button
                        key={`u${index}`}
                        onClick={() => handleUpscale(task, index)}
                        className="flex-1 px-2 py-1.5 text-xs font-medium rounded
                                 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400
                                 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        U{index}
                      </button>
                    ))}
                  </div>

                  {/* V Buttons */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((index) => (
                      <button
                        key={`v${index}`}
                        onClick={() => handleVariation(task, index)}
                        className="flex-1 px-2 py-1.5 text-xs font-medium rounded
                                 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400
                                 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        V{index}
                      </button>
                    ))}
                  </div>

                  {/* Reroll & Download */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReroll(task)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded
                               bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                               hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <RefreshCw size={14} />
                      重绘
                    </button>
                    <button
                      onClick={() => handleDownload(task)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded
                               bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400
                               hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <Download size={14} />
                      下载
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedTask && selectedTask.imageUrl && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div className="max-w-6xl max-h-[90vh] relative">
            <img
              src={selectedTask.imageUrl}
              alt={selectedTask.prompt}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedTask);
              }}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 
                       backdrop-blur-sm rounded-lg transition-colors"
            >
              <Download size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MJGallery;
