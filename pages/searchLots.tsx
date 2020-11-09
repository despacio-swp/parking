import React, { ReactElement } from 'react';
import Head from 'next/head';
import SearchBar from 'material-ui-search-bar';
import AppMenu from '../components/AppMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Paper, Box, TextField, Typography, Grid } from '@material-ui/core';
import styles from './searchLots.module.scss';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import pool from '../server/db';

export default function Search(this: any) {

  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);
  const [filter, setFilter] = React.useState({
    filter: ""});


    const getEntries = () => {
      return new Promise(function(resolve, reject) {
        pool.query('SELECT * FROM lot ORDER BY id ASC', (error, results) => {
          if (error) {
            reject(error)
          }
          resolve(results.rows);
        })
      }) 
    }

  function renderEntries(element: JSX.Element) {
    let vals = getEntries;
    return vals;
  }

  const onchange = (e: any) => {
    this.setFilter({search : e.target.value});
  }

  return <React.Fragment>
    <Head>
      <title>Search for lots</title>
    </Head>
    <AppMenu page="Search" />
    <SearchBar className={styles.searchBar} onChange = {onchange}/>
    <div>
      <List className={styles.searchResult}>
        {renderEntries(
          <ListItem>
            <ListItemText
              primary={"Lot"}
              secondary={secondary ? 'Secondary text' : null}
            />
            <ListItemSecondaryAction>
              <Button variant="contained" color="primary">
                Select
              </Button>
            </ListItemSecondaryAction>
          </ListItem>,
        )}
      </List>
    </div>
  </React.Fragment>;
}