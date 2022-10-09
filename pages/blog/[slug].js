import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import BlogTitle from '../../components/BlogTitle';
import IntroSelf from '../../components/IntroSelf';
import ArcDescrip from '../../components/ArcDescrip';
import styles from '../../styles/PostPage.module.css';

// marked.setOptions({
//     renderer: new marked.Renderer(),
//     highlight: function(code, lang) {
//       const hljs = require('highlight.js');
//       const language = hljs.getLanguage(lang) ? lang : 'plaintext';
//       return hljs.highlight(code, { language }).value;
//     },
//     langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
//     pedantic: false,
//     gfm: true,
//     breaks: false,
//     sanitize: false,
//     smartypants: false,
//     xhtml: false
// });  

export default function PostPage({ data, content }) {
    return (
        <div className={styles.container}>
            <header>
                <BlogTitle />
            </header>
            <main className={styles.marked}>
                <h1 className='post-title'>{data.title}</h1>
                <ArcDescrip date={data.date} readTime={data.readTime} />
                <div className='post-body'>
                    <div dangerouslySetInnerHTML={{ __html: marked.parse(content) }}></div>
                </div>
            </main>
            <footer>
                <BlogTitle />
                <IntroSelf />
            </footer>
        </div>
    );
};

export async function getStaticPaths() {
    const files = fs.readdirSync(path.join('posts'));
    const paths = files.map((fileName) => ({
        params: { 
            slug: fileName.replace('.md', ''),
        },
    }));
    return {
      paths,
      fallback: false,
    };
};

export async function getStaticProps({ params: { slug } }) {
    const fileName = `${slug}.md`
    const article = fs.readFileSync(path.join('posts', fileName), 'utf8');
    const { data, content } = matter(article);
    return {
      props: {
        data, content,
      },
    }
};