---
title: 'Design Pattern - Mediator/Middleware Pattern'
date: 'October 29, 2022'
readTime: '20 min'
difficultyLevel: '3'
---
###### tags: `design pattern`
> 協調各元件之間互動的中間人。

#### 在談 Mediator Pattern 以前...
先來寫段簡單的產品購買流程
一、簡要需求說明
1. 在購買流程中，可選擇產品顏色與輸入購買量
2. 頁面中有兩個展示區域，可以顯示已選擇的顏色和數量
3. 還有一個按鈕可以動態提示 user 下一步的操作：
* 確認用户輸入購買数量是否為正整數，否則顯示：请輸入正确的購買量
* 確認庫存必須少於購買量，否則顯示庫存不足
* 如果以上條件通過，顯示加入購物車

二、實際開發
[未使用 Mediator 概念前](https://codesandbox.io/s/purchase-procedure-without-middleware-vnfksq?file=/src/index.js)
若未來又要增加 n 個產品輸入框的需求，會形成多個元素對多個元素的影響...
不如把邏輯統一整理在一起吧！
[使用 Mediator 概念後](https://codesandbox.io/s/purchase-procedure-with-middleware-n1s5ci?file=/src/index.js) ＝> 這個例子使用 mediator pattern 時程式碼沒有整理的那麼乾淨，Need to think: 使用 IIFE??
讓管理的方式從分散式管理轉為中心化管理。

### 適用情境
當系统中各個 components 之間進行多對多直接的溝通，會造成 components 之間的溝通混亂，由於當 components 數量很多時會更嚴重。
![](https://i.imgur.com/UQf66tz.png)

### 如何解決
1. Mediator pattern 透過創建一個中心化的管理者（Mediator）管理不同 components 間的溝通。
2. 當 Mediator 接受到其中一個 component 的請求，會將該請求轉發給其他 components。
3. components 不會知道彼此的存在，只能通過 Mediator 這個控制中心跟對方進行間接交流。
![](https://i.imgur.com/z4a2LcR.png)

### UML
![](https://i.imgur.com/J6Uo3OQ.png)
＝> Need to think: 這個 UML 中提到 Mediator 需要訂定 Interface 比較像是 Java 這種強型別語言所需要（ex: 假設今天用 Mediator 寫 PM 這個角色，處理跟 其他 Colleague 溝通事宜，在 Interface 中會規範好 PM 應該做到的事項有那些）至於在 JavaScript 中是否要另外做 Interface 則是需要思考的
* Colleague：需要互動的程式元件。Colleague 會持有 Mediator 的 reference，這樣 Colleague 就可以呼叫 Mediator 來幫它做事情。
* ConcreteColleague：Colleague 的實作。
* Mediator：定義 Mediator 方法的介面。
* ConcreteMediator：Mediator 介面的實作。從 UML 中可以看到，ConcreteMediator 會直接關聯各個 ConcreteColleague。
> Mediator 就是一個統一協調各個相關 Colleague 互動的中間人，所以它需要知道怎麼存取這些 Colleague。

### Code Example
[group chat room](https://codesandbox.io/p/sandbox/chat-room-with-middleware-krf7vo?file=%2Fsrc%2Findex.js)
chat room 作為 users 間的 mediator，users 彼此之間不用直接溝通。

```javascript
/** Mediator Interface */
// STEP 2. 做 ChatRoom 的 class
class ChatRoom {
  logMessage(user, message) {
    const sender = user.getName();
    // 印出目前的時間，sender 傳了什麼 message
    console.log(`${new Date().toLocaleString()} [${sender}]: ${message}`);
  }
}

// STEP 1. 做 user 的 class
class User {
  constructor(name, chatroom) {
    this.name = name;
    // 持有 Mediator 的 reference，以呼叫 Mediator 來幫它做事情。
    this.chatroom = chatroom;
  }

  getName() {
    return this.name;
  }

  // send method can use in order to send messages.
  send(message) {
    // 呼叫 chatroom 幫忙做事情, 帶入 User 和 message
    this.chatroom.logMessage(this, message);
  }
}

// STEP 3. ChatRoom Interface 的實作
const chatroom = new ChatRoom();

/** create new users that are connected to the chat room */
// STEP 4. 實作各個 user，chatroom 會跟各個 user 產生直接關聯
const user1 = new User("R", chatroom);
const user2 = new User("J", chatroom);
const user3 = new User("K", chatroom);

// STEP 5. 當 user X send 出 message 時
// 呼叫 mediator chatroom 執行內部 logMessage 的函式
user1.send("K 什麼時候要辦人夫讀書會，想跟 K 學習");
user2.send("我也想跟 K 學習");
user3.send("群裡還有很多人夫大前輩");
```

[air traffic control tower](https://wyattkidd.medium.com/%E7%BF%BB%E8%AD%AF-javascript-%E8%A8%AD%E8%A8%88%E6%A8%A1%E5%BC%8F-fca4e2e16752)

[泡泡堂遊戲](https://www.kancloud.cn/wengwang/read_1/436085)

### 優點
* 低耦合：各個物件間，可通過 Mediator 這個中心的控制點進行交流，降低物件與物件之間的關聯性。各個物件可拿掉不需要關注的資料或方法細節(ex: 聊天室中 user 物件不需要存取其他 user 的名字)，使得物件容易被獨立的重複使用。
* 擴增方法容易，只需將主要邏輯新增在 Middleware 中。不用在各個 components 中寫重複的 code。

### 缺點
* 由於大多邏輯都統一管理於 Mediator，Mediator 本身可能會變得非常肥大，甚至變成 [God Object](https://en.wikipedia.org/wiki/God_object)。
God Object: 了解過多或者負責過多的物件

### 與 Observer Pattern 的差異
* Observer Pattern **適用在物件之間存在一對多的關係**：一個物件狀態改變會影響其他物件時。使用後可降低 Subject 與 Observer 間的耦合關係。
* Mediator Pattern **適用在物件之間存在多對多的關係**。透過 Mediator 作為管理中心，可降低物件之間的耦合關係。
* 使用了 pattern 前後的差別：
![](https://i.imgur.com/LyCjrNx.jpg)
[Reference](https://stackoverflow.com/questions/9226479/mediator-vs-observer-object-oriented-design-patterns)

### Reference
- https://www.patterns.dev/posts/mediator-pattern/
- https://juejin.cn/post/6844903848155283463
- https://ithelp.ithome.com.tw/articles/10225660
- https://refactoring.guru/design-patterns/mediator
