!async function(){let e=document.createElement("div");e.classList.add("chat-container");let t=document.createElement("div");t.classList.add("messages-container"),e.appendChild(t);let a=document.createElement("textarea");a.classList.add("input-textarea"),a.placeholder="Enter your prompt here...",e.appendChild(a);let n=document.createElement("div");n.classList.add("buttons-container"),e.appendChild(n);let o=document.createElement("button");o.classList.add("run-button"),o.innerText="Run",n.appendChild(o);let r=document.createElement("button");r.classList.add("clear-button"),r.innerText="Clear",n.appendChild(r);let i=document.createElement("button");i.classList.add("close-button"),i.innerText="Close",n.appendChild(i);let l=document.createElement("div");l.classList.add("input-list-container"),n.insertBefore(l,r);let d=document.createElement("select");for(let c of(d.classList.add("input-list"),[{value:"",text:"Select a Prompt"},{value:"Fix Grammar - ",text:"Fix Grammar"},{value:"What is ",text:"What is"},{value:"Top 10 anime",text:"Top 10 anime"},{value:"Explain like I'm 5: ",text:"Explain like I'm 5"},{value:"Summarize this: ",text:"Summarize this"},{value:"Continue ",text:"Continue"}])){let s=document.createElement("option");s.value=c.value,s.text=c.text,d.appendChild(s)}d.addEventListener("change",()=>{a.value=d.value}),l.appendChild(d);let p=document.createElement("style");p.textContent=`
  .chat-container {
    position: fixed;
    top: 10px;
    right: 10px;
    width: 410px;
    height: 425px;
    background-color: #eaeff8;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 10001;
    padding: 10px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.3;
    display: none;
    color: #333;
    font-size:15px;
  }

  .messages-container {
    height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
  }

  .input-textarea {
   width: calc(100% - 20px);
  height: 50px;
  padding: 10px;
  border: 1px solid #d4dbe9;
  border-radius: 7px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  background-color: #fff;
  }

  .buttons-container {
    display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3px 0;
  }

  .run-button, .close-button, .clear-button {
    border: none;
    padding: 8px 16px; /* Adjusted padding */
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 14px; /* Unified font size */
  }

  .run-button {
    background-color: #007bff;
    color: #fff;
  }

  .run-button:hover, .run-button:disabled {
    background-color: #0056b3;
  }

  .close-button {
    background-color: #dc3545;
    color: #fff;
  }

  .close-button:hover {
    background-color: #c82333;
  }

  .clear-button {
    background-color: #6c757d;
    color: #fff;
  }

  .clear-button:hover {
    background-color: #5a6268;
  }

   .chat-container h1, .chat-container h2, .chat-container h3, .chat-container ul, .chat-container ol, .chat-container li, .chat-container strong, .chat-container em, .chat-container a, .chat-container pre, .chat-container code {
    margin-bottom: 10px;
  }

  .chat-container h1 {
    font-size: 24px;
    font-weight: bold;
  }

  .chat-container h2 {
    font-size: 20px;
    font-weight: bold;
  }

  .chat-container h3 {
    font-size: 18px;
    font-weight: bold;
  }

  .chat-container ul, .chat-container ol {
    padding-left: 20px;
  }

  .chat-container li {
    margin-bottom: 5px;
  }

  .chat-container strong {
    font-weight: bold;
  }

  .chat-container em {
    font-style: italic;
  }

  .chat-container a {
    color: #007bff;
    text-decoration: none;
  }

  .chat-container a:hover {
    text-decoration: underline;
  }

  .chat-container pre {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    padding: 10px;
    overflow-x: auto;
  }

  .chat-container code {
    font-family: 'Courier New', Courier, monospace;
    background-color: #f5f5f5;
    padding: 2px 5px;
    border: 1px solid #ddd;
  }

  .user-message {
        word-break: break-word;
      width: max-content;
  padding: 5px;
  border-radius: 10px;
  background: #ccd3ff;
  }

  .model-message {
      padding: 5px;
  background: #fdfefe;
  border-radius: 10px;
  position: relative;
  margin: 10px 0 10px 10px;
  overflow: visible;
  }

  .input-list-container {
    margin-right: 10px;
  }

  .input-list {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px; /* Match button font size */
  }
`,document.head.appendChild(p),document.body.appendChild(e),e.style.display="block";let u=[];function h(){for(let e of(t.innerHTML="",u)){let a=document.createElement("div");a.classList.add("user"===e.role?"user-message":"model-message"),a.innerHTML=formatMessage(e.parts[0].text),t.appendChild(a)}t.scrollTop=t.scrollHeight}function f(e,t){u.push({role:e,parts:[{text:t}]}),h()}async function x(e){f("user",e);let a=document.createElement("div");a.classList.add("model-message"),t.appendChild(a);try{let n=await fetch("https://chatai-flame-eta.vercel.app/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chatHistory:u})});if(!n.ok)throw Error(`HTTP error! status: ${n.status}`);let o=n.body.getReader(),r=new TextDecoder,i="";for(;;){let{done:l,value:d}=await o.read();if(l)break;let c=r.decode(d),s=c.split("\n\n").filter(e=>""!==e.trim());for(let p of s){let h=p.split(":")[0].trim();if("data"===h){let x=JSON.parse(p.substring(5).trim());x.text&&(i+=x.text,a.innerHTML=formatMessage(i))}else if("event"===h&&p.includes("end")){console.log("Stream ended");break}}}f("model",i)}catch(g){console.error("Error:",g),a.textContent="Error: "+g.message}}o.addEventListener("click",async()=>{let e=a.value.trim();if(""===e){alert("Please enter a prompt.");return}o.disabled=!0,o.innerText="Running...",await x(e),o.disabled=!1,o.innerText="Run",a.value=""}),r.addEventListener("click",()=>{u=[],h()}),i.addEventListener("click",()=>{e.remove(),p&&p.remove()})}();function formatMessage(e){let t=e;return(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=t.replace(/\\(\*|_|#|!|\[|\]|\(|\))/g,"$1")).replace(/^([^#\*\d].+)$/gm,"<p>$1</p>")).replace(/^### (.*?)$/gm,"<h3>$1</h3>")).replace(/^## (.*?)$/gm,"<h2>$1</h2>")).replace(/^# (.*?)$/gm,"<h1>$1</h1>")).replace(/^( *)(?:(\d+)\.|\*) (.*?)$/gm,(e,t,a,n)=>{let o=void 0!==a;return`${t}<${o?"ol":"ul"}>
${t}  <li>${n}</li>
${t}</${o?"ol":"ul"}>`})).replace(/(<\/ul>\n<ul>|<\/ol>\n<ol>)/g,"")).replace(/<\/li>(<\/ul>|<\/ol>)/g,"$1")).replace(/(<ul>|<\ol>)\n +<li>/g,"$1<li>")).replace(/!\[(.*?)\]\((.*?)\)/g,"<img src='$2' alt='$1'>")).replace(/\[(.*?)\]\((.*?)\)/g,"<a href='$2'>$1</a>")).replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")).replace(/\*(.*?)\*/g,"<em>$1</em>")}
