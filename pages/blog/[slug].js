import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import hljs from "highlight.js";
import Link from "next/link";
import BlogTitle from "../../components/BlogTitle";
import IntroSelf from "../../components/IntroSelf";
import ArcDescrip from "../../components/ArcDescrip";
import styles from "../../styles/PostPage.module.css";
import { sortByDate } from "../../utils";

marked.setOptions({
  // renderer: new marked.Renderer(),
  highlight: function (code, lang) {
    //   console.log('code', code);
    //   console.log('lang', lang);
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-", // highlight.js css expects a top-level 'hljs' class.
  // pedantic: false,
  // gfm: true,
  // breaks: false,
  // sanitize: false,
  // smartypants: false,
  // xhtml: false
});

export default function PostPage({ data, content, prevPost, nextPost }) {
  return (
    <div className={styles.container}>
      <header>
        <BlogTitle />
      </header>
      <main className={styles.marked}>
        <h1 className="post-title">{data.title}</h1>
        <ArcDescrip
          date={data.date}
          readTime={data.readTime}
          difficultyLevel={data.difficultyLevel}
        />
        <div className="post-body">
          <div
            dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
          ></div>
        </div>
      </main>
      <footer>
        <BlogTitle />
        <IntroSelf />
        <div className={styles["see-other-article"]}>
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`}>
              <a className="text-color"> ← {prevPost.data.title}</a>
            </Link>
          ) : (
            <a />
          )}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`}>
              <a className="text-color">{nextPost.data.title} → </a>
            </Link>
          ) : (
            <a />
          )}
        </div>
      </footer>
    </div>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join("posts"));
  // console.log('files', files);
  const paths = files.map((fileName) => ({
    params: {
      slug: fileName.replace(".md", ""),
    },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  /** get current article content */
  const fileName = `${slug}.md`;
  const article = fs.readFileSync(path.join("posts", fileName), "utf8");
  const { data, content } = matter(article);
  // console.log('matter(article)', matter(article));
  // console.log('typeof content', typeof content);

  /** get prev and next article content */
  const files = fs.readdirSync(path.join("posts"));
  const posts = files.map((fileName) => {
    const slug = fileName.replace(".md", "");
    const content = fs.readFileSync(path.join("posts", fileName), "utf8");
    const { data } = matter(content);
    return {
      slug,
      data,
    };
  });
  // console.log('posts', posts);
  const sortedPosts = posts.sort(sortByDate);
  const currentArtIndex = sortedPosts.findIndex((el) => el.slug === slug);
  // console.log('currentArtIndex', currentArtIndex);
  const hasPrevPost = currentArtIndex !== -1 && currentArtIndex !== 0;
  const prevPost = hasPrevPost ? sortedPosts[currentArtIndex - 1] : null;
  const hasNextPost =
    currentArtIndex !== -1 && currentArtIndex !== sortedPosts.length - 1;
  const nextPost = hasNextPost ? sortedPosts[currentArtIndex + 1] : null;
  return {
    props: {
      data,
      content,
      prevPost,
      nextPost,
    },
  };
}
