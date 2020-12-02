import React, { ReactElement } from 'react';
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
  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);
  const [query, setQuery] = React.useState({ query: '' });

  const [lotId, setLotId] = React.useState({ lotId: '' });
  const [capacity, setCapacity] = React.useState({ capacity: 0 });
  const [lotAddress, setLotAddress] = React.useState({ address: '' });
  const [lotDescription, setLotDescription] = React.useState({ description: '' });
  const [value, setValue] = React.useState('name');
  let [requestError, setRequestError] = React.useState<string | null>(null);
  let [requestSuccess, setRequestSuccess] = React.useState(false);
  let router = useRouter();
  let listNum = 1;


  async function getEntries() {
    
  }

  async function getOccupancy() {
    let response;
    try {
      response = await axios.get('/api/v1/presence/lots/');
    }
    catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    if(response.data === null) {
      console.log('Error!');
    }
    return response;
  }


  async function renderEntries() {
    /*let elements = [0, 1, 2, 3, 4, 5].map(value => {
      React.cloneElement(element, {
        key: value,

      })
    },
    );*/
    console.log('Get Entries');
    let response;
    try {
      response = await axios.get('/api/v1/lots/all');
    }
    catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    if(response.data === null) {
      console.log('Error!');
    }
    let vals = response.data.lots;
    console.log('Vals');
    console.log(vals);
    let elements = vals.map();
    return elements;
  }

  function lotSelector(address: string, capacity: number) {
    let fragment = <Box className={styles.searchBox} boxShadow={3}>
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
    </Box>;
    return fragment;
  }

  return <React.Fragment>
    <Head>
      <title>Search for lots</title>
    </Head>
    <AppMenu page="Search" />
    <div className={styles.searchFilter}>
      <FormControl component="fieldset">
        <FormLabel component="legend">Search by:</FormLabel>
        <RadioGroup aria-label="filter" color="#556cd6" name="filter" value={value} onChange={(ev: React.ChangeEvent<HTMLInputElement>,
            ): void => setValue(ev.target.value)}>
          <FormControlLabel value="name" color="#556cd6" control={<Radio />} label="Name" />
          <FormControlLabel value="address" color="#556cd6" control={<Radio />} label="Address" />
          <FormControlLabel value="capacity" color="#556cd6" control={<Radio />} label="Capacity" />
          <FormControlLabel value="protest" color="#556cd6" control={<Radio />} label="Protest" />
          <FormControlLabel value="tags" color="#556cd6" control={<Radio />} label="Tags" />
        </RadioGroup>
      </FormControl>
    </div>
    <SearchBar className={styles.searchBar} onChange={e => { setQuery({ query: e }) }} onRequestSearch={() => console.log(query)} onCancelSearch={() => setQuery({ query: '' })} />
    <div>
      <List className={styles.searchResult}>
        {renderEntries()}
      </List>
    </div>
  </React.Fragment>;
}
