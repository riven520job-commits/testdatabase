import * as React from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardCheck, XCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import type { StudyQuestion } from "../types/question";
import { isAnswerCorrect, readableQuestionType } from "../utils/quiz";

export type MockExamResult = {
  question: StudyQuestion;
  selectedAnswers: string[];
  correct: boolean;
};

type MockExamPageProps = {
  questions: StudyQuestion[];
  onExit: () => void;
  onComplete: (results: MockExamResult[]) => void;
};

export function MockExamPage({ questions, onExit, onComplete }: MockExamPageProps) {
  const [index, setIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<MockExamResult[]>([]);
  const [finished, setFinished] = React.useState(false);
  const question = questions[index];

  if (!question) {
    return <EmptyState title="沒有模擬考題目" description="請返回首頁重新選擇題庫。" action={<button className="btn" onClick={onExit}>返回首頁</button>} />;
  }

  const score = results.filter((result) => result.correct).length;
  const percentage = results.length ? Math.round((score / results.length) * 100) : 0;

  function choose(optionId: string, checked: boolean) {
    if (question.type === "single_choice") {
      setSelectedAnswers([optionId]);
      return;
    }
    const next = new Set(selectedAnswers);
    if (checked) next.add(optionId);
    else next.delete(optionId);
    setSelectedAnswers(Array.from(next));
  }

  function nextQuestion() {
    const nextResults = [...results, { question, selectedAnswers, correct: isAnswerCorrect(question, selectedAnswers) }];
    setResults(nextResults);
    if (index === questions.length - 1) {
      setFinished(true);
      onComplete(nextResults);
    } else {
      setIndex(index + 1);
      setSelectedAnswers([]);
    }
  }

  if (finished) {
    return (
      <>
        <PageHeader title="模擬考成績" description="已完成作答，答題結果也已記錄到複習進度。" />
        <section className="card overflow-hidden">
          <div className="bg-stone-900 px-5 py-8 text-center text-white sm:px-8 sm:py-10">
            <ClipboardCheck className="mx-auto text-stone-300" size={32} />
            <div className="mt-4 text-5xl font-semibold">{percentage}<span className="text-2xl text-stone-300">%</span></div>
            <p className="mt-2 text-sm text-stone-300">答對 {score}／{results.length} 題</p>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            {results.map((result, resultIndex) => (
              <details key={result.question.id} className="rounded-2xl border border-notion-border bg-white p-4">
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  {result.correct ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} /> : <XCircle className="mt-0.5 shrink-0 text-red-600" size={20} />}
                  <span className="min-w-0 flex-1 text-sm font-medium leading-6 text-notion-text">{resultIndex + 1}. {result.question.question}</span>
                </summary>
                <div className="mt-4 border-t border-notion-border pt-4 text-sm leading-6 text-notion-muted">
                  <p>你的答案：{result.selectedAnswers.join(", ") || "未作答"}</p>
                  <p>正確答案：{result.question.correctAnswers.join(", ")}</p>
                  <p className="mt-2 rounded-xl bg-notion-soft p-3">{result.question.explanation || "尚未填寫解析。"}</p>
                </div>
              </details>
            ))}
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              <button className="btn btn-primary" onClick={onExit}>返回首頁</button>
              <button className="btn" onClick={() => window.print()}>列印成績</button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="模擬考"
        description={`第 ${index + 1} 題，共 ${questions.length} 題`}
        action={<button className="btn" onClick={() => confirm("確定要離開模擬考嗎？目前進度不會保留。") && onExit()}><ArrowLeft size={16} /> 離開</button>}
      />
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-stone-200" aria-label={`作答進度 ${index + 1} / ${questions.length}`}>
        <div className="h-full rounded-full bg-stone-800 transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>
      <section className="card p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge tone="blue">{readableQuestionType(question.type)}</Badge><Badge tone="warm">{question.level}</Badge><Badge>{question.category}</Badge>
        </div>
        <h2 className="rounded-2xl bg-[#fbfbfa] p-4 text-lg font-semibold leading-8 text-notion-text sm:p-5 sm:text-xl">{question.question}</h2>
        {question.questionTranslation ? <p className="mt-3 text-sm leading-6 text-notion-muted">翻譯：{question.questionTranslation}</p> : null}
        <div className="mt-5 space-y-3">
          {question.options.map((option) => {
            const selected = selectedAnswers.includes(option.id);
            return (
              <label key={option.id} className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selected ? "border-stone-700 bg-stone-50 ring-1 ring-stone-700" : "border-notion-border bg-white hover:border-stone-300 hover:bg-notion-soft"}`}>
                <input className="mt-1" type={question.type === "single_choice" ? "radio" : "checkbox"} name="exam-answer" checked={selected} onChange={(event) => choose(option.id, event.target.checked)} />
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${selected ? "bg-stone-800 text-white" : "bg-notion-soft text-notion-text"}`}>{option.id}</span>
                <span className="pt-0.5 text-sm leading-6 text-notion-text">{option.text}</span>
              </label>
            );
          })}
        </div>
        <button className="btn btn-primary mt-6 w-full sm:ml-auto sm:flex sm:w-auto" disabled={selectedAnswers.length === 0} onClick={nextQuestion}>
          {index === questions.length - 1 ? "交卷並查看成績" : "下一題"}<ChevronRight size={16} />
        </button>
      </section>
    </>
  );
}
