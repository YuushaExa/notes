function createField(label, type = "text") {
  let fieldContainer = document.createElement("div");
  fieldContainer.classList.add("field-container");

  let labelElement = document.createElement("label");
  labelElement.innerText = label;
  labelElement.classList.add("field-label-" + label.replace(/\s+/g, ""));

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

        [class^="field-label-"] {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .field-input {
            width: calc(100% - 22px);
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

        .button-container1 {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }

        .action-button {
            padding: 5px 10px;
            background-color: #4CAF50; 
            color: white;
            border: none;
            cursor: pointer;
        }
    .image-nav-buttons {
      display: flex;
      flex-direction: column;
      margin-left: 5px;
    }
    .image-nav-button {
      margin-bottom: 3px;
      padding: 2px 6px;
      font-size: 12px;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      cursor: pointer;
    }
        @media (max-width: 768px) {
            .main-container {
                width: 90%;
                height: 90%;
                top: 5%;
                right: 5%; 
                overflow-y: auto; 
            }
        }
.review-button {
  margin-left: 5px;
}
    `;
  document.head.appendChild(style);

  let container = document.createElement("div");
  container.id = "my-advanced-helper-div";
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

  // Image URL field with navigation buttons
  let imageUrlField = createField("Image URL"),
    imageUrlInput = imageUrlField.querySelector("input");

  let imageNavButtons = document.createElement("div");
  imageNavButtons.classList.add("image-nav-buttons");

  let prevImageButton = document.createElement("button"),
    nextImageButton = document.createElement("button");
  prevImageButton.innerText = "←";
  nextImageButton.innerText = "→";
  prevImageButton.classList.add("image-nav-button");
  nextImageButton.classList.add("image-nav-button");

  imageNavButtons.appendChild(prevImageButton);
  imageNavButtons.appendChild(nextImageButton);

  imageUrlField.appendChild(imageNavButtons);
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

  // Image navigation logic
  let currentImageIndex = 0;
  let images = [];

  function updateImagePreview() {
    if (
      images.length > 0 &&
      currentImageIndex >= 0 &&
      currentImageIndex < images.length
    ) {
      imageUrlInput.value = images[currentImageIndex];
      imagePreview.src = images[currentImageIndex];
      imagePreview.style.display = "block";
    } else {
      imagePreview.style.display = "none";
    }
  }

  prevImageButton.onclick = function () {
    currentImageIndex = Math.max(0, currentImageIndex - 1);
    updateImagePreview();
  };

  nextImageButton.onclick = function () {
    currentImageIndex = Math.min(images.length - 1, currentImageIndex + 1);
    updateImagePreview();
  };

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
  buttonContainer.classList.add("button-container1");
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
    let imageUrl = ogData.image;
    let url = window.location.href;

    // YouTube-specific image handling
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1].split("&")[0];
      imageUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }

    // Image extraction
    images = [];
    currentImageIndex = 0;
    if (imageUrl) {
      images.push(imageUrl);
    }
    const pageImages = document.querySelectorAll("img");
    pageImages.forEach((img) => {
      if (
        img.src &&
        isValidImageUrl(img.src) &&
        !images.includes(img.src)
      ) {
        images.push(img.src);
      }
    });

    // Populate fields
    titleInput.value = title;
    urlInput.value = window.location.href;
    descriptionTextarea.value = ogData.description || "";
    imageUrlInput.value = imageUrl;

    // Display image preview if valid
    updateImagePreview();

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

  let reviewText = "";

// Review button
let reviewButton = document.createElement("button");
reviewButton.innerText = "Review";
reviewButton.classList.add("action-button", "review-button");
reviewButton.onclick = async function () {
  // Use DOMParser to create a temporary document for HTML parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(document.body.innerHTML, "text/html");

  // Remove all <script> and <style> tags
  doc.querySelectorAll("script, style").forEach((el) => el.remove());

  // Remove all <a> tags
  doc.querySelectorAll("a").forEach((el) => el.remove());
  doc.querySelectorAll('form[name="post"]').forEach((el) => el.remove());

  // Remove divs containing "nav"
let divs = doc.querySelectorAll("div");
  divs.forEach((div) => {
    if (
      (div.className && div.className.toLowerCase().includes("nav")) ||
      (div.id && div.id.toLowerCase().includes("nav"))
    ) {
      div.remove();
    } else if (
      (div.className && div.className.toLowerCase().includes("banner")) ||
      (div.id && div.id.toLowerCase().includes("banner")) ||
      div.textContent.toLowerCase().includes("banner")
    ) {
      div.remove();
    } else if (
    (div.className && div.className.toLowerCase().includes("message")) ||
    div.textContent.toLowerCase().includes("message")
  ) {
    div.remove();
    }
  });

  // Extract text content
  let textContent = doc.body.textContent;

  // Remove HTML tags, image names, and extra whitespace
  reviewText = textContent
    .replace(/<[^>]+>/g, "") // Remove remaining HTML tags
    .replace(/([a-zA-Z0-9_-]+(\.(jpg|png|webm|jpeg|gif)))/gi, "") // Remove image names
    .replace(/\s+/g, " ") // Replace multiple spaces with single spaces
    .trim()
    .slice(0, 2000); // Limit to 500 characters

  // Send text content to backend API for review
  try {
    const reviewData = await sendReviewDataToBackend(
      reviewText,
      urlInput.value
    );

    if (reviewData) {
      console.log("Review data:", reviewData);
      descriptionTextarea.value = reviewData.reviewedText || "";
    }
  } catch (error) {
    console.error("Error sending review data:", error);
    alert("An error occurred while sending data for review.");
  }
};

buttonContainer.appendChild(reviewButton);

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
            review: reviewText, // Include the extracted review text
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

  async function sendReviewDataToBackend(text, url) {
    const apiUrl = "https://chatai-flame-eta.vercel.app/api/review";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          url: url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from review API:", errorData);
        alert(
          "Error getting data from review API. Check console for details."
        );
        return null;
      }

      const data = await response.json();
      console.log("Review API Response:", data);
      return data;
    } catch (error) {
      console.error("Error calling review API:", error);
      alert(
        "An error occurred while calling the review API. Check console for details."
      );
      return null;
    }
  }

  // Initially display the container
  document.body.appendChild(container);
  container.style.display = "block";
}();
