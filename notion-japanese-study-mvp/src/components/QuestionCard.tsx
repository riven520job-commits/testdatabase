import { Edit3, Play, Trash2 } from "lucide-react";
import type { StudyQuestion } from "../types/question";
import { readableQuestionType } from "../utils/quiz";
import { Badge } from "./Badge";

type QuestionCardProps = {
  question: StudyQuestion;
  onStart: (question: StudyQuestion) => void;
  onEdit: (question: StudyQuestion) => void;
  onDelete?: (id: string) => void;
  showWrongCount?: boolean;
};

export function QuestionCard({ question, onStart, onEdit, onDelete, showWrongCount }: QuestionCardProps) {
  return (
    <article className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="blue">{readableQuestionType(question.type)}</Badge>
        <Badge tone="warm">{question.level}</Badge>
        <Badge>{question.category || "未分類"}</Badge>
        {question.questionTranslation ? <Badge tone="green">有翻譯</Badge> : null}
        {showWrongCount ? <Badge tone="green">錯 {question.wrongCount} 次</Badge> : null}
      </div>

      <h3 className="line-clamp-3 text-base font-semibold leading-7 text-notion-text sm:text-[1.05rem]">{question.question}</h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {question.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-notion-soft px-2.5 py-1 text-xs text-notion-muted">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button className="btn btn-primary col-span-2 sm:col-span-1" onClick={() => onStart(question)}>
          <Play size={16} />
          開始作答
        </button>
        <button className="btn" onClick={() => onEdit(question)}>
          <Edit3 size={16} />
          編輯
        </button>
        {onDelete ? (
          <button className="btn text-red-700 hover:bg-red-50" onClick={() => onDelete(question.id)}>
            <Trash2 size={16} />
            刪除
          </button>
        ) : null}
      </div>
    </article>
  );
}
