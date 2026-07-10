import * as React from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import type { SelfRating, StudyQuestion } from "../types/question";
import { isAnswerCorrect, readableQuestionType } from "../utils/quiz";
import { ratingLabel } from "../utils/review";

type QuizPageProps = {
  question?: StudyQuestion | null;
  onBack: () => void;
  onComplete: (question: StudyQuestion, rating: SelfRating, wasCorrect: boolean) => void;
};

export function QuizPage({ question, onBack, onComplete }: QuizPageProps) {
  const [selectedAnswers, setSelectedAnswers] = React.useState<string[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [showOriginal, setShowOriginal] = React.useState(true);

  React.useEffect(() => {
    setSelectedAnswers([]);
    setSubmitted(false);
    setShowOriginal(!question?.questionTranslation);
  }, [question?.id]);

  if (!question) {
    return (
      <>
        <PageHeader title="測驗" />
        <EmptyState title="沒有選取題目" description="請回到題庫，選擇一題開始作答。" action={<button className="btn" onClick={onBack}>返回</button>} />
      </>
    );
  }

  const currentQuestion = question;
  const hasTranslation = Boolean(currentQuestion.questionTranslation?.trim());
  const displayedQuestion =
    hasTranslation && !showOriginal ? currentQuestion.questionTranslation ?? currentQuestion.question : currentQuestion.question;
  const wasCorrect = submitted ? isAnswerCorrect(currentQuestion, selectedAnswers) : false;

  function choose(optionId: string, checked: boolean) {
    if (currentQuestion.type === "single_choice") {
      setSelectedAnswers([optionId]);
      return;
    }

    const answers = new Set(selectedAnswers);
    if (checked) {
      answers.add(optionId);
    } else {
      answers.delete(optionId);
    }
    setSelectedAnswers(Array.from(answers));
  }

  return (
    <>
      <PageHeader
        title="測驗"
        description="提交後查看解析，再用自我評分安排下一次複習。"
        action={
          <button className="btn" onClick={onBack}>
            <ArrowLeft size={16} />
            返回
          </button>
        }
      />

      <section className="card p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{readableQuestionType(currentQuestion.type)}</Badge>
            <Badge tone="warm">{currentQuestion.level}</Badge>
            <Badge>{currentQuestion.category}</Badge>
          </div>
          {hasTranslation ? (
            <button className="btn" onClick={() => setShowOriginal(!showOriginal)}>
              {showOriginal ? <EyeOff size={16} /> : <Eye size={16} />}
              {showOriginal ? "隱藏原文" : "顯示原文"}
            </button>
          ) : null}
        </div>

        <div className="rounded-2xl border border-notion-border bg-[#fbfbfa] p-4">
          <div className="mb-2 text-xs font-medium text-notion-muted">{hasTranslation && !showOriginal ? "繁體中文翻譯" : "題目原文"}</div>
          <h2 className="text-lg font-semibold leading-8 text-notion-text sm:text-xl">{displayedQuestion}</h2>
          {hasTranslation && showOriginal ? (
            <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-notion-muted">
              翻譯：{currentQuestion.questionTranslation}
            </p>
          ) : null}
        </div>

        <div className="mt-5 space-y-3 sm:mt-6">
          {currentQuestion.options.map((option) => (
            <label
              key={option.id}
              className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selectedAnswers.includes(option.id) ? "border-stone-400 bg-stone-50" : "border-notion-border bg-white hover:bg-notion-soft"
              }`}
            >
              <input
                className="mt-1"
                type={currentQuestion.type === "single_choice" ? "radio" : "checkbox"}
                name="answer"
                checked={selectedAnswers.includes(option.id)}
                disabled={submitted}
                onChange={(event) => choose(option.id, event.target.checked)}
              />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-notion-soft text-xs font-semibold text-notion-text">
                {option.id}
              </span>
              <span className="text-sm leading-6 text-notion-text">{option.text}</span>
            </label>
          ))}
        </div>

        {!submitted ? (
          <button className="btn btn-primary mt-6 w-full sm:w-auto" disabled={selectedAnswers.length === 0} onClick={() => setSubmitted(true)}>
            提交答案
          </button>
        ) : (
          <div className="mt-6 rounded-2xl border border-notion-border bg-[#fbfbfa] p-4 sm:p-5">
            <div className={`mb-4 flex items-center gap-2 text-sm font-semibold ${wasCorrect ? "text-emerald-700" : "text-red-700"}`}>
              {wasCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {wasCorrect ? "答對了" : "答錯了"}
            </div>
            <div className="grid gap-3 text-sm leading-6 text-notion-text">
              <p>正確答案：{currentQuestion.correctAnswers.join(", ")}</p>
              <p>你的答案：{selectedAnswers.length ? selectedAnswers.join(", ") : "未作答"}</p>
              {hasTranslation ? <p>題目原文：{currentQuestion.question}</p> : null}
              <p className="rounded-xl bg-white p-4 text-notion-muted">{currentQuestion.explanation || "尚未填寫解析。"}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {(["again", "hard", "good", "easy"] as SelfRating[]).map((rating) => (
                <button key={rating} className="btn" onClick={() => onComplete(currentQuestion, rating, wasCorrect)}>
                  {ratingLabel(rating)}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
