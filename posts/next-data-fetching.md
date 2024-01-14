---
title: 'Understanding Next.js Data Fetching'
date: 'January 11, 2022'
readTime: '20 min'
difficultyLevel: '3'
---
<!-- # Understanding Next.js Data Fetching (CSR, SSR, SSG, ISR)
 -->
###### tags: `Next.js`

## Outline
* Processing Flow
* Concept 
* Demo
* How to choose
## Processing Flow
The processing flow from the Build step on the Server side up to the Client-side rendering.
**採用 pre-rendering 預渲染的方式：SSR、SSG、ISR**
![](https://i.imgur.com/q6jkKoL.png)
[Reference](https://guydumais.digital/blog/next-js-the-ultimate-cheat-sheet-to-page-rendering/)

### Web性能指標
* Time to First Byte（TTFB）
發出 HTTP request 到獲得 HTTP Response 第一個 byte 的時間
* First Paint（FP）
任何一個 pixel（像素）被瀏覽器繪製到頁面上的時間。可能是簡單的背景色更新或不引人注意的內容，它並不表示頁面內容完整性
* First Contentful Paint（FCP）
當瀏覽者到達網站之後，首次顯示網站內容需要的時間，內容可以是文本、圖片（包含背景圖）、非白色的 canvas 或 SVG，也包括帶有正在加載中的 Web 字體的文本。
* Largest Contentful Paint（LCP）
可視區域中最大的內容元素呈現到屏幕上的時間，用以估算頁面的主要內容對用戶可見時間。
* Time to Interactive（TTI）
頁面從不能互動到可以接收事件產生互動性的時間，瀏覽器已經可以持續性的響應用戶的輸入。

## Client Side Render (CSR) 客戶端渲染
### Flow
* 在 Build Time 時打包 js css 檔案。
* Client request 時拿到並下載檔案，檔案不包含 DATA。
* Browser initial load js, css file。
* 瀏覽器執行 React code。
* **Client fetch API 拿到 DATA，React 更新 UI，執行完畢後，頁面才完整呈現與具有互動性，Time to Interactive（TTI）指標差**。

### 特色
* 畫面於 Runtime 時，在 Client 製作。
* User 可以很快看到畫面，但畫面並非一次到位，而是批次到位，ex: 畫面顯示 loading 狀態。

### 優點
* 頁面資料是最新的：每次頁面請求會在 Client side 打 API 取得最新資料。

### 缺點
* SEO 差：HTML 檔案只有容器，內容可由 JS 動態產生，爬蟲在爬取資料時可能會爬到空的 tag。
* 需要靠 JS render 頁面，JS 檔案較大，隨著專案擴充容易有效能問題。


### Code Example
Special Function: `useEffect`
```typescript
export default function CSRPage() {
  const [dateTime, setDateTime] = React.useState<string>();

  React.useEffect(() => {
    axios
      .get('https://worldtimeapi.org/api/ip')
      .then((res) => {
        setDateTime(res.data.datetime);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <main>
      <TimeSection dateTime={dateTime} />
    </main>
  );
}
```

## Server Side Render (SSR) 伺服器端渲染
### Flow
* 一開始在 Server 端未產生任何頁面。
* **當 User 進到頁面時，Client 向 Server 發出 requests，此時畫面才開始在 Server 端製作，Build 出一個擁有完整內容的 HTML 檔案(含 React js css 以及 DATA)**，接著在 Client 進行下載。從發出 request 到拿到做好畫面的等待時間較長，TTFB (Time to First Byte) 指標差。
* Browser initial load js, css file。
* 進行 Hydration: 在 Client 端把 Server side 渲染出的 DOM element 加上事件監聽器等屬性，讓 DOM element 變為動態且具有互動性。
### 特色
* 畫面於 Runtime 時，在 Server 製作，當畫面製作完成傳回 Client 後才會 render。
* 發出請求後到看到畫面**會有點小 delay，User 需要等待才會一次看到完整畫面(不會有 Loading 指標)**。

### 優點
* 頁面資料是最新的：每次頁面請求會在 Server side 打 API 取得最新資料製作頁面。
* 良好 SEO：在 Server 就製作好畫面，爬蟲爬到的是在 Server 建好並帶上完整資訊的 HTML 檔案。
* 不需要使用 JS 來處理 render 頁面的部分，較不會造成 render blocking，JS 檔案較小。

### 缺點
* TTFB (Time to First Byte) 指標差，下列情形會導致 Server 的回應更慢：
(1) 網速慢
(2) 有大量 User
(3) Sever 端寫的程式碼太糞

### Code Example
Special Function: `getServerSideProps` 
每次有 request (請求) 的時候在 Server side 執行。除了會產生 HTML 檔案，也會產生 JSON 檔案。
```typescript
export default function SSRPage({ dateTime }: SSRPageProps) {
  return (
    <main>
      <TimeSection dateTime={dateTime} />
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // 可以直接抓取資料或是操作資料庫
  const res = await axios.get('https://worldtimeapi.org/api/ip');
  return {
    props: { dateTime: res.data.datetime }, // 傳給該 page 的 props
  };
};
```

## Static Site Generate (SSG) 靜態生成
### Flow
* **在 Build Time 時製作出一個擁有完整內容的靜態 HTML 檔案**，這些 HTML 檔案可以放在 CDN 上被 cache，後續的使用者如果對同樣頁面發出請求，可以直接到 CDN 拿到完整的 HTML 檔案，有更好的 Time to First Byte（TTFB），網站效能較佳。
### 特色
* 當每次 User 進到頁面時，取得在 Build Time 已經在 Server 製作好的靜態檔案並 render，因此畫面一次到位。

### 優點
* 良好 SEO：在 Build Time 就在 Server 製作好具有完整資訊的 HTML 檔案。
### 缺點
* 資料是在 Build Time 拿到的資料，並且不會在 Runtime 更新。
* Build Time 要做的事情比較多，打包時間比較久。

### Code Example
Special function: `getStaticProps`
`getStaticProps` 會在執行 npm run build 的時候執行並抓取所需要的資料。伺服器跑完該 function 後，除了產生了 HTML 檔案，會另外產生 JSON 檔案。在 Client-side (客戶端) 瀏覽器會讀取該 JSON 檔案裡面的資料用來顯示 page 內容。
```typescript
// 透過 props 拿到該 page 所需要的資料
export default function SSGPage({ dateTime }: SSGPageProps) {
  return (
    <main>
      <TimeSection dateTime={dateTime} />
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await axios.get('https://worldtimeapi.org/api/ip');
  return {
    // 傳給該 page 的 props
    props: { dateTime: res.data.datetime },
  };
};
```

## Incremental Static Regeneration(ISR) 增量靜態生成
### Flow
* 在 Build 專案時產生完整的 HTML 檔案，可以透過 `revalidate` 參數設定幾秒後拿新的資料重新 Build 與產生頁面。

### 特色
* 當每次 User 進到頁面時，取得已經製作好的靜態檔案並 render，畫面一次到位。
* 可以設定幾秒要 re-validate 並更新頁面，在 re-validate 的期間，還沒有 Build 產生最新資料頁面之前，會先回傳先前被 cache 的版本，等到產生最新頁面之後才會更新 CDN 中的快取(這樣的快取策略被稱作 [stale-while-revalidate](https://web.dev/i18n/en/stale-while-revalidate/))，user reload page 後可以看到更新後的頁面。如果重 Buld 畫面失敗，會顯示舊的頁面。

![](https://i.imgur.com/mAbE8Bk.png)

**stale-while-revalidate concept**
![](https://i.imgur.com/RUV52oq.png)
[Reference](https://www.storyblok.com/mp/nextjs-incremental-static-regeneration)
![](https://i.imgur.com/ZZeRG56.png)
[Reference](https://theodorusclarence.com/blog/nextjs-fetch-method)

* 可以在 ISR 重 load 幾次資料，會發現有時 server response status code 是 304，代表瀏覽器直接從本身的 cache 讀取內容，所以檔案傳輸非常小。

![](https://i.imgur.com/6lNnx3p.png)

* 若使用 Vercel 服務作部署，可留意 Response Headers 中 x-vercel-cache 的值，若為 STALE 代表目前拿到的是在 cache 中的舊版本。

![](https://i.imgur.com/B36EUST.png)
A background request to the origin was made to get a fresh version.

![](https://i.imgur.com/L2L3KSt.png)
[Reference](https://vercel.com/docs/concepts/edge-network/x-vercel-cache)

* ISR 很像 SSG，不過它解決了 SSG 不能在 run time 更新資料內容的問題，而且 HTML 檔案也會被 cache 在 CDN 上，減輕對伺服器的負擔(這部分比 SSR 好)，網站效能較佳。

### 優點
* 良好 SEO：在 Build Time 就在 Server 製作好具有完整資訊的 HTML 檔案。
### 缺點
* 資料不會立刻更新，需等待 re-validate 重新製作最新資料的頁面。
* Build Time 打包時間比較久。

### Code Example
Special function: `getStaticProps` + `revalidate`
在 Next.js 中要啟用 ISR 跟 SSG 的寫法很像，只是要多指定需要 revalidate 的時間
```typescript
export default function ISR20Page({ dateTime }: ISR20PageProps) {
  return (
    <main>
      <TimeSection dateTime={dateTime} />
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await axios.get('https://worldtimeapi.org/api/ip');

  return {
    props: { dateTime: res.data.datetime },
    // 每 60 秒就會 revalidate 一次頁面
    revalidate: 60,
  };
};
```
## Demo
[Demo](https://next-render.theodorusclarence.com/)

## How to Choose
Next.js 可依專案需求支援不同頁面決定要使用 CSR, SSR, SSG, ISR 等不同的渲染方式。
* 資料會不斷更新，且不需要 SEO 的頁面，可以考慮用 CSR，ex: 內部系統 dashboard。
* 資料會不斷更新，且需要 SEO 的頁面，可以考慮用 SSR。
需留意使用了 SSR 就要考慮 Server 端要處理的事情，因此可視專案架構、是否所有頁面都有 SEO 的需求，來決定 SSR 與 CSR 搭配的比例。
* 資料幾乎不用更新且需要 SEO，可以考慮用 SSG，ex: 部落格，活動或行銷網站。
* 資料不需要頻繁更新且需要 SEO，可以考慮用 ISR，ex: 電商商品頁。

![](https://i.imgur.com/LlfGR4Y.png)
[Reference](https://theodorusclarence.com/blog/nextjs-fetch-usecase?fbclid=IwAR1LXJ-ISy1G1XcFh0CNpwR9MAL-wguj1xspfhIt_094xdCAWWst27URIws)

#### Practice
- 既然 SSG 和 SSR 都是由 server 回傳處理好的畫面，那 SSG 和 SSR 關鍵的差異是什麼？
- 假設 ISR 設定是 20s，在超過 20s 後 server 收到第一次請求時，使用者會看到的是新內容還是舊的內容？
- SSR 和 SSG 那個所需的 build time 較長？哪個 TTFB 較長？

Ans:
1. 產生 HTML 的時機點，前者是 build 的時候就產生了，後者是 request 進來時產生
2. 舊的
3. SSG build 時間長，TTFB 是 SSR 比較長

### Reference
1. Server-side Rendering
https://www.patterns.dev/posts/Server-side-rendering/
2. Next.js: The Ultimate Cheat Sheet To Page Rendering
https://guydumais.digital/blog/next-js-the-ultimate-cheat-sheet-to-page-rendering/
3. Understanding Next.js Data Fetching (CSR, SSR, SSG, ISR)
https://theodorusclarence.com/blog/nextjs-fetch-method
4. How to choose between Next.js CSR, SSR, SSG, and ISR
https://theodorusclarence.com/blog/nextjs-fetch-usecase?fbclid=IwAR1LXJ-ISy1G1XcFh0CNpwR9MAL-wguj1xspfhIt_094xdCAWWst27URIws
5. Incremental Static Regeneration
https://vercel.com/docs/concepts/next.js/incremental-static-regeneration
6. Day24 X Web Rendering Architectures
https://ithelp.ithome.com.tw/m/articles/10279519?sc=rss.iron
7. 初探 Server-Side-Rendering 與 Next.js
https://medium.com/starbugs/%E5%88%9D%E6%8E%A2-Server-side-rendering-%E8%88%87-next-js-%E6%8E%A8%E5%9D%91%E8%A8%88%E7%95%AB-d7a9fb48a964
8. 前端性能優化指南[7]Web性能指標
https://codertw.com/%E7%A8%8B%E5%BC%8F%E8%AA%9E%E8%A8%80/759865/#outline__2_4
9. #03 No-code 之旅 — 什麼是 SSG、SSR、CSR、ISR？
https://ithelp.ithome.com.tw/m/articles/10267249
10. https://github.com/LiangYingC/next-csr-ssr-ssg-simple-demo

### Further study
* https://nextjs.org/docs/basic-features/data-fetching/overview
* https://ithelp.ithome.com.tw/m/articles/10267894
