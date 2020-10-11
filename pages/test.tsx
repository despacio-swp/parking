import React from 'react';
import Head from 'next/head';
import Button from '@material-ui/core/Button';

// testing css modules, delete when done
export default function Blah() {
  return <div>
    <Head>
      <title>example test</title>
    </Head>
    <Button variant="contained" color="primary">
      Hello!
    </Button>
  </div>;
}
