import { api } from "../../scripts/api.js";
import { app } from "../../scripts/app.js";
import { $el, ComfyDialog } from "../../scripts/ui.js";
import { WebSocketClient as wsClient, WebSocketMessage } from './comfyui-chatbot-ws.js';

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
  background-color: #2a2a2a;
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
  background-color: #4a4a4a;
  text-align: right;
}

.message.bot {
  background-color:rgb(220, 138, 138);
  text-align: left;
}

.input-box {
  display: flex;
  padding: 10px;
  border-top: 1px solid #3a3a3a;
}

.input-box textarea {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  background-color: #4a4a4a;
  color: #ffffff;
  min-width: 0; /* Ensure the input can shrink */
}

.input-box button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
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
        $el("div.message", { className: msg.type }, msg.text)
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

    wsClient.connection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messages.push({ type: 'bot', text: message.payload.text });
      this.updateChatWindow();
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.input.trim()) {
      this.messages.push({ type: 'user', text: this.input });
      const message = new WebSocketMessage(
        'user_message',
        new Date().toISOString(),
        'session_id', // Replace with actual session ID
        { text: this.input },
        'user'
      );
      wsClient.sendMessage(message);
      this.input = '';
      this.updateChatWindow();
      // Here you would send the message to the backend and handle the response
    }
  }

  updateChatWindow() {
    const chatWindow = this.element.querySelector('.chat-window');
    chatWindow.innerHTML = '';
    this.messages.forEach((msg, index) => {
      const messageElement = $el("div.message", { className: msg.type }, msg.text);
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
