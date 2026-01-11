'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { GetResultsResponse } from '@ieltsmaster/types';
import Link from 'next/link';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [results, setResults] = useState<GetResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch(`/api/results/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to load results');
        }

        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error loading results:', error);
        alert('Failed to load results. Please try again.');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  if (!results) return null;

  const { submission, question, score } = results;

  const getBandColor = (band: number) => {
    if (band >= 7) return 'text-green-600';
    if (band >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBandLabel = (band: number) => {
    if (band >= 8) return 'Excellent';
    if (band >= 7) return 'Good';
    if (band >= 6) return 'Competent';
    if (band >= 5) return 'Modest';
    return 'Limited';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Results</h1>
          <p className="text-gray-600">
            {question.test_type === 'academic' ? 'Academic' : 'General Training'} -
            {question.task_type === 'task1' ? ' Task 1' : ' Task 2'}
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Overall Band Score</h2>
          <div className={`text-7xl font-bold ${getBandColor(score.overall_band)} mb-2`}>
            {score.overall_band}
          </div>
          <div className="text-xl text-gray-600">{getBandLabel(score.overall_band)}</div>
        </div>

        {/* Individual Scores */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Scores</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ScoreCard
              title="Task Achievement"
              score={score.task_achievement}
              description="How well you addressed the task requirements"
            />
            <ScoreCard
              title="Coherence and Cohesion"
              score={score.coherence_cohesion}
              description="Organization and flow of ideas"
            />
            <ScoreCard
              title="Lexical Resource"
              score={score.lexical_resource}
              description="Range and accuracy of vocabulary"
            />
            <ScoreCard
              title="Grammatical Range and Accuracy"
              score={score.grammatical_range}
              description="Variety and correctness of grammar"
            />
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Detailed Feedback</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{score.feedback}</p>
          </div>
        </div>

        {/* Question and Answer */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Question</h3>
            <div className="bg-blue-50 p-4 rounded mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{question.prompt}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{question.instructions}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Answer</h3>
            <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Words: {submission.word_count}</span>
              <span>Time: {Math.floor(submission.time_taken / 60)}:{(submission.time_taken % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Take Another Test
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score, description }: { title: string; score: number; description: string }) {
  const getColor = (score: number) => {
    if (score >= 7) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getColor(score)}`}>
      <h3 className="font-semibold mb-1">{title}</h3>
      <div className="text-3xl font-bold mb-2">{score}</div>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}
