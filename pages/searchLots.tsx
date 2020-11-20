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

  const [userId, setUserId] = React.useState({ address: '' });
  const [capacity, setCapacity] = React.useState({ capacity: 0 });
  const [lotAddress, setLotAddress] = React.useState({ address: '' });
  const [lotDescription, setLotDescription] = React.useState({ address: '' });
  const [value, setValue] = React.useState('name');
  let [requestError, setRequestError] = React.useState<string | null>(null);
  let [requestSuccess, setRequestSuccess] = React.useState(false);
  let router = useRouter();
  let listNum = 1;

  async function getEntries() {
    let response;
    try {
      response = await axios.post('/api/v1/parkingLots/lot', {
        userId, capacity, lotAddress, lotDescription
      });
    }
    catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    console.log(response);
  }


  function renderEntries(element: JSX.Element) {
    // let vals = getEntries;
    let elements = [0, 1, 2, 3, 4, 5].map(value => {
      React.cloneElement(element, {
        key: value,

      })
    },
    );
    getEntries();
    return elements;
  }

  function lotSelector() {
    let fragment = <Box className={styles.searchBox} boxShadow={3}>
      <ListItem>
        <ListItemText
          primary={'Generated Sample Parking Lot #' + listNum}
          secondary={'Sample Address #' + listNum}
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
        <RadioGroup aria-label="filter" name="filter" value={value} onChange={(ev: React.ChangeEvent<HTMLInputElement>,
            ): void => setValue(ev.target.value)}>
          <FormControlLabel value="name" color="primary" control={<Radio />} label="Name" />
          <FormControlLabel value="address" color="primary" control={<Radio />} label="Address" />
          <FormControlLabel value="capacity" color="primary" control={<Radio />} label="Capacity" />
          <FormControlLabel value="protest" color="primary" control={<Radio />} label="Protest" />
        </RadioGroup>
      </FormControl>
    </div>
    <SearchBar className={styles.searchBar} onChange={e => { setQuery({ query: e }) }} onRequestSearch={() => console.log(query)} onCancelSearch={() => setQuery({ query: '' })} />
    <div>
      <List className={styles.searchResult}>
        {renderEntries(lotSelector())}
      </List>
    </div>
  </React.Fragment>;
}
