import { ArrowRight, BookOpen, ClipboardCheck, Layers, Plus, RotateCcw, Sparkles, Target, XCircle } from "lucide-react";
import type { Page } from "../App";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import type { StudyQuestion } from "../types/question";
import { isDue } from "../utils/date";
import { readableQuestionType } from "../utils/quiz";

type DashboardPageProps = {
  questions: StudyQuestion[];
  onNavigate: (page: Page) => void;
};

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="text-xs font-medium text-notion-muted sm:text-sm">{label}</div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="text-2xl font-semibold text-notion-text sm:text-3xl">{value}</div>
        {hint ? <div className="mb-1 rounded-full bg-notion-soft px-2 py-1 text-[11px] text-notion-muted">{hint}</div> : null}
      </div>
    </div>
  );
}

export function DashboardPage({ questions, onNavigate }: DashboardPageProps) {
  const dueCount = questions.filter((question) => isDue(question.nextReviewAt)).length;
  const wrongCount = questions.filter((question) => question.wrongCount > 0).length;
  const recent = [...questions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <PageHeader
        title="學習總覽"
        description="掌握今天的複習進度，或開始一場自訂模擬考。"
        action={
          <button className="btn btn-primary hidden sm:inline-flex" onClick={() => onNavigate("form")}>
            <Plus size={16} />
            新增題目
          </button>
        }
      />

      <section className="mb-5 overflow-hidden rounded-3xl bg-stone-900 text-white shadow-[0_18px_50px_rgba(28,25,23,0.16)] sm:mb-6">
        <div className="grid gap-6 px-5 py-6 sm:px-7 sm:py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-stone-200"><Sparkles size={14} /> 自訂題庫與題數</div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">準備好測試今天的實力嗎？</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">選擇分類、JLPT 等級與作答題數，完成後一次查看成績與錯題解析。</p>
          </div>
          <button className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100" onClick={() => onNavigate("mock-setup")}>
            <ClipboardCheck size={19} /> 開始模擬考 <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <StatCard label="總題目數" value={questions.length} hint="All" />
        <StatCard label="今日複習" value={dueCount} hint="Due" />
        <StatCard label="錯題數" value={wrongCount} hint="Wrong" />
        <StatCard label="N1 題目" value={questions.filter((question) => question.level === "N1").length} />
        <StatCard label="單選題" value={questions.filter((question) => question.type === "single_choice").length} />
        <StatCard label="複選題" value={questions.filter((question) => question.type === "multiple_choice").length} />
      </div>

      <section className="mt-5 grid gap-4 lg:mt-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-notion-text">最近新增</h2>
            <Layers size={18} className="text-notion-muted" />
          </div>
          {recent.length === 0 ? (
            <EmptyState title="還沒有題目" description="新增第一題後，最近新增列表會顯示在這裡。" />
          ) : (
            <div className="space-y-2.5">
              {recent.map((question) => (
                <div key={question.id} className="rounded-xl border border-notion-border bg-white p-3.5 transition hover:bg-[#fbfbfa] sm:p-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge tone="blue">{readableQuestionType(question.type)}</Badge>
                    <Badge tone="warm">{question.level}</Badge>
                  </div>
                  <div className="text-sm font-medium leading-6 text-notion-text">{question.question}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-notion-text">快速操作</h2>
            <Target size={18} className="text-notion-muted" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <button className="btn btn-primary w-full" onClick={() => onNavigate("form")}> 
              <Plus size={16} />
              新增題目
            </button>
            <button className="btn w-full" onClick={() => onNavigate("mock-setup")}>
              <ClipboardCheck size={16} />
              建立模擬考
            </button>
            <button className="btn w-full" onClick={() => onNavigate("review")}>
              <RotateCcw size={16} />
              開始今日複習
            </button>
            <button className="btn w-full" onClick={() => onNavigate("wrong")}>
              <XCircle size={16} />
              查看錯題本
            </button>
            <button className="btn w-full" onClick={() => onNavigate("questions")}>
              <BookOpen size={16} />
              查看全部題庫
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
