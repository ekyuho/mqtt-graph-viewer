import { useEffect, useRef, useState } from 'react';
import * as mqttPkg from 'mqtt';

// Handle potential ESM/CJS default export mismatch with the browser bundle
const mqtt = (mqttPkg as any).default || mqttPkg;

interface UseMqttOptions {
    uri: string;
    topic: string;
}

export const useMqtt = ({ uri, topic }: UseMqttOptions) => {
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState<string>('Disconnected');
    const clientRef = useRef<MqttClient | null>(null);

    useEffect(() => {
        setStatus('Connecting');
        console.log(`Connecting to ${uri}...`);

        // Connect to the MQTT broker
        // Note: 'mqtt' package automatically handles ws/wss protocols if specified in URI
        const client = mqtt.connect(uri, {
            reconnectPeriod: 1000,
        });

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            setStatus('Connected');
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                    setStatus('Subscription Error');
                } else {
                    console.log(`Subscribed to ${topic}`);
                }
            });
        });

        client.on('message', (receivedTopic, message) => {
            if (receivedTopic === topic) {
                try {
                    const payload = JSON.parse(message.toString());
                    console.log('Received message:', payload);
                    setData(payload);
                } catch (e) {
                    console.error('Failed to parse message:', e);
                }
            }
        });

        client.on('error', (err) => {
            console.error('MQTT Error:', err);
            setStatus('Error');
        });

        client.on('offline', () => {
            console.log('MQTT Offline');
            setStatus('Offline');
        });

        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.end();
                console.log('Disconnected from MQTT broker');
            }
        };
    }, [uri, topic]);

    return { data, status };
};
