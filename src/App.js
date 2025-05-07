import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuizApp() {
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    fetch("/quiz.csv")
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",");
        const data = lines.slice(1).map(line => {
          const values = line.split(",");
          return {
            question: values[0],
            options: values.slice(1, 5).filter(opt => opt !== ""),
            answer: parseInt(values[5], 10) - 1
          };
        });
        setQuiz(data);
      });
  }, []);

  const handleAnswer = (index: number) => {
    setSelected(index);
    if (index === quiz[current].answer) setScore(score + 1);
    setTimeout(() => {
      if (current + 1 < quiz.length) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setShowScore(true);
      }
    }, 1000);
  };

  if (quiz.length === 0) return <p className="text-center mt-10">Chargement du quiz...</p>;

  if (showScore) {
    return (
      <Card className="max-w-xl mx-auto mt-10 p-6 text-center">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Score final</h2>
          <p className="text-lg">{score} / {quiz.length}</p>
        </CardContent>
      </Card>
    );
  }

  const question = quiz[current];

  return (
    <Card className="max-w-xl mx-auto mt-10 p-6">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Question {current + 1} / {quiz.length}</h2>
        <p className="mb-6">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((opt: string, idx: number) => (
            <Button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full justify-start ${selected !== null ? (idx === question.answer ? 'bg-green-500' : idx === selected ? 'bg-red-500' : '') : ''}`}
              disabled={selected !== null}
            >
              {opt}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

