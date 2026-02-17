import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const sources = [
  { id: 'server-a', name: 'Server-A', type: 'server', baseLatency: 50 },
  { id: 'server-b', name: 'Server-B', type: 'server', baseLatency: 80 },
  { id: 'server-c', name: 'Server-C', type: 'server', baseLatency: 60 },
  { id: 'database', name: 'Database', type: 'database', baseLatency: 30 },
  { id: 'cache', name: 'Cache-Redis', type: 'cache', baseLatency: 10 },
  { id: 'api-gateway', name: 'API-Gateway', type: 'gateway', baseLatency: 40 },
];

const clients = new Set();

function generateHeartbeat(source) {
  const latencyVariation = Math.floor(Math.random() * 100) - 20;
  const latency = Math.max(5, source.baseLatency + latencyVariation);
  
  let status = 'online';
  if (latency > 150) status = 'warning';
  if (Math.random() < 0.03) status = 'offline';
  
  return {
    type: 'heartbeat',
    data: {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      source: source.id,
      sourceName: source.name,
      sourceType: source.type,
      status,
      latency: status === 'offline' ? null : latency,
      message: status === 'offline' 
        ? 'Connection timeout' 
        : status === 'warning' 
          ? 'High latency detected' 
          : null,
    }
  };
}

function generateBroadcastMessage() {
  const messages = [
    { type: 'info', content: '系统健康检查完成', sender: 'Health Monitor' },
    { type: 'success', content: '新服务节点已注册', sender: 'Service Registry' },
    { type: 'warning', content: '检测到内存使用率偏高', sender: 'Resource Monitor' },
    { type: 'info', content: '数据库备份任务启动', sender: 'Backup Service' },
    { type: 'success', content: '缓存预热完成', sender: 'Cache Manager' },
    { type: 'warning', content: 'API响应时间增加', sender: 'Performance Monitor' },
    { type: 'error', content: '服务节点连接异常', sender: 'Alert System' },
    { type: 'info', content: '负载均衡策略已更新', sender: 'Load Balancer' },
  ];
  
  const msg = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    type: 'broadcast',
    data: {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...msg,
    }
  };
}

function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[${new Date().toISOString()}] Client connected: ${clientIp}`);
  clients.add(ws);
  
  ws.send(JSON.stringify({
    type: 'connected',
    data: {
      message: 'Connected to heartbeat server',
      sources: sources.map(s => ({ id: s.id, name: s.name, type: s.type })),
    }
  }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received:', message);
      
      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
      
      if (message.type === 'broadcast') {
        broadcast({
          type: 'broadcast',
          data: {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            content: message.content,
            type: message.messageType || 'info',
            sender: message.sender || 'Admin',
          }
        });
      }
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[${new Date().toISOString()}] Client disconnected`);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    clients.delete(ws);
  });
});

setInterval(() => {
  const source = sources[Math.floor(Math.random() * sources.length)];
  const heartbeat = generateHeartbeat(source);
  broadcast(heartbeat);
}, 2000);

setInterval(() => {
  if (Math.random() < 0.3) {
    const broadcastMsg = generateBroadcastMessage();
    broadcast(broadcastMsg);
  }
}, 5000);

console.log(`WebSocket server running on ws://localhost:${PORT}`);
console.log('Press Ctrl+C to stop');
