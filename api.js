const WebSocket = require('ws');
const EventEmitter = require('events');
const Config = require('./config');


const EventTypes = {
    "Player Spawned": 1,
    "Player Leave": 2,
    "Player Message": 3,
    "Player Gamemode Change": 4,
    "Player Place": 5,
    "Weather": 6,
    "Death": 7,
    "Explosion": 8,
    "Gamerule Change": 9,
    "Item Use": 10,
    "Item Use On": 11,
    "Player Interact Block": 12,
    "Player Interact Entity": 13,
    "Backup": 14,
    "Started": 15,
    "Stopped": 16,
    "Errored": 17
}

/**
 * API class for handling WebSocket connections and events.
 */
class API extends EventEmitter {
    constructor() {
        super();
        this.clients = new Set();
        this.subscriptions = new Map();
        this.setupWebSocket();
    }

    /**
     * Sets up the WebSocket based on the configuration.
     */
    setupWebSocket() {
        if (Config.websocketMode === 'listen') {
            this.startListening();
        } else if (Config.websocketMode === 'connect') {
            this.connectToWebSocket();
        }
    }

    /**
     * Starts the WebSocket server and listens for connections.
     */
    startListening() {
        const wss = new WebSocket.Server({ port: Config.websocketPort });
        console.log(`WebSocket server listening on port ${Config.websocketPort}`);

        wss.on('connection', (ws, req) => {
            const ip = req.socket.remoteAddress;
            if (Config.allowConnections === true || Config.allowConnections.includes(ip)) {
                this.clients.add(ws);
                ws.on('message', (message) => this.handleMessage(ws, message));
                ws.on('close', () => this.clients.delete(ws));
            } else {
                ws.close();
            }
        });
    }

    /**
     * Connects to the specified WebSocket server.
     */
    connectToWebSocket() {
        const ws = new WebSocket(`ws://${Config.websocketHost}:${Config.websocketPort}`);
        console.log(`Connecting to WebSocket server at ws://${Config.websocketHost}:${Config.websocketPort}`);

        ws.on('open', () => {
            this.clients.add(ws);
        });

        ws.on('message', (message) => this.handleMessage(ws, message));

        ws.on('close', () => {
            this.clients.delete(ws);
            setTimeout(() => this.connectToWebSocket(), Config.websocketReconnectDelay || 5000);
        });
    }

    /**
     * Handles incoming WebSocket messages.
     * @param {WebSocket} ws - The WebSocket connection.
     * @param {string} message - The message received.
     */
    handleMessage(ws, message) {
        let data;
        try {
            data = JSON.parse(message);
        } catch (err) {
            console.error('Invalid JSON:', message);
            return;
        }

        switch (data.type) {
            case (1): {//Command
                this.emit('command', data.body);
                break;
            }
            case (2): {//Subscribe
                this.handleSubscription(ws, data.body);
                break;
            }
            case (3): {//Unsubscribe
                this.handleSubscription(ws, data.body);
                break;
            }
            default: {
                console.error("Invalid Packet - Invalid or Missing type.")
            }
        }
    }

    /**
     * Handles subscription to events.
     * @param {WebSocket} ws - The WebSocket connection.
     * @param {Array<string>} events - The list of events to subscribe to.
     */
    handleSubscription(ws, events) {
        for (const event of events) {
            if (!this.subscriptions.has(event)) {
                this.subscriptions.set(event, new Set());
            }
            this.subscriptions.get(event).add(ws);
        }
    }

    /**
     * Handles unsubscription from events.
     * @param {WebSocket} ws - The WebSocket connection.
     * @param {Array<string>} events - The list of events to unsubscribe from.
     */
    handleUnsubscription(ws, events) {
        for (const event of events) {
            if (!this.subscriptions.has(event)) {
                this.subscriptions.set(event, new Set());
            }
            this.subscriptions.get(event).remove(ws);
        }
    }

    /**
     * Emits an event to subscribed clients.
     * @param {string} eventName - The name of the event.
     * @param {Object} data - The data to send with the event.
     */
    event(eventName, data) {
        const eventSubscribers = this.subscriptions.get(eventName) || [];
        for (const ws of eventSubscribers) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 2, body: { event: eventName, type: EventTypes[eventName], data } }));
            }
        }
    }
}

module.exports = new API();