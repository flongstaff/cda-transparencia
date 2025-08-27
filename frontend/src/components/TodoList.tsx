import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Implement dark/light mode toggle', completed: true },
    { id: 2, text: 'Ensure complete Spanish Argentina localization', completed: true },
    { id: 3, text: 'Add error boundaries and graceful fallbacks', completed: true },
    { id: 4, text: 'Add legal disclaimers and official source citations', completed: true },
    { id: 5, text: 'Implement anonymous whistleblower channel guidance', completed: true },
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">UX/UI Tasks</h2>
      <ul className="space-y-3">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => {}}
              className="h-5 w-5 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className={`ml-3 text-gray-700 dark:text-gray-300 ${todo.completed ? 'line-through' : ''}`}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;