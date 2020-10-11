import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const ListLink: React.FunctionComponent<{ target: string }> = ({ target }) => {
  return <li><Link href={'/' + target}><a>{target}</a></Link></li>
}

export default function App() {
  return <div>
    <Head>
      <title>Index</title>
    </Head>
    <h2>Index of random stuff</h2>
    <ul>
      <ListLink target="blah" />
      <ListLink target="test" />
    </ul>
  </div>;
}
