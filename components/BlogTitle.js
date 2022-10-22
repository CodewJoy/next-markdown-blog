
import Link from 'next/link';
export default function BlogTitle() {
    return (
        <Link href='/'>
            <h1 className='blog-title link'>Code to Joy&ensp;☕</h1>
        </Link>
    );
}