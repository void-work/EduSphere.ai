
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, QuizQuestion, CareerPlan, CuratedPath, MindMapNode } from "../types";

export interface LogicPuzzle {
  type: string;
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

export interface NoteEnhancement {
  summary: string;
  keyConcepts: string[];
  suggestedDifficulty: number;
}

/**
 * Utility to clean AI response text by removing potential markdown formatting
 */
const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json\n?|```/g, "").trim();
};

export const generateStudyMaterial = async (
  text: string, 
  className: string, 
  textbookName: string
): Promise<{ flashcards: Flashcard[], quiz: QuizQuestion[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an academic expert creating materials for the course "${className}" using "${textbookName}" as the primary source.
    
    TASK: Perform an ATOMIC DECOMPOSITION of the provided text. 
    1. Create a flashcard for EVERY single technical term, definition, date, formula, and key concept mentioned. 
    2. Do NOT summarize; capture the full granularity of the text. 
    3. For every card, the "source" field MUST contain a specific reference (e.g. "Section 1.2: Theory of Evolution").
    4. Generate a 5-question high-level mastery quiz.
    
    TEXT CONTENT:
    \n\n ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                source: { type: Type.STRING }
              },
              required: ["question", "answer", "source"]
            }
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["flashcards", "quiz"]
      }
    }
  });

  return JSON.parse(cleanJsonResponse(response.text || '{"flashcards":[], "quiz":[]}'));
};

export const enhanceNote = async (content: string): Promise<NoteEnhancement> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these study notes and provide a summary, key concepts, and suggested difficulty: \n\n ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedDifficulty: { type: Type.NUMBER }
        },
        required: ["summary", "keyConcepts", "suggestedDifficulty"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || "{}")) as NoteEnhancement;
};

export const mapSkillsToCareer = async (skills: string[]): Promise<CareerPlan[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Based on these skills: ${skills.join(', ')}, suggest 3 high-growth career paths and a learning plan for each.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            description: { type: Type.STRING },
            skillsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
            learningSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["role", "description", "skillsNeeded", "learningSteps"]
        }
      }
    }
  });

  return JSON.parse(cleanJsonResponse(response.text || "[]"));
};

export const generateLogicPuzzle = async (level: number): Promise<LogicPuzzle> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelToUse = level >= 12 ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  const instruction = level >= 12 
    ? "Generate a world-class International Logic Olympiad question."
    : `Generate a fun logic puzzle for a child level ${level}.`;

  const response = await ai.models.generateContent({
    model: modelToUse,
    contents: instruction,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
          hint: { type: Type.STRING }
        },
        required: ["type", "question", "options", "answer", "hint"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || "{}")) as LogicPuzzle;
};

export const generateSketch = async (concept: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `A simple, educational blackboard-style sketch explaining: ${concept}.` }] }
  });
  const base64 = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
  return base64 ? `data:image/png;base64,${base64}` : "";
};

export const generateInfographic = async (topic: string, content: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A high-end professional educational infographic about: ${topic}. CONTENT: ${content}. STYLE: Elite, minimalist commercial.` }]
    }
  });
  const base64 = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
  return base64 ? `data:image/png;base64,${base64}` : "";
};

export const generateAdImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `Hyper-realistic educational promotional image for: ${prompt}. Elite commercial aesthetic.` }]
    }
  });
  const base64 = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
  return base64 ? `data:image/png;base64,${base64}` : "";
};

/**
 * AI Curator: Generates a structured learning path for any given topic.
 */
export const generateCuratedPath = async (topic: string): Promise<CuratedPath> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a world-class educational curator. Create a structured learning roadmap for the topic: "${topic}".
    The roadmap should be professional, logical, and broken down into sequential modules.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          description: { type: Type.STRING },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                synthesis: { type: Type.STRING },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                duration: { type: Type.STRING }
              },
              required: ["title", "synthesis", "objectives", "duration"]
            }
          },
          masteryOutcome: { type: Type.STRING }
        },
        required: ["topic", "description", "modules", "masteryOutcome"]
      }
    }
  });

  return JSON.parse(cleanJsonResponse(response.text || "{}")) as CuratedPath;
};

/**
 * AI Mind Mapper: Decomposes a topic into a hierarchical semantic map.
 */
export const generateMindMapData = async (topic: string, content: string): Promise<MindMapNode> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a semantic analysis expert. Perform a deep hierarchical decomposition of the following topic and content into a structured mind map format.
    
    TOPIC: "${topic}"
    CONTENT: "${content}"
    
    Return a recursive JSON structure. Each node must have a unique 'id', a clear 'label', and an optional 'description'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          description: { type: Type.STRING },
          children: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                children: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["id", "label"]
                  }
                }
              },
              required: ["id", "label"]
            }
          }
        },
        required: ["id", "label"]
      }
    }
  });

  return JSON.parse(cleanJsonResponse(response.text || "{}")) as MindMapNode;
};
