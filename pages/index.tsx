import React from 'react';
import Head from 'next/head';
import ListLink from '../components/ListLink';
import UserInfo from '../components/UserInfo';

export default function App() {
  return <div>
    <Head>
      <title>Index</title>
    </Head>
    <h2>Index of random stuff</h2>
    <h4>Temporary placeholder for homepage</h4>
    <UserInfo />
    <ul>
      <ListLink target="blah" />
      <ListLink target="login" />
      <ListLink target="searchLots"/>
      <ListLink target="lots" />
      <ListLink target="lotProfile" />
      <ListLink target="register" />
      <ListLink target="userProfile" />
    </ul>
  </div>;
}
