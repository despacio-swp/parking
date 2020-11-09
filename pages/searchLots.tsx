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

export default function Search(this: any) {

  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);
  const [filter, setFilter] = React.useState({
    filter: ""});


  function generate(element: JSX.Element) {
    const { }
    return [0, 1, 2, 3, 4, 5].map((value) =>
      React.cloneElement(element, {
        key: value,
      }),
    );
  }

  const onchange = (e: any) => {
    this.setFilter({search : e.target.value});
  }

  return <React.Fragment>
    <Head>
      <title>Search for lots</title>
    </Head>
    <AppMenu page="Search" />
    <SearchBar className={styles.searchBar} onChange = {this.onchange}/>
    <div>
      <List className={styles.searchResult}>
        {generate(
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