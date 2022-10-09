import Link from 'next/link';
import Image from 'next/image';

export default function IntroSelf() {
  return (
    <asid className='intro-self'>
      <Image src='/avatar.jpg' alt='Joy Hung' width='56' height='56' layout='fixed' style={{ borderRadius: '50%' }}/>
      <p className='intro-self-text'>Personal blog by&nbsp;
        <Link href='https://github.com/CodewJoy' passHref>
          <a className='text-color uderline'>Joy Hung</a> 
        </Link>
        .<br/>Curiosity turns work into play.</p>
    </asid>
  )
};