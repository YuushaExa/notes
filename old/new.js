javascript:(function() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '10px';
    modal.style.right = '10px';
    modal.style.width = '300px';
    modal.style.height = 'auto';
    modal.style.backgroundColor = 'white';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    modal.style.zIndex = '10001';
    modal.style.padding = '10px';
    modal.style.display = 'none';
    document.body.appendChild(modal);

    const titleInput = createInput('Title');
    const urlInput = createInput('URL'); // New URL input
    const imageInput = createInput('Image URL');
    const descriptionInput = createInput('Description', 'textarea');
    const contentInput = createInput('Content', 'textarea');
    const categoryInput = createInput('Category');
    const tagsInput = createInput('Tags (comma-separated)');

    const imagePreview = document.createElement('img'); // Image preview element
    imagePreview.style.width = '80%'; // Set width to 80%
    imagePreview.style.display = 'none'; // Initially hidden
    modal.appendChild(imagePreview);

    const penButton = document.createElement('button');
    penButton.innerText = 'Pen';
    penButton.onclick = enableElementSelection; // Function to enable element selection
    modal.appendChild(penButton);

    const autoButton = document.createElement('button');
    autoButton.innerText = 'Auto';
    autoButton.onclick = fillFieldsWithMeta; // Function to fill fields
    modal.appendChild(autoButton);

    const showButton = document.createElement('button');
    showButton.innerText = 'Show';
    showButton.onclick = showContent;
    modal.appendChild(showButton);

    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.onclick = closeModal;
    modal.appendChild(closeButton);

    modal.appendChild(titleInput);
    modal.appendChild(urlInput); // Append URL input
    modal.appendChild(imageInput);
    modal.appendChild(descriptionInput);
    modal.appendChild(contentInput);
    modal.appendChild(categoryInput);
    modal.appendChild(tagsInput);

    // Event listener to update image preview when the image URL changes
    imageInput.querySelector('input').addEventListener('input', function() {
        const imageUrl = this.value;
        if (imageUrl) {
            imagePreview.src = imageUrl;
            imagePreview.style.display = 'block'; // Show the image
        } else {
            imagePreview.style.display = 'none'; // Hide the image if no URL
        }
    });

    document.body.appendChild(modal);
    modal.style.display = 'block';

      function createInput(label, type = 'text') {
        const container = document.createElement('div');
        const inputLabel = document.createElement('label');
        inputLabel.innerText = label;
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        input.type = type;
        container.appendChild(inputLabel);
        container.appendChild(input);
        return container;
    }

    function fillFieldsWithMeta() {
        const metaTags = document.getElementsByTagName('meta');
        let ogData = {};

        for (let meta of metaTags) {
            if (meta.getAttribute('property') && meta.getAttribute('property').startsWith('og:')) {
                ogData[meta.getAttribute('property').replace('og:', '')] = meta.getAttribute('content');
            }
        }

        // Fill the input fields with the retrieved OG data
        titleInput.querySelector('input').value = ogData.title || '';
        urlInput.querySelector('input').value = ogData.url || ''; // Fill URL
        descriptionInput.querySelector('textarea').value = ogData.description || '';
        imageInput.querySelector('input').value = ogData.image || '';

        // Update the image preview if an image URL is available
        if (ogData.image) {
            imagePreview.src = ogData.image;
            imagePreview.style.display = 'block'; // Show the image
        } else {
            imagePreview.style.display = 'none'; // Hide the image if no URL
        }
    }

    function showContent() {
        const title = titleInput.querySelector('input').value;
        const url = urlInput.querySelector('input').value; // Get URL
        const image = imageInput.querySelector('input').value;
        const description = descriptionInput.querySelector('textarea').value;
        const content = contentInput.querySelector('textarea').value;
        const category = categoryInput.querySelector('input').value;
        const tags = tagsInput.querySelector('input').value.split(',').map(tag => tag.trim());

        const jsonWindow = window.open('', '_blank');
        jsonWindow.document.write('<html><head><title>Selected Content</title></head><body>');
        jsonWindow.document.write('<pre>' + JSON.stringify({ title, url, image, description, content, category, tags }, null, 2) + '</pre>');
        jsonWindow.document.write('</body></html>');
        jsonWindow.document.close();
    }

    function closeModal() {
        modal.style.display = 'none';
        // Remove event listeners if needed
        document.removeEventListener('click', handleElementClick);
    }

    function enableElementSelection() {
        // Clear previous content
        contentInput.querySelector('textarea').value = '';
        
        // Add event listener to capture clicks on the document
        document.addEventListener('click', handleElementClick);
    }

function handleElementClick(event) {
    event.preventDefault(); // Prevent default action
    event.stopPropagation(); // Stop the event from bubbling up

    // Check if the clicked element is a button in the modal
    const modalButtons = modal.getElementsByTagName('button');
    for (let button of modalButtons) {
        if (button === event.target) {
            return; // Do not capture if the clicked element is a modal button
        }
    }

    // Get the clicked element
    const selectedElement = event.target.closest('div'); // Ensure we only capture divs

    if (selectedElement) {
        // Initialize an array to hold the content
        const contentArray = [];

        // Capture text content
        const textContent = selectedElement.innerText.trim();
        if (textContent) {
            contentArray.push('<p>' + textContent + '</p>'); // Wrap text in paragraph tags
        }

        // Capture image sources
        const images = selectedElement.getElementsByTagName('img');
        for (let img of images) {
            if (img.src) {
                contentArray.push('<img src="' + img.src + '" alt="Image" style="max-width: 100%; height: auto;" />'); // Add image with styling
            }
        }

        // Capture links
        const links = selectedElement.getElementsByTagName('a');
        for (let link of links) {
            if (link.href) {
                // Check if the link is a YouTube link
                if (link.href.includes('youtube.com/watch') || link.href.includes('youtu.be/')) {
                    const videoId = extractYouTubeId(link.href);
                    if (videoId) {
                        // Create a thumbnail for the YouTube video
                        const thumbnailUrl = 'https://img.youtube.com/vi/' + videoId + '/sddefault.jpg';
                        contentArray.push(`
                            <div style="position: relative; display: inline-block; cursor: pointer;">
                                <img src="${thumbnailUrl}" alt="YouTube Video" style="max-width: 100%; height: auto;" />
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; background: rgba(0, 0, 0, 0.5); padding: 10px; border-radius: 5px;">
                                    Play
                                </div>
                            </div>
                            <div style="display: none;" class="video-container" data-video-id="${videoId}"></div>
                        `);
                    }
                } else {
                    contentArray.push('<a href="' + link.href + '" target="_blank" style="color: blue; text-decoration: underline;">' + link.innerText + '</a>'); // Add link with styling
                }
            }
        }

        // Join the content into a single string
        contentInput.querySelector('textarea').value = contentArray.join('\n');

        // Add click event to the thumbnail to render the video
        const videoContainers = contentInput.querySelectorAll('.video-container');
        videoContainers.forEach(container => {
            const videoId = container.getAttribute('data-video-id');
            const thumbnail = container.previousElementSibling; // Get the thumbnail image

            thumbnail.addEventListener('click', function() {
                container.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                container.style.display = 'block'; // Show the video
                thumbnail.style.display = 'none'; // Hide the thumbnail
            });
        });

        // Remove the event listener after capturing the content
        document.removeEventListener('click', handleElementClick);
    }
}

function extractYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}


// Function to extract YouTube video ID from the 
function extractYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}





    // Append the modal to the body and display it
    document.body.appendChild(modal);
    modal.style.display = 'block';
})();
