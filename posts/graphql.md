---
title: 'GraphQL - Graph Query Language'
date: 'December 17, 2023'
readTime: '25 min'
difficultyLevel: '4'
---
###### tags: `full stack`  

## What is GraphQL
- GraphQL 是一種相對於 RESTful 較新的 API 標準，可以讓 client side 更靈活地取得 server side 資料。
- 由 Facebook 在 2012 年開發，主要是為了解決手機 App 發送多個資料請求所導致的效能問題。在 2015 年公開發佈這項技術。
- 特點：
    - 以單一端點（endpoint）回應所有的查詢請求。 
    - declarative data fetching (Imperative vs Declarative)，client side 跟 server side 溝通所需的資料結構，server side 在一次請求中提供所有必要數據，以減少請求次數，提高效能。

![螢幕快照 2023-11-21 下午9.00.52](https://hackmd.io/_uploads/SkesimcET.png)

### GraphQL v.s. RESTful
1. API endpoints

* `RESTful` 通常會有多個 endpoints
    * `/users/<id>`
    * `/users/<id>/posts`
    * `/users/<id>/followers`
  

* `GraphQL` 只有一個 endpoint
    * `/graphql`

### 2. Data Fetching
Requirement: 某 user Post 了幾篇文章，最近 3 個 followers 是誰
![螢幕快照 2023-11-15 下午10.23.32](https://hackmd.io/_uploads/Bk6_VIfVa.png)

* `RESTful` 
	* 依據下圖 API 的實作方式，需要打 3 支 API 才可以得到頁面要的全部資料
1. 打 users/<id> 拿到 name: Mary（多拿到 birthday, address...）
2. 打 users/<id>/posts 拿到 posts title（多拿到 content, comments...）
3. 打 users/<id>/followers 拿到 followers name（followr 資料多拿到 birthday, address...）
![](https://i.imgur.com/Wg2RlhE.png)

* `GraphQL`
    * 可將不同類型的資料，集中在同一筆 request
    * 資料本身有關聯，如 A 的 response 中有 B 所需要的 params，也可以直嵌入 query 裡面，只需打一次 request 即可
![](https://i.imgur.com/aXeOu3I.png)

> [圖片來源](https://www.howtographql.com/basics/1-graphql-is-the-better-rest/)

3. Schema & Type System
- REST 資料為弱型別。
- GraphQL 資料為強型別。client side 可以預先知道型別，以後端定義好的型別命名與 type 接收資料。減少前後端來回溝通成本。

|  | REST | 	GraphQL |
| -------- | -------- | -------- |
| What is it?     | REST 是用於定義用戶端與伺服器之間的結構化資料交換的規則。     | GraphQL 是一種查詢語言、架構樣式和用於建立和操作 API 的工具集    |
| Best suited for     | REST 適用於明確定義資源的簡單資料來源。     | GraphQL 適用於大型、複雜且相互關聯的資料來源。     |
| Data access     | REST 具有 URL 形式的多個端點來定義資源。     | GraphQL 具有個單一的 URL 端點。     |
| Data returned     | REST 以伺服器定義的固定結構傳回資料。     | GraphQL 以用戶端定義的彈性結構傳回資料。     |
| How data is structured and defined     | REST 資料為弱式類型。因此，用戶端必須在傳回資料時，決定如何解譯格式化的資料。     | GraphQL 資料為強式類型。因此，用戶端以預先決定且相互了解的格式接收資料。     |
| Error checking     | 	使用 REST 時，用戶端必須檢查傳回的資料是否有效。     | 使用 GraphQL 時，schema 結構通常會拒絕無效的請求。這會導致自動產生錯誤訊息。     |

## Problems GraphQL resolve
### 1. Fixed-structure data exchange
REST API 要求 client side req 依據固定結構接收資源。這種剛性結構易於使用，但並非總是交換所需資料的最有效方法。
GraphQL 則讓 client side 以其定義的彈性結構傳回資料。

### 2. Overfetching and Underfetching
* `RESTful` 容易含過多或缺少一些資料，因為 endpoint 回的 response 資料是固定的
    - Overfetching: Download unnecessary data
    - Underfetching: An endpoint doest't return enough of the right info; need to send multiple requests
* `GraphQL` 可精準挑選所需要的資料


## How to use
## Full Schema - Query, Mutation & Subscription
![螢幕快照 2023-11-15 下午11.14.43](https://hackmd.io/_uploads/S1rHZDz4p.png)
（apollo-server-express which does support subscriptions, while express-graphql doesn't support）
    
Test on http://localhost:4000/graphql
### Query
fetch the data
#### 1. 基本
```graphql=
  query {
    hello
    users {
      id
      name
      age
    }
  }

```
得到 server 的 response：

```json=
{
  "data": {
    "hello": "Hello world!",
    "users": [
      {
        "id": "1",
        "name": "Alice",
        "age": 25
      },
      {
        "id": "2",
        "name": "Bob",
        "age": 30
      }
    ]
  }
}
```

#### 2. 有使用參數
query + 參數
```graphql= 
query {
  user(id: "1") {
    name
    age
  }
}
```

得到的 response：

```json=
{
  "data": {
    "user": {
      "name": "Alice",
      "age": 25
    }
  }
}
```
### Mutation 
Handle create, modify, delete
#### 基本

```graphql=
# mutation
mutation {
  createUser(name: "Charlie", age: 28) {
    id
    name
    age
  }
}
```
API 成功後，回傳的 response：

```json=
{
  "data": {
    "createUser": {
      "id": "3",
      "name": "Charlie",
      "age": 28
    }
  }
}
```
### GraphQL Server Settings

1. 建立 GraphQL server：這裡使用 Node.js 的 express-graphql 套件。（Express.js 本身是一個 Web Application 框架，而 express-graphql 擴展了 Express.js，使其能夠輕鬆處理 GraphQL 請求)
2. 定義 Schema 來描述數據模型和操作。
3. 定義 Resolver，Resolver 是一個函式，用於處理 query 和 mutation 請求，並返回相應的數據。
4. 設置 GraphQL endpoint：用於接收和處理客戶端的 query 和 mutation 請求。
5. 發送 query 和 mutation 請求：http://localhost:4000/graphql GraphiQL 可向 GraphQL endpoint發送 query 和 mutation 請求。
```javascript
var express = require("express");
var { graphqlHTTP } = require("express-graphql"); 
var { buildSchema } = require("graphql");

// Sample data (to simulate a database)
let users = [
  { id: "1", name: "Alice", age: 25 },
  { id: "2", name: "Bob", age: 30 },
];
console.log(users);
// Construct a schema, using GraphQL schema language
// ! 表示 non-nullable
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    age: Int!
  }

  type Query {
    hello: String
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, age: Int!): User!
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
  // query
  hello: () => "Hello world!",
  users: () => users,
  user: ({ id }) => {
    const foundUser = users.find((user) => user.id === id);
    return foundUser ? foundUser : null; // Handling user not found
  },
  // mutation
  createUser: ({ name, age }) => {
    const newId = (users.length + 1).toString(); // Safer way to generate ID
    const newUser = { id: newId, name, age };
    users.push(newUser);
    return newUser;
  },
};

var app = express(); //  (app) is used to configure and run the server.
	
// Define GraphQL Middleware:
app.use(
  "/graphql",
  graphqlHTTP({ // creates middleware for handling GraphQL requests
    schema: schema, // The GraphQL schema that defines the types and operations allowed in the API.
    rootValue: root, //  A resolver object defining how to fulfill the operations in the schema.
    graphiql: true, //  This enables the GraphiQL interface, an in-browser IDE for exploring GraphQL APIs.
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");

```

### GraphQL Client

GraphQL Client 主要工作就是，使用前端寫好的 query 與 server 溝通，即 client 只需要寫 query，打 API 行為就交給工具函式庫幫你解決，相當於在使用 RESTful API 時候，會去用 axios 幫助處理 API。

**GraphQL Client**
- [graphql-request](https://github.com/prisma-labs/graphql-request)
- [Apollo Client](https://www.apollographql.com/docs/)
- [relay](https://relay.dev/)

**Code Practice**
use graphql-request 套件（base on JS)
```javascript
const { request, gql } = require("graphql-request");

const endpoint = "http://localhost:4000/graphql"; // Your GraphQL server URL

// Sample query
const getUsersQuery = gql`
  query {
    users {
      id
      name
      age
    }
  }
`;

// Sample mutation
const createUserMutation = gql`
  mutation ($name: String!, $age: Int!) {
    createUser(name: $name, age: $age) {
      id
      name
      age
    }
  }
`;

// Function to fetch users
async function getUsers() {
  try {
    const data = await request(endpoint, getUsersQuery);
    console.log("Users:", data.users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// Function to create a user
async function createUser(name, age) {
  try {
    const data = await request(endpoint, createUserMutation, { name, age });
    console.log("Created user:", data.createUser);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

// // Uncomment and use this to create a user
// createUser("David", 35);

// Usage
getUsers(); // Fetch users

```
    
## When to use 
在以下情況，GraphQL 可能是更好的選擇：

* 頻寬有限，想要減少請求和回應的數量。
* 適用於大型、複雜且相互關聯的資料來源。
* 產品 spec 常常改變，頁面資料需求變更頻繁，導致過去做的 API 需要常常調整。使用 GraphQL 可以快速協助開發，減少前後端溝通成本。

![image](https://hackmd.io/_uploads/Sk_yQUsQa.png)

## Conclusion
- GraphQL enables frontend developers to have more control over the data they retrieve from the server 
- GraphQL enables the server developer to focus on describing the data available rather than implementing and optimizing specific endpoints.
    
## Reference
- [GraphQL官方網站](https://graphql.org/)
- [GraphQL官方網站](https://graphql.org/graphql-js/)
- [HowToGraphQL](https://www.howtographql.com/)
- [Solo.io GraphQL 相關主題](https://www.solo.io/topics/graphql/)
- [AWS官方對比GraphQL與REST](https://aws.amazon.com/tw/compare/the-difference-between-graphql-and-rest/)
- [AlphaCamp文章](https://tw.alphacamp.co/blog/graphql)
- [Uncover the Benefits of Using GraphQL with Zenesys](https://www.zenesys.com/drawbacks-and-benefits-of-using-graphql)
