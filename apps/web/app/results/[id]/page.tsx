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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Your Results</h1>
          <p className="text-lg text-gray-600">
            {question.test_type === 'academic' ? 'Academic' : 'General Training'} -
            {question.task_type === 'task1' ? ' Task 1' : ' Task 2'}
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-10 mb-8 text-center border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Overall Band Score</h2>
          <div className="inline-flex items-center justify-center w-48 h-48 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-4">
            <div className={`text-8xl font-bold ${getBandColor(score.overall_band)}`}>
              {score.overall_band}
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-700 mt-4">{getBandLabel(score.overall_band)}</div>
        </div>

        {/* Individual Scores */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Detailed Scores
          </h2>
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
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Detailed Feedback
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{score.feedback}</p>
          </div>
        </div>

        {/* Question and Answer */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Question
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-500">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{question.prompt}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{question.instructions}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Your Answer
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{submission.content}</p>
            </div>
            <div className="mt-4 flex justify-between text-sm font-medium">
              <span className="text-indigo-600">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {submission.word_count} words
              </span>
              <span className="text-purple-600">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {Math.floor(submission.time_taken / 60)}:{(submission.time_taken % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            Take Another Test
          </Link>
          <Link
            href="/profile"
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-semibold"
          >
            View Profile
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-all font-semibold"
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
    if (score >= 7) return 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-300';
    if (score >= 5) return 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-red-300';
  };

  return (
    <div className={`border-2 rounded-xl p-6 ${getColor(score)} shadow-sm hover:shadow-md transition-shadow`}>
      <h3 className="font-semibold mb-2 text-lg">{title}</h3>
      <div className="text-4xl font-bold mb-3">{score}</div>
      <p className="text-sm opacity-90 leading-relaxed">{description}</p>
    </div>
  );
}
