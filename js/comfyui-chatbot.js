import { api } from "../../scripts/api.js";
import { app } from "../../scripts/app.js";
import { $el, ComfyDialog } from "../../scripts/ui.js";
import { chatWsClient, WebSocketMessage } from './comfyui-chatbot-ws.js';

var docStyle = document.createElement('style');
docStyle.innerHTML = `
#chatbot-dialog {
  width: 10%;
  height: 60%;
  top: 37%;
  box-sizing: content-box;
  z-index: 100000;
  overflow-y: auto;
  left: 93%;
}

.chatbot-container {
  position: fixed;
  right: 0;
  top: 0;
  width: 100%; /* Adjusted to take full width */
  height: 100%; /* Adjusted to take full height */
  background-color: var(--comfy-menu-secondary-bg);

  display: flex;
  flex-direction: column;
  border-left: 1px solid #3a3a3a;
  z-index: 100; /* Ensure it is at the top of the z-axis */
}

.chat-window {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  color: #ffffff;
  overflow-wrap: break-word;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
}

.message.user {
  background-color: var(--input-text);
  text-align: right;
}

.message.bot {
  background-color: var(--comfy-menu-secondary-bg);
  text-align: left;
  color:rgb(12, 12, 12);
}

.input-box {
  display: flex;
  padding: 10px;
  border-top: 1px solid var(--input-text);
}

.input-box textarea {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  background-color: var(--input-text);
  color: #ffffff;
  min-width: 0; /* Ensure the input can shrink */
}

.input-box button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color:rgb(107, 166, 109);
  color: #ffffff;
  cursor: pointer;
  flex-shrink: 0; /* Prevent the button from shrinking */
  max-width: 30%; /* Ensure the button takes at most 30% of the space */
  font-size: calc(0.5em + 1vw); /* Make the text size responsive */
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Add ellipsis for overflow text */
}

.input-box button:hover {
  background-color: #45a049;
}

.side-tool-bar-container.large-sidebar {
  --sidebar-width: 3.5rem;
  --sidebar-icon-size: 1rem;
}
`;
document.head.appendChild(docStyle);

class ChatbotDialog extends ComfyDialog {
  constructor() {
    super();
    this.messages = [];
    this.input = '';
    this.init();
  }

  init() {
    const content = $el("div.chatbot-container", [
      $el("div.chat-window", {}, this.messages.map((msg, index) =>
        $el("div.message", { className: `message ${msg.type}` }, msg.text)
      )),
      $el("form.input-box", {
        onsubmit: (e) => this.handleSubmit(e)
      }, [
        $el("textarea", {
          value: this.input,
          oninput: (e) => {
            this.input = e.target.value;
            this.updateChatWindow();
          },
          placeholder: "Type your question...",
          rows: 3,
          style: {
            resize: "none",
            overflow: "hidden",
            minHeight: "20px",
            maxHeight: "100px"
          }
        }),
        $el("button", { type: "submit" }, "Submit")
      ])
    ]);

    const parentContainer = document.querySelector('.comfyui-body-right');
    // this.element = $el("div", { className: ["comfy-modal", "side-tool-bar-container", "large-sidebar"], id: 'chatbot-dialog', parent: parentContainer }, [ content ]);
    this.element = $el("div", { className: ["comfy-modal"], id: 'chatbot-dialog', parent: parentContainer }, [ content ]);

    if (chatWsClient.connection && chatWsClient.connection.readyState === WebSocket.OPEN) {
      chatWsClient.connection.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('[tutor-agent] Received message:', message);
        this.messages.push({ type: 'bot', text: message.payload.response });
        this.updateChatWindow();
      };
    } else {
      chatWsClient.connection.onopen = () => {
        chatWsClient.connection.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log('[tutor-agent] readyState:', chatWsClient.connection.readyState);
          console.log('[tutor-agent] Received message:', message);
          this.messages.push({ type: 'bot', text: message.payload.response });
          this.updateChatWindow();
        };
      };
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.input.trim()) {
      this.messages.push({ type: 'user', text: this.input });
      const message = new WebSocketMessage(
        'user_message',
        new Date().toISOString(),
        chatWsClient.session_id, // Use the session ID from the WebSocket client
        { text: this.input },
        'user'
      );
      console.log('Sending message:', message);
      console.log('WebSocket readyState:', chatWsClient.connection.readyState);
      chatWsClient.sendMessage(message);
      this.input = '';
      this.updateChatWindow();
      // Here you would send the message to the backend and handle the response
    }
  }

  updateChatWindow() {
    const chatWindow = this.element.querySelector('.chat-window');
    chatWindow.innerHTML = '';
    this.messages.forEach((msg, index) => {
      const messageElement = $el("div.message", { className: `message ${msg.type}` }, msg.text);
      chatWindow.appendChild(messageElement);
    });
  }

  show() {
    this.element.style.display = "block";
  }

  close() {
    this.element.style.display = "none";
  }
}

const chatbotDialog = new ChatbotDialog();
chatbotDialog.show();
