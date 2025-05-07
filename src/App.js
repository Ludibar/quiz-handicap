import { useState, useEffect } from "react";

export default function QuizApp() {
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(() => {
    const saved = localStorage.getItem("quiz-current");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem("quiz-score");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showScore, setShowScore] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("quiz-fontSize");
    return saved ? parseInt(saved, 10) : 16;
  });

  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSqCcoMWwBgsDMPCEcKsO3QjKEpCAs42wnbNiXCMIKpHmvgikNZne9umMwbAED7-_oxjaNFNOoRp8X2/pub?output=csv")
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split("\n");
        const data = lines.slice(1).map(line => {
          const values = line.split(",");
          return {
            question: values[0],
            options: values.slice(1, 5).filter(opt => opt !== ""),
            answer: parseInt(values[5], 10) - 1,
            explanation: values[6] || ""
          };
        });
        setQuiz(data);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("quiz-current", current);
    localStorage.setItem("quiz-score", score);
  }, [current, score]);

  useEffect(() => {
    localStorage.setItem("quiz-fontSize", fontSize);
  }, [fontSize]);

  const handleAnswer = (index) => {
    setSelected(index);
    if (index === quiz[current].answer) setScore(prev => prev + 1);
  };

  const handleNext = () => {
    if (current + 1 < quiz.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setShowScore(true);
      localStorage.removeItem("quiz-current");
      localStorage.removeItem("quiz-score");
    }
  };

  const increaseFont = () => setFontSize(f => Math.min(f + 2, 28));
  const decreaseFont = () => setFontSize(f => Math.max(f - 2, 12));

  if (quiz.length === 0) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Chargement du quiz...</p>;

  if (showScore) {
    const handleRestart = () => {
      setCurrent(0);
      setScore(0);
      setSelected(null);
      setShowScore(false);
      localStorage.removeItem("quiz-current");
      localStorage.removeItem("quiz-score");
    };

    return (
      <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem", textAlign: "center", border: "1px solid #ccc", borderRadius: 8, fontSize }}>
        <h2 style={{ fontSize: fontSize + 4, marginBottom: "1rem" }}>Score final</h2>
        <p style={{ fontSize }}>{score} / {quiz.length}</p>
        <button
          onClick={() => {
            if (window.confirm("Voulez-vous vraiment recommencer le quiz ?")) {
              handleRestart();
            }
          }}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#e53935",
            color: "white",
            border: "none",
            borderRadius: 4,
            fontSize,
            cursor: "pointer"
          }}
        >
          Recommencer le quiz
        </button>
      </div>
    );
  }

  const question = quiz[current];

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: 8, fontSize }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "1rem" }}>
        <button onClick={decreaseFont} style={{ padding: "0.25rem 0.5rem", fontSize }}>A-</button>
        <button onClick={increaseFont} style={{ padding: "0.25rem 0.5rem", fontSize }}>A+</button>
      </div>
      <h2 style={{ fontSize: fontSize + 2, marginBottom: "0.5rem" }}>Question {current + 1} / {quiz.length}</h2>
      <p style={{ marginBottom: "1rem" }}>{question.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={selected !== null}
            style={{
              padding: "0.75rem 1rem",
              textAlign: "left",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize,
              backgroundColor:
                selected === null ? "white" :
                idx === question.answer ? "#c8e6c9" :
                idx === selected ? "#ffcdd2" : "white",
              cursor: selected === null ? "pointer" : "default"
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected !== null && question.explanation && (
        <div style={{ marginBottom: "1rem", backgroundColor: "#f5f5f5", padding: "0.75rem", borderRadius: 4 }}>
          <strong>Explication :</strong> {question.explanation}
        </div>
      )}
      {selected !== null && (
        <button
          onClick={handleNext}
          style={{
            padding: "0.75rem 1.25rem",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 4,
            fontSize,
            cursor: "pointer"
          }}
        >
          Question suivante
        </button>
      )}
    </div>
  );
}

