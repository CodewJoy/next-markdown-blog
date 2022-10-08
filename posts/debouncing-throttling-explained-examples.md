---
title: 'Debouncing and Throttling: explained through examples'
date: 'August 9, 2021'
readTime: '25 min'
---
<!-- # Debounce & Throttle: 網頁 DOM 事件的效能優化
 -->
###### tags: `Debounce` `Throttle`

# 起源
各版本的瀏覽器實作時，為了確保滑鼠移動、滾動、改變視窗大小 (mousemove, scroll, resize) 等事件能夠及時回應維持使用者體驗，觸發的頻率會比較高。也就是說，使用者在一個正常的操作中，有可能在短時間內觸發非常多次事件處理器 (event handler)。

如果為這些短時間內觸發非常多次的事件處理器綁定一些 DOM 節點操作，就會引發大量消耗效能的 DOM 計算，不斷重新計算 DOM 元素的絕對位置，造成頁面緩慢，甚至瀏覽器直接崩潰。

如何解決?
Debounce 和 Throttle 是兩個很相似但是又不同的技術，都可以控制一個函數在一段時間內執行的次數。

當我們在操作 DOM 事件的時候，為函數添加 debounce 或者 throttle 會很有用。我們不會直接去控制這些 DOM 事件觸發的頻率，而是在事件和函數執行之間加了一個我們自己的控制層。

視覺化模擬 Example
https://codepen.io/yichenhung/pen/dyvZNgV
regular: 只要在觸發區域內移動滑鼠，會無限觸發函式
debounce: 滑鼠進去或離開觸發區域執行函式
throttle: 在觸發區域中移動滑鼠即可觸發函式，控制函式觸發頻率

# 去抖動 debounce
讓一個函式在連續觸發時只執行一次。允許我們將多個連續的調用合併成一個。

概念像搭電梯：你走進了電梯，門剛要關上，這時另一個人想要進來，於是電梯沒有移動樓層（處理函數），而是將門打開讓那個人進來。這時又有一個人要進來，就又會上演剛才那一幕。也就是說，電梯延遲了它的函數（移動樓層）執行，但是優化了資源。

## debounce 實例
https://codepen.io/athena0304/pen/NBVjRB/
debounce 事件等到快速事件停止發生後才會觸發函數執行, 多個訊號合併成一個訊號時，是要在最後執行 {leading:false, trailing:true} 執行。

上述例子可讓我們看到連續快速事件是怎樣被一個單獨的 debounce 事件所替代的。但是如果事件觸發時間間隔較長，就不會發生 debounce。 

**大部分的實作會加上 leading 參數，意思是多個訊號合併成一個訊號時，是要在最開始時執行 default: {leading: true, trailing:false} 執行**。
https://codepen.io/athena0304/pen/mGbgGo/

*Lodash 為 .debounce 和 .throttle 添加了更多的特性。最初的 immediate 標識符被 leading 和 trailing所替代。你可以選擇一個選項，也可以兩個都要。默認情況下 trailing 是被開啟的。*

### 程式碼概念
* 設一個計時器 (timer)，保存當下脈絡後 (context, args)
* 只要太早進來 (小於 delay) 就會重置計時器，直到成功執行 setTimeout 內的函式後結束。
* 注意這裡 debounce 回傳的是一個閉包 (closure)，是 js 的一個重要特性，不這樣寫的話 timer 就必須是全域變數，以防止每次呼叫 timer 都被重置產生錯誤。
```javascript=
/**
* @param fn{Function} 實際要執行的函數
* @param delay {Number} 延遲時間，也就是域值
*
* @return {Function} 返回一個去彈跳的函數
*/
function debounce(fn, delay) {

  // 計時器，用來 setTimeout
  var timer;
  
  // 返回一個函數，此函數會在一個時間區間(delay 毫秒）後執行fn函數
  return function () {
  
    // 保存函數調用時的上下文和參數，傳遞給 fn
    var context = this;
    var args = arguments;
    
    // 每次這個返回的函數被調用，就清除計時器，以保證不執行 fn
    clearTimeout(timer);
    
    // 當返回的函數被最後一次調用後（也就是用戶停止了某個連續的操作），再過 delay 毫秒就執行 fn
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay);
  }
}
```

