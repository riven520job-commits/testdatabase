import type { User } from "@supabase/supabase-js";
import type { StudyQuestion } from "../types/question";
import { validateQuestions } from "./storage";
import { APP_URL, supabase } from "./supabase";

type CloudRow = {
  questions: unknown;
  updated_at: string;
};

export type CloudDownload = {
  questions: StudyQuestion[];
  updatedAt: string;
} | null;

export async function getCloudUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function signInToCloud(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("登入失敗，請稍後再試。");
  return data.user;
}

export async function signUpForCloud(email: string, password: string): Promise<{ user: User; needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: APP_URL }
  });
  if (error) throw error;
  if (!data.user) throw new Error("無法建立帳號，請稍後再試。");
  return { user: data.user, needsConfirmation: !data.session };
}

export async function signOutFromCloud(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function requireUser(): Promise<User> {
  const user = await getCloudUser();
  if (!user) throw new Error("請先登入雲端帳號。");
  return user;
}

export async function uploadQuestionsToCloud(questions: StudyQuestion[]): Promise<string> {
  const user = await requireUser();
  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from("japanese_study_sync").upsert(
    {
      user_id: user.id,
      questions,
      updated_at: updatedAt
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
  return updatedAt;
}

export async function downloadQuestionsFromCloud(): Promise<CloudDownload> {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("japanese_study_sync")
    .select("questions, updated_at")
    .eq("user_id", user.id)
    .maybeSingle<CloudRow>();
  if (error) throw error;
  if (!data) return null;

  const questions = validateQuestions(data.questions);
  if (!questions) throw new Error("雲端題庫格式不正確，未覆蓋本機資料。");
  return { questions, updatedAt: data.updated_at };
}

export function mergeQuestionSets(localQuestions: StudyQuestion[], cloudQuestions: StudyQuestion[]): StudyQuestion[] {
  const merged = new Map<string, StudyQuestion>();

  for (const question of [...cloudQuestions, ...localQuestions]) {
    const current = merged.get(question.id);
    if (!current || Date.parse(question.updatedAt) >= Date.parse(current.updatedAt)) {
      merged.set(question.id, question);
    }
  }

  return Array.from(merged.values()).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function mergeWithCloud(localQuestions: StudyQuestion[]): Promise<{ questions: StudyQuestion[]; uploadedAt: string }> {
  const cloud = await downloadQuestionsFromCloud();
  const merged = cloud ? mergeQuestionSets(localQuestions, cloud.questions) : localQuestions;
  const uploadedAt = await uploadQuestionsToCloud(merged);
  return { questions: merged, uploadedAt };
}
