import * as React from "react";
import { Plus, Search } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { QuestionCard } from "../components/QuestionCard";
import type { StudyQuestion } from "../types/question";

type QuestionListPageProps = {
  questions: StudyQuestion[];
  onAdd: () => void;
  onStart: (question: StudyQuestion) => void;
  onEdit: (question: StudyQuestion) => void;
  onDelete: (id: string) => void;
};

export function QuestionListPage({ questions, onAdd, onStart, onEdit, onDelete }: QuestionListPageProps) {
  const categories = Array.from(new Set(questions.map((question) => question.category).filter(Boolean)));
  const levels = Array.from(new Set(questions.map((question) => question.level).filter(Boolean)));
  const [filters, setFilters] = useQuestionFilters();

  const filtered = questions.filter((question) => {
    const keyword = filters.keyword.trim().toLowerCase();
    const searchable = [question.question, question.explanation, question.category, question.level, ...question.tags]
      .join(" ")
      .toLowerCase();

    return (
      (!keyword || searchable.includes(keyword)) &&
      (!filters.category || question.category === filters.category) &&
      (!filters.level || question.level === filters.level) &&
      (!filters.type || question.type === filters.type) &&
      (!filters.onlyWrong || question.wrongCount > 0)
    );
  });

  return (
    <>
      <PageHeader
        title="題庫"
        description="搜尋、篩選與管理所有單選題與複選題。"
        action={
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={16} />
            新增題目
          </button>
        }
      />

      <section className="card mb-5 p-3 sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 text-notion-muted" size={16} />
            <input
              className="form-input pl-9"
              placeholder="搜尋題目、解析、標籤"
              value={filters.keyword}
              onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
            />
          </label>
          <select
            className="form-input"
            value={filters.category}
            onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          >
            <option value="">全部分類</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="form-input"
            value={filters.level}
            onChange={(event) => setFilters({ ...filters, level: event.target.value })}
          >
            <option value="">全部難度</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <select
            className="form-input"
            value={filters.type}
            onChange={(event) => setFilters({ ...filters, type: event.target.value as StudyQuestion["type"] | "" })}
          >
            <option value="">全部題型</option>
            <option value="single_choice">單選題</option>
            <option value="multiple_choice">複選題</option>
          </select>
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-notion-border bg-white px-3 py-2 text-sm text-notion-muted sm:min-h-0">
            <input
              type="checkbox"
              checked={filters.onlyWrong}
              onChange={(event) => setFilters({ ...filters, onlyWrong: event.target.checked })}
            />
            只看錯題
          </label>
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState title="找不到題目" description="調整篩選條件，或新增一題來開始整理你的日文題庫。" />
      ) : (
        <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
          {filtered.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onStart={onStart}
              onEdit={onEdit}
              onDelete={onDelete}
              showWrongCount
            />
          ))}
        </div>
      )}
    </>
  );
}

function useQuestionFilters() {
  return React.useState<{
    keyword: string;
    category: string;
    level: string;
    type: StudyQuestion["type"] | "";
    onlyWrong: boolean;
  }>({
    keyword: "",
    category: "",
    level: "",
    type: "",
    onlyWrong: false
  });
}
