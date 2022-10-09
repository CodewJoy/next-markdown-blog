import Link from 'next/link';
import ArcDescrip from './ArcDescrip';

export default function Post({ post }) {
  return (
    <div>
        <Link href={`/blog/${post.slug}`}>
            <h3 className='article-title link'>{post.data.title}</h3>
        </Link>
        <ArcDescrip date={post.data.date} readTime={post.data.readTime} />
    </div>
  )
};