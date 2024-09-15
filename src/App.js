import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './components/homepage';
import TodoList from './components/todo-list';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/todo-list" element={<TodoList />} />
    </Routes>
  );
}

export default App;
