export type QuestionType = "single_choice" | "multiple_choice" | "short_answer" | "fill_blank";

export type Option = {
  id: string;
  text: string;
  translation?: string;
};

export type StudyQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  questionTranslation?: string;
  options: Option[];
  correctAnswers: string[];
  explanation: string;
  category: string;
  tags: string[];
  level: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  wrongCount: number;
  mastery: number;
  nextReviewAt?: string;
};

export type SelfRating = "again" | "hard" | "good" | "easy";
