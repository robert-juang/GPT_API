//import assets 
import bot from './assets/bot.svg'; 
import user from './assets/user.svg'; 

//Since we're not using react, have to target our elements manually
const form = document.querySelector('form'); 
const chatContainer = document.querySelector('#chat_container'); 

let loadInterval; 

//create a function which has three dots when it is responding to us
function loader(element){
    element.textContent = '';

    loadInterval = setInterval(() => {
      element.textContent += '.'; 
      
      if (element.textContent === '....'){
        element.textContent=''; 
      }
    }, 300) 
}

function typeText(element, text){
  let index = 0; 

  let interval = setInterval(() => {
    if (index < text.length){
      element.innerHTML += text.charAt(index); //get character under a specific index in the text that ai is going to return 
      index++;
    } else{
      clearInterval(interval); 
    }
  }, 20)
}

//generate a unique id for each message to map over them 
function generateUniqueId(){
  const timestamp = Date.now(); 
  const randomNumber = Math.random(); 
  const hexadecimalString = randomNumber.toString(16); //16 characters 

  return `id-${timestamp}-${hexadecimalString}`
}

//isAi speaking or us, value of the message, and our unique ID
function chatStripe (isAi,value, uniqueId){ 
    return (
      `
        <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
            <div class="profile"> 
              <img 
                src="${isAi ? bot : user}" 
                alt="${isAi ? 'bot' : 'user'}" 
              />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
          </div>
        </div>
      `
    ) //src if isAI true, then bot, otherwise user. For alt if isAI true, print bot, otherwise print user 
}

const handleSubmit = async (e) =>{
  e.preventDefault(); 

  const data = new FormData(form); 

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt')); 

  form.reset(); 

  //bot's chatstripe
  const uniqueId = generateUniqueId(); 
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId); 

  chatContainer.scrollTop = chatContainer.scrollHeight; 

  const messageDiv = document.getElementById(uniqueId); 

  loader(messageDiv); 

  // fetch data from server to get response from bot 
  // A Promise is an object which represents the completion or failure of asychronous operation 
  // We can use await keyword inside the async to wait for the promise  
  const response = await fetch('https://robs-codex.onrender.com', {
    method: 'POST', 
    headers: {
      'Content-Type':'application/json'
    }, 
    body: JSON.stringify({
      prompt: data.get('prompt') //data coming from our text area element on screen
    })
  })
  //after we get repsponse want to clear interval 
  clearInterval(loadInterval); 
  messageDiv.innerHTML=''; //clear the dots so we can add our message 

  if(response.ok){
    const data = await response.json(); //giving us the response from the backend 
    const parsedData = data.bot.trim(); //parse data 

    typeText(messageDiv, parsedData); //take parseData into typeText function from earlier 
  } else { //if we have an error 
    const err = await response.text(); 

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

form.addEventListener('submit',handleSubmit); 
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13){
    handleSubmit(e); 
  }
})