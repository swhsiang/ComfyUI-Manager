const CHAT_WEBSOCKET_URL = 'ws://localhost:8000/ws/chat';

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
    this.session_id = null;
  }

  connect() {
    this.connection = new WebSocket(this.url);

    this.connection.onopen = () => {
      console.log(`[tutor-agent] WebSocket connection established to ${this.url}`);
    };

    this.connection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(`[tutor-agent] Received message from ${this.url}:`, message);
      if (message.type === 'init') {
        this.session_id = message.session_id;
        console.log(`[tutor-agent] Session ID received: ${this.session_id}`);
      }
      // Handle other types of messages
    };

    this.connection.onclose = () => {
      console.log(`[tutor-agent] WebSocket connection closed to ${this.url}`);
    };

    this.connection.onerror = (error) => {
      console.error(`[tutor-agent] WebSocket error on ${this.url}:`, error);
    };
  }

  sendMessage(message) {
    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
      if (this.session_id) {
        message.session_id = this.session_id;
      }
      console.log(`[tutor-agent] Sending message with session_id: ${this.session_id}`, message);
      this.connection.send(JSON.stringify(message));
    } else {
      console.error(`[tutor-agent] WebSocket is not open. Ready state:`, this.connection.readyState);
    }
  }
}

const chatWsClient = new WebSocketClient(CHAT_WEBSOCKET_URL);
chatWsClient.connect();

export { chatWsClient, WebSocketMessage  };
