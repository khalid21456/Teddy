import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export const maxDuration = 60

const QuizSchema = z.object({
  title: z.string().describe("A descriptive title for the quiz based on the PDF content"),
  questions: z
    .array(
      z.object({
        question: z.string().describe("A clear, specific question about the PDF content"),
        options: z.array(z.string()).length(4).describe("Four multiple choice options"),
        correctAnswer: z.number().min(0).max(3).describe("Index of the correct answer (0-3)"),
      }),
    )
    .length(10)
    .describe("Exactly 10 multiple choice questions"),
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("pdf") as File

    if (!file) {
      return new Response("No PDF file provided", { status: 400 })
    }

    const result = await generateObject({
      model: google("gemini-1.5-pro"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the following PDF document and generate a comprehensive 10-question multiple choice quiz. 
              
              Instructions:
              - Create exactly 10 questions that test understanding of the key concepts, facts, and details from the document
              - Each question should have 4 multiple choice options (A, B, C, D)
              - Questions should vary in difficulty and cover different sections of the document
              - Make sure only one option is clearly correct for each question
              - Include a mix of factual recall, comprehension, and application questions
              - Avoid questions that are too obvious or too obscure
              - Generate a descriptive title for the quiz based on the document content`,
            },
            {
              type: "file",
              data: await file.arrayBuffer(),
              mimeType: "application/pdf",
            },
          ],
        },
      ],
      schema: QuizSchema,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error("Quiz generation failed:", error)
    return new Response("Quiz generation failed", { status: 500 })
  }
}
