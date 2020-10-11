import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styles from './blah.module.scss';

// testing css modules, delete when done
export default function Blah() {
  return <div>
    <Head>
      <title>css modules test page</title>
    </Head>
    <p>
      <span className={styles.things}>Hi!</span>
      other things here...
    </p>
    <p><Link href="/"><a>go home</a></Link></p>
  </div>;
}
