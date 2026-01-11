'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser(profile);
        } else {
          setUser({ email: authUser.email || 'User' });
        }
      }
    }

    getUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        window.location.href = '/auth/login';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">IM</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">IELTSMaster</h1>
              <p className="text-xs text-gray-500">AI-Powered Writing Practice</p>
            </div>
          </Link>

          {/* User info and actions */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* User profile link */}
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user.full_name || user.email.split('@')[0]}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:bg-gray-400"
              >
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
