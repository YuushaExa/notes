function createField(label, type = "text") {
    let fieldContainer = document.createElement("div"),
        labelElement = document.createElement("label");
    labelElement.innerText = label;
    let inputElement = document.createElement(
        "textarea" === type ? "textarea" : "input"
    );
    inputElement.type = type;
    fieldContainer.appendChild(labelElement);
    fieldContainer.appendChild(inputElement);
    return fieldContainer;
}

!function () {
    let container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "10px";
    container.style.right = "10px";
    container.style.width = "400px";
    container.style.height = "400px"; // Fixed height
    container.style.backgroundColor = "#f5f5f5";
    container.style.border = "1px solid #ddd";
    container.style.borderRadius = "10px";
    container.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    container.style.zIndex = "10001";
    container.style.padding = "15px";
    container.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    container.style.display = "none";
    document.body.appendChild(container);

    // Container for messages
    let messagesContainer = document.createElement("div");
    messagesContainer.style.height = "300px"; // Fixed height for messages
    messagesContainer.style.overflowY = "auto"; // Scrollable
    messagesContainer.style.marginBottom = "10px";
    container.appendChild(messagesContainer);

    // Input Window for Gemini Prompt
    let inputWindow = document.createElement("textarea");
    inputWindow.style.width = "calc(100% - 20px)";
    inputWindow.style.height = "50px"; // Height for input area
    inputWindow.style.padding = "10px";
    inputWindow.style.border = "1px solid #ccc";
    inputWindow.style.borderRadius = "5px";
    inputWindow.style.fontSize = "14px";
    inputWindow.style.lineHeight = "1.5";
    inputWindow.style.resize = "none";
    inputWindow.style.outline = "none";
    inputWindow.style.backgroundColor = "#fff";
    inputWindow.placeholder = "Enter your prompt here...";
    container.appendChild(inputWindow);

    // Chat History (Initially Empty)
    let chatHistory = [];

    async function getGeminiData(prompt) {
        const apiUrl = `https://chatai-flame-eta.vercel.app/api/generate`; 

        try {
            // Add user prompt to chat history
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            updateMessagesDisplay()
            // Send the prompt to your server
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt, chatHistory }), // Send the prompt in the request body
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error from server:", errorData);
                const errorMessage =
                    "Error getting data from the server. Check console for details.";
                chatHistory.push({
                    role: "model",
                    parts: [{ text: errorMessage }],
                });
                updateMessagesDisplay();
                return;
            }

            const data = await response.json();
            // console.log("data", data);

            if (data.text) {
                // Add the model's response to the chat history
                chatHistory.push({
                    role: "model",
                    parts: [{ text: data.text }],
                });
                updateMessagesDisplay();
            } else {
                const errorMessage = "Server response did not contain expected text format.";
                chatHistory.push({
                    role: "model",
                    parts: [{ text: errorMessage }],
                });
                updateMessagesDisplay();
            }
        } catch (error) {
            console.error("Error calling server:", error);
            const errorMessage =
                "An error occurred while calling the server. Check console for details.";
            chatHistory.push({
                role: "model",
                parts: [{ text: errorMessage }],
            });
            updateMessagesDisplay();
        }
    }

    // Function to Update Messages Display
    function updateMessagesDisplay() {
        // Clear existing messages
        messagesContainer.innerHTML = "";

        // Iterate over each message in the chat history
        for (const message of chatHistory) {
            const text = message.parts[0].text;

            // Create a new message container with appropriate styling
            const messageNode = document.createElement("div");

            // Apply different styles based on whether the message is from the user or the model
            if (message.role === "user") {
                messageNode.style.cssText = `
                    margin-bottom: 10px;
                    word-break: break-word;
                    border: 1px solid #00b050;
                    margin-left: 20px;
                    padding: 5px;
                    border-radius: 5px;
                `;
            } else {
                messageNode.style.cssText = `
                    margin-bottom: 10px;
                    word-break: break-word;
                    border: 1px solid rgb(0, 123, 255);
                    margin-right: 20px;
                    padding: 5px;
                    border-radius: 5px;
                `;
            }

            // Set the message text
            messageNode.textContent = text;

            // Append the message to the messages container
            messagesContainer.appendChild(messageNode);
        }

        // Scroll to the bottom of the messages container to show the latest messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Button Container
    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";
    container.appendChild(buttonContainer);

    // Run Button
    let runButton = document.createElement("button");
    runButton.innerText = "Run";
    runButton.style.backgroundColor = "#007bff";
    runButton.style.color = "#fff";
    runButton.style.border = "none";
    runButton.style.padding = "10px 20px";
    runButton.style.borderRadius = "5px";
    runButton.style.cursor = "pointer";
    runButton.style.transition = "background-color 0.2s";
    runButton.onclick = async function () {
        // Get the prompt from the input window
        const prompt = inputWindow.value.trim();

        if (prompt !== "") {
            // Call getGeminiData with the prompt
            await getGeminiData(prompt);

            // Clear the input window
            inputWindow.value = "";
        } else {
            alert("Please enter a prompt.");
        }
    };
    runButton.onmouseover = function () {
        this.style.backgroundColor = "#0056b3";
    };
    runButton.onmouseout = function () {
        this.style.backgroundColor = "#007bff";
    };
    buttonContainer.appendChild(runButton);

    // Close Button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.backgroundColor = "#dc3545";
    closeButton.style.color = "#fff";
    closeButton.style.border = "none";
    closeButton.style.padding = "10px 20px";
    closeButton.style.borderRadius = "5px";
    closeButton.style.cursor = "pointer";
    closeButton.style.transition = "background-color 0.2s";
    closeButton.onclick = function () {
        container.remove(); // Use remove() to delete the container
    };
    closeButton.onmouseover = function () {
        this.style.backgroundColor = "#c82333";
    };
    closeButton.onmouseout = function () {
        this.style.backgroundColor = "#dc3545";
    };
    buttonContainer.appendChild(closeButton);

    // Show the container initially
    container.style.display = "block";
}();



--------------


const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// POST route to handle Gemini API requests
app.post('/api/generate', async (req, res) => {
    const { prompt, chatHistory } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY; // Access API key from environment variable
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    try {
        const requestBody = {
            contents: chatHistory,
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from Gemini API:', errorData);
            return res.status(response.status).json({ error: 'Error from Gemini API', details: errorData });
        }

        const data = await response.json();
        const generatedText = data.candidates[0]?.content?.parts[0]?.text;

        if (generatedText) {
            res.json({ text: generatedText });
        } else {
            res.status(500).json({ error: 'Gemini response did not contain expected text format.' });
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Error processing request.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
