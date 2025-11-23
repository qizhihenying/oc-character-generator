import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { appInitializer } from './utils/appInitializer'

// 初始化应用
appInitializer.initialize().then(() => {
  console.log('✅ App initialized successfully');
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}).catch((error) => {
  console.error('❌ Failed to initialize app:', error);
  // 即使初始化失败也渲染应用
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
