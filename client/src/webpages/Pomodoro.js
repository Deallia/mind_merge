import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css_templates/Pomodoro.css';

const PomodoroTimer = () => {
  // State variables
  const [isActive, setIsActive] = useState(false);
  const [studyDuration, setStudyDuration] = useState(25); // Default to 25 minutes
  const [breakDuration, setBreakDuration] = useState(5); // Default to 5 minutes
  const [secondsRemaining, setSecondsRemaining] = useState(studyDuration * 60);
  const [progress, setProgress] = useState(0);
  
  // Effect for countdown and progress bar
  useEffect(() => {
    let intervalId;
    if (isActive) {
      intervalId = setInterval(() => {
        setSecondsRemaining(prevSeconds => {
          // Calculate progress and update state
          const newSeconds = Math.max(0, prevSeconds - 1);
          setProgress((1 - (newSeconds / (studyDuration * 60))) * 100);
          return newSeconds;
        });
      }, 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isActive, studyDuration]);

  // Update secondsRemaining when studyDuration or breakDuration changes
  useEffect(() => {
    setSecondsRemaining(isActive ? studyDuration * 60 : secondsRemaining);
  }, [studyDuration, breakDuration]);

  // Event handler to start or pause timer
  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  // Event handler to skip to break
  const handleSkipBreak = () => {
    setSecondsRemaining(breakDuration * 60);
    setProgress(0);
  };

  // Reset button functionality
  const handleReset = () => {
    setStudyDuration(25);
    setBreakDuration(5);
    setSecondsRemaining(25 * 60);
    setProgress(0);
    setIsActive(false);
  };

  // Format time to display
  const formatTime = (seconds) => {
    console.log(studyDuration, breakDuration,secondsRemaining);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
  
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pomodoro-timer">
      <h2 className='heading'>Pomodoro Timer: Boost Your Productivity!</h2>
      <div id='sub-container'>
      <div className="input-fields">
        <label htmlFor="studyDuration">Study Duration (minutes):</label>
        <input min="1" max="60" type="number" id="studyDuration" value={studyDuration} disabled={isActive} onChange={(e) => {setStudyDuration(parseInt(e.target.value)); setSecondsRemaining(studyDuration * 60);}} />
        <label htmlFor="breakDuration">Break Duration (minutes):</label>
        <input min="1" max="15" type="number" id="breakDuration" value={breakDuration} disabled={isActive} onChange={(e) => setBreakDuration(parseInt(e.target.value))} />
      </div>
      <div className="timer-display">
        <h3 className='time'>{formatTime(secondsRemaining)}</h3>
      </div>
      <div className="progress-bar">
        <div style={{ width: `${progress}%` }}></div>
      </div>
      <div className="controls">
        <button onClick={handleStartPause}>{isActive ? 'Pause' : 'Start'}</button>
        <button onClick={handleSkipBreak} disabled={!isActive}>Skip to Break</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
