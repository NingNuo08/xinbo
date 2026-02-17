import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { HeartRateMeasurement } from '../types';
import { TrendingUp, Activity, Clock, Zap } from 'lucide-react';

interface StatsPanelProps {
  heartRateData: HeartRateMeasurement[];
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}> = ({ icon, label, value, color, bgColor }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  </div>
);

export const StatsPanel: React.FC<StatsPanelProps> = ({ heartRateData }) => {
  const totalReadings = heartRateData.length;
  
  const heartRates = heartRateData.map(d => d.heartRate);
  const avgHeartRate = heartRates.length > 0 
    ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) 
    : 0;
  const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : 0;
  const minHeartRate = heartRates.length > 0 ? Math.min(...heartRates) : 0;

  const lowCount = heartRates.filter(hr => hr < 60).length;
  const normalCount = heartRates.filter(hr => hr >= 60 && hr < 100).length;
  const highCount = heartRates.filter(hr => hr >= 100).length;

  const chartData = heartRateData.slice(0, 30).reverse().map((data) => ({
    time: new Date(data.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    heartRate: data.heartRate,
  }));

  const pieData = [
    { name: '偏低(<60)', value: lowCount, color: '#3b82f6' },
    { name: '正常(60-99)', value: normalCount, color: '#22c55e' },
    { name: '偏高(≥100)', value: highCount, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const rangeData = [
    { range: '<60', count: lowCount },
    { range: '60-79', count: heartRates.filter(hr => hr >= 60 && hr < 80).length },
    { range: '80-99', count: heartRates.filter(hr => hr >= 80 && hr < 100).length },
    { range: '100-119', count: heartRates.filter(hr => hr >= 100 && hr < 120).length },
    { range: '≥120', count: heartRates.filter(hr => hr >= 120).length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-5 h-5 text-green-400" />}
          label="总记录数"
          value={totalReadings}
          color="text-white"
          bgColor="bg-green-500/20"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-red-400" />}
          label="平均心率"
          value={`${avgHeartRate} BPM`}
          color="text-red-400"
          bgColor="bg-red-500/20"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-yellow-400" />}
          label="最高心率"
          value={`${maxHeartRate} BPM`}
          color="text-yellow-400"
          bgColor="bg-yellow-500/20"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          label="最低心率"
          value={`${minHeartRate} BPM`}
          color="text-blue-400"
          bgColor="bg-blue-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">心率趋势</h3>
          <div className="h-[200px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="心率 (BPM)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                暂无数据，请先连接设备
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">心率分布</h3>
          <div className="h-[200px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">暂无数据</p>
            )}
          </div>
          <div className="flex justify-center gap-4 text-sm mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">心率区间统计</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rangeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" name="记录数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
