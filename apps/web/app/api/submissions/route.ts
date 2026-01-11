import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';
import { SubmitTestRequest } from '@ieltsmaster/types';
import { z } from 'zod';

const requestSchema = z.object({
  question_id: z.string().uuid(),
  content: z.string().min(1),
  word_count: z.number().int().positive(),
  time_taken: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);
    const { question_id, content, word_count, time_taken } = validatedData;

    // Get the question details
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (questionError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Save submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        question_id,
        content,
        word_count,
        time_taken,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission error:', submissionError);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    // Generate AI scoring or mock scores
    let scores;

    if (process.env.USE_MOCK_AI === 'true') {
      // Use mock scores for development/testing
      scores = generateMockScores(content, word_count);
    } else {
      const scoringPrompt = generateScoringPrompt(question, content);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an experienced IELTS examiner. Evaluate the writing based on the four IELTS criteria:
1. Task Achievement/Response (0-9)
2. Coherence and Cohesion (0-9)
3. Lexical Resource (0-9)
4. Grammatical Range and Accuracy (0-9)

Provide scores and detailed feedback. Be fair but thorough in your assessment.`,
          },
          {
            role: 'user',
            content: scoringPrompt,
          },
        ],
        temperature: 0.3,
      });

      const scoringResult = completion.choices[0].message.content || '';
      scores = parseScores(scoringResult);
    }

    // Calculate overall band score (average of 4 criteria)
    const overall_band = Math.round(
      ((scores.task_achievement + scores.coherence_cohesion + scores.lexical_resource + scores.grammatical_range) / 4) * 2
    ) / 2; // Round to nearest 0.5

    // Save scores
    const { data: score, error: scoreError } = await supabase
      .from('scores')
      .insert({
        submission_id: submission.id,
        task_achievement: scores.task_achievement,
        coherence_cohesion: scores.coherence_cohesion,
        lexical_resource: scores.lexical_resource,
        grammatical_range: scores.grammatical_range,
        overall_band,
        feedback: scores.feedback,
      })
      .select()
      .single();

    if (scoreError) {
      console.error('Score error:', scoreError);
      return NextResponse.json({ error: 'Failed to save scores' }, { status: 500 });
    }

    return NextResponse.json({
      submission_id: submission.id,
      score,
    });
  } catch (error) {
    console.error('Error processing submission:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateScoringPrompt(question: any, content: string): string {
  return `
QUESTION (${question.test_type} - ${question.task_type}):
${question.prompt}

INSTRUCTIONS:
${question.instructions}

CANDIDATE'S RESPONSE:
${content}

Please evaluate this IELTS writing response and provide:

1. Task Achievement/Response (0-9): [score]
   - How well does it address the task?
   - Are all parts covered?
   - Is the position clear?

2. Coherence and Cohesion (0-9): [score]
   - How well organized is it?
   - Are ideas logically sequenced?
   - Are cohesive devices used effectively?

3. Lexical Resource (0-9): [score]
   - Range of vocabulary?
   - Accuracy of word choice?
   - Appropriate register?

4. Grammatical Range and Accuracy (0-9): [score]
   - Variety of structures?
   - Accuracy of grammar?
   - Punctuation?

FEEDBACK:
Provide specific, constructive feedback on how to improve in each area.

Format your response as:
TASK_ACHIEVEMENT: [score]
COHERENCE_COHESION: [score]
LEXICAL_RESOURCE: [score]
GRAMMATICAL_RANGE: [score]
FEEDBACK: [detailed feedback]
`;
}

function parseScores(content: string) {
  const taskMatch = content.match(/TASK_ACHIEVEMENT:\s*(\d+(?:\.\d+)?)/i);
  const coherenceMatch = content.match(/COHERENCE_COHESION:\s*(\d+(?:\.\d+)?)/i);
  const lexicalMatch = content.match(/LEXICAL_RESOURCE:\s*(\d+(?:\.\d+)?)/i);
  const grammaticalMatch = content.match(/GRAMMATICAL_RANGE:\s*(\d+(?:\.\d+)?)/i);
  const feedbackMatch = content.match(/FEEDBACK:\s*(.+)$/is);

  return {
    task_achievement: taskMatch ? parseFloat(taskMatch[1]) : 5.0,
    coherence_cohesion: coherenceMatch ? parseFloat(coherenceMatch[1]) : 5.0,
    lexical_resource: lexicalMatch ? parseFloat(lexicalMatch[1]) : 5.0,
    grammatical_range: grammaticalMatch ? parseFloat(grammaticalMatch[1]) : 5.0,
    feedback: feedbackMatch ? feedbackMatch[1].trim() : 'No detailed feedback available.',
  };
}

function generateMockScores(content: string, wordCount: number) {
  // Generate realistic mock scores based on word count
  const baseScore = wordCount >= 150 ? 6.5 : 5.0;
  const variance = Math.random() * 1.5 - 0.5; // -0.5 to +1.0

  const task_achievement = Math.min(9, Math.max(4, baseScore + variance));
  const coherence_cohesion = Math.min(9, Math.max(4, baseScore + variance + 0.5));
  const lexical_resource = Math.min(9, Math.max(4, baseScore + variance - 0.5));
  const grammatical_range = Math.min(9, Math.max(4, baseScore + variance));

  return {
    task_achievement: Math.round(task_achievement * 2) / 2,
    coherence_cohesion: Math.round(coherence_cohesion * 2) / 2,
    lexical_resource: Math.round(lexical_resource * 2) / 2,
    grammatical_range: Math.round(grammatical_range * 2) / 2,
    feedback: `MOCK FEEDBACK (Development Mode):\n\nTask Achievement: Your response addresses the task with ${wordCount} words. Good attempt at covering the main points.\n\nCoherence and Cohesion: The organization of ideas is generally clear. Consider using more linking words to improve flow.\n\nLexical Resource: You demonstrate a reasonable range of vocabulary. Try to use more varied and precise word choices.\n\nGrammatical Range and Accuracy: Your grammar is generally accurate with some complexity. Focus on using a wider range of structures.\n\nOverall: This is mock feedback for development/testing. Enable real AI scoring by setting USE_MOCK_AI=false and adding an OpenAI API key.`,
  };
}
