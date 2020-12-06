import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import SearchBar from 'material-ui-search-bar';
import AppMenu from '../components/AppMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Box, FormControlLabel, RadioGroup, Radio, FormControl, FormLabel } from '@material-ui/core';
import styles from './searchLots.module.scss';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import axios from 'axios';

export default function Search(this: any) {
  let [query, setQuery] = React.useState('');
  let [value, setValue] = React.useState('address');
  let [sort, setSort] = React.useState('asc');
  let [lotEntries, setLotEntries] = useState<JSX.Element[]>([<p>Loading</p>]); // stupid placeholder
  let idList: string[] = [];
  let occupancyList: { id: string; occupancy: number; }[] = [];


  async function getEntries() {
    let response;
    try {
      response = await axios.get('/api/v1/lots/all');
      response.data.lots.forEach((lot: any) => {
        idList.push(lot.lotid);
      });
      idList.forEach((id: string) => {
        occupancyList.push({id: id, occupancy: 0});
      })
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
      response = await axios.get('/api/v1/presence/lots/all');
      let count = 0;
      response.data.lots.forEach((lot: any) => {
        occupancyList.forEach((l: any) => {
            if(l.id === lot.lotid) {
              l.occupancy++;
            }
        });
      });
      return count;
    }
    catch (err) {
      throw err;
    }
  }

  function lotSelector(lotid: string, address: string, capacity: number) {
    let occ = 0;
    for(let i = 0; i < occupancyList.length; i++) {
      if(occupancyList[i].id == lotid) {
        occ = occupancyList[i].occupancy;
      }
    }
    let frag = (
      <React.Fragment key={address + ' | ' + capacity.toString()}>
        <Box className={styles.searchBox} boxShadow={3}>
          <ListItem>
            <ListItemText
              primary={'Address: ' + address}
              secondary={'Capacity: ' + occ + '/' + capacity}
            />
            <ListItemSecondaryAction>
              <Link href={"/lotProfile/" + lotid} passHref>
                <Button variant="contained" color="primary">
                  Select
        </Button>
              </Link>
            </ListItemSecondaryAction>
          </ListItem>
        </Box>
      </React.Fragment>
    )
    return frag
  }

  async function renderEntries() {
    let vals = await getEntries();
    if(vals) {
      await getOccupancy();
      let filtered = vals.filter((lot: any) => lot.lotaddress.includes(query));
      let elements = filtered.map((lot: any) => lotSelector(lot.lotid, lot.lotaddress, lot.capacity));
      handleSort(elements);
      if((value=='address' && sort=='dsc') || (value=='capacity' && sort=='asc')) {
        elements.reverse();
      }
      return elements;
    }
    return <div className={styles.oops}>Nothing to see here ¯\_(ツ)_/¯</div>
  }

  function handleSort(elements: JSX.Element[]) {
    if (value == 'address') {
      elements.sort(function (a, b) {
        let keyA = a.key!.toString();
        let keyB = b.key!.toString();
        let addA = keyA.substring(0, keyA.indexOf(" | "));
        let addB = keyB.substring(0, keyB.indexOf(" | "));
        return addA > addB ? 1 : -1;
      })
    } else {
      elements.sort(function (a, b) {
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
  }, [value, query, sort]);



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
        <RadioGroup aria-label="filter" color="#556cd6" name="filter" value={sort} onChange={(ev: React.ChangeEvent<HTMLInputElement>,
        ): void => setSort(ev.target.value)}>
          <FormControlLabel className={styles.radioSort} value="asc" control={<Radio color="primary" />} label="Asc" />
          <FormControlLabel className={styles.radioSort} value="dsc" control={<Radio color="primary" />} label="Desc" />
        </RadioGroup>
      </FormControl>
    </div>
    <SearchBar className={styles.searchBar} onChange={e => { setQuery(e) }} onRequestSearch={() => console.log(query)} onCancelSearch={() => setQuery('')} />
    <div>
      <List className={styles.searchResult}>
        {lotEntries}
      </List>
    </div>
  </React.Fragment>;
}
