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
    container.style.width = "300px";
    container.style.height = "auto";
    container.style.backgroundColor = "white";
    container.style.border = "1px solid #ccc";
    container.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    container.style.zIndex = "10001";
    container.style.padding = "10px";
    container.style.display = "none";
    document.body.appendChild(container);

    // Create the new Genre field
    let genreField = createField("Genre");

    let titleField = createField("Title"),
        urlField = createField("URL"),
        imageUrlField = createField("Image URL"),
        descriptionField = createField("Description", "textarea"),
        contentField = createField("Content", "textarea"),
        categoryField = createField("Category"),
        tagsField = createField("Tags (comma-separated)");
    let imagePreview = document.createElement("img");
    imagePreview.style.width = "80%";
    imagePreview.style.display = "none";
    container.appendChild(imagePreview);
    imageUrlField.querySelector("input").addEventListener("input", function () {
        let imageUrl = this.value;
        imageUrl
            ? ((imagePreview.src = imageUrl), (imagePreview.style.display = "block"))
            : (imagePreview.style.display = "none");
    });
    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";
    container.appendChild(buttonContainer);
    let sendButton = document.createElement("button");
    sendButton.innerText = "Send";
    sendButton.onclick = function () {
        let data = {
            title: titleField.querySelector("input").value,
            url: urlField.querySelector("input").value,
            image: imageUrlField.querySelector("input").value,
            description: descriptionField.querySelector("textarea").value,
            content: contentField.querySelector("textarea").value,
            category: categoryField.querySelector("input").value,
            tags: tagsField.querySelector("input").value.split(",").map((tag) => tag.trim()),
            genre: genreField.querySelector("input").value, // Get genre value
        };
        sendDataToGitHub(data);
    };
    buttonContainer.appendChild(sendButton);
    let penButton = document.createElement("button");
    penButton.innerText = "Pen";
    let isPenActive = !1;
    penButton.onclick = function () {
        isPenActive = !isPenActive;
        isPenActive
            ? ((penButton.innerText = "Stop Pen"),
                document.addEventListener("click", handleClick))
            : ((penButton.innerText = "Pen"),
                document.removeEventListener("click", handleClick));
    };
    buttonContainer.appendChild(penButton);
    let autoButton = document.createElement("button");
    function isValidImageUrl(url) {
        return url.startsWith("http://") || url.startsWith("https://");
    }

    // Gemini API Key (Replace with your actual key)
    const geminiApiKey = "TOKEN"; // Replace with a secure method!

    // Function to call the Gemini API
    async function getGeminiData(title) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Based on the title "${title}", provide the following: Genre, Tags (comma-separated), and Category. Format your response as JSON with the keys "genre", "tags", and "category".`,
                                },
                            ],
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error from Gemini API:", errorData);
                alert("Error getting data from Gemini. Check console for details.");
                return null;
            }

            const data = await response.json();
            console.log("Gemini API Response:", data); // Log the full response for debugging

            // Extract text from the response
            const generatedText = data.candidates[0]?.content?.parts[0]?.text;

            if (generatedText) {
                try {
                    // Extract JSON from Markdown code block (if present)
                    let jsonString = generatedText;
                    const regex = /```json\s*([\s\S]*?)\s*```/; // Regular expression to find JSON in code block
                    const match = generatedText.match(regex);

                    if (match && match[1]) {
                        jsonString = match[1]; // Extracted JSON string
                    }

                    const parsedData = JSON.parse(jsonString);
                    return parsedData;
                } catch (error) {
                    console.error("Error parsing Gemini response:", error);
                    alert("Error parsing Gemini response. Check console for details.");
                    return null;
                }
            } else {
                console.error("Gemini response did not contain expected text format.");
                alert("Gemini response did not contain expected text format.");
                return null;
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            alert("An error occurred while calling Gemini API. Check console for details.");
            return null;
        }
    }

    autoButton.innerText = "Auto";
    autoButton.onclick = async function () {
        let metaTags = document.getElementsByTagName("meta"),
            ogData = {};
        for (let tag of metaTags)
            tag.getAttribute("property") &&
                tag.getAttribute("property").startsWith("og:") &&
                (ogData[tag.getAttribute("property").replace("og:", "")] =
                    tag.getAttribute("content"));

        let title = ogData.title;
        title ||
            (title = (titleTag = document.querySelector("title"))
                ? titleTag.innerText
                : "");
        title ||
            (title = (h1Tag = document.querySelector("h1")) ? h1Tag.innerText : "");
        title ||
            (title = (h2Tag = document.querySelector("h2")) ? h2Tag.innerText : "");

        let imageUrl = ogData.image;
        imageUrl ||
            (imageUrl = (bodyTag = document.querySelector("body"))
                ? getComputedStyle(bodyTag).backgroundImage.slice(4, -1).replace(/['"]/g, "")
                : "");
        imageUrl ||
            (imageUrl = (firstImage = document.querySelector("img")) ? firstImage.src : "");

        titleField.querySelector("input").value = title || "";
        urlField.querySelector("input").value = window.location.href;
        descriptionField.querySelector("textarea").value = ogData.description || "";
        imageUrlField.querySelector("input").value = imageUrl || "";

        imageUrl && isValidImageUrl(imageUrl)
            ? ((imagePreview.src = imageUrl), (imagePreview.style.display = "block"))
            : (imagePreview.style.display = "none");

        if (title) {
            const geminiData = await getGeminiData(title);
            if (geminiData) {
                genreField.querySelector("input").value = geminiData.genre || ""; // Populate genre field
                categoryField.querySelector("input").value = geminiData.category || "";
                tagsField.querySelector("input").value = geminiData.tags || "";
            }
        } else {
            alert("Could not determine the title of the page.");
        }
    };

    buttonContainer.appendChild(autoButton);
    let showButton = document.createElement("button");
    showButton.innerText = "Show";
    showButton.onclick = function () {
        let newWindow = window.open("", "_blank");
        newWindow.document.write(
            "<html><head><title>Selected Content</title></head><body><pre>" +
            JSON.stringify(
                {
                    title: titleField.querySelector("input").value,
                    url: urlField.querySelector("input").value,
                    image: imageUrlField.querySelector("input").value,
                    description: descriptionField.querySelector("textarea").value,
                    content: contentField.querySelector("textarea").value,
                    category: categoryField.querySelector("input").value,
                    tags: tagsField
                        .querySelector("input")
                        .value.split(",")
                        .map((tag) => tag.trim()),
                    genre: genreField.querySelector("input").value, // Include genre
                },
                null,
                2
            ) +
            "</pre></body></html>"
        );
        newWindow.document.close();
    };
    buttonContainer.appendChild(showButton);
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
closeButton.onclick = function () {
        container.remove(); 
    };
    buttonContainer.appendChild(closeButton);

    function handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        let buttons = container.getElementsByTagName("button");
        for (let button of buttons) if (button === event.target) return;
        let clickedDiv = event.target.closest("div");
        if (clickedDiv) {
            let extractedContent = [],
                textContent = clickedDiv.innerText.trim();
            textContent && extractedContent.push("<p>" + textContent + "</p>");
            let images = clickedDiv.getElementsByTagName("img");
            for (let img of images)
                img.src &&
                    extractedContent.push(
                        '<img src="' +
                        img.src +
                        '" alt="Image" style="max-width: 100%; height: auto;" />'
                    );
            let links = clickedDiv.getElementsByTagName("a");
            for (let link of links)
                link.href &&
                    extractedContent.push(
                        '<a href="' +
                        link.href +
                        '" target="_blank" style="color: blue; text-decoration: underline;">' +
                        link.innerText +
                        "</a>"
                    );
            let contentTextArea = contentField.querySelector("textarea"),
                existingContent = contentTextArea.value.trim();
            contentTextArea.value = existingContent
                ? existingContent + "\n" + extractedContent.join("\n")
                : extractedContent.join("\n");
        }
    }
    async function sendDataToGitHub(data) {
        const token =
            "TOKEN", // Replace with your GitHub PAT
            repoOwner = "YuushaExa", // Replace with your GitHub username
            repoName = "notes", // Replace with your repository name
            filePath = "notes.json",
            branch = "main",
            apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

        try {
            const response = await fetch(apiUrl + `?ref=${branch}`, {
                headers: {
                    Authorization: `token ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const fileData = await response.json();

            // Decode the existing content
            const currentContent = JSON.parse(
                decodeURIComponent(escape(atob(fileData.content)))
            );

            currentContent.push(data);

            // Encode the updated content
            const textEncoder = new TextEncoder();
            const utf8EncodedData = textEncoder.encode(
                JSON.stringify(currentContent, null, 2)
            );
            const base64EncodedString = btoa(
                Uint8Array.from(utf8EncodedData).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ""
                )
            );

            const updateResponse = await fetch(apiUrl, {
                method: "PUT",
                headers: {
                    Authorization: `token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "Add new note",
                    content: base64EncodedString,
                    sha: fileData.sha,
                    branch: branch,
                }),
            });

            if (updateResponse.ok) {
                alert("Data sent to GitHub successfully!");
            } else {
                const errorData = await updateResponse.json();
                console.error("Error sending data to GitHub:", errorData);
                alert(
                    "Error sending data to GitHub. Status: " +
                    updateResponse.status +
                    ". Message: " +
                    errorData.message
                );
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Check console for details.");
        }
    }

    // Add fields to the container in your desired order:
    container.appendChild(titleField);
    container.appendChild(urlField);
    container.appendChild(imageUrlField);
    container.appendChild(descriptionField);
    container.appendChild(contentField);
    container.appendChild(categoryField);
    container.appendChild(tagsField);
    container.appendChild(genreField); // Add the genre field here

    document.body.appendChild(container);
    container.style.display = "block";
}();
