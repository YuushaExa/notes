(function () {
  // Create the main container for the chat interface
  const chatContainer = document.createElement("div");
  chatContainer.classList.add("chat-container");

  // Create a container for chat messages
  const messagesContainer = document.createElement("div");
  messagesContainer.classList.add("messages-container");
  chatContainer.appendChild(messagesContainer);

  // Create a textarea for user input
  const inputTextArea = document.createElement("textarea");
  inputTextArea.classList.add("input-textarea");
  inputTextArea.placeholder = "Enter your prompt here...";
  chatContainer.appendChild(inputTextArea);

  // Initialize an empty array to store chat history
  let chatHistory = [];

  // Function to format text with Markdown-like syntax (Optimized)
  function formatText(text) {
    const replacements = [
      [/\*\*(.*?)\*\*/g, "<strong>$1</strong>"],
      [/\*(.*?)\*/g, "<em>$1</em>"],
      [/^### (.*?)$/gm, "<h3>$1</h3>"],
      [/^## (.*?)$/gm, "<h2>$1</h2>"],
      [/^# (.*?)$/gm, "<h1>$1</h1>"],
      [/^\* (.*?)$/gm, "<li>$1</li>"],
      [/^(\d+)\. (.*?)$/gm, "<li>$2</li>"],
      [/\[(.*?)\]\((.*?)\)/g, "<a href='$2'>$1</a>"],
      [/!\[(.*?)\]\((.*?)\)/g, "<img src='$2' alt='$1'>"],
      [/%60%60%60(.*?)%60%60%60/gs, "<pre><code>$1</code></pre>"],
      [/%60(.*?)%60/g, "<code>$1</code>"],
      [/^(?!<[h|u|o|l|p|i|s|c|a|p]).*(\r?\n\r?\n).*$/gm, "<p>$&</p>"],
    ];

    let formattedText = text;
    for (const [regex, replacement] of replacements) {
      formattedText = formattedText.replace(regex, replacement);
    }

    formattedText = formattedText
      .replace(/(<li>.*<\/li>)/gms, "<ul>$1</ul>") // Wrap lists only once
      .replace(/(<li>.*<\/li>)/gms, "<ol>$1</ol>") // Wrap lists only once
      .replace(/\r?\n\r?\n/g, "\n"); // Normalize newlines

    return formattedText;
  }

  // Function to call the server and get a response (Enhanced Error Handling)
  async function callServer(prompt) {
    // Add user message to chat history
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    displayChatHistory();

    try {
      // Send request to the server
      const response = await fetch(
        "https://chatai-flame-eta.vercel.app/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: prompt, chatHistory: chatHistory }),
        }
      );

      // Handle server errors more gracefully
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || "Unknown error from server.";
        throw new Error(
          `Server responded with status ${response.status}: ${errorMessage}`
        );
      }

      // Process server response
      const data = await response.json();
      if (data.text) {
        chatHistory.push({ role: "model", parts: [{ text: data.text }] });
      } else {
        throw new Error("Server response did not contain expected text format.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      chatHistory.push({
        role: "model",
        parts: [{ text: `Error: ${error.message}` }],
      });
    } finally {
      displayChatHistory();
    }
  }

  // Function to display chat history in the messages container (Optimized)
  function displayChatHistory() {
    messagesContainer.innerHTML = "";
    const fragment = document.createDocumentFragment(); // Use a fragment for efficiency

    for (const message of chatHistory) {
      const formattedText = formatText(message.parts[0].text);
      const messageElement = document.createElement("div");
      messageElement.innerHTML = formattedText;
      messageElement.classList.add(
        message.role === "user" ? "user-message" : "model-message"
      );
      fragment.appendChild(messageElement);
    }

    messagesContainer.appendChild(fragment);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Create a container for buttons
  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");
  chatContainer.appendChild(buttonsContainer);

  // Create the "Run" button (Enhanced with loading state)
  const runButton = document.createElement("button");
  runButton.classList.add("run-button");
  runButton.innerText = "Run";
  runButton.onclick = async function () {
    const prompt = inputTextArea.value.trim();
    if (prompt === "") {
      alert("Please enter a prompt.");
      return;
    }

    runButton.disabled = true; // Disable button during request
    runButton.innerText = "Running..."; // Indicate loading state

    await callServer(prompt);

    runButton.disabled = false; // Re-enable button
    runButton.innerText = "Run"; // Reset button text
    inputTextArea.value = "";
  };
  buttonsContainer.appendChild(runButton);

  // Create the "Clear" button
  const clearButton = document.createElement("button");
  clearButton.classList.add("clear-button");
  clearButton.innerText = "Clear";
  clearButton.onclick = function () {
    chatHistory = [];
    displayChatHistory();
  };
  buttonsContainer.appendChild(clearButton);

  // Create the "Close" button
  const closeButton = document.createElement("button");
  closeButton.classList.add("close-button");
  closeButton.innerText = "Close";
  closeButton.onclick = function () {
    chatContainer.remove();
  };
  buttonsContainer.appendChild(closeButton);

  // Create input list container and insert before "Clear" button
  const inputListContainer = document.createElement("div");
  inputListContainer.classList.add("input-list-container");
  buttonsContainer.insertBefore(inputListContainer, clearButton);

  // Create the input list (select element)
  const inputList = document.createElement("select");
  inputList.classList.add("input-list");

  // Pre-made prompt options (Enhanced with more options)
  const promptOptions = [
    { value: "", text: "Select a Prompt" }, // Added a default option
    { value: "Fix Grammar - ", text: "Fix Grammar" },
    { value: "What is ", text: "What is" },
    { value: "Top 5 anime", text: "Top 5 anime" },
    { value: "Explain like I'm 5: ", text: "Explain like I'm 5" }, // New option
    { value: "Summarize this: ", text: "Summarize this" }, // New option
  ];

  // Add options to the input list (Optimized with loop)
  for (const optionData of promptOptions) {
    const option = document.createElement("option");
    option.value = optionData.value;
    option.text = optionData.text;
    inputList.appendChild(option);
  }

  // Add onchange event to input list
  inputList.onchange = function () {
    inputTextArea.value = inputList.value;
  };

  // Add input list to its container
  inputListContainer.appendChild(inputList);

  // Create a style element for custom styles (Consolidated and Optimized)
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .chat-container {
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      height: 415px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      z-index: 10001;
      padding: 15px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.5;
      display: none;
      color: #111;
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
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 14px;
      line-height: 1.5;
      resize: none;
      outline: none;
      background-color: #fff;
    }

    .buttons-container {
      display: flex;
      justify-content: space-between;
      align-items: center; /* Vertically align items */
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

    .chat-container p, .chat-container h1, .chat-container h2, .chat-container h3, .chat-container ul, .chat-container ol, .chat-container li, .chat-container strong, .chat-container em, .chat-container a, .chat-container pre, .chat-container code {
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
      border: 1px solid #00b050;
      margin-left: 20px;
      padding: 5px;
      border-radius: 5px;
    }

    .model-message {
      word-break: break-word;
      border: 1px solid rgb(0, 123, 255);
      margin-right: 20px;
      padding: 5px;
      border-radius: 5px;
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

  // Append elements to the document
  document.head.appendChild(styleElement);
  document.body.appendChild(chatContainer);
  chatContainer.style.display = "block";
})();
