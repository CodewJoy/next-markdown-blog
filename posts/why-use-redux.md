---
title: '[Note] Why use Redux?'
date: 'December 10, 2022'
readTime: '10 min'
---
###### tags: `Redux` 

> A Predictable State Container for JS Apps

## 解決問題
* 用來實現跨 components 的「狀態管理」，解決 React prop drilling 問題
* 當 App 的資料 state 會被很多 View 使用並更改，使用 Redux 能夠讓資料的變更（state mutations）是可預期的，易於測試與 debug
![](https://i.imgur.com/kJHScWi.png)

## 如何實現
![](https://i.imgur.com/yRLyItg.png)

組成 Redux 的三個要素：
* Store：一個物件，在應用程式中負責保管 state，整合所有的 reducer，整個應用程式必然只有一個 store
* Reducer：一個函式，接收到不同的 action 指令時該對 state 做什麼操作
* Action：一個物件，用來描述對資料要進行什麼樣的操作

遵循嚴格的**單向資料流**，絕對不逆向：

1. component dispatch 一個 action 給 reducer
2. reducer 根據 action 的 type，計算後回傳全新的 state 並更新到 store tree
3. View 取得最新的 state

## 三個原則
* 單一來源：整個應用程式的 state 都保存在單一的 store 裡面
* 唯讀：要改變 state 的唯一方式就是透過 action
* 純函式：reducer 是一個 pure function，它會根據 action 和原有的 state，在不變更原有 state 的情況下，回傳新的 state
> pure function：用相同的 inputs 多次呼叫，都應該產生相同的 output，且不執行任何有 side effects 的動作，完全可預測的函式

這三個原則就是 Redux 的精華，是為了做到「predictable」不可或缺的


## pros & cons
### 優點
* 透過 Reducer 能避免開發者直接 mutate 資料，以減少可能的錯誤並且能追蹤每次資料的變化。
* 透過 Redux Dev Tool，能夠清楚知道 App 資料狀態變更的 when、where、why、how
* 因為資料變更途徑只有一條，所以甚至可以做到 undo、redo 的操作
### 缺點
* 比起直接存變數，特別走 Redux 流程更麻煩一點，要定義很多 action 與 reducer，有很多 boiler plate
* 需要轉換成 Redux 思維，學習曲線較大

### 適合情境
* 「跨多個 View 的 state」
其實可以把 Redux 理解成一個小型的「訂閱系統」，state 就是被關注的值，當 state 發生變化時，通知所有有來訂閱這個 state 的 View，進而做相對應的呈現。

### Reference
1. [前端技能樹的十萬個為什麼-為什麼要用 Redux](https://ithelp.ithome.com.tw/articles/10296471)
2. [[Redux] Redux Basic 基礎](https://pjchender.dev/react/redux-basic/)