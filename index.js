let bot = 'https://media.istockphoto.com/id/1206829856/vector/chat-bot-icon-vector-isolated-contour-symbol-illustration.jpg?b=1&s=170667a&w=0&k=20&c=roO-2ltHCxkKZjuXeYeraXH-wO95hAvREpBTkservao='
let user = 'https://icons.iconarchive.com/icons/graphicloads/flat-finance/256/person-icon.png'
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
var endpoint = 'https://api.openai.com/v1/completions';
var apiKey = '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';
let loadInterval;
var request = new XMLHttpRequest();
let messageDiv;
function loader(element) {
  element.innerText = "";
  console.log('ran here')
  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.innerText += ".";

    // If the loading indicator has reached three dots, reset it
    if (element.innerText === "....") {
      element.innerText = "";
    }
  }, 300);
}
function typeText(element, text) {
    let index = 0;
  
    function update() {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
        requestAnimationFrame(update);
      }
    }
  
    update();
  }

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}
// Define an array to store the previous messages
// Define an array to store the previous messages
// Define an array to store the previous messages
let previousMessages = [];

// ...


const handleSubmit = async (e) => {
  e.preventDefault();


  const data = new FormData(form);
 localStorage.setItem("previousMessages", JSON.stringify([{ sender: "User", text: data.get("prompt") }]));
  // Store the current message in the previousMessages array
  previousMessages.push({ sender: "User", text: data.get("prompt") });

  // Use the previousMessages array to inform the app's response
  let prompt = data.get("prompt");
  if (localStorage.getItem("previousMessages")) {
    const previousMessages = JSON.parse(localStorage.getItem("previousMessages"));
  }
  if (previousMessages.length > 1) {
    prompt += `\n\n Previous messages: \n`;
    previousMessages.forEach((message) => {
      if (message.sender === "AI") {
        prompt += `${message.text}\n`;
      } else {
        prompt += `${message.sender}: ${message.text}\n`;
      }
    });
  }

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  // to clear the textarea input
  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div
  messageDiv = document.getElementById(uniqueId);
   // messageDiv.innerHTML = "..."
  loader(messageDiv);
  
  request.open('POST', endpoint);
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('Authorization', `Bearer ${apiKey}`);
  var body = {
    model: 'text-davinci-003',
    prompt: prompt,
    temperature: 0, // Higher values means the model will take more risks.
    max_tokens: 3000, // The maximum number
  // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
};
console.log(body.prompt);
console.log(JSON.stringify(body));
request.send(JSON.stringify(body));

request.onreadystatechange = function() {
  if (request.readyState === 4 && request.status === 200) {
    // clear the loading interval

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';
    console.log(previousMessages);
    const response = JSON.parse(request.responseText);
    setTimeout(() => {
        typeText(messageDiv, response.choices[0].text);
      }, 1000);
    // store the AI's response in the previousMessages array
    previousMessages.push({ sender: "AI", text: response.choices[0].text });
  }
}
}



form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
