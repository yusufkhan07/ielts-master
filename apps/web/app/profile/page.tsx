'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Submission {
  id: string;
  submitted_at: string;
  word_count: number;
  question: {
    test_type: string;
    task_type: string;
  };
  scores: {
    overall_band: number;
  } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
      }

      // Get submissions with scores
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select(`
          id,
          submitted_at,
          word_count,
          question:questions(test_type, task_type),
          scores(overall_band)
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (submissionsData) {
        setSubmissions(submissionsData as any);
      }

      setIsLoading(false);
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName || null })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } else {
      setProfile({ ...profile, full_name: fullName || null });
      setIsEditing(false);
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Profile not found</div>
      </div>
    );
  }

  const avgScore = submissions.length > 0
    ? submissions
        .filter(s => s.scores)
        .reduce((sum, s) => sum + (s.scores?.overall_band || 0), 0) /
      submissions.filter(s => s.scores).length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.full_name || profile.email.split('@')[0]}
                </h1>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>

          {/* Edit Profile */}
          {isEditing ? (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(profile.full_name || '');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t pt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-indigo-600">{submissions.length}</div>
            <div className="text-gray-600">Total Submissions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-indigo-600">
              {avgScore > 0 ? avgScore.toFixed(1) : '-'}
            </div>
            <div className="text-gray-600">Average Score</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-indigo-600">
              {submissions.reduce((sum, s) => sum + s.word_count, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Words Written</div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Submissions</h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No submissions yet</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Start Your First Test
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/results/${submission.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {(submission.question as any).test_type === 'academic' ? 'Academic' : 'General'} -
                        {(submission.question as any).task_type === 'task1' ? ' Task 1' : ' Task 2'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(submission.submitted_at).toLocaleDateString()} at{' '}
                        {new Date(submission.submitted_at).toLocaleTimeString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {submission.word_count} words
                      </div>
                    </div>
                    {submission.scores && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {submission.scores.overall_band}
                        </div>
                        <div className="text-xs text-gray-500">Band Score</div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
