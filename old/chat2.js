(function() {
  // Create the main container
  let container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.width = "400px";
  container.style.height = "400px";
  container.style.backgroundColor = "#f5f5f5";
  container.style.border = "1px solid #ddd";
  container.style.borderRadius = "10px";
  container.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
  container.style.zIndex = "10001";
  container.style.padding = "15px";
  container.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  container.style.display = "none";

  // Create the chat history container
  let chatHistoryContainer = document.createElement("div");
  chatHistoryContainer.style.height = "300px";
  chatHistoryContainer.style.overflowY = "auto";
  chatHistoryContainer.style.marginBottom = "10px";
  container.appendChild(chatHistoryContainer);

  // Create the input textarea
  let inputTextArea = document.createElement("textarea");
  inputTextArea.style.width = "calc(100% - 20px)";
  inputTextArea.style.height = "50px";
  inputTextArea.style.padding = "10px";
  inputTextArea.style.border = "1px solid #ccc";
  inputTextArea.style.borderRadius = "5px";
  inputTextArea.style.fontSize = "14px";
  inputTextArea.style.lineHeight = "1.5";
  inputTextArea.style.resize = "none";
  inputTextArea.style.outline = "none";
  inputTextArea.style.backgroundColor = "#fff";
  inputTextArea.placeholder = "Enter your prompt here...";
  container.appendChild(inputTextArea);

  // Chat history array
  let chatHistory = [];

  // Function to send prompt and get response
  async function sendMessage(prompt) {
    try {
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      updateChatDisplay();

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

      if (!response.ok) {
        let errorData = await response.json();
        console.error("Error from server:", errorData);
        chatHistory.push({
          role: "model",
          parts: [
            {
              text: "Error getting data from the server. Check console for details.",
            },
          ],
        });
        updateChatDisplay();
        return;
      }

      let responseData = await response.json();
      if (responseData.text) {
        chatHistory.push({ role: "model", parts: [{ text: responseData.text }] });
        updateChatDisplay();
      } else {
        chatHistory.push({
          role: "model",
          parts: [
            {
              text: "Server response did not contain expected text format.",
            },
          ],
        });
        updateChatDisplay();
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
      updateChatDisplay();
    }
  }

  // Function to update the chat display
  function updateChatDisplay() {
    chatHistoryContainer.innerText = "";
    for (let message of chatHistory) {
      let messageText = message.parts[0].text;
      let messageDiv = document.createElement("div");
      messageDiv.textContent = messageText;

      if (message.role === "user") {
        messageDiv.style.cssText = `
                    margin-bottom: 10px;
                    word-break: break-word;
                    border: 1px solid #00b050;
                    margin-left: 20px;
                    padding: 5px;
                    border-radius: 5px;
                `;
      } else {
        messageDiv.style.cssText = `
                    margin-bottom: 10px;
                    word-break: break-word;
                    border: 1px solid rgb(0, 123, 255);
                    margin-right: 20px;
                    padding: 5px;
                    border-radius: 5px;
                `;
      }
      chatHistoryContainer.appendChild(messageDiv);
    }
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
  }

  // Create the button container
  let buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";
  container.appendChild(buttonContainer);

  // Create the "Run" button
  let runButton = document.createElement("button");
  runButton.innerText = "Run";
  runButton.style.backgroundColor = "#007bff";
  runButton.style.color = "#fff";
  runButton.style.border = "none";
  runButton.style.padding = "10px 20px";
  runButton.style.borderRadius = "5px";
  runButton.style.cursor = "pointer";
  runButton.style.transition = "background-color 0.2s";
  runButton.onclick = async function() {
    let prompt = inputTextArea.value.trim();
    if (prompt !== "") {
      await sendMessage(prompt);
      inputTextArea.value = "";
    } else {
      alert("Please enter a prompt.");
    }
  };
  runButton.onmouseover = function() {
    this.style.backgroundColor = "#0056b3";
  };
  runButton.onmouseout = function() {
    this.style.backgroundColor = "#007bff";
  };
  buttonContainer.appendChild(runButton);

  // Create the "Close" button
  let closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.style.backgroundColor = "#dc3545";
  closeButton.style.color = "#fff";
  closeButton.style.border = "none";
  closeButton.style.padding = "10px 20px";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.style.transition = "background-color 0.2s";
  closeButton.onclick = function() {
    container.remove();
  };
  closeButton.onmouseover = function() {
    this.style.backgroundColor = "#c82333";
  };
  closeButton.onmouseout = function() {
    this.style.backgroundColor = "#dc3545";
  };
  buttonContainer.appendChild(closeButton);

  // Append the container to the body and show it
  document.body.appendChild(container);
  container.style.display = "block";
})();
