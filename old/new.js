!function() {
  // Create the main container div
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

  // Create input fields for title, URL, image URL, description, content, category, and tags
  let titleField = createField("Title");
  let urlField = createField("URL");
  let imageUrlField = createField("Image URL");
  let descriptionField = createField("Description", "textarea");
  let contentField = createField("Content", "textarea");
  let categoryField = createField("Category");
  let tagsField = createField("Tags (comma-separated)");

  // Create an image preview element
  let imagePreview = document.createElement("img");
  imagePreview.style.width = "80%";
  imagePreview.style.display = "none";
  container.appendChild(imagePreview);

  // Create button container for horizontal alignment
  let buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between"; 
  container.appendChild(buttonContainer);

  // Create a "Send" button
  let sendButton = document.createElement("button");
  sendButton.innerText = "Send";
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

    sendDataToGitHub(data);
  };
  buttonContainer.appendChild(sendButton);

  // Create a "Pen" button
  let penButton = document.createElement("button");
  penButton.innerText = "Pen";
  let isPenActive = false;
  penButton.onclick = function() {
    isPenActive = !isPenActive;
    if (isPenActive) {
      penButton.innerText = "Stop Pen";
      document.addEventListener("click", handleClick);
    } else {
      penButton.innerText = "Pen";
      document.removeEventListener("click", handleClick);
    }
  };
  buttonContainer.appendChild(penButton);

  // Create an "Auto" button
  let autoButton = document.createElement("button");
  autoButton.innerText = "Auto";
  autoButton.onclick = function() {
    let metaTags = document.getElementsByTagName("meta");
    let ogData = {};
    for (let tag of metaTags) {
      if (tag.getAttribute("property") && tag.getAttribute("property").startsWith("og:")) {
        ogData[tag.getAttribute("property").replace("og:", "")] = tag.getAttribute("content");
      }
    }

    let title = ogData.title;
    if (!title) {
      let titleTag = document.querySelector("title");
      title = titleTag ? titleTag.innerText : "";
    }
    if (!title) {
      let h1Tag = document.querySelector("h1");
      title = h1Tag ? h1Tag.innerText : "";
    }
    if (!title) {
      let h2Tag = document.querySelector("h2");
      title = h2Tag ? h2Tag.innerText : "";
    }

    // Get image from og:image, <body>, or first <img>
    let imageUrl = ogData.image;
    if (!imageUrl) {
      let bodyTag = document.querySelector("body");
      if (bodyTag) {
          let bodyStyle = getComputedStyle(bodyTag);
          imageUrl = bodyStyle.backgroundImage.slice(4, -1).replace(/['"]/g, ""); 
      }
    }
    if (!imageUrl) {
      let firstImage = document.querySelector("img");
      imageUrl = firstImage ? firstImage.src : "";
    }
    
    titleField.querySelector("input").value = title || "";
    urlField.querySelector("input").value = window.location.href;
    descriptionField.querySelector("textarea").value = ogData.description || "";
    imageUrlField.querySelector("input").value = imageUrl || "";
    if (ogData.image) {
      imagePreview.src = ogData.image;
      imagePreview.style.display = "block";
    } else {
      imagePreview.style.display = "none";
    }
  };
  buttonContainer.appendChild(autoButton);

  // Create a "Show" button
  let showButton = document.createElement("button");
  showButton.innerText = "Show";
  showButton.onclick = function() {
    let title = titleField.querySelector("input").value;
    let url = urlField.querySelector("input").value;
    let imageUrl = imageUrlField.querySelector("input").value;
    let description = descriptionField.querySelector("textarea").value;
    let content = contentField.querySelector("textarea").value;
    let category = categoryField.querySelector("input").value;
    let tags = tagsField.querySelector("input").value.split(",").map(tag => tag.trim());
    let newWindow = window.open("", "_blank");
    newWindow.document.write("<html><head><title>Selected Content</title></head><body>");
    newWindow.document.write("<pre>" + JSON.stringify({
      title: title,
      url: url,
      image: imageUrl,
      description: description,
      content: content,
      category: category,
      tags: tags
    }, null, 2) + "</pre>");
    newWindow.document.write("</body></html>");
    newWindow.document.close();
  };
  buttonContainer.appendChild(showButton);

  // Create a "Close" button
  let closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.onclick = function() {
    container.style.display = "none";
    if (isPenActive) {
      document.removeEventListener("click", handleClick);
      isPenActive = false;
      penButton.innerText = "Pen";
    }
  };
  buttonContainer.appendChild(closeButton);

  // Helper function to create input fields
  function createField(label, type = "text") {
    let fieldContainer = document.createElement("div");
    let labelElement = document.createElement("label");
    labelElement.innerText = label;
    let inputElement = document.createElement(type === "textarea" ? "textarea" : "input");
    inputElement.type = type;
    fieldContainer.appendChild(labelElement);
    fieldContainer.appendChild(inputElement);
    return fieldContainer;
  }

  // Function to handle clicks when "Pen" is active
  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    // Check if click event target is a button inside the panel,
    // if it is, return and dont add text to content field.
    let buttons = container.getElementsByTagName("button");
    for (let button of buttons) {
      if (button === event.target) {
        return;
      }
    }

    // Check if the clicked element is inside the main div
    let clickedDiv = event.target.closest("div");
    if (clickedDiv) {
      let extractedContent = [];
      let textContent = clickedDiv.innerText.trim();
      if (textContent) {
        extractedContent.push("<p>" + textContent + "</p>");
      }

      let images = clickedDiv.getElementsByTagName("img");
      for (let img of images) {
        if (img.src) {
          extractedContent.push('<img src="' + img.src + '" alt="Image" style="max-width: 100%; height: auto;" />');
        }
      }

      let links = clickedDiv.getElementsByTagName("a");
      for (let link of links) {
        if (link.href) {
          extractedContent.push('<a href="' + link.href + '" target="_blank" style="color: blue; text-decoration: underline;">' + link.innerText + "</a>");
        }
      }

      let contentTextArea = contentField.querySelector("textarea");
      let existingContent = contentTextArea.value.trim();
      let newContent = extractedContent.join("\n");
      contentTextArea.value = existingContent ? existingContent + "\n" + newContent : newContent;
    }
  }

  // Append all fields to the container
  container.appendChild(titleField);
  container.appendChild(urlField);
  container.appendChild(imageUrlField);
  container.appendChild(descriptionField);
  container.appendChild(contentField);
  container.appendChild(categoryField);
  container.appendChild(tagsField);

  // Update image preview when image URL changes
  imageUrlField.querySelector("input").addEventListener("input", function() {
    let imageUrl = this.value;
    if (imageUrl) {
      imagePreview.src = imageUrl;
      imagePreview.style.display = "block";
    } else {
      imagePreview.style.display = "none";
    }
  });

  // Show the container initially
  document.body.appendChild(container);
  container.style.display = "block";

// GitHub API interaction (Modified to handle Unicode characters)
async function sendDataToGitHub(data) {
  const token = "githTOKEN"; // Replace with your actual token
  const repoOwner = "YuushaExa"; // Replace with your GitHub username
  const repoName = "notes"; // Replace with your repository name
  const filePath = "notes.json"; // The path to your notes file
  const branch = "main"; // The branch you're working on
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

  try {
    // Get the current file content and SHA
    const response = await fetch(apiUrl + `?ref=${branch}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    const fileData = await response.json();
    const currentContent = JSON.parse(atob(fileData.content));

    // Add new data to the array
    currentContent.push(data);

    // Encode the JSON string to UTF-8
    const textEncoder = new TextEncoder();
    const utf8EncodedData = textEncoder.encode(JSON.stringify(currentContent, null, 2));

    // Convert the UTF-8 encoded byte array to a base64 string
    const base64EncodedString = btoa(String.fromCharCode(...utf8EncodedData));

    // Update the file
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
      alert("Error sending data to GitHub. Check console for details.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Check console for details.");
  }
}

  document.body.appendChild(container);
  container.style.display = "block";
}();
