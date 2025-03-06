import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import '../css_templates/DisplayFlashcardSet.css';


const Flashcard = () => {
  const {user,flashcard} = useParams();
  const [flashcardSet_data, setFlascardSet_Data] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState([
    // { question: 'What is the capital of France?', answer: 'Paris' },
    // { question: 'What is 2 + 2?', answer: '4' },
    // { question: 'What is the largest planet in our solar system?', answer: 'Jupiter' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  

  const currentCard = cards[currentCardIndex];

  const flipCard = () => {
    setIsFlipped(prevState => !prevState);
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1) % cards.length);
  };

  useEffect(() => {
    console.log("fl",flashcard);
      const fetchCards = async (flashcardset) => {
        console.log(flashcardset);
        try {
          const response = await axios.get(`/flashcard_${flashcardset}`);
          if (!!response.data.title) {
            console.log(response.data);
            setCards(response.data.question_answer);
            setFlascardSet_Data(response.data);
            setIsLoading(false);
            
          }
        } catch (error) {
          console.error('Error fetching resources:', error);
        }
      };
 
   if (flashcard) {
    fetchCards(parseInt(flashcard));
  }
}, [flashcard]);


  return (
    <div className="flashcard-container">
      
        {isLoading ? (
          <p id="loading">Loading...</p>
      ) : (
        <>
        <div id="info">
      <div className={`flashcard ${isFlipped ? 'flashcard-flipped' : ''}`} onClick={flipCard}>
        <div className="flashcard-inner">
        {/* {isFlipped &&( */}
          <div className="flashcard-front"> 
            <span className="flashcard-content">{currentCard.question}</span>
          </div>       
          <div className="flashcard-back">
            <span className="flashcard-content">{currentCard.answer}</span>
          </div>
        </div>
      </div>
      <div>
          <h2>Title: {flashcardSet_data.title}</h2>
          <h4>Description: {flashcardSet_data.description} </h4>
          <p>Posted by: {flashcardSet_data.posted_by}</p>
          <p>Numer of questions: {flashcardSet_data.num_questions}</p>
          </div>
      </div>
      <div className="btn-control">
      <button id="prev" onClick={handlePrevCard}> <i class="fa fa-chevron-left"></i>  Prev. Card</button>  
      <button id="next" onClick={handleNextCard}>Next Card  <i class="fa fa-chevron-right"></i></button>
      </div>
      </>
      )}
    </div>  
  );
};

export default Flashcard;
