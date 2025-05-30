export const maxDuration = 60

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  title: string
  questions: QuizQuestion[]
}

export async function POST(request: Request) {
  try {
    // // Check for available environment variables
    // const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
    // console.log("Available env vars:", {
    //   GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "SET" : "NOT SET",
    //   GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? "SET" : "NOT SET",
    // })

    // if (!apiKey) {
    //   console.error("No Google API key found in environment variables")
    //   return new Response("API key not configured. Please check environment variables.", { status: 500 })
    // }

    // console.log("Using API key:", apiKey.substring(0, 10) + "...")

    const formData = await request.formData()
    const file = formData.get("pdf") as File

    if (!file) {
      return new Response("No PDF file provided", { status: 400 })
    }

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")

    const prompt = `Analyze the following PDF document and generate a comprehensive 10-question multiple choice quiz. 

Instructions:
- Create exactly 10 questions that test understanding of the key concepts, facts, and details from the document
- Each question should have 4 multiple choice options
- Questions should vary in difficulty and cover different sections of the document
- Make sure only one option is clearly correct for each question
- Include a mix of factual recall, comprehension, and application questions
- Avoid questions that are too obvious or too obscure
- Generate a descriptive title for the quiz based on the document content

Please respond with a JSON object in this exact format:
{
  "title": "Quiz title based on document content",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Make sure to include exactly 10 questions and the correctAnswer should be the index (0-3) of the correct option.`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: "application/pdf",
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }
    const apiKey = "AIzaSyA_RSx46QwFJsxjEXHfNtjhXnagQzAL4wM"
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google API Error:", errorText)
      return new Response(`Google API Error: ${response.status}`, { status: 500 })
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("Unexpected API response structure:", data)
      return new Response("Invalid response from Google API", { status: 500 })
    }

    const generatedText = data.candidates[0].content.parts[0].text

    // Extract JSON from the response
    let quiz: Quiz
    try {
      // Try to find JSON in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        quiz = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Failed to parse JSON from response:", generatedText)
      return new Response("Failed to parse quiz from AI response", { status: 500 })
    }

    // Validate the quiz structure
    if (!quiz.title || !quiz.questions || quiz.questions.length !== 10) {
      console.error("Invalid quiz structure:", quiz)
      return new Response("Invalid quiz structure generated", { status: 500 })
    }

    // Validate each question
    for (const question of quiz.questions) {
      if (
        !question.question ||
        !question.options ||
        question.options.length !== 4 ||
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3
      ) {
        console.error("Invalid question structure:", question)
        return new Response("Invalid question structure generated", { status: 500 })
      }
    }

    return Response.json(quiz)
  } catch (error) {
    console.error("Quiz generation failed:", error)
    return new Response("Quiz generation failed", { status: 500 })
  }
}
