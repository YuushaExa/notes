javascript:(function(){const modal=document.createElement('div');modal.style.position='fixed';modal.style.top='10px';modal.style.right='10px';modal.style.width='300px';modal.style.height='auto';modal.style.backgroundColor='white';modal.style.border='1px solid #ccc';modal.style.boxShadow='0 0 10px rgba(0,0,0,0.5)';modal.style.zIndex='10001';modal.style.padding='10px';modal.style.display='none';document.body.appendChild(modal);const titleInput=createInput('Title'),imageInput=createInput('Image URL'),descriptionInput=createInput('Description','textarea'),contentInput=createInput('Content','textarea'),categoryInput=createInput('Category'),tagsInput=createInput('Tags (comma-separated)');const showButton=document.createElement('button');showButton.innerText='Show';showButton.onclick=showContent;modal.appendChild(showButton);const closeButton=document.createElement('button');closeButton.innerText='Close';closeButton.onclick=closeModal;modal.appendChild(closeButton);modal.appendChild(titleInput);modal.appendChild(imageInput);modal.appendChild(descriptionInput);modal.appendChild(contentInput);modal.appendChild(categoryInput);modal.appendChild(tagsInput);document.body.appendChild(modal);modal.style.display='block';function createInput(label,type='text'){const container=document.createElement('div'),inputLabel=document.createElement('label');inputLabel.innerText=label;const input=document.createElement(type==='textarea'?'textarea':'input');input.type=type;container.appendChild(inputLabel);container.appendChild(input);return container;}function showContent(){const title=titleInput.querySelector('input').value,image=imageInput.querySelector('input').value,description=descriptionInput.querySelector('textarea').value,content=contentInput.querySelector('textarea').value,category=categoryInput.querySelector('input').value,tags=tagsInput.querySelector('input').value.split(',').map(tag=>tag.trim());const jsonWindow=window.open('','_blank');jsonWindow.document.write('<html><head><title>Selected Content</title></head><body>');jsonWindow.document.write('<pre>'+JSON.stringify({title,image,description,content,category,tags},null,2)+'</pre>');jsonWindow.document.write('</body></html>');jsonWindow.document.close();}function closeModal(){modal.style.display='none';}})();
