import * as React from "react";
import { Languages, Save, Trash2, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import type { Option, QuestionType, StudyQuestion } from "../types/question";

type QuestionFormPageProps = {
  editingQuestion?: StudyQuestion | null;
  categories: string[];
  onSave: (question: StudyQuestion) => void;
  onCancel: () => void;
};

const levels = ["N5", "N4", "N3", "N2", "N1", "商務", "自訂"];
const optionIds = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function createDefaultQuestion(): StudyQuestion {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    type: "single_choice",
    question: "",
    questionTranslation: "",
    options: ["A", "B", "C", "D"].map((id) => ({ id, text: "", translation: "" })),
    correctAnswers: ["A"],
    explanation: "",
    category: "",
    tags: [],
    level: "N5",
    source: "",
    createdAt: timestamp,
    updatedAt: timestamp,
    reviewCount: 0,
    wrongCount: 0,
    mastery: 0,
    nextReviewAt: new Date().toISOString().slice(0, 10)
  };
}

export function QuestionFormPage({ editingQuestion, categories, onSave, onCancel }: QuestionFormPageProps) {
  const [draft, setDraft] = React.useState<StudyQuestion>(() => editingQuestion ?? createDefaultQuestion());
  const [tagInput, setTagInput] = React.useState(() => (editingQuestion?.tags ?? []).join(", "));
  const [wantsTranslation, setWantsTranslation] = React.useState(() => Boolean(editingQuestion?.questionTranslation));
  const [wantsOptionTranslations, setWantsOptionTranslations] = React.useState(() =>
    Boolean(editingQuestion?.options.some((option) => option.translation?.trim()))
  );
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setDraft(editingQuestion ?? createDefaultQuestion());
    setTagInput((editingQuestion?.tags ?? []).join(", "));
    setWantsTranslation(Boolean(editingQuestion?.questionTranslation));
    setWantsOptionTranslations(Boolean(editingQuestion?.options.some((option) => option.translation?.trim())));
    setError("");
  }, [editingQuestion]);

  function updateOption(index: number, field: "text" | "translation", value: string) {
    const options = draft.options.map((option, optionIndex) => (optionIndex === index ? { ...option, [field]: value } : option));
    setDraft({ ...draft, options });
  }

  function addOption() {
    const nextId = optionIds.find((id) => !draft.options.some((option) => option.id === id)) ?? crypto.randomUUID();
    setDraft({ ...draft, options: [...draft.options, { id: nextId, text: "", translation: "" }] });
  }

  function removeOption(optionId: string) {
    const options = draft.options.filter((option) => option.id !== optionId);
    const correctAnswers = draft.correctAnswers.filter((answer) => answer !== optionId);
    setDraft({ ...draft, options, correctAnswers });
  }

  function setQuestionType(type: QuestionType) {
    const correctAnswers = type === "single_choice" ? [draft.correctAnswers[0] ?? draft.options[0]?.id ?? "A"] : draft.correctAnswers;
    setDraft({ ...draft, type, correctAnswers });
  }

  function toggleCorrectAnswer(optionId: string, checked: boolean) {
    if (draft.type === "single_choice") {
      setDraft({ ...draft, correctAnswers: [optionId] });
      return;
    }

    const answers = new Set(draft.correctAnswers);
    if (checked) {
      answers.add(optionId);
    } else {
      answers.delete(optionId);
    }
    setDraft({ ...draft, correctAnswers: Array.from(answers) });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanOptions = draft.options.map((option) => ({
      ...option,
      text: option.text.trim(),
      translation: wantsOptionTranslations ? option.translation?.trim() || undefined : undefined
    }));
    const tags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!draft.question.trim()) {
      setError("請輸入題目內容。");
      return;
    }
    if (cleanOptions.length < 2 || cleanOptions.some((option) => !option.text)) {
      setError("請至少保留兩個選項，且每個選項都要有文字。");
      return;
    }
    if (draft.correctAnswers.length === 0) {
      setError("請選擇正確答案。");
      return;
    }
    if (!draft.category.trim()) {
      setError("請輸入分類。");
      return;
    }

    onSave({
      ...draft,
      question: draft.question.trim(),
      questionTranslation: wantsTranslation ? draft.questionTranslation?.trim() : undefined,
      options: cleanOptions,
      explanation: draft.explanation.trim(),
      category: draft.category.trim(),
      tags,
      source: draft.source?.trim(),
      updatedAt: new Date().toISOString()
    });
  }

  return (
    <>
      <PageHeader title={editingQuestion ? "編輯題目" : "新增題目"} description="整理日文原文、可選翻譯、答案與解析。" />

      <form onSubmit={submit} className="card p-4 sm:p-5">
        {error ? <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-5 sm:gap-6">
          <label className="grid gap-2">
            <span className="form-label">題目原文</span>
            <textarea
              className="form-input min-h-32 resize-y"
              value={draft.question}
              onChange={(event) => setDraft({ ...draft, question: event.target.value })}
              placeholder="例如：『苛立ち』はどのような意味を表しますか？"
            />
          </label>

          <section className="rounded-2xl border border-notion-border bg-[#fbfbfa] p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-notion-muted">
                  <Languages size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-notion-text">繁體中文翻譯</h2>
                  <p className="mt-1 text-xs leading-5 text-notion-muted">題目是日文時，可以手動加入翻譯；作答時可切換是否看日文原文。</p>
                </div>
              </div>
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-notion-border bg-white px-3 text-sm text-notion-text">
                <input
                  type="checkbox"
                  checked={wantsTranslation}
                  onChange={(event) => setWantsTranslation(event.target.checked)}
                />
                加入翻譯
              </label>
            </div>
            {wantsTranslation ? (
              <textarea
                className="form-input mt-3 min-h-24 resize-y"
                value={draft.questionTranslation ?? ""}
                onChange={(event) => setDraft({ ...draft, questionTranslation: event.target.value })}
                placeholder="例如：「苛立ち」可以表示哪些意思？"
              />
            ) : null}
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="form-label">題型</span>
              <select className="form-input" value={draft.type} onChange={(event) => setQuestionType(event.target.value as QuestionType)}>
                <option value="single_choice">單選題</option>
                <option value="multiple_choice">複選題</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="form-label">難度</span>
              <select className="form-input" value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value })}>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="form-label">分類</span>
              <input
                className="form-input"
                list="question-categories"
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                placeholder="選擇既有分類或輸入新分類"
              />
              <datalist id="question-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>
          </div>

          <section className="rounded-2xl border border-notion-border bg-[#fbfbfa] p-3 sm:p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-notion-text">選項與正確答案</h2>
                <p className="mt-1 text-xs text-notion-muted">左側勾選代表正確答案；可選擇是否替每個選項加入翻譯。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex min-h-11 items-center gap-2 rounded-xl border border-notion-border bg-white px-3 text-sm text-notion-text">
                  <input type="checkbox" checked={wantsOptionTranslations} onChange={(event) => setWantsOptionTranslations(event.target.checked)} />
                  選項翻譯
                </label>
                <button type="button" className="btn" onClick={addOption}>新增選項</button>
              </div>
            </div>
            <div className="space-y-3">
              {draft.options.map((option, index) => (
                <div key={option.id} className="grid gap-3 rounded-xl border border-notion-border bg-white p-3 sm:grid-cols-[72px_1fr_auto]">
                  <label className="flex min-h-11 items-center gap-2 rounded-lg bg-notion-soft px-3 text-sm font-medium text-notion-text sm:bg-transparent sm:px-0">
                    <input
                      type={draft.type === "single_choice" ? "radio" : "checkbox"}
                      name="correctAnswer"
                      checked={draft.correctAnswers.includes(option.id)}
                      onChange={(event) => toggleCorrectAnswer(option.id, event.target.checked)}
                    />
                    {option.id}
                  </label>
                  <div className="grid gap-2">
                    <input className="form-input" value={option.text} onChange={(event) => updateOption(index, "text", event.target.value)} placeholder={`${option.id} 選項原文`} />
                    {wantsOptionTranslations ? (
                      <div className="relative">
                        <Languages className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-notion-muted" size={16} />
                        <input className="form-input pl-10" value={option.translation ?? ""} onChange={(event) => updateOption(index, "translation", event.target.value)} placeholder={`${option.id} 繁體中文翻譯（選填）`} />
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="btn text-red-700 hover:bg-red-50"
                    onClick={() => removeOption(option.id)}
                    disabled={draft.options.length <= 2}
                    title="刪除選項"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <label className="grid gap-2">
            <span className="form-label">解析</span>
            <textarea
              className="form-input min-h-28 resize-y"
              value={draft.explanation}
              onChange={(event) => setDraft({ ...draft, explanation: event.target.value })}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="form-label">標籤</span>
              <input className="form-input" value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="N1, 情緒, 新聞" />
            </label>
            <label className="grid gap-2">
              <span className="form-label">來源</span>
              <input className="form-input" value={draft.source ?? ""} onChange={(event) => setDraft({ ...draft, source: event.target.value })} />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn flex-1 sm:flex-none" onClick={onCancel}>
            <X size={16} />
            取消
          </button>
          <button type="submit" className="btn btn-primary flex-1 sm:flex-none">
            <Save size={16} />
            儲存
          </button>
        </div>
      </form>
    </>
  );
}
