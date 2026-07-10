import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { QuestionCard } from "../components/QuestionCard";
import type { StudyQuestion } from "../types/question";

type WrongQuestionsPageProps = {
  questions: StudyQuestion[];
  onStart: (question: StudyQuestion) => void;
  onEdit: (question: StudyQuestion) => void;
};

export function WrongQuestionsPage({ questions, onStart, onEdit }: WrongQuestionsPageProps) {
  const wrongQuestions = questions.filter((question) => question.wrongCount > 0);

  return (
    <>
      <PageHeader title="錯題本" description="wrongCount 大於 0 的題目會集中在這裡，方便重新作答。" />
      {wrongQuestions.length === 0 ? (
        <EmptyState title="目前沒有錯題" description="作答錯誤後，題目會自動進入錯題本。" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {wrongQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} onStart={onStart} onEdit={onEdit} showWrongCount />
          ))}
        </div>
      )}
    </>
  );
}
