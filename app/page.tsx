"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, FileText, Brain, Award, RotateCcw } from "lucide-react"
import Image from "next/image"
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

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage === 100) return "Perfect! Outstanding work! 🎉"
    if (percentage >= 80) return "Excellent job! Well done! 🌟"
    if (percentage >= 60) return "Good effort! Keep it up! 👍"
    return "Keep practicing! You'll improve! 💪"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Teddy Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-24 h-24  flex items-center justify-center">
              <span className="text-2xl"><Image src="/image.png" alt="Description" width={300} height={300} /></span>
            </div>
            <div>
              <h1 style={{fontFamily:"Fredoka One"}} className="text-5xl font-bold text-[#F97A00]">
                Teddy
              </h1>
              <p className="text-sm font-bold text-green-600">Quiz Generator</p>
            </div>
          </div>
          <p style={{fontFamily:"Quicksand",fontWeight:"bold"}} className="text-lg text-gray-800 max-w-2xl mx-auto">
            Upload your PDF documents and let Teddy create intelligent multiple choice quizzes to test your knowledge
          </p>
        </div>

        {!quiz && (
          <Card className="mb-8 border-2 border-orange-100 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#F97A00] to-[#D5451B] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Upload className="w-6 h-6" />
                </div>
                Upload PDF Document
              </CardTitle>
              <CardDescription className="text-orange-100">
                Upload a PDF file to automatically generate a comprehensive 10-question multiple choice quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pdf" className="text-gray-800 font-medium">
                    Select PDF File
                  </Label>
                  <div className="relative">
                    <Input 
                      id="pdf" 
                      name="pdf" 
                      type="file" 
                      accept="application/pdf" 
                      required 
                      className="border-2 border-orange-200 focus:border-[#F97A00] focus:ring-[#F97A00] h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#F97A00] hover:file:bg-orange-100" 
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    const fileInput = document.getElementById('pdf') as HTMLInputElement;
                    if (fileInput?.files?.[0]) {
                      const formData = new FormData();
                      formData.append('pdf', fileInput.files[0]);
                      handleSubmit(formData);
                    }
                  }}
                  disabled={loading} 
                  className="w-full h-12 bg-gradient-to-r from-[#F97A00] to-[#D5451B] hover:from-[#D5451B] hover:to-[#F97A00] text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Brain className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Quiz...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Generate Quiz with Teddy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {quiz && (
          <div className="space-y-6">
            <Card className="border-2 border-orange-100 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#F97A00] to-[#D5451B] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Brain className="w-6 h-6" />
                  </div>
                  {quiz.title}
                </CardTitle>
                <CardDescription className="text-orange-100 flex items-center gap-2">
                  <span>Answer all 10 questions and click "Show Results" to see your score</span>
                  <div className="ml-auto flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">{Object.keys(selectedAnswers).length}/10</span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {quiz.questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="border-l-4 border-l-[#F97A00] shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#F97A00] to-[#D5451B] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {questionIndex + 1}
                    </div>
                    Question {questionIndex + 1}
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-gray-800 ml-11 leading-relaxed">
                    {question.question}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <RadioGroup
                    value={selectedAnswers[questionIndex]?.toString()}
                    onValueChange={(value) => handleAnswerChange(questionIndex, Number.parseInt(value))}
                    className="space-y-3"
                  >
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          showResults
                            ? optionIndex === question.correctAnswer
                              ? "bg-green-50 border-green-300 shadow-md"
                              : selectedAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer
                                ? "bg-red-50 border-red-300 shadow-md"
                                : "bg-gray-50 border-gray-200"
                            : selectedAnswers[questionIndex] === optionIndex
                              ? "bg-orange-50 border-[#F97A00] shadow-md"
                              : "hover:bg-orange-50 hover:border-orange-200 border-gray-200"
                        }`}
                      >
                        <RadioGroupItem
                          value={optionIndex.toString()}
                          id={`q${questionIndex}-option${optionIndex}`}
                          disabled={showResults}
                          className="data-[state=checked]:bg-[#F97A00] data-[state=checked]:border-[#F97A00]"
                        />
                        <Label 
                          htmlFor={`q${questionIndex}-option${optionIndex}`} 
                          className="flex-1 cursor-pointer font-medium text-gray-800 leading-relaxed"
                        >
                          {option}
                        </Label>
                        {showResults && optionIndex === question.correctAnswer && (
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                            Correct
                          </div>
                        )}
                        {showResults &&
                          selectedAnswers[questionIndex] === optionIndex &&
                          optionIndex !== question.correctAnswer && (
                            <div className="flex items-center gap-2 text-red-600 font-semibold">
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                ✗
                              </div>
                              Wrong
                            </div>
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
                  className="flex-1 h-12 bg-gradient-to-r from-[#F97A00] to-[#D5451B] hover:from-[#D5451B] hover:to-[#F97A00] text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                >
                  <Award className="w-5 h-5 mr-2" />
                  Show Results
                </Button>
              )}

              {showResults && (
                <Card className="flex-1 border-2 border-orange-100 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-[#F97A00] to-[#D5451B] rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Final Score</h3>
                        <p className={`text-5xl font-bold ${getScoreColor(calculateScore(), quiz.questions.length)} mb-2`}>
                          {calculateScore()}/{quiz.questions.length}
                        </p>
                        <p className="text-xl font-semibold text-gray-600">
                          {Math.round((calculateScore() / quiz.questions.length) * 100)}% Correct
                        </p>
                        <p className="text-lg text-gray-600 mt-3 font-medium">
                          {getScoreMessage(calculateScore(), quiz.questions.length)}
                        </p>
                      </div>
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
                className="flex-1 h-12 border-2 border-[#F97A00] text-[#F97A00] hover:bg-[#F97A00] hover:text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Generate New Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
