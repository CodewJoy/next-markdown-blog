---
title: "Case Study — Designing Shared Global State Across Multiple Independent Applications"
date: "July 1, 2026"
readTime: "10 min"
difficultyLevel: "1"
---

## Problem

系統由多個獨立部署的前端應用程式組成，每個應用程式都是獨立載入的頁面。

當使用者切換不同功能時，瀏覽器會重新載入整個頁面，因此前一個應用程式的 React Tree 與 Redux Store 都會被銷毀，新頁面則重新建立自己的 Store。

然而，部分狀態需要在所有應用程式之間保持一致，例如：

- 使用者權限
- UI 主題
- Feature Flags
- 共用設定

如何在維持各應用程式獨立部署的前提下，共享這些全域狀態，成為這次架構設計的核心問題。

## Analysis

最直覺的方案是將共用狀態放入 Redux，但實際分析後發現幾個限制。

將狀態放在單一應用程式的 Redux Store

- 其他應用程式需要依賴該 Store
- 打破模組邊界，形成跨應用程式耦合

每個應用程式各自維護一份狀態

- 相同資料分散在多個來源
- 狀態同步成本高
- 容易產生不一致

建立共用 Redux Store

Redux 必須透過 React Provider 注入 Store，代表所有應用程式都需要依賴相同的 Provider 與初始化流程，降低彼此的獨立性。

因此真正需要的全域狀態管理方式應具備以下特性：

- 不依附於 React Tree
- 不需要 Provider
- 可由各應用程式自行初始化
- 任意元件皆可直接存取

## Solution

將狀態依照生命週期拆分管理。

### 全域狀態

跨應用程式共享的設定改由 Zustand 管理，包括：

- 使用者權限
- UI 主題
- Feature Flags
- 共用設定

選擇 Zustand 的關鍵原因在於 Store 不依賴 React Provider。

每個應用程式啟動時，皆可透過 Server 提供的設定初始化同一份 Store，而任何元件都能直接讀取，不需要知道自己位於哪一個應用程式的 React Tree 中。

### 業務狀態

各應用程式內部的業務邏輯仍維持使用 Redux，例如：

- 地圖互動
- KPI 篩選
- 報表參數
- 畫面狀態

這些狀態仍受益於 Redux 的單向資料流、Redux DevTools，以及 Time-travel Debugging，使複雜狀態更容易追蹤與維護。

## Impact

- 建立全域設定與業務狀態的清楚責任邊界
- 避免跨應用程式共享 Redux Store 所造成的架構耦合
- 各應用程式仍可獨立部署與初始化
- 全域設定具有單一資料來源，降低同步成本
- 保留 Redux 在複雜業務狀態管理上的可維護性與除錯能力
- Architecture Decision: 將狀態依生命週期拆分為「跨應用程式全域狀態」與「應用程式內業務狀態」，降低系統耦合，同時保留各自最適合的狀態管理方式。
