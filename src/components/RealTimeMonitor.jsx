import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './RealTimeMonitor.css';

const RealTimeMonitor = () => {
    const [events, setEvents] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        attacks: 0,
        metrics: 0,
        logs: 0
    });
    const socketRef = useRef(null);
    const eventsEndRef = useRef(null);

    useEffect(() => {
        // Connect to WebSocket server
        // UPDATE THIS URL when deploying to cloud
        const SOCKET_URL = 'http://localhost:3001';

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        // Connection events
        socketRef.current.on('connect', () => {
            console.log('✅ Connected to real-time server');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('❌ Disconnected from server');
            setIsConnected(false);
        });

        socketRef.current.on('connected', (data) => {
            console.log('Server message:', data.message);
        });

        // Listen for ANY live data (attacks, metrics, logs, status, etc.)
        socketRef.current.on('live-data', (data) => {
            console.log('📊 New live data:', data);

            setEvents(prev => {
                const newEvents = [data, ...prev].slice(0, 100); // Keep last 100 events
                return newEvents;
            });

            // Update stats based on data type
            setStats(prev => ({
                total: prev.total + 1,
                attacks: prev.attacks + (data.type === 'attack' ? 1 : 0),
                metrics: prev.metrics + (data.type === 'metric' ? 1 : 0),
                logs: prev.logs + (data.type === 'log' || data.type === 'status' ? 1 : 0)
            }));
        });

        // Backward compatibility: also listen for attack-update
        socketRef.current.on('attack-update', (data) => {
            const attackEvent = { ...data, type: 'attack' };
            console.log('📊 New attack data:', attackEvent);

            setEvents(prev => {
                const newEvents = [attackEvent, ...prev].slice(0, 100);
                return newEvents;
            });

            setStats(prev => ({
                total: prev.total + 1,
                attacks: prev.attacks + 1,
                metrics: prev.metrics,
                logs: prev.logs
            }));
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Auto-scroll to latest event
    useEffect(() => {
        eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [events]);

    const getTypeClass = (type) => {
        const typeMap = {
            attack: 'type-attack',
            metric: 'type-metric',
            log: 'type-log',
            status: 'type-status',
            alert: 'type-alert'
        };
        return typeMap[type?.toLowerCase()] || 'type-default';
    };

    const getSeverityClass = (severity) => {
        const severityMap = {
            critical: 'severity-critical',
            high: 'severity-high',
            medium: 'severity-medium',
            low: 'severity-low',
            info: 'severity-info'
        };
        return severityMap[severity?.toLowerCase()] || 'severity-medium';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const renderEventContent = (event) => {
        // Render different content based on event type
        switch (event.type) {
            case 'attack':
                return (
                    <>
                        {event.attack_type && (
                            <div className="detail-row">
                                <span className="detail-label">Attack Type:</span>
                                <span className="detail-value">{event.attack_type}</span>
                            </div>
                        )}
                        {event.source_ip && (
                            <div className="detail-row">
                                <span className="detail-label">Source:</span>
                                <span className="detail-value">{event.source_ip}</span>
                            </div>
                        )}
                        {event.target && (
                            <div className="detail-row">
                                <span className="detail-label">Target:</span>
                                <span className="detail-value">{event.target}</span>
                            </div>
                        )}
                        {event.status && (
                            <div className="detail-row">
                                <span className="detail-label">Status:</span>
                                <span className={`status-badge status-${event.status}`}>
                                    {event.status}
                                </span>
                            </div>
                        )}
                    </>
                );

            case 'metric':
                return (
                    <>
                        {event.metric_name && (
                            <div className="detail-row">
                                <span className="detail-label">Metric:</span>
                                <span className="detail-value">{event.metric_name}</span>
                            </div>
                        )}
                        {event.value !== undefined && (
                            <div className="detail-row">
                                <span className="detail-label">Value:</span>
                                <span className="detail-value">{event.value}{event.unit ? ` ${event.unit}` : ''}</span>
                            </div>
                        )}
                    </>
                );

            case 'log':
            case 'status':
            default:
                // Display all fields except standard ones
                return (
                    <>
                        {event.message && (
                            <div className="detail-row">
                                <span className="detail-label">Message:</span>
                                <span className="detail-value">{event.message}</span>
                            </div>
                        )}
                        {Object.keys(event).filter(key =>
                            !['timestamp', 'type', 'severity', 'message', 'details'].includes(key)
                        ).map(key => (
                            <div key={key} className="detail-row">
                                <span className="detail-label">{key}:</span>
                                <span className="detail-value">{String(event[key])}</span>
                            </div>
                        ))}
                    </>
                );
        }
    };

    return (
        <section className="realtime-monitor section-padding">
            <div className="container">
                <div className="section-header">
                    <span className="section-tag">LIVE MONITORING</span>
                    <h2>
                        Real-Time <span className="gradient-text">System Feed</span>
                    </h2>
                    <p className="section-subtitle">
                        Live data stream from our AI-powered defense system
                    </p>
                </div>

                {/* Connection Status */}
                <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                    <div className="status-indicator"></div>
                    <span>{isConnected ? 'Connected to Live Feed' : 'Connecting...'}</span>
                </div>

                {/* Stats Dashboard */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Events</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.attacks}</div>
                        <div className="stat-label">Attacks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.metrics}</div>
                        <div className="stat-label">Metrics</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.logs}</div>
                        <div className="stat-label">Logs</div>
                    </div>
                </div>

                {/* Live Event Feed */}
                <div className="attack-feed-container">
                    <div className="feed-header">
                        <h3>Live Event Feed</h3>
                        <span className="attack-count">{events.length} recent events</span>
                    </div>

                    <div className="attack-feed">
                        {events.length === 0 ? (
                            <div className="no-attacks">
                                <div className="pulse-icon">📡</div>
                                <p>Waiting for live data...</p>
                                <small>System is monitoring for events</small>
                            </div>
                        ) : (
                            events.map((event, index) => (
                                <div key={index} className={`attack-item ${getTypeClass(event.type)}`}>
                                    <div className="attack-header">
                                        <div className="event-type-container">
                                            <span className={`event-type ${getTypeClass(event.type)}`}>
                                                {event.type || 'event'}
                                            </span>
                                            {event.severity && (
                                                <span className={`severity-badge ${getSeverityClass(event.severity)}`}>
                                                    {event.severity}
                                                </span>
                                            )}
                                        </div>
                                        <span className="attack-time">{formatTime(event.timestamp)}</span>
                                    </div>

                                    <div className="attack-details">
                                        {renderEventContent(event)}
                                    </div>

                                    {event.details && (
                                        <div className="attack-message">{event.details}</div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={eventsEndRef} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RealTimeMonitor;
