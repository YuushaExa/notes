(function () {
  // Create the main container for the chat interface
  let chatContainer = document.createElement("div");
  chatContainer.classList.add("chat-container");

  // Create a container for chat messages
  let messagesContainer = document.createElement("div");
  messagesContainer.classList.add("messages-container"); // Add class for CSS
  chatContainer.appendChild(messagesContainer);

  // Create a textarea for user input
  let inputTextArea = document.createElement("textarea");
  inputTextArea.classList.add("input-textarea"); // Add class for CSS
  inputTextArea.placeholder = "Enter your prompt here...";
  chatContainer.appendChild(inputTextArea);

  // Initialize an empty array to store chat history
  let chatHistory = [];

  // Function to format text with Markdown-like syntax
  function formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      .replace(/^\* (.*?)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gms, "<ul>$1</ul>")
      .replace(/^(\d+)\. (.*?)$/gm, "<li>$2</li>")
      .replace(/(<li>.*<\/li>)/gms, "<ol>$1</ol>")
      .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2'>$1</a>")
      .replace(/!\[(.*?)\]\((.*?)\)/g, "<img src='$2' alt='$1'>")
      .replace(/%60%60%60(.*?)%60%60%60/gs, "<pre><code>$1</code></pre>")
      .replace(/%60(.*?)%60/g, "<code>$1</code>")
      .replace(/^(?!<[h|u|o|l|p|i|s|c|a|p]).*(\r?\n\r?\n).*$/gm, "<p>$&</p>")
      .replace(/\r?\n\r?\n/g, "\n");
  }

  // Function to call the server and get a response
  async function callServer(prompt) {
    try {
      // Add user message to chat history
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      displayChatHistory();

      // Send request to the server
      let response = await fetch(
        "https://chatai-flame-eta.vercel.app/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: prompt, chatHistory: chatHistory }),
        }
      );

      // Handle server errors
      if (!response.ok) {
        let errorData = await response.json();
        console.error("Error from server:", errorData);
        chatHistory.push({
          role: "model",
          parts: [
            { text: "Error getting data from the server. Check console for details." },
          ],
        });
        displayChatHistory();
        return;
      }

      // Process server response
      let data = await response.json();
      if (data.text) {
        chatHistory.push({ role: "model", parts: [{ text: data.text }] });
        displayChatHistory();
      } else {
        chatHistory.push({
          role: "model",
          parts: [
            {
              text: "Server response did not contain expected text format.",
            },
          ],
        });
        displayChatHistory();
      }
    } catch (error) {
      console.error("Error calling server:", error);
      chatHistory.push({
        role: "model",
        parts: [
          {
            text: "An error occurred while calling the server. Check console for details.",
          },
        ],
      });
      displayChatHistory();
    }
  }

  // Function to display chat history in the messages container
  function displayChatHistory() {
    messagesContainer.innerHTML = "";
    for (let message of chatHistory) {
      let formattedText = formatText(message.parts[0].text);
      let messageElement = document.createElement("div");
      messageElement.innerHTML = formattedText;
      messageElement.classList.add(
        message.role === "user" ? "user-message" : "model-message"
      );
      messagesContainer.appendChild(messageElement);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Create a container for buttons
  let buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container"); // Add class for CSS
  chatContainer.appendChild(buttonsContainer);

  // Create the "Run" button
  let runButton = document.createElement("button");
  runButton.classList.add("run-button"); // Add class for CSS
  runButton.innerText = "Run";
  runButton.onclick = async function () {
    let prompt = inputTextArea.value.trim();
    if (prompt !== "") {
      await callServer(prompt);
      inputTextArea.value = "";
    } else {
      alert("Please enter a prompt.");
    }
  };
  buttonsContainer.appendChild(runButton);

let clearButton = document.createElement("button");
  clearButton.classList.add("clear-button"); // Add class for CSS
  clearButton.innerText = "Clear";
  clearButton.onclick = function () {
    chatHistory = []; // Clear the chat history array
    displayChatHistory(); // Update the display to show an empty chat
  };
  buttonsContainer.appendChild(clearButton);

  // Create the "Close" button
  let closeButton = document.createElement("button");
  closeButton.classList.add("close-button"); // Add class for CSS
  closeButton.innerText = "Close";
  closeButton.onclick = function () {
    chatContainer.remove();
  };
  buttonsContainer.appendChild(closeButton);

  let inputListContainer = document.createElement("div");
  inputListContainer.classList.add("input-list-container");
  buttonsContainer.insertBefore(inputListContainer, clearButton); // Insert before "Clear" button

  // Create the input list (select element)
  let inputList = document.createElement("select");
  inputList.classList.add("input-list");

  // Pre-made prompt options
  const promptOptions = [
    "",
    "Fix Grammar - ",
    "What is ",
    "Top 5 anime",
  ];

  // Add options to the input list
  for (let optionText of promptOptions) {
    let option = document.createElement("option");
    option.value = optionText;
    option.text = optionText;
    inputList.appendChild(option);
  }

  // Add onchange event to input list
  inputList.onchange = function () {
    inputTextArea.value = inputList.value; // Set textarea to selected value
  };

  // Add input list to its container
  inputListContainer.appendChild(inputList);

  // Create a style element for custom styles
  let styleElement = document.createElement("style");
  styleElement.textContent = `
        .chat-container {
          position: fixed;
          top: 10px;
          right: 10px;
          width: 400px;
          height: 400px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          z-index: 10001;
          padding: 15px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.5;
          display: none; /* Initially hidden */
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
        }
    
        .run-button, .close-button {
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
    
        .run-button {
          background-color: #007bff;
          color: #fff;
        }
    
        .run-button:hover {
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
          background-color: #6c757d; /* Example color - adjust as needed */
          color: #fff;
        }

        .clear-button:hover {
          background-color: #5a6268; /* Example hover color */
        }

        /* Styles for message formatting */
        .chat-container p {
          margin-bottom: 10px;
        }
    
        .chat-container h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
        }
    
        .chat-container h2 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 12px;
        }
    
        .chat-container h3 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 12px;
        }
    
        .chat-container ul, .chat-container ol {
          margin-bottom: 10px;
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
          margin-bottom: 10px;
        }
    
        .chat-container code {
          font-family: 'Courier New', Courier, monospace;
          background-color: #f5f5f5;
          padding: 2px 5px;
          border: 1px solid #ddd;
        }
    
        .user-message {
          margin-bottom: 10px;
          word-break: break-word;
          border: 1px solid #00b050;
          margin-left: 20px;
          padding: 5px;
          border-radius: 5px;
        }
    
        .model-message {
          margin-bottom: 10px;
          word-break: break-word;
          border: 1px solid rgb(0, 123, 255);
          margin-right: 20px;
          padding: 5px;
          border-radius: 5px;
        }

  .input-list-container {
          margin-right: 10px; /* Add some space between list and buttons */
        }

        .input-list {
          /* Style as needed */
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
    `;

  // Append elements to the document
  document.head.appendChild(styleElement);
  document.body.appendChild(chatContainer);
  chatContainer.style.display = "block"; // Show the container after styles are applied
})();
