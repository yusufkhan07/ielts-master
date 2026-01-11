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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {testType === 'academic' ? 'Academic' : 'General Training'} - {taskType === 'task1' ? 'Task 1' : 'Task 2'}
              </h1>
              <p className="text-sm text-gray-600">Read the question carefully before starting</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 p-6 mb-6 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Question:
            </h2>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{question.prompt}</p>
          </div>

          <div className="bg-gray-50 p-6 mb-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Instructions:
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{question.instructions}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{question.word_count}+</div>
              <div className="text-gray-700 font-medium">Minimum words</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-1">{question.time_limit} min</div>
              <div className="text-gray-700 font-medium">Time limit</div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            Start Writing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with timer and word count */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-6">
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time Remaining</div>
              <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : timeLeft < 600 ? 'text-orange-600' : 'text-indigo-600'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Word Count</div>
              <div className={`text-2xl font-bold ${wordCount >= question.word_count ? 'text-green-600' : 'text-orange-600'}`}>
                {wordCount} / {question.word_count}
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Question panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Question
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 p-4 mb-4 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{question.prompt}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{question.instructions}</p>
            </div>
          </div>

          {/* Writing panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Your Answer
            </h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[600px] p-4 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-sans text-base leading-relaxed bg-white text-gray-900"
              placeholder="Start typing your answer here..."
              disabled={isSubmitting}
              autoFocus
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
