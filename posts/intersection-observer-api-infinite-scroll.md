---
title: 'Realize Infinite Scroll with Intersection Observer API'
date: 'October 6, 2022'
readTime: '20 min'
---
# 使用 Intersection Observer API 實現 Infinite Scroll

###### tags: `Intersection Observer` `Web API`

## 前言
現代瀏覽器提供的 Intersection Observer API 非常適合用來實現 Infinite Scroll 和 Lazy Loading 等前端常見的需求。

### Infinite Scroll
隨著使用者滑動頁面，將更多的內容載入 — 類似分頁的功能，但使用者不需要自行切換頁面

#### 過去的實作
在過去要偵測元素是否已經進入「可視範圍」這件事情一種可行的方式是：註冊 scroll 事件監聽搭配運用 [Element.getBoundingClientRect()](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect)、[offsetTop](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetTop)、[offsetLeft](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetLeft)

> 熟悉的 [Stylish](https://codewjoy.github.io/Stylish-Web-Joy/) Code... 
```typescript=
// scroll and call getNextPaging()
window.addEventListener('scroll', () => {getNextPaging()});

// paging function
function getNextPaging() { 
    const triggerDistance = 50;
    const distance = productContainer.getBoundingClientRect().bottom - window.innerHeight;
    if (next_paging !== undefined) {
        if (!isLoading && distance < triggerDistance) {
            isLoading = true;
            ajax(`https://api.appworks-school.tw/api/1.0/products/${category}?paging=${next_paging}`, function (response) {
                isLoading = false;
                render(response);
            }); 
        }
    }     
}
```
[demo of getBoundingClientRect](https://bqv9r.csb.app/)
![](https://i.imgur.com/5ENiqSl.png)

#### 缺點
* 在主執行緒同步的處理註冊和處理事件監聽，透過 Element.getBoundingClientRect()、offsetTop、 offsetLeft 等取得圖片的大小、計算元素與可視範圍的相對或絕對位置等，會迫使瀏覽器同步的（synchronously）重新計算整個頁面的佈局，使得效能降低 —> High Cost
[在 JavaScript 當中使用 Element.getBoundingClientRect()、offsetTop、 offsetLeft... 會觸發瀏覽器 reflow / relayout](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)

舉例：每個客人經過門口餐廳服務生都去確認是否是前來用餐，同時還要處理餐廳內客人的需求

### IntersectionObserver API 解決的問題
舉例：在門口掛上鈴鐺，當設定的目標客人進來或出去都會聽到鈴聲，服務生聽到鈴聲再跟進門客人確認用餐需求即可 ---> low cost
* Intersection Obeserver API「能方便地自動觀察目標元素是否進入或離開父層（或其外層）元素或瀏覽器的 viewport」，解決了該問題。
* async non-blocking API，可以「非同步的」幫我們觀察一個或多個目標是否進出指定的外層元素或 viewport，當被觸發時，可以同時獲得一筆或多筆觀察資訊。只有 callback 函式會在主執行緒上運行。

![](https://i.imgur.com/OLwYQmI.png)

#### 語法
[demo](https://codepen.io/yichenhung/pen/wvmgawO?editors=0010)
- `callback` 函式：當目標元素進入或離開指定外層或預設 viewport 時觸發
- `options`：設定在哪些情況下觸發`callback` 函式
```javascript=
// entries 能拿到所有目標元素進出(intersect)變化的資訊
let callback = (entries) => {
    
    // 取得每一個 entry 都是描述被觀察物件有 intersection change 的情況, 做一些處理或工作
    entries.forEach(entry => {
        entry.target
        entry.isIntersecting
        entry.intersectionRatio // 被觀察者（target）和觀察者（viewport）的重疊比例

        // entry.boundingClientRect
        // entry.intersectionRect
        // entry.rootBounds
        // entry.time
  });
};

let options = {
  root: document.querySelector('#scrollArea'), // 預設 document viewport
  rootMargin: '0px', // 預設 0, 也可以設定 '10px 20px 30px 40px'
  threshold: 1.0 // 預設 0, 也可以使用陣列 [0, 0.25, 0.5, 0.75, 1]
}

// 製作鈴鐺：建立一個 intersection observer，帶入相關設定資訊
let observer = new IntersectionObserver(callback, options);

