import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { Download, LogIn, LogOut, RefreshCw, ShieldCheck, Trash2, Upload, UserPlus } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import type { StudyQuestion } from "../types/question";
import {
  getCloudUser,
  mergeWithCloud,
  signInToCloud,
  signOutFromCloud,
  signUpForCloud
} from "../utils/cloudSync";
import { validateQuestions } from "../utils/storage";

type SettingsPageProps = {
  questions: StudyQuestion[];
  onImport: (questions: StudyQuestion[]) => void;
  onClear: () => void;
};

export function SettingsPage({ questions, onImport, onClear }: SettingsPageProps) {
  const [cloudMessage, setCloudMessage] = React.useState("");
  const [localMessage, setLocalMessage] = React.useState("");
  const [user, setUser] = React.useState<User | null>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    void getCloudUser().then(setUser);
  }, []);

  async function runCloudAction(action: () => Promise<void>) {
    setBusy(true);
    setCloudMessage("");
    try {
      await action();
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "未知錯誤";
      let friendlyMessage = rawMessage;
      if (rawMessage.toLowerCase().includes("invalid login credentials")) {
        friendlyMessage = "帳號尚未建立、尚未完成 Email 驗證，或密碼不正確。";
      } else if (rawMessage.toLowerCase().includes("email address") && rawMessage.toLowerCase().includes("invalid")) {
        friendlyMessage = "Supabase 判定這個 Email 無效，請檢查拼字，或改用另一個可收信的 Email。";
      }
      setCloudMessage(`操作失敗：${friendlyMessage}`);
    } finally {
      setBusy(false);
    }
  }

  function signIn() {
    void runCloudAction(async () => {
      const nextUser = await signInToCloud(email.trim(), password);
      setUser(nextUser);
      setPassword("");
      setCloudMessage("已登入雲端題庫。");
    });
  }

  function signUp() {
    void runCloudAction(async () => {
      const result = await signUpForCloud(email.trim(), password);
      setPassword("");
      if (result.needsConfirmation) {
        setCloudMessage("帳號已建立，請先到信箱完成驗證，再回來登入。");
      } else {
        setUser(result.user);
        setCloudMessage("帳號已建立並登入。");
      }
    });
  }

  function signOut() {
    void runCloudAction(async () => {
      await signOutFromCloud();
      setUser(null);
      setCloudMessage("已登出；本機題庫仍保留在此裝置。");
    });
  }

  function syncCloud() {
    void runCloudAction(async () => {
      const result = await mergeWithCloud(questions);
      onImport(result.questions);
      setCloudMessage(`同步完成，共 ${result.questions.length} 題；同一題保留 updatedAt 較新的版本。`);
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
    setLocalMessage("已匯出 JSON。");
  }

  async function importJson(file: File | undefined) {
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const validQuestions = validateQuestions(parsed);
      if (!validQuestions) {
        setLocalMessage("匯入失敗：JSON 格式不是 StudyQuestion[]。");
        return;
      }
      onImport(validQuestions);
      setLocalMessage(`已匯入 ${validQuestions.length} 題。`);
    } catch {
      setLocalMessage("匯入失敗：無法解析 JSON。");
    }
  }

  function clearAll() {
    if (confirm("確定要清除全部題目嗎？這個動作無法復原。")) {
      onClear();
      setLocalMessage("已清除全部資料。");
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
            <div className="grid gap-4 rounded-2xl border border-notion-border bg-[#fbfbfa] p-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.65fr)] sm:items-center sm:p-5">
              <button className="btn btn-primary min-h-12 w-full" disabled={busy} onClick={syncCloud}>
                <RefreshCw size={16} /> 合併同步
              </button>
              <div className="flex items-start gap-2 text-xs leading-5 text-notion-muted">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={17} />
                <span>自動比較同一題的更新時間，保留較新的版本後同步到所有裝置。</span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-notion-muted">為避免誤覆蓋資料，雲端同步只提供安全合併模式。</p>
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

        {cloudMessage ? (
          <p role="status" aria-live="polite" className="mt-4 rounded-xl bg-notion-soft px-4 py-3 text-sm font-medium text-notion-text">
            {cloudMessage}
          </p>
        ) : null}
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

        {localMessage ? <p className="mt-4 rounded-xl bg-notion-soft px-4 py-3 text-sm text-notion-muted">{localMessage}</p> : null}
      </section>
    </>
  );
}
