---
title: 'Performance Optimization: use dynamic import in React'
date: 'March 9, 2022'
readTime: '15 min'
difficultyLevel: '2'
---
###### tags: `React`

## When: 何時可以考慮使用 dynamic import
當前端使用 React 框架寫完程式碼，一般來說我們會使用 Webpack 等打包套件打包程式碼。並且在檢視套件分佈情形，會使用 [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)。
如果沒有另外做處理，產生出來的檔案會是一個 bundle.js 的JavaScript 檔案，該檔案是專案內所有被編譯過的程式碼，讓網頁載入時只需要拿到打包過的 JavaScript 就能夠產生所有互動與畫面。

但如果在功能比較複雜的網站，當我們的功能越寫越多，打包的 JavaScript 也會越來越大包，這樣會導致一開始進入網站時網頁下載資源的時間會越長，畫面出現在網頁的速度越慢，使用者體驗越差。

針對這個問題，Dynamic Import 是其中一種解決方案。

## Why: 為何要使用 Dynamic import

這裡可套用 lazy loading 的概念：「等用到的時候再載入」。
由於不是每個網站使用者到網站都會用到每項功能，所以有很大的機率其實有些部分根本是不需要的，如果使用者不看，那我們也不需要把所有模組放在第一包 JavaScript 中。

如果今天我們的 App 中，有些功能在初始載入時不會立即使用，ex 使用者不點選按鈕的話根本不會呈現與該模組有關的畫面。

這時可把將初始頁面與該模組分開打包成不同的 JavaScript 檔案，以減少「滿足看到網站第一個畫面需求」的 JavaScript 檔案大小

如果網站使用者手動點到該功能，再用「動態的方式 ( 發 Request) 要回那個功能」打包的 JavaScript ，如果已經要回來，則會「直接使用」已經要回來的 JavaScript，不會又再發 Request 去要一次。

- **優點**
**可減少初始頁面載入的 JavaScript 資源大小與等待時間**，這是我們想要達成的目標。
- **缺點**
在手動點選該功能時，由於需要額外載入該模組對應的 JavaScript 資源，比起原本會多花一些時間。

[看案例動態顯示](https://www.patterns.dev/posts/dynamic-import/)
[案例程式碼](https://codesandbox.io/s/dynamicimport-forked-lr9bp?file=/src/components/ChatInput.js)

## How: 如何使用 Dynamic Import？
在 React 的官網中 有介紹了 React Suspense & React.lazy，可實作 dynamic import。
Notice：該方法不適用在 server side rendering

#### React 原生提供的解決方案 - React Suspense & React.lazy
React 在 v16.6 新增了 **lazy** 和 **Suspense** API，有興趣可以看 [React Today and Tomorrow — Sophie Alpert and Dan Abramov — React Conf 2018](https://www.youtube.com/watch?v=V-QO-KO90iQ&ab_channel=ReactConf)
lazy API 負責呼叫 import() 語法非同步載入 App 元件，動態載入js，可以將程式碼分割，需要用到時再用import載入

`<Suspense>` 元件必須搭配 Lazy 使用，主要是讓你可以「等」目標程式碼的載入，假如 component 還沒載入完成，可以透過 fallback 直接指定載入狀態 (loading state) 的畫面（例如一個 Spinner），讓用戶等待 data 載入時可以顯示。

**我們可以把 Suspense 理解成一種機制，這個機制是用來跟 React 說某個正在被讀取的元件，目前還沒有準備好；而這時 React 就知道要等到該元件準備好後，再更新資料。**

備註：suspense 這個字有懸而未決的意思
```typescript
const ProfilePage = React.lazy(() => import('./ProfilePage')); // lazy loading

// 在 ProfilePage 组件处于加载阶段时显示一个 spinner
<Suspense fallback={<Spinner />}>
  <ProfilePage />
</Suspense>
```
### 如何修改非同步載入模組名稱
設定 Webpack 提供的 webpackChunkName 就能做到
ex: webpackChunkName: ProfilPage
2.chunk.js => ProfilPage.chunk.js

## 心得
1. 看過別家產品實際使用 dynamic import 的情境，滿多是著重在 **route dynamic import**，
主要是使用在產品整包是 single page application，所以搭配  route dynamic import，做到分開載入頁面的動作。

2. by 模組的拆法，確實要考慮到滿多層面才能實際運用，否則花費成本不符合效益
(1) **若該頁面其他元件會跟移掉的元件有相依性，把該元件 lazy import 可能會產生潛在風險**
(2) 元件要夠大移掉拆掉才有感，否則沒有太大效益
(3) 若 spec 一直改變，被拆掉的模組又說要一開始就使用，就要把該手法拔掉

## Reference:
- 前端 pattern (推薦閱讀)
https://www.patterns.dev/posts/
- React | 為太龐大的程式碼做 Lazy Loading 和 Code Splitting
https://medium.com/starbugs/react-%E7%82%BA%E5%A4%AA%E9%BE%90%E5%A4%A7%E7%9A%84%E7%A8%8B%E5%BC%8F%E7%A2%BC%E5%81%9A-lazy-loading-%E5%92%8C-code-splitting-7384626a6e0d
- Code-Splitting
https://zh-hant.reactjs.org/docs/code-splitting.html
- Suspense for Data Fetching (Experimental)
https://reactjs.org/docs/concurrent-mode-suspense.html
https://zh-hans.reactjs.org/docs/concurrent-mode-suspense.html
- React 中使用 Dynamic Import
https://medium.com/itsoktomakemistakes/react-%E4%B8%AD%E4%BD%BF%E7%94%A8-dynamic-import-3bfed937669e
- 為何React lazy與Suspense不常被使用
https://blog.yyisyou.tw/8687e398/