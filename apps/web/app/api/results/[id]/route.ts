import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get submission with related data
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        questions (*),
        scores (*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    return NextResponse.json({
      submission: {
        id: submission.id,
        content: submission.content,
        word_count: submission.word_count,
        time_taken: submission.time_taken,
        submitted_at: submission.submitted_at,
      },
      question: submission.questions,
      score: submission.scores,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
