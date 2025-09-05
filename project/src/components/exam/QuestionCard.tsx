import React, { useState } from 'react';
import { Question } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer?: string | number;
  onAnswerChange: (answer: string | number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  onAnswerChange
}) => {
  const [textAnswer, setTextAnswer] = useState(
    typeof currentAnswer === 'string' ? currentAnswer : ''
  );

  const handleTextChange = (value: string) => {
    setTextAnswer(value);
    onAnswerChange(value);
  };

  const handleOptionSelect = (index: number) => {
    onAnswerChange(index);
  };

  return (
    <Card className="mb-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-blue-600">
            Question {questionNumber} sur {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {question.points} point{question.points > 1 ? 's' : ''}
          </span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.text}
        </h3>
      </div>

      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                currentAnswer === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={currentAnswer === index}
                onChange={() => handleOptionSelect(index)}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 leading-relaxed">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <div>
          <textarea
            value={textAnswer}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={6}
            placeholder="Saisissez votre réponse détaillée ici..."
          />
          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span>Développez votre réponse avec des exemples concrets</span>
            <span>{textAnswer.length} caractères</span>
          </div>
        </div>
      )}
    </Card>
  );
};