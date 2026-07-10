import * as React from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { QuestionFormPage } from "./pages/QuestionFormPage";
import { QuestionListPage } from "./pages/QuestionListPage";
import { QuizPage } from "./pages/QuizPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { MockExamPage, type MockExamResult } from "./pages/MockExamPage";
import { MockExamSetupPage } from "./pages/MockExamSetupPage";
import { WrongQuestionsPage } from "./pages/WrongQuestionsPage";
import { Layout } from "./components/Layout";
import type { SelfRating, StudyQuestion } from "./types/question";
import { applyReviewResult } from "./utils/review";
import { clearQuestions, loadQuestions, saveQuestions } from "./utils/storage";

export type Page = "dashboard" | "questions" | "form" | "quiz" | "review" | "wrong" | "settings" | "mock-setup" | "mock-exam";

export default function App() {
  const [questions, setQuestions] = React.useState<StudyQuestion[]>(() => loadQuestions());
  const [page, setPage] = React.useState<Page>("dashboard");
  const [editingQuestion, setEditingQuestion] = React.useState<StudyQuestion | null>(null);
  const [activeQuestion, setActiveQuestion] = React.useState<StudyQuestion | null>(null);
  const [returnPage, setReturnPage] = React.useState<Page>("questions");
  const [mockExamQuestions, setMockExamQuestions] = React.useState<StudyQuestion[]>([]);
  const categories = React.useMemo(
    () => Array.from(new Set(questions.map((question) => question.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [questions]
  );

  function persist(nextQuestions: StudyQuestion[]) {
    setQuestions(nextQuestions);
    saveQuestions(nextQuestions);
  }

  function navigate(nextPage: Page) {
    if (nextPage !== "form") {
      setEditingQuestion(null);
    }
    setPage(nextPage);
  }

  function saveQuestion(question: StudyQuestion) {
    const exists = questions.some((item) => item.id === question.id);
    const nextQuestions = exists ? questions.map((item) => (item.id === question.id ? question : item)) : [question, ...questions];
    persist(nextQuestions);
    setEditingQuestion(null);
    setPage("questions");
  }

  function deleteQuestion(id: string) {
    if (!confirm("確定要刪除這題嗎？")) {
      return;
    }
    persist(questions.filter((question) => question.id !== id));
  }

  function editQuestion(question: StudyQuestion) {
    setEditingQuestion(question);
    setPage("form");
  }

  function startQuiz(question: StudyQuestion) {
    setActiveQuestion(question);
    setReturnPage(page === "quiz" ? "questions" : page);
    setPage("quiz");
  }

  function completeQuiz(question: StudyQuestion, rating: SelfRating, wasCorrect: boolean) {
    const updated = applyReviewResult(question, rating, wasCorrect);
    persist(questions.map((item) => (item.id === question.id ? updated : item)));
    setActiveQuestion(updated);
    setPage(returnPage);
  }

  function importQuestions(importedQuestions: StudyQuestion[]) {
    persist(importedQuestions);
    setPage("questions");
  }

  function clearAll() {
    clearQuestions();
    setQuestions([]);
  }

  function startMockExam(selectedQuestions: StudyQuestion[]) {
    setMockExamQuestions(selectedQuestions);
    setPage("mock-exam");
  }

  function completeMockExam(results: MockExamResult[]) {
    const resultMap = new Map(results.map((result) => [result.question.id, result]));
    persist(
      questions.map((question) => {
        const result = resultMap.get(question.id);
        return result ? applyReviewResult(question, result.correct ? "good" : "again", result.correct) : question;
      })
    );
  }

  let content: React.ReactNode;

  if (page === "dashboard") {
    content = <DashboardPage questions={questions} onNavigate={navigate} />;
  } else if (page === "questions") {
    content = (
      <QuestionListPage
        questions={questions}
        onAdd={() => {
          setEditingQuestion(null);
          setPage("form");
        }}
        onStart={startQuiz}
        onEdit={editQuestion}
        onDelete={deleteQuestion}
      />
    );
  } else if (page === "form") {
    content = (
      <QuestionFormPage
        editingQuestion={editingQuestion}
        categories={categories}
        onSave={saveQuestion}
        onCancel={() => setPage("questions")}
      />
    );
  } else if (page === "quiz") {
    content = <QuizPage question={activeQuestion} onBack={() => setPage(returnPage)} onComplete={completeQuiz} />;
  } else if (page === "review") {
    content = <ReviewPage questions={questions} onStart={startQuiz} onEdit={editQuestion} />;
  } else if (page === "wrong") {
    content = <WrongQuestionsPage questions={questions} onStart={startQuiz} onEdit={editQuestion} />;
  } else if (page === "mock-setup") {
    content = <MockExamSetupPage questions={questions} onBack={() => setPage("dashboard")} onStart={startMockExam} />;
  } else if (page === "mock-exam") {
    content = <MockExamPage questions={mockExamQuestions} onExit={() => setPage("dashboard")} onComplete={completeMockExam} />;
  } else {
    content = <SettingsPage questions={questions} onImport={importQuestions} onClear={clearAll} />;
  }

  return (
    <Layout currentPage={page} onNavigate={navigate}>
      {content}
    </Layout>
  );
}
