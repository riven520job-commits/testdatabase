# Notion Japanese Study MVP

一個 Notion 風格的個人日文學習題庫 MVP，使用 React、Vite、TypeScript、Tailwind CSS 與 localStorage。

## 啟動方式

```bash
npm install
npm run dev
```

正式建置：

```bash
npm run build
```

## 功能

- Dashboard 統計總題目、今日複習、錯題、題型與難度數量
- 題庫列表搜尋與篩選
- 新增、編輯、刪除題目
- 題目可加入手動繁體中文翻譯，測驗時可切換是否顯示日文原文
- 單選題與複選題測驗
- 錯題本
- 今日複習與簡單間隔複習
- 可依分類、JLPT 等級與題數建立隨機模擬考，交卷後查看成績與解析
- 匯出、匯入 JSON
- localStorage 離線儲存
- Supabase Email 登入與手機／電腦雙向題庫同步
- 雲端下載、本機上傳，以及依每題 `updatedAt` 保留較新版本的合併同步

## 主要檔案

- `src/types/question.ts`：題目、選項與自我評分型別
- `src/utils/storage.ts`：localStorage、sample data、匯入 validate
- `src/utils/quiz.ts`：單選與複選答案判斷
- `src/utils/review.ts`：間隔複習規則
- `src/utils/date.ts`：日期工具
- `src/components/`：共用版面、Sidebar、Badge、QuestionCard、EmptyState
- `src/pages/`：Dashboard、題庫、表單、測驗、今日複習、錯題本、設定
- `src/App.tsx`：頁面切換與題目資料狀態管理

## 部署

此專案可部署到 GitHub Pages 或 Netlify。`vite.config.ts` 已使用 `base: "./"`，靜態部署較不容易遇到路徑問題。

## Supabase 同步

前端使用 Supabase publishable key，資料存放於 `japanese_study_sync`。該表已啟用 RLS，只有登入者能讀寫 `user_id = auth.uid()` 的資料；`manifestation_sync` 等既有資料表不在此功能的讀寫範圍內。
