const micBtn = document.getElementById("micBtn");
const userText = document.getElementById("userText");
const aiText = document.getElementById("aiText");

// Check browser support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Sorry, your browser does not support Speech Recognition. Please use Chrome or Edge.");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

micBtn.addEventListener("click", () => {
  userText.textContent = "Listening...";
  aiText.textContent = "Waiting for your question...";
  recognition.start();
});

// When speech is successfully recognized
recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  userText.textContent = transcript;
  aiText.textContent = "Thinking...";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: transcript })
    });

    const data = await response.json();
    aiText.textContent = data.reply;

  } catch (error) {
    aiText.textContent = "Error getting AI response.";
  }
};
