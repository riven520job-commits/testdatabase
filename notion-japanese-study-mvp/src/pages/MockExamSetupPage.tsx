import * as React from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, Shuffle } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import type { StudyQuestion } from "../types/question";

type MockExamSetupPageProps = {
  questions: StudyQuestion[];
  onBack: () => void;
  onStart: (questions: StudyQuestion[]) => void;
};

function shuffled<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function MockExamSetupPage({ questions, onBack, onStart }: MockExamSetupPageProps) {
  const available = React.useMemo(
    () => questions.filter((question) => question.type === "single_choice" || question.type === "multiple_choice"),
    [questions]
  );
  const categories = React.useMemo(
    () => Array.from(new Set(available.map((question) => question.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [available]
  );
  const levels = React.useMemo(
    () => Array.from(new Set(available.map((question) => question.level).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [available]
  );
  const [category, setCategory] = React.useState("all");
  const [level, setLevel] = React.useState("all");
  const [questionCount, setQuestionCount] = React.useState(10);

  const filtered = available.filter(
    (question) => (category === "all" || question.category === category) && (level === "all" || question.level === level)
  );
  const actualCount = Math.min(questionCount, filtered.length);

  return (
    <>
      <PageHeader
        title="建立模擬考"
        description="選擇想練習的題庫範圍，題目會自動打亂，交卷後統一公布成績。"
        action={
          <button className="btn" onClick={onBack}>
            <ArrowLeft size={16} /> 返回首頁
          </button>
        }
      />

      {available.length === 0 ? (
        <EmptyState title="沒有可用的選擇題" description="請先新增單選題或複選題，再建立模擬考。" action={<button className="btn btn-primary" onClick={onBack}>返回首頁</button>} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="card p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white"><ClipboardList size={21} /></span>
              <div>
                <h2 className="font-semibold text-notion-text">考試範圍</h2>
                <p className="mt-0.5 text-sm text-notion-muted">可依分類與難度縮小題庫</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="form-label">
                題庫分類
                <select className="form-input mt-2" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="all">全部分類</option>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="form-label">
                JLPT 等級
                <select className="form-input mt-2" value={level} onChange={(event) => setLevel(event.target.value)}>
                  <option value="all">全部等級</option>
                  {levels.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="form-label" htmlFor="exam-count">作答題數</label>
                <span className="rounded-full bg-notion-soft px-3 py-1 text-sm font-semibold text-notion-text">{actualCount} 題</span>
              </div>
              <input
                id="exam-count"
                className="w-full accent-stone-800"
                type="range"
                min={1}
                max={Math.max(1, Math.min(50, filtered.length))}
                value={actualCount || 1}
                onChange={(event) => setQuestionCount(Number(event.target.value))}
                disabled={filtered.length === 0}
              />
              <div className="mt-2 flex justify-between text-xs text-notion-muted"><span>1 題</span><span>最多 {Math.min(50, filtered.length)} 題</span></div>
            </div>
          </section>

          <aside className="card flex flex-col p-5 sm:p-6">
            <div className="rounded-2xl bg-stone-900 p-5 text-white">
              <div className="text-sm text-stone-300">符合條件</div>
              <div className="mt-2 text-4xl font-semibold">{filtered.length}</div>
              <div className="mt-1 text-sm text-stone-300">題庫中的選擇題</div>
            </div>
            <div className="my-5 space-y-3 text-sm text-notion-muted">
              <div className="flex items-center gap-2"><Shuffle size={16} /> 每次隨機排序</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} /> 交卷後顯示解析</div>
            </div>
            <button
              className="btn btn-primary mt-auto w-full"
              disabled={filtered.length === 0}
              onClick={() => onStart(shuffled(filtered).slice(0, actualCount))}
            >
              開始模擬考
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
