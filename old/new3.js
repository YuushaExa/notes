!function() {
    let container = document.createElement("div");
    container.style.position = "fixed",
    container.style.top = "10px",
    container.style.right = "10px",
    container.style.width = "300px",
    container.style.height = "auto",
    container.style.backgroundColor = "white",
    container.style.border = "1px solid #ccc",
    container.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)",
    container.style.zIndex = "10001",
    container.style.padding = "10px",
    container.style.display = "none",
    document.body.appendChild(container);
    let titleField = createField("Title"),
    urlField = createField("URL"),
    imageUrlField = createField("Image URL"),
    descriptionField = createField("Description", "textarea"),
    contentField = createField("Content", "textarea"),
    categoryField = createField("Category"),
    tagsField = createField("Tags (comma-separated)");
    let imagePreview = document.createElement("img");
    imagePreview.style.width = "80%",
    imagePreview.style.display = "none",
    container.appendChild(imagePreview),
    imageUrlField.querySelector("input").addEventListener("input", function() {
        let imageUrl = this.value;
        imageUrl ? (imagePreview.src = imageUrl,
        imagePreview.style.display = "block") : imagePreview.style.display = "none"
    });
    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex",
    buttonContainer.style.justifyContent = "space-between",
    container.appendChild(buttonContainer);
    let sendButton = document.createElement("button");
    sendButton.innerText = "Send",
    sendButton.onclick = function() {
        let data = {
            title: titleField.querySelector("input").value,
            url: urlField.querySelector("input").value,
            image: imageUrlField.querySelector("input").value,
            description: descriptionField.querySelector("textarea").value,
            content: contentField.querySelector("textarea").value,
            category: categoryField.querySelector("input").value,
            tags: tagsField.querySelector("input").value.split(",").map(tag => tag.trim())
        };
        sendDataToGitHub(data)
    }
    ;
    buttonContainer.appendChild(sendButton);
    let penButton = document.createElement("button");
    penButton.innerText = "Pen";
    let isPenActive = !1;
    penButton.onclick = function() {
        isPenActive = !isPenActive,
        isPenActive ? (penButton.innerText = "Stop Pen",
        document.addEventListener("click", handleClick)) : (penButton.innerText = "Pen",
        document.removeEventListener("click", handleClick))
    }
    ;
    buttonContainer.appendChild(penButton);
    let autoButton = document.createElement("button");
    function isValidImageUrl(url) {
        return url.startsWith("http://") || url.startsWith("https://")
    }
    autoButton.innerText = "Auto",
    autoButton.onclick = function() {
        let metaTags = document.getElementsByTagName("meta"), ogData = {};
        for (let tag of metaTags)
            tag.getAttribute("property") && tag.getAttribute("property").startsWith("og:") && (ogData[tag.getAttribute("property").replace("og:", "")] = tag.getAttribute("content"));
        let title = ogData.title;
        title || (title = (titleTag = document.querySelector("title")) ? titleTag.innerText : ""),
        title || (title = (h1Tag = document.querySelector("h1")) ? h1Tag.innerText : ""),
        title || (title = (h2Tag = document.querySelector("h2")) ? h2Tag.innerText : "");
        let imageUrl = ogData.image;
        imageUrl || (imageUrl = (bodyTag = document.querySelector("body")) ? getComputedStyle(bodyTag).backgroundImage.slice(4, -1).replace(/['"]/g, "") : ""),
        imageUrl || (imageUrl = (firstImage = document.querySelector("img")) ? firstImage.src : ""),
        titleField.querySelector("input").value = title || "",
        urlField.querySelector("input").value = window.location.href,
        descriptionField.querySelector("textarea").value = ogData.description || "",
        imageUrlField.querySelector("input").value = imageUrl || "",
        imageUrl && isValidImageUrl(imageUrl) ? (imagePreview.src = imageUrl,
        imagePreview.style.display = "block") : imagePreview.style.display = "none"
    }
    ;
    buttonContainer.appendChild(autoButton);
    let showButton = document.createElement("button");
    showButton.innerText = "Show",
    showButton.onclick = function() {
        let newWindow = window.open("", "_blank");
        newWindow.document.write("<html><head><title>Selected Content</title></head><body><pre>" + JSON.stringify({
            title: titleField.querySelector("input").value,
            url: urlField.querySelector("input").value,
            image: imageUrlField.querySelector("input").value,
            description: descriptionField.querySelector("textarea").value,
            content: contentField.querySelector("textarea").value,
            category: categoryField.querySelector("input").value,
            tags: tagsField.querySelector("input").value.split(",").map(tag => tag.trim())
        }, null, 2) + "</pre></body></html>"),
        newWindow.document.close()
    }
    ;
    buttonContainer.appendChild(showButton);
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close",
    closeButton.onclick = function() {
        container.style.display = "none",
        isPenActive && (document.removeEventListener("click", handleClick),
        isPenActive = !1,
        penButton.innerText = "Pen")
    }
    ;
    buttonContainer.appendChild(closeButton);
    function createField(label, type = "text") {
        let fieldContainer = document.createElement("div"), labelElement = document.createElement("label");
        labelElement.innerText = label;
        let inputElement = document.createElement("textarea" === type ? "textarea" : "input");
        return inputElement.type = type,
        fieldContainer.appendChild(labelElement),
        fieldContainer.appendChild(inputElement),
        fieldContainer
    }
    function handleClick(event) {
        event.preventDefault(),
        event.stopPropagation();
        let buttons = container.getElementsByTagName("button");
        for (let button of buttons)
            if (button === event.target)
                return;
        let clickedDiv = event.target.closest("div");
        if (clickedDiv) {
            let extractedContent = [], textContent = clickedDiv.innerText.trim();
            textContent && extractedContent.push("<p>" + textContent + "</p>");
            let images = clickedDiv.getElementsByTagName("img");
            for (let img of images)
                img.src && extractedContent.push('<img src="' + img.src + '" alt="Image" style="max-width: 100%; height: auto;" />');
            let links = clickedDiv.getElementsByTagName("a");
            for (let link of links)
                link.href && extractedContent.push('<a href="' + link.href + '" target="_blank" style="color: blue; text-decoration: underline;">' + link.innerText + "</a>");
            let contentTextArea = contentField.querySelector("textarea"), existingContent = contentTextArea.value.trim();
            contentTextArea.value = existingContent ? existingContent + "\n" + extractedContent.join("\n") : extractedContent.join("\n")
        }
    }
async function sendDataToGitHub(data) {
    const token = "TOKEN", repoOwner = "YuushaExa", repoName = "notes", filePath = "notes.json", branch = "main", apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    try {
        const response = await fetch(apiUrl + `?ref=${branch}`, {
            headers: {
                Authorization: `token ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const fileData = await response.json();

        // Decode the existing content using a more reliable method
        const currentContent = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));

        currentContent.push(data);

        // Encode the updated content using a safer method for non-Latin characters
        const textEncoder = new TextEncoder();
        const utf8EncodedData = textEncoder.encode(JSON.stringify(currentContent, null, 2));

        // Use a Uint8Array to Base64 conversion that handles all characters correctly:
        const base64EncodedString = btoa(Uint8Array.from(utf8EncodedData).reduce((data, byte) => data + String.fromCharCode(byte), ''));

        const updateResponse = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                Authorization: `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Add new note",
                content: base64EncodedString,
                sha: fileData.sha,
                branch: branch
            })
        });

        if (updateResponse.ok) {
            alert("Data sent to GitHub successfully!");
        } else {
            const errorData = await updateResponse.json();
            console.error("Error sending data to GitHub:", errorData);
            alert("Error sending data to GitHub. Check console for details.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Check console for details.");
    }
}
    container.appendChild(titleField),
    container.appendChild(urlField),
    container.appendChild(imageUrlField),
    container.appendChild(descriptionField),
    container.appendChild(contentField),
    container.appendChild(categoryField),
    container.appendChild(tagsField),
    document.body.appendChild(container),
    container.style.display = "block"
}();
