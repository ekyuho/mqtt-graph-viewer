import { useEffect, useState } from 'react';
import './App.css';
import './App.css';
import { useMqtt } from './hooks/useMqtt';
import { SensorChart } from './components/SensorChart';

// Configuration
const MQTT_BROKER_URL = 'ws://damoa.io:9002'; // Trying 8084 (WSS) first
const MQTT_TOPIC = 'ek/sensor/3';

// To support standard WS if WSS fails, we might need a toggle or fallback.
// But browsers usually block WS on HTTPS pages. Localhost allows it though.
// If 8084 fails, user might need to change to ws://damoa.io:8083/mqtt

function App() {
  const { data, status } = useMqtt({ uri: MQTT_BROKER_URL, topic: MQTT_TOPIC });
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [dataPoint, setDataPoint] = useState<{ timestamp: number; value: number } | null>(null);

  // Parse incoming data
  useEffect(() => {
    if (data) {
      // Expected format: { "3T0": value }
      // The user mentioned "10초단위로 받아" (receive every 10s).
      // The broker sends it, we just visualize it when it comes.
      const val = data['3T0'];
      if (typeof val === 'number') {
        setCurrentValue(val);
        setDataPoint({
          timestamp: Date.now(),
          value: val
        });
      }
    }
  }, [data]);

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Connected': return 'connected';
      case 'Connecting': return 'connecting';
      default: return 'disconnected';
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: '2.5rem' }}>Sensor Dashboard</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Real-time monitoring of {MQTT_TOPIC}</p>
        </div>

        <div className="status-indicator">
          <span className={`dot ${getStatusColor(status)}`}></span>
          <span>{status}</span>
        </div>
      </header>

      <main>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>3T0 Live Data</h2>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block' }}>Current Value</span>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                {currentValue !== null ? currentValue.toFixed(2) : '--'}
              </span>
            </div>
          </div>

          <SensorChart dataPoint={dataPoint} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Data updates automatically every ~10 seconds
            </p>
            <button
              onClick={() => {
                const simVal = 20 + Math.random() * 10;
                setCurrentValue(simVal);
                setDataPoint({ timestamp: Date.now(), value: simVal });
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--text-secondary)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Simulate Data
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Placeholder for future widgets */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Connection Details</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <p><strong>Broker:</strong> {MQTT_BROKER_URL}</p>
              <p><strong>Topic:</strong> {MQTT_TOPIC}</p>
              <p><strong>Last Update:</strong> {dataPoint ? new Date(dataPoint.timestamp).toLocaleTimeString() : 'Waiting...'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
