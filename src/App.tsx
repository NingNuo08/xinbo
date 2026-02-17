import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeartRateMonitor } from './components/HeartRateMonitor';
import { StatsPanel } from './components/StatsPanel';
import { useBluetoothHeartRate } from './hooks/useBluetoothHeartRate';
import { HeartRateMeasurement } from './types';
import { Activity, BarChart3, Menu, X } from 'lucide-react';

type TabType = 'monitor' | 'stats';

function App() {
  const bluetooth = useBluetoothHeartRate();
  const [activeTab, setActiveTab] = useState<TabType>('monitor');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [heartRateData, setHeartRateData] = useState<HeartRateMeasurement[]>([]);

  useEffect(() => {
    const unsubHeartRate = bluetooth.subscribeHeartRate(setHeartRateData);
    return () => {
      unsubHeartRate();
    };
  }, []);

  const tabs = [
    { id: 'monitor' as const, label: '心跳监控', icon: Activity },
    { id: 'stats' as const, label: '数据统计', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>导航菜单</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <nav
            className={`
              ${sidebarOpen ? 'block' : 'hidden'}
              lg:block w-full lg:w-64 flex-shrink-0
            `}
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">关于系统</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                通过蓝牙连接您的智能手表，实时获取心率数据。支持心率历史记录查看和数据统计分析功能。
              </p>
            </div>
          </nav>

          <main className="flex-1 min-w-0">
            {activeTab === 'monitor' && (
              <HeartRateMonitor />
            )}

            {activeTab === 'stats' && (
              <StatsPanel heartRateData={heartRateData} />
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
