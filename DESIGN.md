# 專案設計系統指南 (Design System Guide)

本專案採用經典的 **包浩斯 (Bauhaus)** 與 **新野獸派 (Neo-Brutalism)** 風格，融合幾何純粹性、高對比原色與強烈黑框投影，營造專業且具備強烈建築藝術質感的介面體驗。

---

## 1. 核心設計哲學

- **形隨機能 (Form Follows Function)**：重視資訊架構的清晰度，各狀態與屬性一目了然。
- **純粹幾何 (Pure Geometry)**：大量運用方塊（矩形）、圓形與三角形幾何元素。
- **高對比度 (High Contrast)**：粗黑色框線、深黑色硬邊陰影，杜絕模糊的漸層投影。
- **零圓角邊框 (Zero Border Radius)**：除了特定圓形標章/頭像外，主要卡片、按鈕、輸入框皆採用 `rounded-none`。

---

## 2. 色彩調色盤 (Color Palette)

定義於 [src/index.css](file:///c:/Users/jun/Desktop/傳送門/RFI%20TRACK/HSU/src/index.css)：

| 名稱 | 色碼 / Token | 用途說明 |
| :--- | :--- | :--- |
| **Bauhaus Background** | `#F0F0F0` (`--color-bauhaus-bg`) | 主畫面底色，搭配點狀格線底圖 |
| **Bauhaus Foreground** | `#121212` (`--color-bauhaus-fg`) | 主要文字、粗邊框、陰影底色 |
| **Bauhaus Red** | `#D02020` (`--color-bauhaus-red`) | 高優先級、緊急、刪除、強調標記 |
| **Bauhaus Blue** | `#1040C0` (`--color-bauhaus-blue`) | 導航作用中、已解決狀態、次要重點標記 |
| **Bauhaus Yellow** | `#F0C020` (`--color-bauhaus-yellow`) | 頂部全域 Header、審查中 (In Review) 警告狀態 |
| **Neutral White** | `#FFFFFF` | 卡片表面、按鈕預設底色 |

---

## 3. 字體排印 (Typography)

- **字體家族**：`Outfit`, sans-serif（幾何無襯線字體，由 Google Fonts 載入）。
- **字重規範**：
  - 一般內文：`font-normal` (400) / `font-medium` (500)
  - 欄位標籤、按鈕：`font-bold` (700)
  - 核心大標題、計數徽章：`font-black` (900)
- **大寫與字距**：操作標籤與狀態常用 `uppercase tracking-wider` 或 `tracking-widest`。

---

## 4. 陰影與互動行為 (Shadows & Micro-interactions)

- **小型硬邊陰影**：`shadow-bauhaus-sm` (`2px 2px 0px 0px #121212`)
- **標準硬邊陰影**：`shadow-bauhaus` (`4px 4px 0px 0px #121212`)
- **大型卡片陰影**：`shadow-bauhaus-lg` (`8px 8px 0px 0px #121212`)
- **按鈕按壓回饋**：
  ```css
  active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
  ```

---

## 5. 核心 UI 元件類別 (Component Classes)

- `.bauhaus-card`：白色底、`border-4 border-[#121212]`、`shadow-bauhaus-lg`。
- `.bauhaus-btn`：白色底、粗黑框、`shadow-bauhaus`、點擊位移效果。
- `.bauhaus-input`：`border-2 border-[#121212]`、`shadow-bauhaus`、聚焦反饋。
- `.shape-triangle`：使用 `clip-path` 生成正三角形幾何形狀。
