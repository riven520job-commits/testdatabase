import type { SelfRating, StudyQuestion } from "../types/question";
import { addDays } from "./date";

const reviewPlan: Record<SelfRating, { days: number; mastery: number }> = {
  again: { days: 1, mastery: 1 },
  hard: { days: 3, mastery: 2 },
  good: { days: 7, mastery: 4 },
  easy: { days: 14, mastery: 5 }
};

export function applyReviewResult(
  question: StudyQuestion,
  rating: SelfRating,
  wasCorrect: boolean
): StudyQuestion {
  const plan = reviewPlan[rating];

  return {
    ...question,
    reviewCount: question.reviewCount + 1,
    wrongCount: wasCorrect ? question.wrongCount : question.wrongCount + 1,
    mastery: plan.mastery,
    nextReviewAt: addDays(plan.days),
    updatedAt: new Date().toISOString()
  };
}

export function ratingLabel(rating: SelfRating): string {
  const labels: Record<SelfRating, string> = {
    again: "不會",
    hard: "模糊",
    good: "會",
    easy: "很熟"
  };
  return labels[rating];
}
