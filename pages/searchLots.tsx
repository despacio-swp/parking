import React from 'react';
import Head from 'next/head';
import SearchBar from 'material-ui-search-bar';
import AppMenu from '../components/AppMenu';
import { Paper, Box, TextField, Typography, Grid } from '@material-ui/core';
import styles from './searchLots.module.scss';

export default function Search() {
    return <React.Fragment>
      <Head>
        <title>Search for lots</title>
      </Head>
      <AppMenu page="Search" />
      <SearchBar className={styles.searchBar}/>
    </React.Fragment>;
  }