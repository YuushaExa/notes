// Function to create tabs based on categories
function createTabs(data) {
    const tabsContainer = document.getElementById('tabs-container');
    const categories = new Set(data.map(note => note.category));
    const allTab = document.createElement('button');
    allTab.innerText = 'All';
    allTab.onclick = () => displayNotes(data);
    tabsContainer.appendChild(allTab);

    categories.forEach(category => {
        const tab = document.createElement('button');
        tab.innerText = category;
        tab.onclick = () => displayNotes(data.filter(note => note.category === category));
        tabsContainer.appendChild(tab);
    });
}

// Function to display notes
function displayNotes(data) {
    const container = document.getElementById('notes-container');
    container.innerHTML = ''; // Clear previous notes
    data.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');

        noteDiv.innerHTML = `
            <h2>${note.title}</h2>
            <img src="${note.image}" alt="${note.title}" />
            <p><strong>Description:</strong> ${note.description}</p>
            <p><strong>Content:</strong> ${note.content}</p>
            <p><strong>Category:</strong> ${note.category}</p>
            <p><strong>Tags:</strong> ${note.tags.join(', ')}</p>
        `;

        container.appendChild(noteDiv);
    });
}

// Fetch JSON data from notes.json
fetch('notes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        createTabs(data);
        displayNotes(data); // Display all notes by default
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
