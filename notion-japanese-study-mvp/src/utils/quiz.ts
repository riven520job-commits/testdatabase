import type { StudyQuestion } from "../types/question";

export function isAnswerCorrect(question: StudyQuestion, selectedAnswers: string[]): boolean {
  if (question.type === "single_choice") {
    return selectedAnswers.length === 1 && selectedAnswers[0] === question.correctAnswers[0];
  }

  if (question.type === "multiple_choice") {
    const selected = new Set(selectedAnswers);
    const correct = new Set(question.correctAnswers);

    if (selected.size !== correct.size) {
      return false;
    }

    for (const answer of selected) {
      if (!correct.has(answer)) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function readableQuestionType(type: StudyQuestion["type"]): string {
  const labels: Record<StudyQuestion["type"], string> = {
    single_choice: "單選題",
    multiple_choice: "複選題",
    short_answer: "問答題",
    fill_blank: "填空題"
  };
  return labels[type];
}
