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
    * `getStaticProps` to get posts files content from posts folder
    * `getStaticPaths` and dynamic routes to get each article's path
* use [gray matter](https://www.npmjs.com/package/gray-matter) to convert a string with front-matter
* use [marked](https://marked.js.org/) to parse markdown into HTML


## Reference
[Static Blog With Next.js and Markdown](https://www.youtube.com/watch?v=MrjeefD8sac&ab_channel=TraversyMedia)
