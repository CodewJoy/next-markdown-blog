---
title: 'Recursive Components in React'
date: 'January 13, 2024'
readTime: '15min'
difficultyLevel: '3'
---
###### tags: `React`, `recursive`

## When think about recursive...
[Recursion MDN](https://developer.mozilla.org/en-US/docs/Glossary/Recursion)

每次想到遞迴，就會聯想到費式數列的題目。
- **factorial function**
```javascript
function factorial(num) {
    if (num <= 1) { // base condition
        return 1;
    }
    return num * factorial(num - 1); // function calling itself with new input value.
}
console.log(factorial(6)); // 720 
```
遞迴不僅適用於一般函式的應用，還可以用在像 Recursive Component 這樣的 UI 呈現上。這種應用方式非常有趣。

## What is Recursive Component
Recursive Component 是一種設計方法，特色在於使用相似或相同的元素或 component 嵌套自身，以建立具有動態且層次結構的介面。
這種設計方式特別適用於React或類似框架，讓組件可以以遞迴的方式包含或參照相同類型的 component。

## When to use
- nested file explorer，例如樹狀結構的檔案總管
- Family tree
- 其他階層式或樹狀結構的使用者介面設計

## Recursion v.s. Loops
- Recursion 呼叫一個呼叫自身的函數，而 loops 需要不斷呼叫相同的代碼直到滿足特定條件。
- 變數聲明：
在 loops 中，必須在迭代之前聲明控制變數（例如，計數器 let i=0）。使用 Recursion 時，不需要聲明變數來執行操作。
- 增加/減少：
迴圈可能需要增加或減少控制變數以避免無窮迴圈。
遞迴不依賴於變數，只需要一個基本條件來停止函數呼叫。
- 返回值：
迴圈無法返回任何值，而遞迴允許從函數返回值。
- 可讀性和模塊性：
在樹狀結構情境中，遞迴往往使代碼更加可讀和模塊化。使用迴圈可能使代碼變得更長。

## How to implement

### 實例情境
下面的資料結構中，包含一個物件陣列，每個物件都擁有一個稱為 children 的鍵（key），該鍵對應到另一個物件陣列。同時，這些物件的 children 鍵再度對應到更多的物件陣列。在這種情況下，適合使用遞迴組件。
```javascript
{
  "name": "MyReactApp",
  "type": "folder",
  "children": [
    {
      "name": "src",
      "type": "folder",
      "children": [
        {
          "name": "components",
          "type": "folder",
          "children": [
            {
              "name": "Header.js",
              "type": "file"
            },
            {
              "name": "Footer.js",
              "type": "file"
            }
          ]
        },
        {
          "name": "pages",
          "type": "folder",
          "children": [
            {
              "name": "Home.js",
              "type": "file"
            },
            {
              "name": "About.js",
              "type": "file"
            }
          ]
        },
        {
          "name": "App.js",
          "type": "file"
        },
        {
          "name": "index.js",
          "type": "file"
        }
      ]
    },
    {
      "name": "public",
      "type": "folder",
      "children": [
        {
          "name": "index.html",
          "type": "file"
        },
        {
          "name": "favicon.ico",
          "type": "file"
        }
      ]
    },
    {
      "name": "node_modules",
      "type": "folder",
      "children": []
    },
    {
      "name": "package.json",
      "type": "file"
    },
    {
      "name": "package-lock.json",
      "type": "file"
    }
  ]
}

```
### 程式碼範例
[在 CodeSandbox 上查看程式碼範例](https://codesandbox.io/p/sandbox/recursive-folder-cvwy5n?file=%2Fsrc%2FApp.js)

```javascript
import { useState, useRef, useEffect } from "react";

const Directory = ({ files }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [contentHeight, setContentHeight] = useState(null);
  const contentRef = useRef(null);

  const handleClickFolder = () => {
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    setContentHeight(isExpanded ? contentRef.current?.scrollHeight : 0);
  }, [isExpanded]);

  const getMaxHeight = () => {
    return isExpanded ? contentHeight : 0;
  };

  if (files.children) {
    return (
      <div className="folder">
        <div className="folder-title" onClick={handleClickFolder}>
          <div className={`arrow-icon ${isExpanded ? "expand" : ""}`}></div>
          <div>{files.name}</div>
        </div>
        <div
          className={`folder-content ${isExpanded ? "show" : ""}`}
          style={{ height: getMaxHeight() }}
          ref={contentRef}
        >
          {isExpanded &&
            files.children.map((file) => (
              <Directory key={file.name} files={file} />
            ))}
        </div>
      </div>
    );
  }
  return <div className="file">{files.name}</div>;
};

export default Directory;

```

## Additional: Recursive Components in Vue
[Vue recursive components: Rendering nested comments](https://blog.logrocket.com/rendering-nested-comments-recursive-components-vue/)

## Reference
- [Recursive components in React: A real-world example](https://dev.to/logrocket/recursive-components-in-react-a-real-world-example-328g?fbclid=IwAR3Kz6UrhR_bEJCZiHbatZVnHqIU9jNOe6mB4JnzFJtZEuC-TLIZxWz9BLE)
- [How to Use Recursion in React](https://www.freecodecamp.org/news/how-to-use-recursion-in-react/)
- [Creating a simple file explorer with recursive components in React](https://dev.to/siddharthvenkatesh/creating-a-simple-file-explorer-with-recursive-components-in-react-458h)