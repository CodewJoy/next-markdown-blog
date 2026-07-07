import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Head from "next/head";
import Link from "next/link";
import BlogTitle from "../components/BlogTitle";
import IntroSelf from "../components/IntroSelf";
import Post from "../components/Post";
import { sortByDate } from "../utils";

export default function Home({ posts }) {
  return (
    <div className="container">
      <Head>
        <title>Code to Joy</title>
        <meta
          name="description"
          content="Personal blog by Joy Hung about web development, JavaScript, React, and learning through practice."
        />
        <meta property="og:title" content="Code to Joy" />
        <meta
          property="og:description"
          content="Personal blog by Joy Hung about web development, JavaScript, React, and learning through practice."
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <header>
        <BlogTitle />
      </header>
      <IntroSelf />
      <main>
        {posts.map((post, index) => (
          <Post key={index} post={post} />
        ))}
      </main>
      <footer>
        <Link href="https://github.com/CodewJoy" passHref>
          <a className="text-color uderline">GitHub</a>
        </Link>
        &nbsp;•&nbsp;
        <Link href="https://leetcode.com/codewjoy/" passHref>
          <a className="text-color uderline">LeetCode</a>
        </Link>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  // Get files from the posts dir
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
  return {
    props: {
      posts: posts.sort(sortByDate),
    },
  };
}
