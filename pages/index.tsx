import React from 'react';
import Head from 'next/head';
import ListLink from '../components/ListLink';
import UserInfo from '../components/UserInfo';
import AppMenu from '../components/AppMenu';

export default function App() {
  return <div>
    <Head>
      <title>Index</title>
    </Head>
    <AppMenu page="Index" />
    <h2>Index of random stuff</h2>
    <h4>Temporary placeholder for homepage</h4>
    Current account information:
    <UserInfo />
    Pages:
    <ul>
      <ListLink target="login" />
      <ListLink target="searchLots"/>
      <ListLink target="lotProfile" />
      <ListLink target="register" />
      <ListLink target="userProfile" />
      <ListLink target="lots" />
      <ListLink target="protests" />
      <ListLink target="searchProtests" />
    </ul>
  </div>;
}
