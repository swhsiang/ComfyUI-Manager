import { api } from "../../scripts/api.js";
import { app } from "../../scripts/app.js";
import { $el, ComfyDialog } from "../../scripts/ui.js";

var docStyle = document.createElement('style');
docStyle.innerHTML = `
#chatbot-dialog {
  width: 300px;
  height: 600px;
  box-sizing: content-box;
  z-index: 1000;
  overflow-y: auto;
  // position: fixed;
  : 0;
  // top: 0;
}

.message.user {
  background-color: #4a4a4a;
  color: #ffffff;
  text-align: right;
  margin-left: auto;
  margin-right: 10px;
  padding: 10px;
  border-radius: 10px;
  max-width: 80%;
}

.message.bot {
  background-color: #383838;
  color: #ffffff;
  text-align: left;
  margin-left: 10px;
  margin-right: auto;
  padding: 10px;
  border-radius: 10px;
  max-width: 80%;
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
        $el("input", {
          type: "text",
          value: this.input,
          oninput: (e) => this.input = e.target.value,
          placeholder: "Type your question..."
        }),
        $el("button", { type: "submit" }, "Submit")
      ])
    ]);

    this.element = $el("div.comfy-modal", { id: 'chatbot-dialog', parent: document.body }, [ content ]);
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.input.trim()) {
      this.messages.push({ type: 'user', text: this.input });
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

var chatbotStyle = document.createElement('style');
chatbotStyle.innerHTML = `
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
  z-index: 10000; /* Ensure it is at the top of the z-axis */
}

.chat-window {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  color: #ffffff;
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
  background-color: #383838;
  text-align: left;
}

.input-box {
  display: flex;
  padding: 10px;
  border-top: 1px solid #3a3a3a;
}

.input-box input {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  background-color: #4a4a4a;
  color: #ffffff;
}

.input-box button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: #ffffff;
  cursor: pointer;
}

.input-box button:hover {
  background-color: #45a049;
}
`;
document.head.appendChild(chatbotStyle);
