# Next Markdown Blog
Simple static blog using markdown and Next.js

[Demo Link](https://code-to-joy-blog.vercel.app/)

## Usage
*  Install dependencies
npm install
* Run dev server
npm run dev
* Build for prod and export static website
npm run build

## Technologies
* Next.js Static Side Generation
    * use `getStaticProps` and `getStaticPaths` to implenent [Dynamic Routes](https://nextjs.org/learn/basics/dynamic-routes).
* [gray matter](https://www.npmjs.com/package/gray-matter) – Parses front-matter from markdown files.
* [marked](https://marked.js.org/) – Compiles markdown into HTML.
* [highlight.js](https://www.npmjs.com/package/highlight.js?activeTab=readme) – code syntax highlighter
## Reference
* [Static Blog With Next.js and Markdown](https://www.youtube.com/watch?v=MrjeefD8sac&ab_channel=TraversyMedia)
* [Build a static blog from markdown files with Next.js](https://w3collective.com/static-blog-next-js/)
* [How to use Highlight.js on a Next.js site](https://dev.to/kontent_ai/how-to-use-highlight-js-on-a-next-js-site-f9)
* [marked - highlight](https://marked.js.org/using_advanced#highlight)
* [fs.readdirSync(path[, options])](https://nodejs.org/api/fs.html#fsreaddirsyncpath-options)
* [fs.readFileSync(path[, options])](https://nodejs.org/api/fs.html#fsreadfilesyncpath-options)
* [path.join([...paths])](https://nodejs.org/api/path.html#pathjoinpaths)

