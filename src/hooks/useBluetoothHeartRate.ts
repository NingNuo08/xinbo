import { HeartRateMeasurement, BluetoothHeartRateDevice } from '../types';

const HEART_RATE_SERVICE_UUID = 'heart_rate';
const HEART_RATE_MEASUREMENT_UUID = 'heart_rate_measurement';

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
  removeEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void;
  startNotifications(): Promise<void>;
  stopNotifications(): Promise<void>;
  value: DataView | null;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTService>;
  disconnect(): void;
}

interface BluetoothDevice extends EventTarget {
  id: string;
  name: string;
  gatt: BluetoothRemoteGATTServer;
  addEventListener(type: 'gattserverdisconnected', listener: (event: Event) => void): void;
  removeEventListener(type: 'gattserverdisconnected', listener: (event: Event) => void): void;
}

interface Bluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface RequestDeviceOptions {
  filters: { services: string[] }[];
  optionalServices?: string[];
}

declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }
}

function parseHeartRateValue(dataView: DataView): HeartRateMeasurement {
  const flags = dataView.getUint8(0);
  const is16Bit = flags & 0x01;
  const contactDetected = !!(flags & 0x02);
  const hasEnergyExpended = !!(flags & 0x08);
  const hasRRIntervals = !!(flags & 0x10);

  let heartRate: number;
  let index = 1;

  if (is16Bit) {
    heartRate = dataView.getUint16(index, true);
    index += 2;
  } else {
    heartRate = dataView.getUint8(index);
    index += 1;
  }

  let energyExpended: number | null = null;
  if (hasEnergyExpended) {
    energyExpended = dataView.getUint16(index, true);
    index += 2;
  }

  const rrIntervals: number[] = [];
  if (hasRRIntervals) {
    while (index + 1 < dataView.byteLength) {
      const rrValue = dataView.getUint16(index, true);
      rrIntervals.push(rrValue / 1024);
      index += 2;
    }
  }

  return {
    timestamp: new Date(),
    heartRate,
    contactDetected,
    energyExpended,
    rrIntervals,
  };
}

let globalBluetoothDevice: BluetoothDevice | null = null;
let globalCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let globalDeviceState: BluetoothHeartRateDevice | null = null;
let globalHeartRateData: HeartRateMeasurement[] = [];
let globalError: string | null = null;
let globalIsConnecting: boolean = false;
let heartRateListeners: Set<(data: HeartRateMeasurement[]) => void> = new Set();
let deviceListeners: Set<(device: BluetoothHeartRateDevice | null) => void> = new Set();
let errorListeners: Set<(error: string | null) => void> = new Set();
let connectingListeners: Set<(connecting: boolean) => void> = new Set();
let globalListener: ((event: Event) => void) | null = null;
let globalDisconnectListener: ((event: Event) => void) | null = null;

function notifyHeartRateListeners() {
  heartRateListeners.forEach(l => l([...globalHeartRateData]));
}

function notifyDeviceListeners() {
  deviceListeners.forEach(l => l(globalDeviceState ? { ...globalDeviceState } : null));
}

function notifyErrorListeners() {
  errorListeners.forEach(l => l(globalError));
}

function notifyConnectingListeners() {
  connectingListeners.forEach(l => l(globalIsConnecting));
}

function handleHeartRateNotification(event: Event) {
  const target = event.target as BluetoothRemoteGATTCharacteristic;
  if (target.value) {
    const measurement = parseHeartRateValue(target.value);
    globalHeartRateData = [measurement, ...globalHeartRateData].slice(0, 100);
    notifyHeartRateListeners();
  }
}

function handleDisconnection() {
  globalDeviceState = globalDeviceState ? { ...globalDeviceState, connected: false } : null;
  globalError = '设备已断开连接';
  notifyDeviceListeners();
  notifyErrorListeners();
}

