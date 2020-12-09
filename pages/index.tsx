import React from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react';
/*
import Head from 'next/head';
import ListLink from '../components/ListLink';
import UserInfo from '../components/UserInfo';
import AppMenu from '../components/AppMenu';
*/
import accountsService from '../client/accountsService';

function App() {
  let router = useRouter();
  if (!accountsService.ready) {
    return <div>Loading account information</div>;
  }
  if (!accountsService.loggedIn) {
    router.push('/login');
    return <div>Redirecting to login</div>;
  } else {
    router.push('/profiles/self');
    return <div>Redirecting to profile</div>;
  }
  /*
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
  */
}

export default observer(App);
