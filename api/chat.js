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

Background:
Vedhasri is a Computer Science undergraduate from Bangalore with strong interest in AI/ML.
She has worked on AI projects in healthcare, legal tech and computer vision.
She has experience building ML systems, RAG pipelines and user-friendly AI tools.
She is applying for an AI Agent role.

Always answer honestly and thoughtfully.
`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  inputs: `${systemPrompt}\n\nQuestion: ${message}\nAnswer:`,
  options: {
    wait_for_model: true
  }
}),

      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({
        reply: "The AI model is warming up. Please try again in a few seconds.",
      });
    }

    const generatedText =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : data.generated_text;

    const reply = generatedText
      ? generatedText.split("Answer:").pop().trim()
      : "Sorry, I couldn't generate a response.";

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ reply: "Server error. Please try again." });
  }
}
