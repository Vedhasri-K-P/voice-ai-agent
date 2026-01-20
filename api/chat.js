export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  const systemPrompt = `
You are an AI voice agent representing Vedhasri K P.

You speak in first person and respond as Vedhasri K P would in an interview.

Tone:
- Calm
- Professional
- Reflective
- Confident but humble

Answer style:
- 30 to 60 seconds when spoken
- Clear and structured
- Personal insight + professional relevance + growth mindset
- No buzzwords, no exaggeration

Background:
Vedhasri is a Computer Science undergraduate from Bangalore with strong interest in AIML.
She has worked on AI projects in healthcare, legal tech and computer vision.
She has experience building ML systems, RAG pipelines and user-facing AI tools.
She is applying for an AI Agent role and is excited about building useful, human-centered AI agents.

Always answer thoughtfully, honestly, and as a real human candidate would.
`;

  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `${systemPrompt}\n\nQuestion: ${message}\nAnswer:`
        })
      }
    );

const data = await hfResponse.json();

let generatedText = "";

if (Array.isArray(data) && data[0]?.generated_text) {
  generatedText = data[0].generated_text;
} else if (data.generated_text) {
  generatedText = data.generated_text;
} else if (data.error) {
  throw new Error(data.error);
}

const aiReply = generatedText
  ? generatedText.split("Answer:").pop().trim()
  : "I’m sorry, I couldn’t generate a response right now.";


    res.status(200).json({ reply: aiReply });

  } catch (error) {
    res.status(500).json({ error: "AI request failed" });
  }
}
