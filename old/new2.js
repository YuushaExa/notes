function createField(label, type = "text") {
    let fieldContainer = document.createElement("div");
    fieldContainer.classList.add("field-container");

    let labelElement = document.createElement("label");
    labelElement.innerText = label;
    labelElement.classList.add("field-label");

    let inputElement = document.createElement(
        "textarea" === type ? "textarea" : "input"
    );
    inputElement.type = type;
    inputElement.classList.add("field-input");

    fieldContainer.appendChild(labelElement);
    fieldContainer.appendChild(inputElement);
    return fieldContainer;
}

!function () {
    // Create the CSS style element and insert the CSS rules
    let style = document.createElement("style");
    style.innerHTML = `
        .main-container {
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            height: auto;
            background-color: white;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            z-index: 10001;
            padding: 10px;
            display: none; /* Initially hidden */
        }

        .field-container {
            margin-bottom: 10px;
        }

        .field-label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .field-input {
            width: 100%;
            padding: 5px;
            border: 1px solid #ccc;
            box-sizing: border-box;
        }

        .image-preview {
            width: 80%;
            display: none;
            margin-top: 10px;
        }

        .button-container {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }

        .action-button {
            padding: 5px 10px;
            background-color: #4CAF50; /* Example - you can customize */
            color: white;
            border: none;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style); // Add the style element to the document head

    let container = document.createElement("div");
    container.classList.add("main-container");
    document.body.appendChild(container);

    // Create fields (store input elements for later use)
    let titleField = createField("Title"),
        titleInput = titleField.querySelector("input");
    let urlField = createField("URL"),
        urlInput = urlField.querySelector("input");
    let imageUrlField = createField("Image URL"),
        imageUrlInput = imageUrlField.querySelector("input");
    let descriptionField = createField("Description", "textarea"),
        descriptionTextarea = descriptionField.querySelector("textarea");
    let contentField = createField("Content", "textarea"),
        contentTextarea = contentField.querySelector("textarea");
    let categoryField = createField("Category"),
        categoryInput = categoryField.querySelector("input");
    let tagsField = createField("Tags (comma-separated)"),
        tagsInput = tagsField.querySelector("input");
    let genreField = createField("Genre"),
        genreInput = genreField.querySelector("input");

    let imagePreview = document.createElement("img");
    imagePreview.classList.add("image-preview");
    container.appendChild(imagePreview);

    // Add event listener to image URL field
    imageUrlInput.addEventListener("input", function () {
        let imageUrl = this.value;
        if (imageUrl && isValidImageUrl(imageUrl)) {
            imagePreview.src = imageUrl;
            imagePreview.style.display = "block";
        } else {
            imagePreview.style.display = "none";
        }
    });

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    container.appendChild(buttonContainer);

    let sendButton = document.createElement("button");
    sendButton.innerText = "Send";
    sendButton.classList.add("action-button");
    sendButton.onclick = function () {
        let data = {
            title: titleInput.value,
            url: urlInput.value,
            image: imageUrlInput.value,
            description: descriptionTextarea.value,
            content: contentTextarea.value,
            category: categoryInput.value,
            tags: tagsInput.value.split(",").map((tag) => tag.trim()),
            genre: genreInput.value,
        };
        sendDataToGitHub(data);
    };
    buttonContainer.appendChild(sendButton);

    function isValidImageUrl(url) {
        return url.startsWith("http://") || url.startsWith("https://");
    }

    // Function to call your backend API
    async function getGeminiData(title, url, description) {
        const apiUrl = "https://chatai-flame-eta.vercel.app/api/extract-info";
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: title, url: url, description: description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error from your API:", errorData);
                alert("Error getting data from your API. Check console for details.");
                return null;
            }

            const data = await response.json();
            console.log("Your API Response:", data);
            return data;
        } catch (error) {
            console.error("Error calling your API:", error);
            alert("An error occurred while calling your API. Check console for details.");
            return null;
        }
    }

    let autoButton = document.createElement("button");
    autoButton.innerText = "Auto";
    autoButton.classList.add("action-button");
    autoButton.onclick = async function () {
        // Extract OpenGraph data
        const metaTags = document.getElementsByTagName("meta");
        const ogData = {};
        for (const tag of metaTags) {
            const property = tag.getAttribute("property");
            if (property?.startsWith("og:")) {
                ogData[property.replace("og:", "")] = tag.getAttribute("content");
            }
        }

        // Determine title and image URL
        let title = ogData.title || document.querySelector("title")?.innerText ||
            document.querySelector("h1")?.innerText ||
            document.querySelector("h2")?.innerText || "";
        let imageUrl = ogData.image ||
            document.querySelector("body")?.style.backgroundImage.slice(4, -1).replace(/['"]/g, "") ||
            document.querySelector("img")?.src || "";

        // Populate fields
        titleInput.value = title;
        urlInput.value = window.location.href;
        descriptionTextarea.value = ogData.description || "";
        imageUrlInput.value = imageUrl;

        // Display image preview if valid
        if (imageUrl && isValidImageUrl(imageUrl)) {
            imagePreview.src = imageUrl;
            imagePreview.style.display = "block";
        } else {
            imagePreview.style.display = "none";
        }

        // Fetch Gemini data if title is available
        if (title) {
            try {
                const geminiData = await getGeminiData(title, urlInput.value, descriptionTextarea.value);
                if (geminiData) {
                    genreInput.value = geminiData.genre || "";
                    categoryInput.value = geminiData.category || "";
                    tagsInput.value = geminiData.tags || "";
                }
            } catch (error) {
                console.error("Error fetching Gemini data:", error);
                alert("An error occurred while fetching additional data.");
            }
        } else {
            alert("Could not determine the title of the page.");
        }
    };
    buttonContainer.appendChild(autoButton);

    let showButton = document.createElement("button");
    showButton.innerText = "Show";
    showButton.classList.add("action-button");
    showButton.onclick = function () {
        let newWindow = window.open("", "_blank");
        newWindow.document.write(
            "<html><head><title>Selected Content</title></head><body><pre>" +
            JSON.stringify(
                {
                    title: titleInput.value,
                    url: urlInput.value,
                    image: imageUrlInput.value,
                    description: descriptionTextarea.value,
                    content: contentTextarea.value,
                    category: categoryInput.value,
                    tags: tagsInput.value.split(",").map((tag) => tag.trim()),
                    genre: genreInput.value,
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
    closeButton.classList.add("action-button");
    closeButton.onclick = function () {
        container.remove();
    };
    buttonContainer.appendChild(closeButton);

    async function sendDataToGitHub(data) {
        const apiUrl = "https://chatai-flame-eta.vercel.app/api/send-to-github";
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const responseData = await response.json();
                alert(responseData.message);
            } else {
                const errorData = await response.json();
                console.error("Error sending data to GitHub:", errorData);
                alert("Error sending data to GitHub. Check console for details.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Check console for details.");
        }
    }

    // Add fields to the container
    container.appendChild(titleField);
    container.appendChild(urlField);
    container.appendChild(imageUrlField);
    container.appendChild(descriptionField);
    container.appendChild(contentField);
    container.appendChild(categoryField);
    container.appendChild(tagsField);
    container.appendChild(genreField);

    document.body.appendChild(container);
    container.style.display = "block";
}();
