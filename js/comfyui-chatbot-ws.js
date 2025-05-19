const WEBSOCKET_URL = 'ws://localhost:8080';

class WebSocketMessage {
  constructor(type, timestamp, session_id, payload, sender) {
    this.type = type;
    this.timestamp = timestamp;
    this.session_id = session_id;
    this.payload = payload;
    this.sender = sender;
  }
}

class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.connection = null;
  }

  connect() {
    this.connection = new WebSocket(this.url);

    this.connection.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.connection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      // Handle the received message
    };

    this.connection.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.connection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message) {
    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
      this.connection.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open. Ready state:', this.connection.readyState);
    }
  }
}

const wsClient = new WebSocketClient(WEBSOCKET_URL);
wsClient.connect();

export default wsClient;
