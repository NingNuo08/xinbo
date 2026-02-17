import { useEffect, useState, useCallback } from 'react';
import { useBluetoothHeartRate } from '../hooks/useBluetoothHeartRate';
import { HeartRateMeasurement, BluetoothHeartRateDevice } from '../types';
import { format } from 'date-fns';

export function HeartRateMonitor() {
  const bluetooth = useBluetoothHeartRate();
  const [device, setDevice] = useState<BluetoothHeartRateDevice | null>(null);
  const [heartRateData, setHeartRateData] = useState<HeartRateMeasurement[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubHeartRate = bluetooth.subscribeHeartRate(setHeartRateData);
    const unsubDevice = bluetooth.subscribeDevice(setDevice);
    const unsubError = bluetooth.subscribeError(setError);
    const unsubConnecting = bluetooth.subscribeConnecting(setIsConnecting);

    return () => {
      unsubHeartRate();
      unsubDevice();
      unsubError();
      unsubConnecting();
    };
  }, []);

  const currentHeartRate = heartRateData[0]?.heartRate ?? null;

  const getHeartRateColor = useCallback((hr: number) => {
    if (hr < 60) return 'text-blue-500';
    if (hr < 100) return 'text-green-500';
    if (hr < 140) return 'text-yellow-500';
    return 'text-red-500';
  }, []);

  const getStatusColor = useCallback(() => {
    if (!device) return 'bg-gray-500';
    if (device.connected) return 'bg-green-500';
    return 'bg-red-500';
  }, [device]);

  if (!bluetooth.isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">浏览器不支持</span>
        </div>
        <p className="mt-2 text-sm text-red-600">
          请使用Chrome、Edge或Opera浏览器，并确保使用HTTPS或localhost访问
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">心跳监控</h2>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></span>
            <span className="text-sm text-gray-600">
              {device ? (device.connected ? '已连接' : '已断开') : '未连接'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-6">
          {!device?.connected ? (
            <button
              onClick={bluetooth.connect}
              disabled={isConnecting}
              className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  连接中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  连接心率设备
                </>
              )}
            </button>
          ) : (
            <button
              onClick={bluetooth.disconnect}
              className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              断开连接
            </button>
          )}
          {heartRateData.length > 0 && (
            <button
              onClick={bluetooth.clearData}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              清除数据
            </button>
          )}
        </div>

        {device && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <span className="font-medium">设备名称:</span> {device.name}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ID: {device.id.slice(0, 8)}...
            </div>
          </div>
        )}

        {currentHeartRate !== null && (
          <div className="mb-6 text-center">
            <div className={`text-7xl font-bold ${getHeartRateColor(currentHeartRate)}`}>
              {currentHeartRate}
            </div>
            <div className="text-gray-500 mt-2">BPM</div>
          </div>
        )}
      </div>

      {heartRateData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">历史记录</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {heartRateData.slice(0, 20).map((data, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
              >
                <span className={`font-medium ${getHeartRateColor(data.heartRate)}`}>
                  {data.heartRate} BPM
                </span>
                <span className="text-gray-400 text-xs">
                  {format(data.timestamp, 'HH:mm:ss')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">使用说明</h4>
        <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
          <li>确保手表已开启心率广播功能</li>
          <li>点击"连接心率设备"按钮</li>
          <li>在弹出的设备列表中选择您的手表</li>
          <li>连接成功后即可实时查看心率数据</li>
        </ol>
      </div>
    </div>
  );
}
