javascript: !function() {
  let chatContainer = document.createElement("div");
  chatContainer.classList.add("chat-container");

  let messagesContainer = document.createElement("div");
  messagesContainer.classList.add("messages-container");
  chatContainer.appendChild(messagesContainer);

  let inputTextArea = document.createElement("textarea");
  inputTextArea.classList.add("input-textarea");
  inputTextArea.placeholder = "Enter your prompt here...";
  chatContainer.appendChild(inputTextArea);

  let chatHistory = [];

  // Formatting function (restored and adapted)
function formatMessage(messageText) {
  let formattedText = messageText;

  // Escape special characters to prevent unintended formatting
  formattedText = formattedText.replace(/\\(\*|_|#|!|\[|\]|\(|\))/g, "$1");

  // Paragraphs (must be done before other block-level elements)
  formattedText = formattedText.replace(/^([^#\*\d].+)$/gm, "<p>$1</p>");

  // Headings (order matters: h3 before h2 before h1)
  formattedText = formattedText.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  formattedText = formattedText.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  formattedText = formattedText.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Ordered and unordered lists (process together to handle order correctly)
  formattedText = formattedText.replace(
    /^( *)(?:(\d+)\.|\*) (.*?)$/gm,
    (match, indent, number, content) => {
      const isOrdered = number !== undefined;
      return `${indent}<${isOrdered ? "ol" : "ul"}>\n${indent}  <li>${content}</li>\n${indent}</${isOrdered ? "ol" : "ul"}>`;
    }
  );

  // Merge consecutive lists of the same type and handle nested lists
  formattedText = formattedText.replace(
    /(<\/ul>\n<ul>|<\/ol>\n<ol>)/g,
    ""
  );
  // Clean up loose </li></ul> or </li></ol> that might be present after processing nested lists
  formattedText = formattedText.replace(/<\/li>(<\/ul>|<\/ol>)/g, "$1");
  // Move starting <ul><li ...> or <ol><li ...> to the same line to prevent extra line breaks
  formattedText = formattedText.replace(/(<ul>|<\ol>)\n +<li>/g, "$1<li>");

  // Images
  formattedText = formattedText.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    "<img src='$2' alt='$1'>"
  );

  // Links
  formattedText = formattedText.replace(
    /\[(.*?)\]\((.*?)\)/g,
    "<a href='$2'>$1</a>"
  );

  // Bold (must be after links and images to avoid conflicts)
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italics (must be after bold)
  formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");

  return formattedText;
}

  async function sendMessage(userPrompt) {
    chatHistory.push({ role: "user", parts: [{ text: userPrompt }] });
    updateDisplay();

    try {
      const response = await fetch("https://chatai-flame-eta.vercel.app/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: userPrompt, chatHistory: chatHistory })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      const responseText = await response.text(); // Still expecting plain text from server
      chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    } catch (error) {
      console.error("Error:", error.message);
      chatHistory.push({ role: "model", parts: [{ text: `Error: ${error.message}` }] });
    } finally {
      updateDisplay();
    }
  }

  function updateDisplay() {
    messagesContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (const message of chatHistory) {
      const formattedText = formatMessage(message.parts[0].text); // Format the message
      const messageDiv = document.createElement("div");
      messageDiv.innerHTML = formattedText; // Use innerHTML for formatted content
      messageDiv.classList.add(message.role === "user" ? "user-message" : "model-message");
      fragment.appendChild(messageDiv);
    }

    messagesContainer.appendChild(fragment);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");
  chatContainer.appendChild(buttonsContainer);

  const runButton = document.createElement("button");
  runButton.classList.add("run-button");
  runButton.innerText = "Run";
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
  buttonsContainer.appendChild(runButton);

  const clearButton = document.createElement("button");
  clearButton.classList.add("clear-button");
  clearButton.innerText = "Clear";
  clearButton.addEventListener("click", () => {
    chatHistory = [];
    updateDisplay();
  });
  buttonsContainer.appendChild(clearButton);

  const closeButton = document.createElement("button");
  closeButton.classList.add("close-button");
  closeButton.innerText = "Close";
  closeButton.addEventListener("click", () => {
    chatContainer.remove();
    // Remove the style element when close button is clicked
    if (styleElement) {
      styleElement.remove();
    }
  });
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
    { value: "Summarize this: ", text: "Summarize this" }
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

  // Create style element (no changes needed)
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

// Append style element to the head
document.head.appendChild(styleElement);

// Append chat container to the body
document.body.appendChild(chatContainer);

// Display the chat interface
chatContainer.style.display = "block";
}();
