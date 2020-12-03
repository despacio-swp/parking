import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SearchBar from 'material-ui-search-bar';
import AppMenu from '../components/AppMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Paper, Box, TextField, Typography, Grid, FormGroup, FormControlLabel, RadioGroup, Radio, FormControl, FormLabel } from '@material-ui/core';
import { shadows } from '@material-ui/system';
import styles from './searchLots.module.scss';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import axios from 'axios';

export default function Search(this: any) {
  let [query, setQuery] = React.useState({ query: '' });
  let [value, setValue] = React.useState('address');
  let [lotEntries, setLotEntries] = useState<JSX.Element[]>([<p>Loading</p>]); // stupid placeholder
  let [lotOccupancy, setOccupancy] = useState<number[]>([0]);


  async function getEntries() {
    let response;
    try {
      response = await axios.get('/api/v1/lots/all');
    }
    catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    if (response.data === null) {
      console.log('Error!');
    }
    return response.data.lots;
  }

  async function getOccupancy() {
    let response;
    try {
      response = await axios.get('/api/v1/presence/');
    }
    catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    if (response.data === null) {
      console.log('Error!');
    }
    return response.data;
  }

  function lotSelector(address: string, capacity: number) {
    return (
      <React.Fragment key={ address + ' | ' + capacity.toString()}>
        <Box className={styles.searchBox} boxShadow={3}>
          <ListItem>
            <ListItemText
              primary={'Address: ' + address}
              secondary={'Capacity: ' + capacity}
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
      </React.Fragment>
    )
  }

  async function renderEntries() {
    let vals = await getEntries();
    let elements = vals.map((lot: any) => lotSelector(lot.lotaddress, lot.capacity));
    handleSort(elements);
    return elements;
  }

  function handleSort(elements: JSX.Element[]) {
    if(value == 'address'){
      elements.sort(function(a, b) {
        let keyA = a.key!.toString();
        let keyB = b.key!.toString();
        let addA = keyA.substring(0, keyA.indexOf(" | "));
        let addB = keyB.substring(0, keyB.indexOf(" | "));
        return addA > addB ? 1 : -1;
    })
    } else {
      elements.sort(function(a, b) {
        let keyA = a.key!.toString();
        let keyB = b.key!.toString();
        let capA = parseInt(keyA.substring(keyA.indexOf(" | ")));
        let capB = parseInt(keyB.substring(keyB.indexOf(" | ")));
        return capA - capB;
    })
        
    }
    elements.forEach(element => {
      console.log(element.key);
    });
  }

  useEffect(() => {
    (async () => {
      setLotEntries(await renderEntries());
    })();
  }, []);



  return <React.Fragment>
    <Head>
      <title>Search for lots</title>
    </Head>
    <AppMenu page="Search" />
    <div className={styles.searchFilter}>
      <FormControl component="fieldset">
        <FormLabel component="legend">Sort by:</FormLabel>
        <RadioGroup aria-label="filter" color="#556cd6" name="filter" value={value} onChange={(ev: React.ChangeEvent<HTMLInputElement>,
        ): void => setValue(ev.target.value)}>
          <FormControlLabel className={styles.radioSort} value="address" control={<Radio color="primary" />} label="Address" />
          <FormControlLabel className={styles.radioSort} value="capacity" control={<Radio color="primary" />} label="Capacity" />
        </RadioGroup>
      </FormControl>
    </div>
    <SearchBar className={styles.searchBar} onChange={e => { setQuery({ query: e }) }} onRequestSearch={() => console.log(query)} onCancelSearch={() => setQuery({ query: '' })} />
    <div>
      <List className={styles.searchResult}>
        {lotEntries}
      </List>
    </div>
  </React.Fragment>;
}
