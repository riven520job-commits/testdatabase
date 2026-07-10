import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { CloudDownload, CloudUpload, Download, LogIn, LogOut, RefreshCw, Trash2, Upload, UserPlus } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import type { StudyQuestion } from "../types/question";
import {
  downloadQuestionsFromCloud,
  getCloudUser,
  mergeWithCloud,
  signInToCloud,
  signOutFromCloud,
  signUpForCloud,
  uploadQuestionsToCloud
} from "../utils/cloudSync";
import { validateQuestions } from "../utils/storage";

type SettingsPageProps = {
  questions: StudyQuestion[];
  onImport: (questions: StudyQuestion[]) => void;
  onClear: () => void;
};

export function SettingsPage({ questions, onImport, onClear }: SettingsPageProps) {
  const [message, setMessage] = React.useState("");
  const [user, setUser] = React.useState<User | null>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    void getCloudUser().then(setUser);
  }, []);

  async function runCloudAction(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(`操作失敗：${error instanceof Error ? error.message : "未知錯誤"}`);
    } finally {
      setBusy(false);
    }
  }

  function signIn() {
    void runCloudAction(async () => {
      const nextUser = await signInToCloud(email.trim(), password);
      setUser(nextUser);
      setPassword("");
      setMessage("已登入雲端題庫。");
    });
  }

  function signUp() {
    void runCloudAction(async () => {
      const result = await signUpForCloud(email.trim(), password);
      setPassword("");
      if (result.needsConfirmation) {
        setMessage("帳號已建立，請先到信箱完成驗證，再回來登入。");
      } else {
        setUser(result.user);
        setMessage("帳號已建立並登入。");
      }
    });
  }

  function signOut() {
    void runCloudAction(async () => {
      await signOutFromCloud();
      setUser(null);
      setMessage("已登出；本機題庫仍保留在此裝置。");
    });
  }

  function uploadCloud() {
    void runCloudAction(async () => {
      await uploadQuestionsToCloud(questions);
      setMessage(`已將本機 ${questions.length} 題上傳並覆蓋雲端題庫。`);
    });
  }

  function downloadCloud() {
    void runCloudAction(async () => {
      const cloud = await downloadQuestionsFromCloud();
      if (!cloud) {
        setMessage("雲端尚無題庫；請先從任一裝置上傳。");
        return;
      }
      onImport(cloud.questions);
      setMessage(`已從雲端下載 ${cloud.questions.length} 題並覆蓋本機題庫。`);
    });
  }

  function syncCloud() {
    void runCloudAction(async () => {
      const result = await mergeWithCloud(questions);
      onImport(result.questions);
      setMessage(`同步完成，共 ${result.questions.length} 題；同一題保留 updatedAt 較新的版本。`);
    });
  }

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
      <PageHeader title="設定" description="管理本機資料，或登入後在手機與電腦之間同步題庫。" />

      <section className="card mb-5 p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-notion-text">雲端題庫同步</h2>
            <p className="mt-1 text-sm text-notion-muted">同一帳號可在手機與電腦存取同一份題庫；本機資料仍可離線使用。</p>
          </div>
          {user ? (
            <button className="btn" disabled={busy} onClick={signOut}>
              <LogOut size={16} /> 登出
            </button>
          ) : null}
        </div>

        {user ? (
          <>
            <div className="mb-4 rounded-2xl border border-notion-border bg-[#fbfbfa] p-4 text-sm">
              <div className="text-notion-muted">目前登入帳號</div>
              <div className="mt-1 font-medium text-notion-text">{user.email}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button className="btn btn-primary" disabled={busy} onClick={syncCloud}>
                <RefreshCw size={16} /> 合併同步
              </button>
              <button className="btn" disabled={busy} onClick={downloadCloud}>
                <CloudDownload size={16} /> 下載雲端覆蓋本機
              </button>
              <button className="btn" disabled={busy} onClick={uploadCloud}>
                <CloudUpload size={16} /> 上傳本機覆蓋雲端
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-notion-muted">
              建議平常使用「合併同步」。只有確認其中一端資料為準時，才使用覆蓋功能。
            </p>
          </>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-notion-muted">
              Email
              <input className="input mt-1" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="text-sm text-notion-muted">
              密碼（至少 6 個字元）
              <input className="input mt-1" type="password" minLength={6} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <button className="btn btn-primary" disabled={busy || !email.trim() || password.length < 6} onClick={signIn}>
              <LogIn size={16} /> 登入
            </button>
            <button className="btn" disabled={busy || !email.trim() || password.length < 6} onClick={signUp}>
              <UserPlus size={16} /> 建立帳號
            </button>
          </div>
        )}
      </section>

      <section className="card p-5">
        <div className="mb-5 rounded-2xl border border-notion-border bg-[#fbfbfa] p-4">
          <div className="text-sm text-notion-muted">此裝置的本機題目數</div>
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
