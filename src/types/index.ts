export interface HeartbeatData {
  id: string;
  timestamp: Date;
  status: 'online' | 'offline' | 'warning';
  latency: number;
  source: string;
  message?: string;
}

export interface BroadcastMessage {
  id: string;
  timestamp: Date;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  sender: string;
}

export interface HeartbeatStats {
  totalBeats: number;
  onlineCount: number;
  offlineCount: number;
  warningCount: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
}

export interface ChartDataPoint {
  time: string;
  latency: number;
  count: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface BluetoothHeartRateDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface HeartRateMeasurement {
  timestamp: Date;
  heartRate: number;
  contactDetected: boolean;
  energyExpended: number | null;
  rrIntervals: number[];
}
