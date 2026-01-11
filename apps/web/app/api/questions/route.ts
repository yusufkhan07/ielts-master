import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import {
  GenerateQuestionRequest,
  TestType,
  TaskType,
} from "@ieltsmaster/types";
import { z } from "zod";

const requestSchema = z.object({
  test_type: z.enum(["academic", "general"]),
  task_type: z.enum(["task1", "task2"]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);
    const { test_type, task_type } = validatedData;

    // Generate question using OpenAI or mock data
    let questionData;

    if (process.env.USE_MOCK_AI === "true") {
      // Use mock data for development/testing
      questionData = generateMockQuestion(test_type, task_type);
    } else {
      const prompt = generatePromptForQuestion(test_type, task_type);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an IELTS examiner creating authentic IELTS writing questions. Generate realistic, varied questions that match official IELTS standards.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
      });

      const generatedContent = completion.choices[0].message.content || "";
      questionData = parseQuestionResponse(
        generatedContent,
        test_type,
        task_type
      );
    }

    // Save question to database
    const { data: question, error: dbError } = await supabase
      .from("questions")
      .insert({
        test_type,
        task_type,
        prompt: questionData.prompt,
        instructions: questionData.instructions,
        word_count: task_type === "task1" ? 150 : 250,
        time_limit: task_type === "task1" ? 20 : 40,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save question" },
        { status: 500 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error generating question:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generatePromptForQuestion(
  testType: TestType,
  taskType: TaskType
): string {
  if (testType === "academic") {
    if (taskType === "task1") {
      return `Generate an IELTS Academic Writing Task 1 question. This should describe visual information (a graph, table, chart, or diagram).

      Provide:
      1. A clear description of what visual data the candidate should describe
      2. Instructions that match official IELTS format

      Format your response as:
      PROMPT: [description of the visual]
      INSTRUCTIONS: [the official-style instructions]`;
    } else {
      return `Generate an IELTS Academic Writing Task 2 essay question on a relevant contemporary topic.

      Provide:
      1. A clear essay question that presents a point of view, argument, or problem
      2. Instructions that match official IELTS format

      Format your response as:
      PROMPT: [the essay question]
      INSTRUCTIONS: [the official-style instructions]`;
    }
  } else {
    if (taskType === "task1") {
      return `Generate an IELTS General Training Writing Task 1 letter question.

      Provide:
      1. A scenario requiring the candidate to write a letter (formal, semi-formal, or informal)
      2. Instructions that match official IELTS format including bullet points of what to include

      Format your response as:
      PROMPT: [the letter scenario]
      INSTRUCTIONS: [the official-style instructions with bullet points]`;
    } else {
      return `Generate an IELTS General Training Writing Task 2 essay question on a topic of general interest.

      Provide:
      1. A clear essay question
      2. Instructions that match official IELTS format

      Format your response as:
      PROMPT: [the essay question]
      INSTRUCTIONS: [the official-style instructions]`;
    }
  }
}

function parseQuestionResponse(
  content: string,
  testType: TestType,
  taskType: TaskType
) {
  const promptMatch = content.match(/PROMPT:\s*(.+?)(?=INSTRUCTIONS:|$)/s);
  const instructionsMatch = content.match(/INSTRUCTIONS:\s*(.+?)$/s);

  return {
    prompt: promptMatch ? promptMatch[1].trim() : content,
    instructions: instructionsMatch
      ? instructionsMatch[1].trim()
      : getDefaultInstructions(testType, taskType),
  };
}

function getDefaultInstructions(
  testType: TestType,
  taskType: TaskType
): string {
  if (testType === "academic") {
    if (taskType === "task1") {
      return "Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.";
    }
    return "Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.";
  } else {
    if (taskType === "task1") {
      return "Write at least 150 words. You do NOT need to write any addresses. Begin your letter as follows: Dear...";
    }
    return "Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.";
  }
}

function generateMockQuestion(testType: TestType, taskType: TaskType) {
  const mockQuestions = {
    academic: {
      task1: {
        prompt:
          "The bar chart shows the percentage of adults in different age groups who used the internet in the UK between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        instructions: "Write at least 150 words.",
      },
      task2: {
        prompt:
          "Some people believe that university students should be required to attend classes. Others believe that going to classes should be optional for students. Discuss both these views and give your own opinion.",
        instructions:
          "Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
      },
    },
    general: {
      task1: {
        prompt:
          "You recently bought a product online, but when it arrived, it was damaged. Write a letter to the company. In your letter:\n- Explain what the product was\n- Describe the damage\n- Say what you want the company to do about it",
        instructions:
          "Write at least 150 words. You do NOT need to write any addresses. Begin your letter as follows: Dear Sir or Madam,",
      },
      task2: {
        prompt:
          "In many countries, people are now living longer than ever before. Some people say an ageing population creates problems for governments. Other people think there are benefits if society has more elderly people. To what extent do the advantages of having an ageing population outweigh the disadvantages?",
        instructions:
          "Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
      },
    },
  };

  return mockQuestions[testType][taskType];
}
