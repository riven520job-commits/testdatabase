import * as React from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import type { StudyQuestion } from "../types/question";
import { validateQuestions } from "../utils/storage";

type SettingsPageProps = {
  questions: StudyQuestion[];
  onImport: (questions: StudyQuestion[]) => void;
  onClear: () => void;
};

export function SettingsPage({ questions, onImport, onClear }: SettingsPageProps) {
  const [message, setMessage] = React.useState("");

  function exportJson() {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `japanese-study-questions-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("已匯出 JSON。");
  }

  async function importJson(file: File | undefined) {
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const validQuestions = validateQuestions(parsed);
      if (!validQuestions) {
        setMessage("匯入失敗：JSON 格式不是 StudyQuestion[]。");
        return;
      }
      onImport(validQuestions);
      setMessage(`已匯入 ${validQuestions.length} 題。`);
    } catch {
      setMessage("匯入失敗：無法解析 JSON。");
    }
  }

  function clearAll() {
    if (confirm("確定要清除全部題目嗎？這個動作無法復原。")) {
      onClear();
      setMessage("已清除全部資料。");
    }
  }

  return (
    <>
      <PageHeader title="設定" description="匯入、匯出與清除 localStorage 裡的題庫資料。" />

      <section className="card p-5">
        <div className="mb-5 rounded-2xl border border-notion-border bg-[#fbfbfa] p-4">
          <div className="text-sm text-notion-muted">目前 localStorage 題目數</div>
          <div className="mt-2 text-3xl font-semibold text-notion-text">{questions.length}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button className="btn btn-primary" onClick={exportJson}>
            <Download size={16} />
            匯出 JSON
          </button>
          <label className="btn cursor-pointer">
            <Upload size={16} />
            匯入 JSON
            <input className="hidden" type="file" accept="application/json,.json" onChange={(event) => void importJson(event.target.files?.[0])} />
          </label>
          <button className="btn" onClick={clearAll}>
            <Trash2 size={16} />
            清除全部資料
          </button>
        </div>

        {message ? <p className="mt-4 rounded-xl bg-notion-soft px-4 py-3 text-sm text-notion-muted">{message}</p> : null}
      </section>
    </>
  );
}
