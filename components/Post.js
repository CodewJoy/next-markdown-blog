import Link from 'next/link';
import styles from '../styles/Post.module.css';

export default function Post({ post }) {
  return (
    <div className='card'>
        <Link href={`/blog/${post.slug}`}>
            <h3 className={styles.title}>{post.data.title}</h3>
        </Link>
        <small>{post.data.date} • {post.data.readTime} read</small> 
    </div>
  )
};