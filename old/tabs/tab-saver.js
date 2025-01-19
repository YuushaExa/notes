let savedTabs = [];

document.getElementById('save-tabs').addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({});
  savedTabs = tabs.map(tab => ({
    title: tab.title,
    url: tab.url
  }));

  // Display saved tabs
  const tabsList = document.getElementById('tabs-list');
  tabsList.innerHTML = savedTabs
    .map(
      (tab, index) => `
      <div class="tab-item">
        <strong>${index + 1}. ${tab.title}</strong><br>
        <a href="${tab.url}" target="_blank">${tab.url}</a>
      </div>
    `
    )
    .join('');

  alert(`${savedTabs.length} tabs saved!`);
});

document.getElementById('send-to-github').addEventListener('click', async () => {
  if (savedTabs.length === 0) {
    alert("No tabs saved. Please save tabs first.");
    return;
  }

  const apiUrl = "https://chatai-flame-eta.vercel.app/api/send-tabs-to-github";
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(savedTabs),
    });

    if (response.ok) {
      const responseData = await response.json();
      alert(responseData.message);
    } else {
      const errorData = await response.json();
      console.error('Error sending data to GitHub:', errorData);
      alert('Error sending data to GitHub. Check console for details.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Check console for details.');
  }
});
