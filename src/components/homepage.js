import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Homepage() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('/todo-list');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-yellow-50 font-sans">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl">
        <h1 className="text-center text-3xl font-bold mb-6 text-gray-800">
          Welcome to your Todo List 📝
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Stay organized and boost productivity with a simple, effective way to track your tasks and goals.
        </p>
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <img src={`${process.env.PUBLIC_URL}/todo-list-homepage.jpg`} alt="Todo List Homepage" className="rounded-md"/>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleNavigation}
            className="bg-yellow-500 hover:bg-yellow-400 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
