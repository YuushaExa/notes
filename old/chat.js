!async function() {
  let chatContainer = document.createElement("div");
  chatContainer.classList.add("chat-container");

  let messagesContainer = document.createElement("div");
  messagesContainer.classList.add("messages-container");
  chatContainer.appendChild(messagesContainer);

  let inputTextArea = document.createElement("textarea");
  inputTextArea.classList.add("input-textarea");
  inputTextArea.placeholder = "Enter your prompt here...";
  chatContainer.appendChild(inputTextArea);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");
  chatContainer.appendChild(buttonsContainer);

  const runButton = document.createElement("button");
  runButton.classList.add("run-button");
  runButton.innerText = "Run";
  buttonsContainer.appendChild(runButton);

  const clearButton = document.createElement("button");
  clearButton.classList.add("clear-button");
  clearButton.innerText = "Clear";
  buttonsContainer.appendChild(clearButton);

  const closeButton = document.createElement("button");
  closeButton.classList.add("close-button");
  closeButton.innerText = "Close";
  buttonsContainer.appendChild(closeButton);

  const inputListContainer = document.createElement("div");
  inputListContainer.classList.add("input-list-container");
  buttonsContainer.insertBefore(inputListContainer, clearButton);

  const inputListSelect = document.createElement("select");
  inputListSelect.classList.add("input-list");
  const promptOptions = [
    { value: "", text: "Select a Prompt" },
    { value: "Fix Grammar - ", text: "Fix Grammar" },
    { value: "What is ", text: "What is" },
    { value: "Top 10 anime", text: "Top 10 anime" },
    { value: "Explain like I'm 5: ", text: "Explain like I'm 5" },
    { value: "Summarize this: ", text: "Summarize this" },
    { value: "Continue ", text: "Continue" }
  ];

  for (const option of promptOptions) {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
    inputListSelect.appendChild(optionElement);
  }

  inputListSelect.addEventListener("change", () => {
    inputTextArea.value = inputListSelect.value;
  });
  inputListContainer.appendChild(inputListSelect);

  // Style element
  const styleElement = document.createElement("style");
  styleElement.textContent = `
  .chat-container {
    position: fixed;
    top: 10px;
    right: 10px;
    width: 410px;
    height: 425px;
    background-color: #eaeff8;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 10001;
    padding: 10px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.3;
    display: none;
    color: #333;
    font-size:15px;
  }

  .messages-container {
    height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
  }

  .input-textarea {
   width: calc(100% - 20px);
  height: 50px;
  padding: 10px;
  border: 1px solid #d4dbe9;
  border-radius: 7px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  background-color: #fff;
  }

  .buttons-container {
    display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3px 0;
  }

  .run-button, .close-button, .clear-button {
    border: none;
    padding: 8px 16px; /* Adjusted padding */
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 14px; /* Unified font size */
  }

  .run-button {
    background-color: #007bff;
    color: #fff;
  }

  .run-button:hover, .run-button:disabled {
    background-color: #0056b3;
  }

  .close-button {
    background-color: #dc3545;
    color: #fff;
  }

  .close-button:hover {
    background-color: #c82333;
  }

  .clear-button {
    background-color: #6c757d;
    color: #fff;
  }

  .clear-button:hover {
    background-color: #5a6268;
  }

   .chat-container h1, .chat-container h2, .chat-container h3, .chat-container ul, .chat-container ol, .chat-container li, .chat-container strong, .chat-container em, .chat-container a, .chat-container pre, .chat-container code {
    margin-bottom: 10px;
  }

  .chat-container h1 {
    font-size: 24px;
    font-weight: bold;
  }

  .chat-container h2 {
    font-size: 20px;
    font-weight: bold;
  }

  .chat-container h3 {
    font-size: 18px;
    font-weight: bold;
  }

  .chat-container ul, .chat-container ol {
    padding-left: 20px;
  }

  .chat-container li {
    margin-bottom: 5px;
  }

  .chat-container strong {
    font-weight: bold;
  }

  .chat-container em {
    font-style: italic;
  }

  .chat-container a {
    color: #007bff;
    text-decoration: none;
  }

  .chat-container a:hover {
    text-decoration: underline;
  }

  .chat-container pre {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    padding: 10px;
    overflow-x: auto;
  }

  .chat-container code {
    font-family: 'Courier New', Courier, monospace;
    background-color: #f5f5f5;
    padding: 2px 5px;
    border: 1px solid #ddd;
  }

  .user-message {
    word-break: break-word;
    width: max-content;
    padding: 5px;
    border-radius: 10px;
    background: #ccd3ff;
  }

  .model-message {
    padding: 5px;
    background: #fdfefe;
    border-radius: 10px;
    position: relative;
    margin: 10px 0 10px 10px;
    overflow: visible;
  }

  .input-list-container {
    margin-right: 10px;
  }

  .input-list {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px; /* Match button font size */
  }
`;
  document.head.appendChild(styleElement);
  document.body.appendChild(chatContainer);
  chatContainer.style.display = "block";

  // Chat history array
   const markedScript = document.createElement("script");
  markedScript.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
  document.head.appendChild(markedScript);

  // Chat history array
  let chatHistory = [];

  // Function to update the display with chat history
  function updateDisplay() {
    messagesContainer.innerHTML = "";
    for (const message of chatHistory) {
      const messageElement = document.createElement("div");
      messageElement.classList.add(
        message.role === "user" ? "user-message" : "model-message"
      );

      // Use marked to convert Markdown to HTML
      messageElement.innerHTML = marked.parse(message.parts[0].text);

      messagesContainer.appendChild(messageElement);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
  }

  // Function to add a message to the chat history and display it
  function addMessageToChatHistory(role, text) {
    chatHistory.push({
      role: role,
      parts: [{ text: text }]
    });
    updateDisplay();
  }

  // Function to send a message to the Gemini API
  async function sendMessage(userPrompt) {
    addMessageToChatHistory("user", userPrompt);

    const modelMessageElement = document.createElement("div");
    modelMessageElement.classList.add("model-message");
    messagesContainer.appendChild(modelMessageElement);

    try {
      const response = await fetch('https://chatai-flame-eta.vercel.app/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatHistory }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);

        // Parse the streamed events
        const events = text.split('\n\n').filter(event => event.trim() !== '');
        for (const event of events) {
          const eventType = event.split(':')[0].trim();
          if (eventType === 'data') {
            const data = JSON.parse(event.substring(5).trim());
            if (data.text) {
              fullResponse += data.text;
              // Use marked to convert Markdown to HTML
              modelMessageElement.innerHTML = marked.parse(fullResponse);
            }
          } else if (eventType === 'event' && event.includes('end')) {
            console.log('Stream ended'); // Handle end of stream
            break; // Exit the loop
          }
        }
      }

      addMessageToChatHistory("model", fullResponse);

    } catch (error) {
      console.error("Error:", error);
      modelMessageElement.textContent = "Error: " + error.message;
    }
  }
  // Event listeners for buttons
  runButton.addEventListener("click", async () => {
    const userPrompt = inputTextArea.value.trim();
    if (userPrompt === "") {
      alert("Please enter a prompt.");
      return;
    }
    runButton.disabled = true;
    runButton.innerText = "Running...";
    await sendMessage(userPrompt);
    runButton.disabled = false;
    runButton.innerText = "Run";
    inputTextArea.value = "";
  });

  clearButton.addEventListener("click", () => {
    chatHistory = [];
    updateDisplay();
  });

  closeButton.addEventListener("click", () => {
    chatContainer.remove();
    if (styleElement) {
      styleElement.remove();
    }
  });
}();
