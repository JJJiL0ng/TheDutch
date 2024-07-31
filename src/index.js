import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 성능 메트릭을 콘솔에 기록하는 함수
const logPerformance = (metric) => {
  console.log(metric.name, metric.value);
  // 여기에 성능 메트릭을 분석 서비스로 보내는 로직을 추가할 수 있습니다.
};

// 루트 요소 가져오기
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // 웹 바이탈 측정 및 보고
  reportWebVitals(logPerformance);
} else {
  console.error('루트 요소를 찾을 수 없습니다. index.html 파일을 확인해주세요.');
}