
import Link from 'next/link';
const emoji = require('node-emoji');

export default function BlogTitle() {
    return (
        <Link href='/'>
            <h1 className='blog-title link'>Code to Joy&ensp;{emoji.get('coffee')}</h1>
        </Link>
    );
}