import type { Option, StudyQuestion } from "../types/question";
import { addDays, todayKey } from "./date";

const STORAGE_KEY = "notion-japanese-study-questions";

function makeOption(id: string, text: string): Option {
  return { id, text };
}

const now = new Date().toISOString();

export const sampleQuestions: StudyQuestion[] = [
  {
    id: "sample-1",
    type: "multiple_choice",
    question: "「苛立ち」はどのような意味を表しますか？",
    questionTranslation: "「苛立ち」可以表示哪些意思？",
    options: [
      makeOption("A", "焦躁"),
      makeOption("B", "煩躁"),
      makeOption("C", "興奮"),
      makeOption("D", "不耐煩")
    ],
    correctAnswers: ["A", "B", "D"],
    explanation: "「苛立ち」表示焦躁、煩躁、不耐煩，通常不是正面興奮的意思。",
    category: "單字",
    tags: ["N1", "情緒", "新聞"],
    level: "N1",
    source: "自己整理",
    createdAt: now,
    updatedAt: now,
    reviewCount: 0,
    wrongCount: 0,
    mastery: 0,
    nextReviewAt: todayKey()
  },
  {
    id: "sample-2",
    type: "single_choice",
    question: "「気まずい」に最も近い意味はどれですか？",
    questionTranslation: "「気まずい」最接近哪個意思？",
    options: [
      makeOption("A", "開心的"),
      makeOption("B", "尷尬的"),
      makeOption("C", "懷念的"),
      makeOption("D", "嚴肅的")
    ],
    correctAnswers: ["B"],
    explanation: "「気まずい」表示氣氛尷尬、彼此不自在。",
    category: "單字",
    tags: ["N2", "日常會話"],
    level: "N2",
    source: "自己整理",
    createdAt: now,
    updatedAt: now,
    reviewCount: 0,
    wrongCount: 0,
    mastery: 0,
    nextReviewAt: addDays(1)
  },
  {
    id: "sample-3",
    type: "single_choice",
    question: "「さすがに無理がある」の最も自然な意味はどれですか？",
    questionTranslation: "「さすがに無理がある」最自然的意思是？",
    options: [
      makeOption("A", "果然很厲害"),
      makeOption("B", "實在太勉強、太牽強"),
      makeOption("C", "完全沒問題"),
      makeOption("D", "很適合這個情況")
    ],
    correctAnswers: ["B"],
    explanation: "「さすがに無理がある」常用於吐槽或指出對方說法、計畫太牽強。",
    category: "自然表現",
    tags: ["綜藝", "會話", "吐槽"],
    level: "N1",
    source: "自己整理",
    createdAt: now,
    updatedAt: now,
    reviewCount: 0,
    wrongCount: 0,
    mastery: 0,
    nextReviewAt: todayKey()
  }
];

function isOption(value: unknown): value is Option {
  if (typeof value !== "object" || value === null) return false;
  const option = value as Record<string, unknown>;
  return typeof option.id === "string" && typeof option.text === "string";
}

export function isStudyQuestion(value: unknown): value is StudyQuestion {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  const types = ["single_choice", "multiple_choice", "short_answer", "fill_blank"];

  return (
    typeof item.id === "string" &&
    typeof item.question === "string" &&
    (item.questionTranslation === undefined || typeof item.questionTranslation === "string") &&
    typeof item.type === "string" &&
    types.includes(item.type) &&
    Array.isArray(item.options) &&
    item.options.every(isOption) &&
    Array.isArray(item.correctAnswers) &&
    item.correctAnswers.every((answer) => typeof answer === "string") &&
    typeof item.explanation === "string" &&
    typeof item.category === "string" &&
    Array.isArray(item.tags) &&
    item.tags.every((tag) => typeof tag === "string") &&
    typeof item.level === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string" &&
    typeof item.reviewCount === "number" &&
    typeof item.wrongCount === "number" &&
    typeof item.mastery === "number"
  );
}

export function validateQuestions(value: unknown): StudyQuestion[] | null {
  if (!Array.isArray(value) || !value.every(isStudyQuestion)) {
    return null;
  }
  return value;
}

export function loadQuestions(): StudyQuestion[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveQuestions(sampleQuestions);
    return sampleQuestions;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return validateQuestions(parsed) ?? sampleQuestions;
  } catch {
    return sampleQuestions;
  }
}

export function saveQuestions(questions: StudyQuestion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

export function clearQuestions(): void {
  localStorage.removeItem(STORAGE_KEY);
}
