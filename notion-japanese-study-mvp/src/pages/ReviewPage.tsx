import { Play } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { QuestionCard } from "../components/QuestionCard";
import type { StudyQuestion } from "../types/question";
import { isDue } from "../utils/date";

type ReviewPageProps = {
  questions: StudyQuestion[];
  onStart: (question: StudyQuestion) => void;
  onEdit: (question: StudyQuestion) => void;
};

export function ReviewPage({ questions, onStart, onEdit }: ReviewPageProps) {
  const dueQuestions = questions.filter((question) => isDue(question.nextReviewAt));
  const firstQuestion = dueQuestions[0];

  return (
    <>
      <PageHeader
        title="今日複習"
        description={`今天需要複習 ${dueQuestions.length} 題。完成作答與自我評分後，系統會安排下一次複習日期。`}
        action={
          firstQuestion ? (
            <button className="btn btn-primary" onClick={() => onStart(firstQuestion)}>
              <Play size={16} />
              逐題開始
            </button>
          ) : null
        }
      />
      {dueQuestions.length === 0 ? (
        <EmptyState title="今天沒有待複習題目" description="可以去題庫新增題目，或從錯題本重新練習。" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {dueQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} onStart={onStart} onEdit={onEdit} showWrongCount />
          ))}
        </div>
      )}
    </>
  );
}
