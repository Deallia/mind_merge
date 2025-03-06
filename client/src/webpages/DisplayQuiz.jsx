import React, { useState, useEffect } from 'react';
import "../css_templates/DisplayQuiz.css"; 
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';

const DisplayQuiz = () => {
  const {user, quiz} = useParams();
  const [quizData, setQuizData] = useState([]);
  const [currentQuestionPosition, setCurrentQuestionPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null); // State to track answer status
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [gameStarted, setGameStarted] = useState(false); 
  const [shuffledAnswers, setShuffledAnswers] = useState([]); 
 

  useEffect(() => {


    const fetchQuiz = async (quizId) => {
      console.log(quizId);
      try {
        const response = await axios.get(`/quiz_${quizId}`);
        if (!!response.data.title) {
          console.log(response.data);
          setQuestions(response.data.question_answer);
          setQuizData(response.data)
          
          setIsLoading(false)
          
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
      
    };

    // Ensure quiz is fetched only when quiz parameter changes
    if (quiz) {
      fetchQuiz(parseInt(quiz));
    }
  
  }, [quiz]); // Include quiz in the dependency array

  useEffect(() => {
  if (questions.length > 0) {
    const currentAnswers = questions[currentQuestionPosition].answers;
    shuffleAnswers(currentAnswers);
    
  }
}, [currentQuestionPosition, questions]);

 
  const shuffleAnswers = (answers) => {
    // Shuffle the order of the answer buttons
    const shuffled = shuffle(answers);
    // Set shuffled answers
    setShuffledAnswers(shuffled);
  };
  
  // Function to shuffle an array
  const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    setCurrentQuestionPosition(0);
    setScore(0);
    setShowResults(false);
    setAnswerStatus(null); // Reset answer status
    setGameStarted(true);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionPosition < questions.length - 1) {
      setCurrentQuestionPosition(currentQuestionPosition + 1);
    } else {
      setShowResults(true);
    }
    setAnswerStatus(null); // Reset answer status
  };

  const selectAnswer = (correct) => {
    if (correct) {
      setScore(score + 1);
    }
    setAnswerStatus(correct ? 'correct' : 'wrong'); // Set answer status
    // Move to next question after a delay
    setTimeout(moveToNextQuestion, 1000);
  };

  const quitGame = () => {
    setGameStarted(false);  
  };

  return (

<div id="quiz-container">
 
        {isLoading ? (
          <p>Loading...</p>
      ) : (
        <>
          {!showResults && (
            <>
              {!gameStarted ? (
              <div id = "quiz-intro"> <h1>{quizData.title}</h1>
                <h2>Quiz Description: {quizData.description}</h2>
                <h6>created by: {quizData.posted_by}</h6>
                <h3>Total Questions: {quizData.num_questions}</h3>
                <button id="startBtn" onClick={startGame}>Start Quiz</button>
              </div>
                ) : (
                <>
                 <button id="quit" onClick={quitGame}>  Quit</button>
                  {currentQuestionPosition < questions.length && (
                    <div id="qContainer">
                      <div id="qDetails">{questions[currentQuestionPosition].question}</div>
                      <div id="ansBtns" className="btnContainer">
                        {shuffledAnswers.map((answer, index) => (
                          <button
                            key={index}
                            className={`button ${answerStatus === null ? '' : answer.correct ? 'correct' : 'wrong'}`}
                            onClick={() => {selectAnswer(answer.correct);}}
                          >
                            {answer.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {showResults && (
            <div id="finalResults">
              <h2>Quiz Completed!</h2>
              <p>Your score: {score} out of {questions.length}</p>
              <button id = "startBtn" onClick={startGame}>Restart Quiz</button>
            </div>
          )}
        </>
      )}
    </div>
  );

};

export default DisplayQuiz;
