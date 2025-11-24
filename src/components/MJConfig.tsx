import React, { useState, useEffect } from 'react';
import { Settings, X, Check, AlertCircle } from 'lucide-react';
import { mjAPI, MJConfig } from '../utils/midjourneyAPI';
import { API_FORMATS, APIFormat } from '../utils/apiFormats';

interface MJConfigProps {
  onClose: () => void;
}

const MJConfigComponent: React.FC<MJConfigProps> = ({ onClose }) => {
  const [config, setConfig] = useState<MJConfig>({
    apiKey: '',
    baseUrl: 'https://api.vectorengine.ai',
    modelName: 'midjourney',
    notifyHook: '',
    apiFormat: 'midjourney',
    botType: 'MID_JOURNEY',
    requiresAuth: 'bearer',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const existingConfig = mjAPI.getConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, []);

  const handleTestConnection = async () => {
    if (!config.apiKey.trim()) {
      setTestResult({ success: false, message: '请先输入 API Key' });
      return;
    }
    if (!config.baseUrl.trim()) {
      setTestResult({ success: false, message: '请先输入 API Base URL' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    setError('');

    try {
      // 临时保存配置用于测试
      const tempConfig = { ...config };
      mjAPI.saveConfig(tempConfig);

      // 发送一个测试请求（使用简单的提示词）
      const response = await fetch(`${config.baseUrl}/mj/submit/imagine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          botType: 'MID_JOURNEY',
          prompt: 'test connection',
          base64Array: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 1) {
          setTestResult({ success: true, message: '连接成功！API 配置正确' });
        } else {
          setTestResult({ success: false, message: `API 返回错误: ${data.description || '未知错误'}` });
        }
      } else {
        setTestResult({ 
          success: false, 
          message: `连接失败: ${response.status} ${response.statusText}` 
        });
      }
    } catch (e) {
      setTestResult({ 
        success: false, 
        message: `网络错误: ${e instanceof Error ? e.message : '无法连接到服务器'}` 
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!config.apiKey.trim()) {
      setError('请输入 API Key');
      return;
    }
    if (!config.baseUrl.trim()) {
      setError('请输入 API Base URL');
      return;
    }

    try {
      mjAPI.saveConfig(config);
      setSaved(true);
      setError('');
      setTestResult(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      setError('保存配置失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="text-purple-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              API 配置
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="输入你的 API Key"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       transition-all"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              从你的 API 服务商获取
            </p>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Base URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.vectorengine.ai"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       transition-all"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              API 服务的基础地址
            </p>
          </div>

          {/* API Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API 格式 <span className="text-red-500">*</span>
            </label>
            <select
              value={config.apiFormat || 'midjourney'}
              onChange={(e) => setConfig({ ...config, apiFormat: e.target.value as APIFormat })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       transition-all"
            >
              {Object.values(API_FORMATS).map((format) => (
                <option key={format.id} value={format.id}>
                  {format.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {API_FORMATS[config.apiFormat || 'midjourney'].description}
            </p>
          </div>

          {/* Model Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              模型名称 (可选)
            </label>
            <input
              type="text"
              value={config.modelName || ''}
              onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
              placeholder="midjourney, niji, 或其他中转API支持的模型"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       transition-all"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              指定使用的模型名称，支持各种中转API提供商的模型配置
            </p>
          </div>

          {/* Notify Hook (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              回调地址 (可选)
            </label>
            <input
              type="text"
              value={config.notifyHook}
              onChange={(e) => setConfig({ ...config, notifyHook: e.target.value })}
              placeholder="https://your-domain.com/webhook"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       transition-all"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              任务完成时的回调地址，留空则不使用
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-2">使用说明：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>配置完成后，生成提示词时可选择自动绘图</li>
                  <li>绘图任务会在画板中显示进度和结果</li>
                  <li>支持 U1-U4（放大）、V1-V4（变体）、重绘等操作</li>
                  <li>API Key 仅保存在本地浏览器中，不会上传到服务器</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`rounded-lg p-4 border ${
              testResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <Check className="text-green-600 dark:text-green-400" size={20} />
                ) : (
                  <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                )}
                <p className={`text-sm ${
                  testResult.success
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Check className="text-green-600 dark:text-green-400" size={20} />
                <p className="text-sm text-green-800 dark:text-green-300">配置保存成功！</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                     transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-blue-500 dark:border-blue-400
                     text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20
                     transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500
                     text-white font-medium hover:shadow-lg transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? '已保存' : '保存配置'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MJConfigComponent;
