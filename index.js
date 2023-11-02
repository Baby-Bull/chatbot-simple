document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("input");
  inputField.addEventListener("keydown", (e) => {
    if (e.code === "Enter") {
      let input = inputField.value;
      inputField.value = "";
      output(input);
    }
  });
});


const translateSentance = async (text, srcLang, tarLang) => {
  var urlTranslate = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + srcLang + "&tl=" + tarLang + "&dt=t&q=" + encodeURI(text);
  const res = await fetch(urlTranslate)
  const resAfterTransalate = (await res.json())[0];
  const resAfterCombine = (resAfterTransalate.map(e => e[0]).join(''))
  console.log(resAfterCombine);
  return resAfterCombine;
}
const generateResponse = async (apiKey, text) => {
  const preAnswer = await translateSentance(text, 'vi', 'en');
  const data = {
    "prompt": {
      "text": preAnswer
    },
    "temperature": 0.8,
    "top_k": 40,
    "top_p": 0.95,
    "candidate_count": 1,
    "max_output_tokens": 1024,
    "stop_sequences": [],
    // the below options is used for safety topic ** open for demand **************************
    "safety_settings": [
      {
        "category": "HARM_CATEGORY_DEROGATORY",
        "threshold": "BLOCK_NONE"
      },
      {
        "category": "HARM_CATEGORY_TOXICITY",
        "threshold": "BLOCK_NONE"
      },
      {
        "category": "HARM_CATEGORY_VIOLENCE",
        "threshold": "BLOCK_NONE"
      },
      {
        "category": "HARM_CATEGORY_SEXUAL",
        "threshold": "BLOCK_NONE"
      },
      {
        "category": "HARM_CATEGORY_MEDICAL",
        "threshold": "BLOCK_NONE"
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS",
        "threshold": "BLOCK_NONE"
      }
    ]
  }
  var urlAnswer = `https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key=${apiKey}`;
  const response = await fetch(urlAnswer, {
    method: "POST",
    cache: "no-cache",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  })
  const res1 = (await response.json()).candidates[0].output
  console.log(res1);
  const finalRes = await translateSentance(res1, 'en', 'vi')
  console.log(finalRes);
  return finalRes;
}

function compare(promptsArray, repliesArray, string) {
  let reply;
  let replyFound = false;
  for (let x = 0; x < promptsArray.length; x++) {
    for (let y = 0; y < promptsArray[x].length; y++) {
      if (promptsArray[x][y] === string) {
        let replies = repliesArray[x];
        reply = replies[Math.floor(Math.random() * replies.length)];
        replyFound = true;
        // Stop inner loop when input value matches prompts
        break;
      }
    }
    if (replyFound) {
      // Stop outer loop when reply is found instead of interating through the entire array
      break;
    }
  }
  return reply;
}

const output = async (input) => {
  let product;
  product = await generateResponse(`AIzaSyBCzXc3opro24R3qAYuHeXnWXHuVCpWd-c`, input);

  // its nonsense to use *****************************************
  let tempProduct;
  let text = input.toLowerCase().replace(/[^\w\s]/gi, "").replace(/[\d]/gi, "").trim();
  text = text
    .replace(/ a /g, " ")   // 'tell me a story' -> 'tell me story'
    .replace(/i feel /g, "")
    .replace(/whats/g, "what is")
    .replace(/please /g, "")
    .replace(/ please/g, "")
    .replace(/r u/g, "are you");

  if (compare(prompts, replies, text)) {
    // Search for exact match in `prompts`
    tempProduct = compare(prompts, replies, text);
  } else if (text.match(/thank/gi)) {
    tempProduct = "You're welcome!"
  } else if (text.match(/(corona|covid|virus)/gi)) {
    // If no match, check if message contains `coronavirus`
    tempProduct = coronavirus[Math.floor(Math.random() * coronavirus.length)];
  } else {
    // If all else fails: random alternative
    tempProduct = alternative[Math.floor(Math.random() * alternative.length)];
  }
  console.log(tempProduct);
  // end of nonsense ********************************************************************


  // Update DOM
  console.log(product);
  addChat(input, product);
}

function addChat(input, product) {
  const messagesContainer = document.getElementById("messages");

  let userDiv = document.createElement("div");
  userDiv.id = "user";
  userDiv.className = "user response";
  userDiv.innerHTML = `<img src="user-top.png" class="avatar"><span>${input}</span>`;
  messagesContainer.appendChild(userDiv);

  let botDiv = document.createElement("div");
  let botImg = document.createElement("img");
  let botText = document.createElement("span");
  botDiv.id = "bot";
  botImg.src = "bot-mini.png";
  botImg.className = "avatar";
  botDiv.className = "bot response";
  botText.innerText = "Đang suy nghĩ...";
  botDiv.appendChild(botText);
  botDiv.appendChild(botImg);
  messagesContainer.appendChild(botDiv);
  // Keep messages at most recent
  messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;

  // Fake delay to seem "real"
  setTimeout(() => {
    botText.innerText = `${product}`;
    textToSpeech(product)
  }, 2000
  )

}