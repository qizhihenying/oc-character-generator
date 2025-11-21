import React, { useState, useEffect } from 'react';
import { Download, X, AlertCircle, Sparkles } from 'lucide-react';
import { updateChecker, VersionInfo } from '../utils/updateChecker';

const UpdateNotification: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // 启动时检查更新
    checkForUpdates();
    
    // 每小时检查一次
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    setChecking(true);
    const update = await updateChecker.checkForUpdates();
    setChecking(false);
    
    if (update) {
      setUpdateInfo(update);
      setShowNotification(true);
    }
  };

  const handleDownload = () => {
    if (updateInfo) {
      updateChecker.downloadUpdate(updateInfo.downloadUrl);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification || !updateInfo) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
      <div className="glass-card rounded-2xl p-5 shadow-2xl border-2 border-purple-300">
        {/* 关闭按钮 */}
        {!updateInfo.forceUpdate && (
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {/* 标题 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              发现新版本！
            </h3>
            <p className="text-sm text-gray-600">
              v{updateInfo.version}
            </p>
          </div>
        </div>

        {/* 更新内容 */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2 font-medium">更新内容：</p>
          <ul className="space-y-1">
            {updateInfo.changelog.map((item, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 强制更新提示 */}
        {updateInfo.forceUpdate && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-800">
              此版本包含重要更新，建议立即升级
            </p>
          </div>
        )}

        {/* 发布日期 */}
        <p className="text-xs text-gray-500 mb-4">
          发布时间：{updateInfo.releaseDate}
        </p>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
          >
            <Download size={18} />
            立即下载
          </button>
          
          {!updateInfo.forceUpdate && (
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              稍后提醒
            </button>
          )}
        </div>

        {/* 当前版本 */}
        <p className="text-xs text-gray-400 text-center mt-3">
          当前版本：v{updateChecker.getCurrentVersion()}
        </p>
      </div>
    </div>
  );
};

export default UpdateNotification;
