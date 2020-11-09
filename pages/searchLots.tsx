import React, { ReactElement } from 'react';
import Head from 'next/head';
import SearchBar from 'material-ui-search-bar';
import AppMenu from '../components/AppMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Paper, Box, TextField, Typography, Grid } from '@material-ui/core';
import { shadows } from '@material-ui/system';
import styles from './searchLots.module.scss';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import pool from '../server/db';
import Link from 'next/link';

export default function Search(this: any) {
  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);
  const [filter, setFilter] = React.useState({ filter: '' });


  /* const getEntries = () => {
      return new Promise(function(resolve, reject) {
        pool.query('SELECT * FROM lot ORDER BY id ASC', (error, results) => {
          if (error) {
            reject(error)
          }
          resolve(results.rows);
        })
      })
    }*/

  function renderEntries(element: JSX.Element) {
    // let vals = getEntries;
    return [0, 1, 2, 3, 4, 5].map(value =>
      React.cloneElement(element, {
        key: value
      }),
    );
  }

  const onchange = (e: any) => {
    this.setFilter({ search: e.target.value });
  };

  return <React.Fragment>
    <Head>
      <title>Search for lots</title>
    </Head>
    <AppMenu page="Search" />
    <SearchBar className={styles.searchBar} />
    <div>
      <List className={styles.searchResult}>
        {renderEntries(
          <Box className={styles.searchBox} boxShadow={3}>
            <ListItem>
              <ListItemText
                primary={'Generated Sample Parking Lot'}
                secondary={secondary ? 'Secondary text' : null}
              />
              <ListItemSecondaryAction>
                <Link href="/lotProfile" passHref>
                  <Button variant="contained" color="primary">
                    Select
                  </Button>
                </Link>
              </ListItemSecondaryAction>
            </ListItem>
          </Box>
        )}
      </List>
    </div>
  </React.Fragment>;
}
