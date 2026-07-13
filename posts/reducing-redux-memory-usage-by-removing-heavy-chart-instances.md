---
title: "Case Study — Reducing Redux Memory Usage by Removing Heavy Chart Instances"
date: "January 11, 2026"
readTime: "10 min"
difficultyLevel: "1"
---

## Problem

在圖表功能中，應用程式曾經將圖表 library 的 instance 存放在 Redux。

由於 instance 內部包含：

- DOM references
- Event listeners
- Rendering state
- 其他大量不可序列化的資料

因此造成幾個問題：

- Redux DevTools 無法正常序列化 state
- 需要額外使用 state sanitizer 才能檢視 Redux state
- Redux 長期持有 instance reference，增加記憶體使用量
- State 不再符合 Redux 應保持 Serializable Data 的原則

## Root Cause

真正需要共享的資料，其實並不是圖表 instance。

大部分功能只需要：

- 圖表資料（Chart Data）
- 使用者操作狀態
- 圖表設定

instance 本身只是 UI Layer 的實作細節。

將 UI Instance 放進 Global State，會讓 Redux 同時負責：

- Business State
- UI Object Lifecycle

造成兩者耦合。

## Solution

重新設計 State Ownership。

Redux 僅保留純資料（Serializable Data）。

例如：

- chart data
- row / column data
- chart dimensions
- hidden series state

圖表 instance 則改由元件內部管理（例如 useRef），生命週期完全跟隨元件。

當需要輸出圖表時：

- 建立暫時性的 offscreen chart
- 套用目前 Redux 中保存的資料
- 產生輸出結果
- 完成後立即釋放 instance

整個流程不會將任何圖表 instance 存入 Redux。

## Result

改善後帶來幾項效果：

- Redux State 完全保持 Serializable
- 移除額外的 DevTools state sanitizer
- 降低 Redux 長期持有大型物件造成的記憶體使用
- UI 顯示與輸出流程共用同一份資料來源，避免行為不一致
- State 與 UI Lifecycle 職責更加清楚，降低後續維護成本

## 核心設計原則

- Global State 應只保存業務資料（Business State），
  UI Instance 應由元件自行管理（UI Lifecycle）。
- 透過重新劃分 State Ownership，可以同時改善記憶體使用、資料一致性，以及系統可維護性。