// 設定觀察對象：告訴 observer 要觀察哪個目標元素
observer.observe(TARGET_ELEMENT)
}
```
#### options 參數
- `root` 必須要是所有目標元素的父元素(或祖父層的元素)
![](https://i.imgur.com/aWZy7jw.png)
- `rootMargin`：設定 root 周圍的 margin — 能有效的**擴大或縮小這個用來觀察的盒子範圍**。設定的值就類似設定一般 margin："30px 30px 30px 30px"（上右下左），也能縮寫成一個值：30px
![](https://i.imgur.com/wl76ich.png)

- `threshold`：設定目標元素的可見度達到多少比例時，觸發 callback 函式。可以帶入單一一個值：**只想在可見度達一個比例時觸發**；也可帶入一個陣列：**想在可見度達多個比例時觸發** 
    - 預設值為 0：一但目標進入或目標的最後一個 px 離開觀察範圍時就觸發
    - 設定為 0.5 ：一但可見度為 50% 時就觸發
    - 設定為 1：可見度達 100% 或一但往下掉低於 100% 時就觸發
    - **設定為 [0, 0.25, 0.5, 0.75, 1]：可見度每跳 25% 時就觸發** -> 看範例
![](https://i.imgur.com/0p1139z.png)
![](https://i.imgur.com/MulbGt7.png)
#### callback 中的 entry 參數
- `entry.target`: 取得是哪個目標元素進入或離開了 viewport
- `isIntersecting`：用來判別目標元素是否進入或離開了 viewport
    - 值由 false 轉為 true：目標元素進入 viewport
    - 值由 true 轉為 false：目標元素離開 viewport
```javascript=
let callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      //  只在目標元素進入 viewport 時執行這裡的工作
    } else {
      // 只在目標元素離開 viewport 時執行這裡的工作
    }
  })
}
```
- `rootBounds`: 用來觀察的盒子 (root + rootMargin)
- `boundingClientRect`: 目標元素
- `intersectionRect`: 目標元素和盒子重疊的區塊

![](https://i.imgur.com/yOg66o8.png)

- `intersectionRatio`：目標元素有多少比例和用來觀察的盒子重疊（白話的來說：目標元素的可見度為多少）。計算方式：*intersectionRect / boundingClientRect*

:::info
:warning: threshold 與 intersectionRatio 兩者差異 ?
- options 所設定的 threshold 是想訂定「何時觸發」，threshold 當中所設定的單一或多個值就是在設定一個個 intersectionRatio 值作為門檻，一但跨越這個門檻（或這些門檻），就觸發 callback 函式
- intersectionRatio 則是當目標元素進出（intersect）變化當下的即時資訊
:::

- `observer.unobserve(entry.target)`: 只想一次性偵測目標對象的進入或離開
```javascript=
let callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      //  目標元素進入 viewport 時做一些事情
      ...
      // 完成後，結束觀察
      observer.unobserve(entry.target)
    } 
  })
}
```

[Infinite scroll example - append new child](https://codepen.io/shubochao/pen/NWPpQGG)

[Infinite scroll example - add image](https://codepen.io/yichenhung/pen/poLwLzz)

#### 瀏覽器支援度
:warning: Jun 1, 2022 除了IE不支援, chrome, safari, firefox都支援 
[Can I use Search?](https://caniuse.com/?search=Intersection%20Observer)

### Libraries
- React: **`react-lazyload`** [demo](https://codesandbox.io/s/lazy-loading-images-iu3fsr?file=/src/LazyImage.js)
- Vue: [vue-intersection-observer](https://www.npmjs.com/package/vue-intersection-observer)

#### 小知識
[scrollspy 也有使用到 intersection observer 的概念](https://bootstrap5.hexschool.com/docs/5.0/components/scrollspy/)

### Reference
[Intersection Observer API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
[Intersection Observer API：Lazy Loading, Infinite Scroll](https://medium.com/%E9%BA%A5%E5%85%8B%E7%9A%84%E5%8D%8A%E8%B7%AF%E5%87%BA%E5%AE%B6%E7%AD%86%E8%A8%98/%E8%AA%8D%E8%AD%98-intersection-observer-api-%E5%AF%A6%E4%BD%9C-lazy-loading-%E5%92%8C-infinite-scroll-c8d434ad218c)
[modules-dynamic-imports article](https://javascript.info/modules-dynamic-imports)
[The Intersection Observer API](https://blog.arnellebalane.com/the-intersection-observer-api-d441be0b088d)
[Import on Visibility](https://hackmd.io/@Emmacheng/SyQInMaI9)
[如何用 Intersection Observer API 實作 Infinite Scroll/Lazy Loading](https://shubo.io/intersection-observer-api/)

[Easily implement Infinite Scrolling using Intersection Observer in vanilla JavaScript](https://dev.to/il3ven/easily-implement-infinite-scrolling-using-intersection-observer-in-vanilla-javascript-5695)

[React infinite scroll example](https://codesandbox.io/s/infinite-scroll-with-intersection-observer-3bps7?file=/src/App.js)