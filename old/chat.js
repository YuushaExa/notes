javascript: (function () {
  /* Function to inject the marked library */
  function injectMarkedScript(callback) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    script.onload = callback; // Call the main bookmarklet code after marked is loaded
    script.onerror = () => {
      console.error("Error loading marked.js");
    };
    document.head.appendChild(script);
  }

  /* Main bookmarklet code */
  function initializeChat() {
    (async function () {
      // --- DOM Element Creation and Setup ---

      function createChatContainer() {
        const fragment = document.createDocumentFragment();

        const chatContainer = createElement("div", ["chat-container"]);
        const messagesContainer = createElement("div", ["messages-container"]);
        const inputTextArea = createElement("textarea", ["input-textarea"], {
          placeholder: "Enter your prompt here...",
        });
        const buttonsContainer = createElement("div", ["buttons-container"]);
        const runButton = createElement("button", ["run-button"], {
          innerText: "Run",
        });
        const clearButton = createElement("button", ["clear-button"], {
          innerText: "Clear",
        });
        const closeButton = createElement("button", ["close-button"], {
          innerText: "Close",
        });
        const inputListContainer = createElement("div", ["input-list-container"]);
        const inputListSelect = createInputListSelect(inputTextArea);

        buttonsContainer.appendChild(runButton);
        buttonsContainer.appendChild(clearButton);
        buttonsContainer.appendChild(closeButton);
        inputListContainer.appendChild(inputListSelect)
        buttonsContainer.insertBefore(inputListContainer, clearButton);

        chatContainer.appendChild(messagesContainer);
        chatContainer.appendChild(inputTextArea);
        chatContainer.appendChild(buttonsContainer);

        fragment.appendChild(chatContainer);
        document.body.appendChild(fragment);

        return {
          chatContainer,
          messagesContainer,
          inputTextArea,
          runButton,
          clearButton,
          closeButton,
        };
      }

      function createElement(tagName, classNames = [], attributes = {}) {
        const element = document.createElement(tagName);
        element.classList.add(...classNames);
        for (const [key, value] of Object.entries(attributes)) {
          element[key] = value;
        }
        return element;
      }

      function createInputListSelect(inputTextArea) {
        const inputListSelect = createElement("select", ["input-list"]);
        const promptOptions = [
          { value: "", text: "Select a Prompt" },
          { value: "Fix Grammar - ", text: "Fix Grammar" },
          { value: "What is ", text: "What is" },
          { value: "Top 10 anime", text: "Top 10 anime" },
          { value: "Explain like I'm 5: ", text: "Explain like I'm 5" },
          { value: "Summarize this: ", text: "Summarize this" },
          { value: "Continue ", text: "Continue" },
        ];

        for (const option of promptOptions) {
          const optionElement = createElement("option", [], {
            value: option.value,
            text: option.text,
          });
          inputListSelect.appendChild(optionElement);
        }

        inputListSelect.addEventListener("change", () => {
          inputTextArea.value = inputListSelect.value;
        });

        return inputListSelect;
      }

      function createStyleElement() {
        const styleElement = createElement("style");
        styleElement.textContent = `
          /* Combined and Minified CSS */
          .chat-container{position:fixed;top:10px;right:10px;width:410px;height:425px;background-color:#eaeff8;border:1px solid #ddd;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,.1);z-index:10001;padding:10px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.3;display:none;color:#333;font-size:15px}
          .messages-container{height:300px;overflow-y:auto;margin-bottom:10px}
          .input-textarea{width:calc(100% - 20px);height:50px;padding:10px;border:1px solid #d4dbe9;border-radius:7px;font-size:14px;line-height:1.5;resize:none;outline:none;background-color:#fff}
          .buttons-container{display:flex;justify-content:space-between;align-items:center;margin:3px 0}
          .run-button,.close-button,.clear-button{border:none;padding:8px 16px;border-radius:5px;cursor:pointer;transition:background-color .2s;font-size:14px}
          .run-button{background-color:#007bff;color:#fff}
          .run-button:hover,.run-button:disabled{background-color:#0056b3}
          .close-button{background-color:#dc3545;color:#fff}
          .close-button:hover{background-color:#c82333}
          .clear-button{background-color:#6c757d;color:#fff}
          .clear-button:hover{background-color:#5a6268}
          .chat-container h1,.chat-container h2,.chat-container h3,.chat-container ul,.chat-container ol,.chat-container li,.chat-container strong,.chat-container em,.chat-container a,.chat-container pre,.chat-container code{margin-bottom:10px}
          .chat-container h1{font-size:24px;font-weight:700}
          .chat-container h2{font-size:20px;font-weight:700}
          .chat-container h3{font-size:18px;font-weight:700}
          .chat-container ul,.chat-container ol{padding-left:20px}
          .chat-container li{margin-bottom:5px}
          .chat-container strong{font-weight:700}
          .chat-container em{font-style:italic}
          .chat-container a{color:#007bff;text-decoration:none}
          .chat-container a:hover{text-decoration:underline}
          .chat-container pre{background-color:#f5f5f5;border:1px solid #ddd;padding:10px;overflow-x:auto}
          .chat-container code{font-family:'Courier New',Courier,monospace;background-color:#f5f5f5;padding:2px 5px;border:1px solid #ddd}
          .user-message{word-break:break-word;width:max-content;padding:5px;border-radius:10px;background:#ccd3ff}
          .model-message{padding:5px;background:#fdfefe;border-radius:10px;position:relative;margin:10px 0 10px 10px}
          .input-list-container{margin-right:10px}
          .input-list{padding:5px;border:1px solid #ccc;border-radius:5px;font-size:14px}
        `;
        return styleElement;
      }

      // --- Chat Logic ---

      function initializeChatElements() {
        const {
          chatContainer,
          messagesContainer,
          inputTextArea,
          runButton,
          clearButton,
          closeButton,
        } = createChatContainer();

        const styleElement = createStyleElement();
        document.head.appendChild(styleElement);

        let chatHistory = [];

        // Function to parse Markdown and update the message element
        function updateMessageElementWithMarkdown(messageElement, markdownText) {
          messageElement.innerHTML = marked.parse(markdownText);
        }

        function updateChatDisplay() {
          messagesContainer.innerHTML = "";
          const fragment = document.createDocumentFragment();

          for (const message of chatHistory) {
            const messageElement = createElement("div", [
              message.role === "user" ? "user-message" : "model-message",
            ]);

            // Parse and display message content
            if (message.role === "model") {
              updateMessageElementWithMarkdown(messageElement, message.parts[0].text);
            } else {
              messageElement.textContent = message.parts[0].text;
            }

            fragment.appendChild(messageElement);
          }

          messagesContainer.appendChild(fragment);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function addMessageToChatHistory(role, content) {
          chatHistory.push({ role, parts: [{ text: content }] });
          updateChatDisplay();
        }

        async function getModelResponse(prompt) {
          addMessageToChatHistory("user", prompt);
          const modelMessageElement = createElement("div", ["model-message"]);
          messagesContainer.appendChild(modelMessageElement);

          try {
            const response = await fetch(
              "https://chatai-flame-eta.vercel.app/api/generate",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatHistory }),
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const textDecoder = new TextDecoder();
            let accumulatedResponse = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const textChunk = textDecoder.decode(value);
              const dataChunks = textChunk
                .split("\n\n")
                .filter((chunk) => chunk.trim() !== "");

              for (const dataChunk of dataChunks) {
                const dataEvent = dataChunk.split(":")[0].trim();
                if (dataEvent === "data") {
                  const jsonData = JSON.parse(dataChunk.substring(5).trim());
                  if (jsonData.text) {
                    accumulatedResponse += jsonData.text;
                    // Parse and update the content in real-time
                    updateMessageElementWithMarkdown(
                      modelMessageElement,
                      accumulatedResponse
                    );
                  }
                } else if (dataEvent === "event" && dataChunk.includes("end")) {
                  console.log("Stream ended");
                  break;
                }
              }
            }

            addMessageToChatHistory("model", accumulatedResponse);
          } catch (error) {
            console.error("Error:", error);
            modelMessageElement.textContent = `Error: ${error.message}`;
          }
        }

        // --- Event Listeners ---

        runButton.addEventListener("click", async () => {
          const prompt = inputTextArea.value.trim();
          if (prompt === "") {
            alert("Please enter a prompt.");
            return;
          }

          runButton.disabled = true;
          runButton.innerText = "Running...";

          await getModelResponse(prompt);

          runButton.disabled = false;
          runButton.innerText = "Run";
          inputTextArea.value = "";
        });

        clearButton.addEventListener("click", () => {
          chatHistory = [];
          updateChatDisplay();
        });

        closeButton.addEventListener("click", () => {
          chatContainer.remove();
          styleElement.remove();
        });

        chatContainer.style.display = "block";
      }

      initializeChatElements();
    })();
  }

  /* Inject marked and then initialize */
  injectMarkedScript(initializeChat);
})();
