"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, FileText, Brain } from "lucide-react"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  title: string
  questions: Question[]
}

export default function PDFQuizGenerator() {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    try {
      setLoading(true)
      setQuiz(null)
      setSelectedAnswers({})
      setShowResults(false)

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const generatedQuiz = await response.json()
        setQuiz(generatedQuiz)
      } else {
        console.error("Quiz generation failed")
      }
    } catch (error) {
      console.error("Quiz generation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const calculateScore = () => {
    if (!quiz) return 0
    let correct = 0
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const handleShowResults = () => {
    setShowResults(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PDF Quiz Generator</h1>
          <p className="text-lg text-gray-600">Upload a PDF and generate an intelligent multiple choice quiz</p>
        </div>

        {!quiz && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload PDF Document
              </CardTitle>
              <CardDescription>
                Upload a PDF file to automatically generate a 10-question multiple choice quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="pdf">PDF File</Label>
                  <Input id="pdf" name="pdf" type="file" accept="application/pdf" required className="mt-1" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {quiz && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>Answer all 10 questions and click "Show Results" to see your score</CardDescription>
              </CardHeader>
            </Card>

            {quiz.questions.map((question, questionIndex) => (
              <Card key={questionIndex}>
                <CardHeader>
                  <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                  <CardDescription className="text-base font-medium text-gray-900">{question.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedAnswers[questionIndex]?.toString()}
                    onValueChange={(value) => handleAnswerChange(questionIndex, Number.parseInt(value))}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                          showResults
                            ? optionIndex === question.correctAnswer
                              ? "bg-green-50 border-green-200"
                              : selectedAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer
                                ? "bg-red-50 border-red-200"
                                : "bg-gray-50 border-gray-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`q${questionIndex}-option${optionIndex}`}
                          disabled={showResults}
                        />
                        <Label htmlFor={`q${questionIndex}-option${optionIndex}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                        {showResults && optionIndex === question.correctAnswer && (
                          <span className="text-green-600 font-semibold">✓ Correct</span>
                        )}
                        {showResults &&
                          selectedAnswers[questionIndex] === optionIndex &&
                          optionIndex !== question.correctAnswer && (
                            <span className="text-red-600 font-semibold">✗ Wrong</span>
                          )}
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-4">
              {!showResults && (
                <Button
                  onClick={handleShowResults}
                  className="flex-1"
                  disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                >
                  Show Results
                </Button>
              )}

              {showResults && (
                <Card className="flex-1">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Your Score</h3>
                      <p className="text-4xl font-bold text-blue-600">
                        {calculateScore()}/{quiz.questions.length}
                      </p>
                      <p className="text-gray-600 mt-2">
                        {Math.round((calculateScore() / quiz.questions.length) * 100)}% Correct
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={() => {
                  setQuiz(null)
                  setSelectedAnswers({})
                  setShowResults(false)
                }}
                variant="outline"
                className="flex-1"
              >
                Generate New Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