export function useBluetoothHeartRate() {
  const isSupported = 'bluetooth' in navigator;

  const connect = async () => {
    if (!isSupported) {
      globalError = '此浏览器不支持蓝牙功能，请使用Chrome、Edge等支持Web Bluetooth的浏览器';
      notifyErrorListeners();
      return;
    }

    globalIsConnecting = true;
    globalError = null;
    notifyConnectingListeners();
    notifyErrorListeners();

    try {
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE_UUID] }],
        optionalServices: ['battery_service', 'device_information'],
      });

      globalBluetoothDevice = bluetoothDevice;
      globalDeviceState = {
        id: bluetoothDevice.id,
        name: bluetoothDevice.name || '未知设备',
        connected: false,
      };
      notifyDeviceListeners();

      globalDisconnectListener = handleDisconnection;
      bluetoothDevice.addEventListener('gattserverdisconnected', globalDisconnectListener);

      const server = await bluetoothDevice.gatt.connect();
      
      if (!server.connected) {
        throw new Error('无法连接到GATT服务器');
      }

      const service = await server.getPrimaryService(HEART_RATE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT_UUID);
      
      globalCharacteristic = characteristic;
      globalListener = handleHeartRateNotification;
      
      characteristic.addEventListener('characteristicvaluechanged', globalListener);
      await characteristic.startNotifications();

      globalDeviceState = {
        id: bluetoothDevice.id,
        name: bluetoothDevice.name || '未知设备',
        connected: true,
      };
      notifyDeviceListeners();

    } catch (err: any) {
      console.error('蓝牙连接错误:', err);
      if (err.name === 'NotFoundError') {
        globalError = '未找到心率设备，请确保设备已开启心率广播';
      } else if (err.name === 'SecurityError') {
        globalError = '需要HTTPS或localhost才能使用蓝牙功能';
      } else if (err.name === 'NetworkError') {
        globalError = '设备连接失败，请重试';
      } else {
        globalError = err.message || '连接失败';
      }
      globalDeviceState = null;
      notifyDeviceListeners();
      notifyErrorListeners();
    } finally {
      globalIsConnecting = false;
      notifyConnectingListeners();
    }
  };

  const disconnect = () => {
    if (globalListener && globalCharacteristic) {
      globalCharacteristic.removeEventListener('characteristicvaluechanged', globalListener);
      globalCharacteristic.stopNotifications().catch(() => {});
    }
    
    if (globalBluetoothDevice?.gatt?.connected) {
      globalBluetoothDevice.gatt.disconnect();
    }

    globalDeviceState = globalDeviceState ? { ...globalDeviceState, connected: false } : null;
    globalHeartRateData = [];
    notifyDeviceListeners();
    notifyHeartRateListeners();
  };

  const clearData = () => {
    globalHeartRateData = [];
    notifyHeartRateListeners();
  };

  return {
    get device() { return globalDeviceState ? { ...globalDeviceState } : null; },
    get heartRateData() { return [...globalHeartRateData]; },
    get isConnecting() { return globalIsConnecting; },
    get error() { return globalError; },
    isSupported,
    connect,
    disconnect,
    clearData,
    get currentHeartRate() { return globalHeartRateData[0]?.heartRate ?? null; },
    subscribeHeartRate: (callback: (data: HeartRateMeasurement[]) => void) => {
      heartRateListeners.add(callback);
      callback([...globalHeartRateData]);
      return () => heartRateListeners.delete(callback);
    },
    subscribeDevice: (callback: (device: BluetoothHeartRateDevice | null) => void) => {
      deviceListeners.add(callback);
      callback(globalDeviceState ? { ...globalDeviceState } : null);
      return () => deviceListeners.delete(callback);
    },
    subscribeError: (callback: (error: string | null) => void) => {
      errorListeners.add(callback);
      callback(globalError);
      return () => errorListeners.delete(callback);
    },
    subscribeConnecting: (callback: (connecting: boolean) => void) => {
      connectingListeners.add(callback);
      callback(globalIsConnecting);
      return () => connectingListeners.delete(callback);
    },
  };
}
