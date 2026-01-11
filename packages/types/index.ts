// IELTS Test Types
export type TestType = 'academic' | 'general';
export type TaskType = 'task1' | 'task2';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Question {
  id: string;
  test_type: TestType;
  task_type: TaskType;
  prompt: string;
  instructions: string;
  word_count: number;
  time_limit: number; // in minutes
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  question_id: string;
  content: string;
  word_count: number;
  time_taken: number; // in seconds
  submitted_at: string;
}

export interface Score {
  id: string;
  submission_id: string;
  task_achievement: number; // 0-9
  coherence_cohesion: number; // 0-9
  lexical_resource: number; // 0-9
  grammatical_range: number; // 0-9
  overall_band: number; // 0-9
  feedback: string;
  created_at: string;
}

// API Request/Response Types
export interface GenerateQuestionRequest {
  test_type: TestType;
  task_type: TaskType;
}

export interface GenerateQuestionResponse {
  question: Question;
}

export interface SubmitTestRequest {
  question_id: string;
  content: string;
  word_count: number;
  time_taken: number;
}

export interface SubmitTestResponse {
  submission_id: string;
  score: Score;
}

export interface GetResultsResponse {
  submission: Submission;
  question: Question;
  score: Score;
}
