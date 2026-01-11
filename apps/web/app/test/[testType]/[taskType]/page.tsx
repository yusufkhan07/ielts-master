'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { TestType, TaskType, Question } from '@ieltsmaster/types';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testType = params.testType as TestType;
  const taskType = params.taskType as TaskType;

  const [question, setQuestion] = useState<Question | null>(null);
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Load question on mount
  useEffect(() => {
    async function loadQuestion() {
      try {
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test_type: testType,
            task_type: taskType,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate question');
        }

        const data = await response.json();
        setQuestion(data.question);
        setTimeLeft(data.question.time_limit * 60); // Convert to seconds
      } catch (error) {
        console.error('Error loading question:', error);
        alert('Failed to load question. Please try again.');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestion();
  }, [testType, taskType, router]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, timeLeft]);

  // Update word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [content]);

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleSubmit = async () => {
    if (!question) return;

    if (wordCount < question.word_count) {
      const confirmed = confirm(
        `You need at least ${question.word_count} words. You currently have ${wordCount}. Submit anyway?`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);

    try {
      const timeTaken = (question.time_limit * 60) - timeLeft;
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          content,
          word_count: wordCount,
          time_taken: timeTaken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      const data = await response.json();
      router.push(`/results/${data.submission_id}`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading question...</div>
      </div>
    );
  }

  if (!question) return null;

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {testType === 'academic' ? 'Academic' : 'General Training'} - {taskType === 'task1' ? 'Task 1' : 'Task 2'}
          </h1>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Question:</h2>
            <p className="text-gray-800 whitespace-pre-wrap">{question.prompt}</p>
          </div>

          <div className="bg-gray-50 p-4 mb-6 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{question.instructions}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-indigo-50 p-4 rounded">
              <div className="text-2xl font-bold text-indigo-600">{question.word_count}+</div>
              <div className="text-gray-600">Minimum words</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded">
              <div className="text-2xl font-bold text-indigo-600">{question.time_limit} min</div>
              <div className="text-gray-600">Time limit</div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
          >
            Start Writing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and word count */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-6">
            <div>
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Word Count</div>
              <div className={`text-2xl font-bold ${wordCount >= question.word_count ? 'text-green-600' : 'text-orange-600'}`}>
                {wordCount} / {question.word_count}
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Question panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Question</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{question.prompt}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{question.instructions}</p>
            </div>
          </div>

          {/* Writing panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[600px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Start typing your answer here..."
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
