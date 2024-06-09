---
title: 'Cross Tab Communication'
date: 'January 14, 2024'
readTime: '25 min'
difficultyLevel: '3'
---

###### tags: `front-end`, `Web API`, `Broadcast Channel`

## What is Cross Tab Communication?
Cross Tab Communication 是多個 browser tabs, windows, frames of iframes 之間交換訊息的能力。


## When to use Cross Tab Communication
在前端開發中，有時候需要在不同的瀏覽器標籤（TAB）之間進行溝通。以下是一些可能需要跨TAB溝通的情境：

1. 共享資料或狀態： 
如果你的應用程序在不同的標籤中打開，並且你需要在這些標籤之間共享某些資料或狀態，那麼你可能需要一種機制來實現這種共享。這可以是某種形式的事件系統或共享儲存。
e.g. 更改網站的主題，並在所有 Tab 之間同步這些變更。
2. 單一登入（Single Sign-On，SSO）： 如果應用程序使用單一登入，並且在不同的標籤中打開，你可能需要確保使用者在一個標籤中登入後，其他標籤也能夠識別該登入狀態。
3. 事件通知： 某些情況下，你可能希望在一個標籤中觸發的事件能夠影響其他標籤，例如在一個標籤中進行了某種操作後，其他標籤也需要進行相應的更新。
4. 即時通訊： 如果你的應用程序包含即時通訊功能，而使用者可能在不同的標籤中打開多個聊天視窗，你可能需要確保這些聊天視窗之間的消息同步。
## How to implement Cross Tab Communication
要實現在不同 Tab 之間的溝通，有以下方法：

1. LocalStorage 或 SessionStorage： 這兩者都是在不同標籤之間共享資料的簡單方法，但要注意，它們都有大小限制，而且只能存儲字串。
[Code Example](https://codesandbox.io/p/sandbox/session-storage-example-1-klpei)
**使用 localStorage 的實作概念**
當 app 在一個 tab 中初次載入時，向 localStorage 中存一個名為 "loaded" 的值，表示 app 已經 loaded。其他 tabs 可以透過監聽 storage 事件來檢測 "loaded" 的變化，得知 app 在其他 tabs 中是否已經 loaded。
**使用到的觀念**
`window.addEventListener("storage", (e) => { ... });` 用來監聽 localStorage 變化。這個事件監聽器的**觸發條件是在同一瀏覽器中的其他 tab 修改了 localStorage 的值**。當在同一 tab 中修改 localStorage 時，該事件監聽器不會被觸發。
2. Cookies： Cookies 可以在不同標籤之間共享資料，但它們的大小也是有限制的，而且會被包含在每個 HTTP 請求中。
3. Broadcast Channel API： 這是一個 HTML5 API，允許你在不同窗口（標籤）之間發送消息。
4. Service Workers： 可以使用 Service Workers 在不同標籤之間進行通訊，這對於離線應用程序和後台處理也很有用。
5. WebSockets： 使用 WebSocket 技術可以實現即時通訊，從而在不同標籤之間傳遞消息。
### Broadcast Channel API
#### What is Broadcast Channel API
[MDN - BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
Broadcast Channel API 允許在相同來源的瀏覽上下文(contexts)中（包括 windows、tabs、frames 或 iframe）和 Web Workers 之間進行基本通訊。

通過創建 BroadcastChannel 物件，可以接收發送到該通道的任何消息。接收者可以通過建立自己具有相同名稱的 BroadcastChannel 來“訂閱”特定通道，並在它們之間實現雙向通訊。

#### 限制
only work with domains on the same-origin.
You will not be able to use this 
- across HTTP and HTTPS.
- across different hosts.
- across different ports.

#### How to implement Broadcast Channel API
**Broadcast Channel interface**
- Creating or joining a channel
```typescript
// Connection to a broadcast channel
const bc = new BroadcastChannel("test_channel");
```
- Sending a message
```typescript
// Example of sending of a very simple message
bc.postMessage("This is a test message.");
```
- Receiving a message
```typescript
// A handler that only logs the event to the console:
bc.onmessage = (event) => {
  console.log(event);
};
```
- Disconnecting a channel
```typescript
// Disconnect the channel
bc.close();

```

![image](https://hackmd.io/_uploads/B1zaTa_d6.png)


![image](https://hackmd.io/_uploads/BkuPqsPOa.png)

![image](https://hackmd.io/_uploads/Bk5hiiPuT.png)

#### Things You Can Do with Broadcast Channels
- 偵測其他 tabs 的使用者行為，如登入或登出。
可以一次在所有 tab 中登出。 
- 共享狀態。例如，使用像 Flux 或 Redux 這樣的狀態管理框架，可以透過發送 message 讓所有 tab 的 state 保持一致。
或者在一個 tab 上更新數據，並在所有打開的 tab 中看到更新，無需手動刷新每個 tab。

#### Browser 兼容性
[CanIUse - BroadcastChannel](https://caniuse.com/broadcastchannel)

#### 程式碼案例
[Code Example](https://codesandbox.io/p/sandbox/broadcastchannel-message-demo-1-qckg2)

`index.js`
```typescript
import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useBroadcastChannel } from "./hooks";

function App() {
  const broadcast = useBroadcastChannel("north_ot");
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  const handleBroadcast = useCallback(
    e => {
      setMessages([...messages, { person: "Other Tab", value: e.data }]);
    },
    [messages]
  );

  useEffect(() => {
    if (broadcast) {
      broadcast.onmessage = handleBroadcast;
    }
  }, [broadcast, handleBroadcast]);

  function handleSend() {
    broadcast.postMessage(msg);
    setMessages([...messages, { person: "You", value: msg }]);
    setMsg("");
  }

  return (
    <div className="App">
      <input value={msg} onChange={e => setMsg(e.target.value)} />
      <button onClick={handleSend}>Send Message</button>

      <h5>Messages</h5>
      {messages.map((msg, i) => (
        <p key={i}>
          <strong>{msg.person}:</strong> {msg.value}
        </p>
      ))}
    </div>
  );
}
```

`hooks.js`
```typescript
export const useBroadcastChannel = channel => {
  const [broadcast, setBroadcast] = useState(null);

  useEffect(() => {
    const bc = new BroadcastChannel(channel);
    setBroadcast(bc);

    return () => {
      bc.close();
    };
  }, [channel]);

  return broadcast;
};
```

## Reference
1. [Cross Tab Communication with Javascript
](https://dev.to/naismith/cross-tab-communication-with-javascript-1hc9)
2. [How to use the BroadcastChannel API in JavaScript](https://www.digitalocean.com/community/tutorials/js-broadcastchannel-api)
3. [Exploring the Broadcast Channel API](https://dev.to/bernardop/exploring-the-broadcast-channel-api-i57)
4. [Tackling Tab Chaos with Broadcast Channel API](https://medium.com/paktolus-engineering/tackling-tab-chaos-with-broadcast-channel-api-d630ab812ea9)
