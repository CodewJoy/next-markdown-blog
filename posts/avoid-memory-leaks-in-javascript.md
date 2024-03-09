---
title: 'Causes of Memory Leaks in JavaScript and How to Avoid Them'
date: 'November 19, 2022'
readTime: '25 min'
difficultyLevel: '3'
---

# JavaScript - 重新認識 Memory Leak 

###### tags: `JavaScript` `Memory Leak` `Garbabe Collection` `Chrome Dev Tool`

![](https://i.imgur.com/CtUzCCS.png)

## 為什麼了解 Memory Leak 是重要的
* 傳統的網頁在一般情況下，忽視記憶體管理並不會產生顯著的後果。這是因為使用者重新整理頁面後，記憶體資料都被清理了。
* 隨著 SPA 的普及，我們不得不更加關注頁面的記憶體管理。使用者在 SPA 上往往很少重新整理頁面，隨著頁面停留時間的增長，記憶體可能越佔越多，輕則影響頁面效能，嚴重的可能導致標籤頁崩潰。

![](https://i.imgur.com/oSNeDMp.png)
*  A poorly-coded SPA with problem of memory leak might start to slow to a crawl, or the browser may just terminate the tab and you’ll see Chrome’s familiar “Aw, snap!” page.

## What is Memory leaks

**Memory leak（記憶體流失) 概念**
* 程式運行的過程中，不再使用的記憶體空間沒有正常被釋放，持續佔用空間而造成的記憶體浪費。如果這種狀況不斷發生，就會使可用的記憶體越來越少，降低電腦的效能。
* 在 JavaScript 裡，記憶體回收的工作是交由自動化的 Garbage Collection 來完成，它就像記憶體裡的清道夫，會判斷不再使用的記憶體並將其回收。

**細部說明**
**Reference chain**
* Browser 會將 objects 存放在 heap memory 中，從根物件 (root，在瀏覽器中是 window，node 則是 global)，藉由 reference chain 可到達這些 objects。

    ![](https://i.imgur.com/EW6NuKX.png)

**Garbage Collection(簡稱 GC)**
* Garbage Collector 是 JavaScript 引擎中的一種 background process，其工作是：定期從根物件開始往下探詢每一個子節點，鑑別沒有被探詢到、或是沒有被探詢物件參考的物件，也就是所謂「無法到達的物件 (unreachable objects)」，並將其刪除，回收相對應的記憶體空間

    下圖中 Object 4 會從記憶體中移除
    ![](https://i.imgur.com/76FvcAw.png)
    
    [Reference-counting garbage collection](https://felixgerschau.com/video/stack-heap-gc-animation.mp4)

* 當 objects 本該被 GC 清掉，卻由於疏忽或錯誤，objects 意外被引用而維持可被 reference chain 訪問的狀態，成為可被探詢到的垃圾資料，就會發生 Memory leaks。

## JavaScript 導致 Memory Leaks 常見的 6 種情形

### 1.不當存取全域變數

全域變數不會被 GC 回收。在非嚴格模式下，需避免以下錯誤: 
* 給未宣告的變數賦值，會讓區域變數變成全域變數
```javascript=
// wrong
function createGlobalVariables() { 
    leaking1 = '變成全域性變數'; // 如果作用域內沒有宣告變數，卻賦值給該變數，JavaScript 會自動幫我們在全域宣告一個全域變數
}; 
createGlobalVariables(); 
window.leaking1; // '變成全域性變量了' => 在瀏覽器下的全域物件是 window
```
* 使用指向全域性物件的 this，會讓區域變數變成全域變數
```javascript=
// wrong
function createGlobalVariables() { 
    this.leaking2 = '這也是全域性變數';
}; 
createGlobalVariables();  // => 直接呼叫函式的情況下，this 會指向全域
window.leaking2; // '這也是全域性變數' 
```
**如何避免**
採用嚴格模式("use strict")．上述例子在嚴格模式下會爆錯，避免 memory leak 產生

### 2.Closures 閉包

一般的函式作用域變數在函式執行完後會被清理. 
閉包讓我們可以從 inner 函式訪問 outer 函式 scope 的變數，此特性會讓該變數一直處於被引用狀態，不會被 GC 回收。
```javascript=
// wrong
function outer() {
  const potentiallyHugeArray = [];

  return function inner() {
    potentiallyHugeArray.push('Hello'); // function inner is closed over the potentiallyHugeArray variable
    console.log('Hello');
    console.log('potentiallyHugeArray', potentiallyHugeArray);
  };
};
const sayHello = outer(); // contains definition of the function inner

function repeat(fn, num) {
  for (let i = 0; i < num; i++){
    fn();
  }
}
repeat(sayHello, 10); // 每次呼叫 sayHello 都會新增 'Hello' 到potentiallyHugeArray  
 
// now imagine repeat(sayHello, 100000)
```
**如何避免**
在使用閉包時需要清楚知道
* 何時創建了閉包以及閉包保留了哪些 Objects
* 閉包的預期壽命以及使用情形，尤其是作為 callback 來使用的時候


### 3.Timers 定時器

在 setTimeout 或 setInterval 的 callback 函式中引用某些物件，是防止被 GC 回收的常見做法。
下面的例子中，data 物件只能在 timer 清掉後被 GC 回收。但因為沒有拿到 setInterval return 的定時器 ID，也就沒辦法用程式碼清除這個 timer。
雖然 data.hugeString 完全沒被使用，也會一直保留在記憶體中。

```javascript=
// wrong
function setCallback() { 
    const data = { 
        counter: 0, 
        hugeString: new Array(100000).join('x') 
    }; 
    return function cb() { 
        data.counter++; // data 物件現在已經屬於 callback 函式的作用域 
        console.log('data.counter', data.counter);
        console.log('data', data)
    } 
} 
setInterval(setCallback(), 1000); // 無法停止定時器
```
**如何避免**

對於使用壽命未定義或不確定的 callback 函式，我們應該：
* 留意被 timer 的 callback 所參考的物件
* 必要時使用 timer return 的定時器 ID，丟進 clearTimeout 或 clearInterval 以清除 timer。

```javascript=
// right
function setCallback() { 
    // 分開定義變數 
    let counter = 0; 
    const hugeString = new Array(100000).join('x'); // setCallback return 後即被回收 
    return function cb() { 
        counter++; // 只剩 counter 位於 callback 函式作用域 
        console.log(counter); 
    } 
} 
 
const timerId = setInterval(setCallback(), 1000); // 儲存定時器 ID 
 
// 執行某些操作 ... 
 
clearInterval(timerId); // 清除定時器，ex 按完按鈕後清除
```

### 4.Event listeners 事件監聽器

事件監聽器會阻止其作用域內的變數被 GC 回收，事件監聽器會一直處於 active，直到
1. 使用 removeEventListener() 移除該 event listers
2. 移除與其關聯的 DOM 元素

```javascript=
// wrong
const hugeString = new Array(100000).join('x');

document.addEventListener('keyup', function() { // 匿名監聽器無法移除 
  doSomething(hugeString); // hugeString 會一直處於 callback 函式的作用域內 
});
```
上面例子中
1. 事件監聽器用了匿名函式，沒法用 removeEventListener()移除
2. 也無法刪除 document元素

因此事件 callback 函式內的變數會一直保留，就算我們只想觸發一次事件。


**如何避免**
當事件監聽器不再需要時，使用具名函式方式得到其 reference，並且在 removeEventListener() 中解除事件監聽器跟關聯的 DOM 元素的連結
```javascript=
// right
function listener() { 
    doSomething(hugeString); 
} 
document.addEventListener('keyup', listener);  
document.removeEventListener('keyup', listener);  
```

如果事件監聽器只需要執行一次， addEventListener()可以接受[第三個 optional 參數 {once: true}](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)，監聽器函式會在事件觸發一次執行後自動移除(此時匿名函式也可以用此方式)。

```javascript=
// right
document.addEventListener('keyup', function listener(){ 
    doSomething(hugeString); 
}, {once: true}); // 執行一次後自動移除事件監聽器 

```

React 寫法
```javascript=
useEffect(() => {
    window.addEventListener('keyup', listener);  
    return () => {
        window.removeEventListener('keyup', listener); 
    };
},[]); 
```

### 5. 儲存 DOM 的變數
如果 DOM 節點被 JavaScript 程式碼持續引用，即使將該節點從 DOM three 移除，也不會被 GC 回收。

```javascript=
// wrong
function createElement() { 
    const div = document.createElement('div'); 
    div.id = 'detached'; 
    return div; 
} 
 
// 即使呼叫了deleteElement() ，全域變數 detachedDiv 依然儲存著 DOM 元素的 reference，所以無法被 GC 回收
const detachedDiv = createElement(); 
document.body.appendChild(detachedDiv); 

function deleteElement() {
    document.body.removeChild(document.getElementById('detached')); 
} 
 
deleteElement(); // Heap snapshot 顯示為 detached div#detached 
```

**如何避免**
限制只能在 local scope 之內引用 DOM
```javascript=
// right
function createElement() { 
    const div = document.createElement('div'); 
    div.id = 'detached'; 
    return div; 
} 
 
function appendElement() {
    // 在 local scope 之內引用 DOM
    const detachedDiv = createElement(); 
    document.body.appendChild(detachedDiv); 
} 
 
appendElement(); 
 
function deleteElement() { 
     document.body.removeChild(document.getElementById('detached')); 
} 
 
deleteElement(); 
```

### 6. 快取: 以「弱引用 (weak reference)」機制取代「強引用 (strong reference)」實現快取，避免 memory leak

如果持續地往快取裡增加資料，沒有定時清除無用的物件，也沒有限制快取大小，那麼快取就會像滾雪球一樣越來越大。

[Map v.s. WeakMap, Set v.s Weak Set](https://javascript.info/weakmap-weakset)

Wrong Example: 使用 Map 資料結構來儲存快取

```javascript=
// wrong
let user_1 = { name: "Peter", id: 12345 };
let user_2 = { name: "Mark", id: 54321 };
const mapCache = new Map();

function cache(obj){
  if (!mapCache.has(obj)){
    const value = `${obj.name} has an id of ${obj.id}`;
    mapCache.set(obj, value); // 添加 key

    return [value, 'computed'];
  }

  return [mapCache.get(obj), 'cached']; // 讀取 value
}

cache(user_1); // ['Peter has an id of 12345', 'computed']
cache(user_1); // ['Peter has an id of 12345', 'cached']
cache(user_2); // ['Mark has an id of 54321', 'computed']

console.log(mapCache); // ((…) => "Peter has an id of 12345", (…) => "Mark has an id of 54321")
user_1 = null; // removing the inactive user

// Garbage Collector
console.log(mapCache); // ((…) => "Peter has an id of 12345", (…) => "Mark has an id of 54321") // first entry is still in cache
```

當設定 key value pair 在 Map 的資料結構中，即使之後 key 被清空，原本的 key value pair 還是依然存在，因為 Map 中所有 key 和 value 會一直被引用，導致無法被 GC
![](https://i.imgur.com/v0sEm8B.png)



解決方案： 上述案例可以改使用 [WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)。 
WeakMap 是 ES6 新增的一種資料結構，它只用物件作為 key，並保持物件 key 的 weak reference，如果物件 key 被置空了，相關的 key value pair 會被 GC 自動回收。

```javascript=
// right
let user_1 = { name: "Kayson", id: 12345 }; 
let user_2 = { name: "Jerry", id: 54321 }; 
const weakMapCache = new WeakMap(); 
 
function cache(obj){ 
  if (!weakMapCache.has(obj)){
    const value = `${obj.name} has an id of ${obj.id}`;
    weakMapCache.set(obj, value); // 添加 key

    return [value, 'computed'];
  }
    return [weakMapCache.get(obj), 'cached']; 
} 
 
cache(user_1); // ['Kayson has an id of 12345', 'computed'] 
cache(user_2); // ['Jerry has an id of 54321', 'computed'] 
console.log(weakMapCache); // ((…) => "Kayson has an id of 12345", (…) => "Jerry has an id of 54321"} 
user_1 = null;  
 
// Garbage Collector 
 
console.log(weakMapCache); // ((…) => "Jerry has an id of 54321") - 第一條記錄已被 GC 刪除 
```

## 如何偵測 Memory Leak

[Demo 使用範例](https://sh1zuku.glitch.me/demo/memory-leak/)
出處：[你所不知道的必學前端Debug技巧：即學即用！讓你Debug不求人(iT邦幫忙鐵人賽系列書)](https://www.books.com.tw/products/0010904896?loc=M_0009_001)

### Chrome Task Manager
1. 開啟 Chrome 的 Task Manager 。
![](https://i.imgur.com/ZemyuEs.png)
2. 找到存在 Memory Leak 問題的網頁。
![](https://i.imgur.com/LjuLOut.png)
3. 如果頁面都沒有任何互動，記憶體佔用卻越來越多，很可能存在 Memory Leak。
4. 若懷疑特定行為會產生 Memory Leak，可在網頁上重複執行該動作。
5. 重複多次後再次觀察 Task Manager ，確定 JavaScript memory 有顯著的增加。
6. 由上面的步驟我們可以鎖定特定動作會導致記憶體增加。

### Chrome Dev Tool
#### Performance Panel: 找到發生 Memory Leak 的函式
在鎖定目標行為或函式後，可以使用 DevTools 的 Perfomance 功能紀錄 Memory 的使用情況:

0. 重新整理頁面，讓記憶體用量初始化，減少其他影響
1. 在問題網頁上開啟 DevTools 的 Perfomance Tab 。
![](https://i.imgur.com/jTwmdmw.png)
2. 勾選 Memory 表示要記錄 Memory 的使用情況。效能紀錄中會多出一列記憶體用量折線圖
3. 按下左上的開始記錄紐。
4. 在頁面上使用目標功能，造成記憶體用量上升。
5. 功能執行完畢後，點擊垃圾桶圖示，執行垃圾回收清除記憶體
6. 重複 4. 5. 步驟數次
7. 停止紀錄效能資訊，按下 Stop 。觀察折線趨勢
若在重複步驟過程中，整體記憶體用量逐漸上升，並且每次釋放記憶體時，折線沒有恢復到前一步騶高度，大致上能確認該功能存在記憶體洩漏
![](https://i.imgur.com/D08Og5y.png)
* 上圖中可看到 JS Heap 呈現上升趨勢，點擊折線圖上升處，可在下方詳細資訊面板中看到造成記憶體洩漏的函式

* 確認排除 Memory Leak 問題
要確認沒有 Memory Leak 的問題可以在使用 Performance 紀錄記憶體的使用情形。
記憶體在每次動作後會恢復正常水平就代表沒有記憶體洩漏問題。
![](https://i.imgur.com/unkkeP3.png)

#### Memory Panel: 找出發生 Memory Leak 的物件

* Concept
![](https://i.imgur.com/dPPjINe.png)

##### 3-snapshot technique
1. 開啟 DevTools 的 Memory Tab, 選擇 Heap snapshot。
![](https://i.imgur.com/w1E6VDF.png)
3. 重新整理頁面，點擊左上角 ● Take Heap snapshot，take snapshot 1。
4. 執行目標功能後，點擊左上角 ● take snapshot 2。
5. 點擊垃圾桶圖案進行 GC, 再次執行目標功能, take snapshot 3。
6. 在 Tab 選擇 Comparison ，並且選擇想看的 snapshot。比較 snapshpt 1, 2, 3 下方列表的變化, 如此一來我們就可以看到不同時機點下哪個類型的物件有異常的增長，可以從中發現問題點。
![](https://i.imgur.com/aHbLPvc.png)

* Sanpshot 2 多了 array constructor，Size Delta 值最大，顯示有大量記憶體佔用
![](https://i.imgur.com/wAk7NV9.png)
* 展開記憶體用量較大資訊，可看到造成記憶體洩漏的物件
![](https://i.imgur.com/d4Mwkr3.png)
    Memory Panel 名詞
    * Distance, 從 Root 開始算，存取到該物件的最短路徑
    * Shallow Size: 物件本身所用的 Memory
    * Retained Size: 該物件被回收後能夠釋放的記憶體

* 甚至可跳到造成 Memory Leak 對應的程式碼
![](https://i.imgur.com/TJg9c0R.png)



[Google 當初解 Gmail website memory leak 的方法也是用同樣的概念](https://docs.google.com/presentation/d/1wUVmf78gG-ra5aOxvTfYdiLkdGaR9OhXRnOlIcEmu2s/pub?start=false&loop=false&delayms=3000&slide=id.g14717ff3_0_47)


**結論**
了解 GC 可以幫助我們寫出比較不容易記憶體洩漏的程式碼。在開發上這並不是一個容易被找出來的問題，透過以上手法我們可以防範一些比較基本的錯誤，必要時也可以透過 Chrome dev tool 來除錯。

**心得**
1. 平時可以留意對於全域變數的運用，不過我們現在大部分都是用[模組化的 JavaScript](https://javascript.info/modules-intro#a-module-code-is-evaluated-only-the-first-time-when-imported)，即使是在檔案裡直接定義變數，它也不會是 global 的，但同樣的問題有機會發生在 module 內、closure 內，所以重要的是這個概念，留意但也不須過度謹慎（例如，每個用完的都在自己設回 null）
討論：過去實作上有無遇到 Memory Leak 的問題

2. 回到記憶體管理的課題，Redux 的使用也是類似全域變數的概念。對於跨 Component 傳遞與拿取變數的需求，何時該把變數儲存在 Redux，何時該把變數儲存在 Context 等 issue，記憶體的佔用也可作為考量的一個因素
討論：工作實戰中何時該把變數儲存在 react-redux (or Vuex)，何時該把變數儲存在 Context(provide, inject) 呢？

##  Reference and further study
* 從你的 Node.js 專案裡找出 Memory leak，及早發現、及早治療！=> 後端服用
https://vocus.cc/article/61176c17fd89780001942f1c
* Causes of Memory Leaks in JavaScript and How to Avoid Them
https://www.ditdot.hr/en/causes-of-memory-leaks-in-javascript-and-how-to-avoid-them
* JavaScript 記憶體洩漏防範之道
https://www.gushiciku.cn/pl/pBZY/zh-tw
* 通過【垃圾回收機制】的角度認識【Map與WeakMap】的區別
https://www.gushiciku.cn/pl/g4iM/zh-tw?fbclid=IwAR3_BMatJFYGTMtJbc331F4Iur1fyKTCuNQSmWHN5Ja2ftLLeO-qwP_JxT4
* https://medium.com/starbugs/%E8%BA%AB%E7%82%BA-js-%E9%96%8B%E7%99%BC%E8%80%85-%E4%BD%A0%E4%B8%8D%E8%83%BD%E4%B8%8D%E7%9F%A5%E9%81%93%E7%9A%84%E8%A8%98%E6%86%B6%E9%AB%94%E7%AE%A1%E7%90%86%E6%A9%9F%E5%88%B6-d9db2fd66f8
* 身為前端開發者，你不能不知道的 Runtime Performance Debug 技巧
https://medium.com/starbugs/%E8%BA%AB%E7%82%BA%E5%89%8D%E7%AB%AF%E9%96%8B%E7%99%BC%E8%80%85-%E4%BD%A0%E4%B8%8D%E8%83%BD%E4%B8%8D%E7%9F%A5%E9%81%93%E7%9A%84-runtime-performance-debug-%E6%8A%80%E5%B7%A7-4f0efd27b86d
* 使用 Chrome DevTools 找出 Memory Leak 問題
https://peterhpchen.github.io/2018/12/03/memory-leak-javascript.html
* Monitor your web page's total memory usage with measureMemory()
https://web.dev/monitor-total-page-memory-usage/
* Fix Memory Problems @ Google Developers
https://developer.chrome.com/docs/devtools/memory-problems/
* Variable Scope, Garbage Collection, and Memory Management in JavaScript 
https://hackmd.io/awI7ChnISsS2SOLi2j5gJA
* Fixing memory leaks in web applications
https://nolanlawson.com/2020/02/19/fixing-memory-leaks-in-web-applications/
* JavaScript's Memory Management Explained
https://felixgerschau.com/javascript-memory-management/
* [web] 記憶體問題 memory leak
https://pjchender.dev/webdev/google-developer-memory-leak/