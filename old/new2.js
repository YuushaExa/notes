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
  let style = document.createElement("style");
  style.id = "my-advanced-helper-css";
  style.textContent = `
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
               font-family: Arial,Helvetica,sans-serif;
    color: black;
    font-size: 15px;
        border-radius: 7px;
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
          width: 108%;
    display: none;
    margin-top: -11px;
    margin-left: -11px;
    max-height: 200px;
    border-radius: 7px;
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
  document.head.appendChild(style);

  let container = document.createElement("div");
  container.id = "my-advanced-helper-div"; // Main container now has an ID
  container.classList.add("main-container");
  document.body.appendChild(container);
  // Image preview
  let imagePreview = document.createElement("img");
  imagePreview.classList.add("image-preview");
  container.appendChild(imagePreview);

  // Create fields and append them to the container
  let titleField = createField("Title"),
    titleInput = titleField.querySelector("input");
  container.appendChild(titleField);

  let urlField = createField("URL"),
    urlInput = urlField.querySelector("input");
  container.appendChild(urlField);

  let imageUrlField = createField("Image URL"),
    imageUrlInput = imageUrlField.querySelector("input");
  container.appendChild(imageUrlField);

  let descriptionField = createField("Description", "textarea"),
    descriptionTextarea = descriptionField.querySelector("textarea");
  container.appendChild(descriptionField);

  let contentField = createField("Content", "textarea"),
    contentTextarea = contentField.querySelector("textarea");
  container.appendChild(contentField);

  let categoryField = createField("Category"),
    categoryInput = categoryField.querySelector("input");
  container.appendChild(categoryField);

  let tagsField = createField("Tags (comma-separated)"),
    tagsInput = tagsField.querySelector("input");
  container.appendChild(tagsField);

  let genreField = createField("Genre"),
    genreInput = genreField.querySelector("input");
  container.appendChild(genreField);

  imageUrlInput.addEventListener("input", function () {
    let imageUrl = this.value;
    if (imageUrl && isValidImageUrl(imageUrl)) {
      imagePreview.src = imageUrl;
      imagePreview.style.display = "block";
    } else {
      imagePreview.style.display = "none";
    }
  });

  // Button container
  let buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  container.appendChild(buttonContainer);

  // Send button
  let sendButton = document.createElement("button");
  sendButton.innerText = "Send";
  sendButton.classList.add("action-button");
  sendButton.onclick = function () {
    sendDataToGitHub({
      title: titleInput.value,
      url: urlInput.value,
      image: imageUrlInput.value,
      description: descriptionTextarea.value,
      content: contentTextarea.value,
      category: categoryInput.value,
      tags: tagsInput.value.split(",").map((tag) => tag.trim()),
      genre: genreInput.value,
    });
  };
  buttonContainer.appendChild(sendButton);

  // Auto button
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
    let title =
      ogData.title ||
      document.querySelector("title")?.innerText ||
      document.querySelector("h1")?.innerText ||
      document.querySelector("h2")?.innerText ||
      "";
    let imageUrl =
      ogData.image ||
      document
        .querySelector("body")
        ?.style.backgroundImage.slice(4, -1)
        .replace(/['"]/g, "") ||
      document.querySelector("img")?.src ||
      "";

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
        const geminiData = await getGeminiData(
          title,
          urlInput.value,
          descriptionTextarea.value
        );
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

  // Show button
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

  // Close button
  let closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.classList.add("action-button");
  closeButton.onclick = function () {
    // Remove container by ID
    if (container) {
      container.remove();
    }

    // Remove style element by ID
    let styleElement = document.getElementById("my-advanced-helper-css");
    if (styleElement) {
      styleElement.remove();
    }
  };
  buttonContainer.appendChild(closeButton);

  // Helper functions
  function isValidImageUrl(url) {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  async function getGeminiData(title, url, description) {
    const apiUrl = "https://chatai-flame-eta.vercel.app/api/extract-info";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          url: url,
          description: description,
        }),
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
      alert(
        "An error occurred while calling your API. Check console for details."
      );
      return null;
    }
  }

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

  // Initially display the container
  document.body.appendChild(container);
  container.style.display = "block";
}();
