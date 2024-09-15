import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Homepage() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/todo-list');
  };

  return (
    <div className="flex justify-center h-screen bg-yellow-50">
      <div className="m-8 justify-center">
        <h1 className="flex justify-center text-4xl m-6">Welcome to your Todo List 📝</h1>
        <p className="flex justify-center mt-8">
          Stay organized and boost productivity with a simple, effective way to track your tasks and goals.
        </p>
        <div className="flex justify-between mt-14">
          <div>
            <img className="rounded-lg" src="http://placekitten.com/200/300" alt="placeholder kitten"/>
            <p className="flex justify-center">Highlight!</p>
          </div>
          <div>
            <img className="rounded-lg" src="http://placekitten.com/200/300" alt="placeholder kitten"/>
            <p className="flex justify-center">Highlight!</p>
          </div>
          <div>
            <img className="rounded-lg" src="http://placekitten.com/200/300" alt="placeholder kitten"/>
            <p className="flex justify-center">Highlight!</p>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNavigation}
            className="bg-yellow-500 hover:bg-yellow-300 text-white font-bold py-2 px-4 rounded"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