### 常見用法
* 連續輸入
(1) 使用者連續輸入基本資訊後，才觸發事件處理器進行格式確認與提示訊息等。
(2) 敲擊鍵盤，通過 Ajax 請求自動填充表單
https://codepen.io/athena0304/pen/NLKVZw/
為什麼要在用戶還在輸入的時候每隔 50ms 就發送一次 Ajax請求？_.debounce 可以幫助我們避免額外的開銷，**只有當用戶停止輸入了再發送請求**。**這裡設置 leading = false，我們是想要等到最後一個字符輸入完再執行函數**。
* Resize
通過拖拽瀏覽器窗口，可以觸發很多次 resize 事件。
https://codepen.io/athena0304/pen/KxPLZy/
這裡在 resize 事件上使用的是默認的 `trailing ` 選項（trailing=false），因為我們想知道的是**用戶停止調整瀏覽器時當下**的結果。

# 函數節流(節流閥) throttle

* 讓一個函數不要執行得太頻繁，也就是控制函數最高呼叫頻率，減少一些過快的呼叫來節流。
* Throttle 和 debounce 最主要的區別就是 throttle 保證函數每 X 毫秒至少執行一次。
* 實際上，throttle 函數就是使用 .debounce 帶著 maxWait 的選項來定義的。[source code](https://github.com/lodash/lodash/blob/4.8.0-npm/throttle.js)

### 程式碼概念
與 debounce 的程式邏輯相似，只多了一個時間間隔的判斷。

```javascript=
/**
* @param fn{Function} 實際要執行的函數
* @param delay {Number} 執行間隔，單位是毫秒
*
* @return {Function} 返回一個節流函數
*/
function throttle(fn, threshhold) {
  // 紀錄上次執行的時間
  var last;
  // 計時器
  var timer;
  
  // 默認間隔為 250 ms
  threshhold || (threshhold = 250);
  
  // 返回的函數，每過 threshold 毫秒就執行一次 fn 函數
  return function () {
    // 保存函數調用時的上下文和參數，傳遞給 fn
    var context = this;
    var args = arguments;
    
    var now = +new Date();
    // 如果距離上次執行 fn 函數的時間小於 threshold
    // 就放棄執行 fn，並重新計時
    if (last && now < last + threshhold) {
      // 每次這個返回的函數被調用，就清除計時器，以保證不執行 fn
      clearTimeout(timer)
      
      // 保證在當前時間區間結束後，再執行一次 fn
      timer = setTimeout(function () {
        last = now;
        fn.apply(context, args)
      }, threshold);
    
    // 在時間區間的最開始和到達指定間隔的時候執行一次 fn
    } else {
      last = now
      fn.apply(context, args)
    }
  }
}
```
### 常見用法
* 無限滾動 
(1) 用戶在一個無限滾動的頁面裡向下滾動，你**需要知道當前滾動的位置距離底部還有多遠**，如果接近底部了，我們就得通過 Ajax 請求獲取更多的內容，將其添加到頁面裡。
(2) 此時我們之前的 _.debounce 就派不上作用了。**使用 debounce 只有當用戶停止滾動時才能觸發，而我們需要的是在用戶滾動到底部之前就開始獲取內容**。
(3) **使用 _.throttle 就能確保實時檢查距離底部還有多遠。並且減少 scroll 的觸發頻率**，因為 scroll 常常綁定一些消耗資源的 render 的事件。

### throttle 實例
https://codepen.io/dcorb/pen/eJLMxa

# 常見的坑

使用 _.debounce 函數的一個常見錯誤就是多次調用它：

```javascript=
// wrong
$(window).on('scroll', function() {
   _.debounce(doSomething, 300); 
});
// correct
$(window).on('scroll', _.debounce(doSomething, 200));
```

為 debounced 函數創建一個變量保存他，就可以讓我們調用他的私有函數 debounced_version.cancel()，lodash 也能這麼使用。
```javascript=
var debounced_version = _.debounce(doSomething, 200);
$(window).on('scroll', debounced_version);
// 如果需要的话
debounced_version.cancel();
```

# Loadash 造好的輪子
比起自己寫，建議直接使用 Lodash 的實作比較穩定。

* debounce
https://lodash.com/docs/4.17.15#debounce
* throttle
https://lodash.com/docs/4.17.15#throttle

# requestAnimationFrame (rAF)

## rAF 舉例 - prograss bar
https://codepen.io/chriscoyier/pen/ltseg?editors=0010

* 另一種限制函數執行速度的方法
* requestAnimationFrame 是一個瀏覽器原生的 API，不是一種優化方法論，因此可以和上面兩種方法一起使用
* rAF 大致可以視為 16 ms 的 throttle
_.throttle(dosomething, 16)，但其內部的機制是由瀏覽器直接控制，因此有更好的精準度，常用於與動畫有關的控制。

我們可以使用 rAF API，作為 throttle 函數的替代，其優缺點如下：
* 優點：
(1) 目標是 60fps（每幀 16ms，Frame per second/Frame Rate畫面播放速率），但是會在瀏覽器內部決定如何安排渲染的最佳時機。
(2) 簡單，而且是原生標準 API，易維護執行，精度高
* 缺點：
(1) rAFs 的開始/取消由我們自己來管理，而不像 .debounce 和 .throttle 是在內部管理的。
(2) 支援所有現代瀏覽器，不支援 IE 9。如果需要還是要使用 polyfill 。
(3) 後端的 node.js 不支援，不能在 server 檔案系統的事件使用 throttle

### 常見用法
* 涉及到元素位置重新計算的情境
(1) 如果你的 JavaScript 函式跟繪圖或動畫有關，會建議使用 requestAnimationFrame 處理所有涉及到元素位置重新計算的情境
(2) 如果是處理 Ajax 請求，或者決定是否添加/刪除某個 class（可能會觸發一個 CSS 動畫），可考慮使用 _.debounce 和 _.throttle，因其可以設置更低一些的執行速度（例如 200ms，而不是16ms）。

### rAF 與 throttle 的對比實驗
https://codepen.io/dcorb/pen/pgOKKw/
一邊是 rAF，一邊是 16ms 間隔的 _.throttle。它們性能很相似，但是 rAF 可能會在更復雜的場景下性能更高一些。


# 小結
使用 debounce，throttle 和 requestAnimationFrame 都可以優化事件處理，三者各不相同，也可搭配使用，相輔相成。
* debounce：將一系列迅速觸發的事件（例如敲擊鍵盤）合併成一個單獨的事件。
* throttle：確保每 X 毫秒執行一次。例如每 200ms 檢查一下滾動條的位置來觸發某個 CSS 動畫。
* requestAnimationFrame：可替代 throttle ，適用於需要重新計算元素在屏幕上的位置和渲染的時候，能夠保證動畫或者變化的平滑性。

# Reference:
1. Debouncing and Throttling Explained Through Examples
https://css-tricks.com/debouncing-throttling-explained-examples/ (lodash document 在 Debounce 和 Throttle 內容中推薦閱讀的一篇文章)
2. https://codertw.com/%E7%A8%8B%E5%BC%8F%E8%AA%9E%E8%A8%80/691496/
3. https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html
4. https://jinlong.github.io/2016/04/24/Debouncing-and-Throttling-Explained-Through-Examples/
5. 深入理解requestAnimationFrame的動畫迴圈
https://codertw.com/%E5%89%8D%E7%AB%AF%E9%96%8B%E7%99%BC/260087/
6. https://css-tricks.com/using-requestanimationframe/