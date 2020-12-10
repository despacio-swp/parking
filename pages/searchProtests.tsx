import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import SearchBar from 'material-ui-search-bar';
import AppMenu from '../components/AppMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Box, FormControlLabel, RadioGroup, Radio, FormControl, FormLabel } from '@material-ui/core';
import styles from './searchProtests.module.scss';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import axios from 'axios';

export default function Search(this: any) {
  let [query, setQuery] = React.useState('');
  let [value, setValue] = React.useState('name');
  let [sort, setSort] = React.useState('asc');
  let [protestEntries, setProtestEntries] = useState<JSX.Element[]>([<p>Loading</p>]); // stupid placeholder
  let idList: string[] = [];
  let protestList: { protestId: string; protestName: string; protestAddress: string; }[] = [];


  async function getEntries() {
    let response;
    try {
      response = await axios.get('/api/v1/protests/all');
      response.data.protests.forEach((protest: any) => {
        idList.push(protest.protestId);
        protestList.push({ protestId: protest.protestId, protestName: protest.protestName, protestAddress: protest.protestAddress });
      });
    }
    catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    if (response.data === null) {
      console.log('Error!');
    }
    return response.data.protests;
  }

  function protestSelector(protestId: string, name: string, address: string) {
    let frag = (
      <React.Fragment key={name + ' | ' + address}>
        <Box className={styles.searchBox} boxShadow={3}>
          <ListItem>
            <div className={styles.listBox}>
              <ListItemText
                primary={'Name: ' + name}
                secondary={'Location: ' + address}
              />
            </div>
            <div className={styles.listButton}>
              <ListItemSecondaryAction>
                <Link href={"/ProtestProfile/" + protestId} passHref>
                  <Button variant="text" color="primary">
                    More Info
                  </Button>
                </Link>
              </ListItemSecondaryAction>
            </div>
          </ListItem>
        </Box>
      </React.Fragment>
    )
    return frag
  }

  async function renderEntries() {
    let vals = await getEntries();
    if (vals !== null) {
      console.log(vals);
      if (vals.length > 1) {
        let filtered = vals.filter((protest: any) => protest.protestaddress.includes(query));
        let elements = filtered.map((protest: any) => protestSelector(protest.protestid, protest.protestname, protest.protestaddress));
        handleSort(elements);
        if (sort == 'dsc') {
          elements.reverse();
        }
        return elements;
      } else {
        return vals.map((protest: any) => protestSelector(protest.protestid, protest.protestname, protest.protestaddress));
      }
    }
    return <div className={styles.oops}>Nothing to see here ¯\_(ツ)_/¯</div>
  }

  function handleSort(elements: JSX.Element[]) {
    if (value == 'name') {
      elements.sort(function (a, b) {
        let keyA = a.key!.toString();
        let keyB = b.key!.toString();
        let nameA = parseInt(keyA.substring(0, keyA.indexOf(" | ")));
        let nameB = parseInt(keyB.substring(0, keyB.indexOf(" | ")));
        return nameA > nameB ? 1 : -1;
      })
    } else {
      elements.sort(function (a, b) {
        let keyA = a.key!.toString();
        let keyB = b.key!.toString();
        let addA = parseInt(keyA.substring(keyA.indexOf(" | ")));
        let addB = parseInt(keyB.substring(keyB.indexOf(" | ")));
        return addA > addB ? 1 : -1;
      })

    }
    elements.forEach(element => {
      console.log(element.key);
    });
  }

  useEffect(() => {
    (async () => {
      setProtestEntries(await renderEntries());
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

        <div className={styles.floatContainer}>
          <div className={styles.floatChild}>
            <RadioGroup id="radioLeft" aria-label="filter" color="#556cd6" name="filter" value={value} onChange={(ev: React.ChangeEvent<HTMLInputElement>,
            ): void => setValue(ev.target.value)}>
              <FormControlLabel className={styles.radioSort} value="name" control={<Radio color="primary" />} label="Name" />
              <FormControlLabel className={styles.radioSort} value="address" control={<Radio color="primary" />} label="Address" />
            </RadioGroup>
          </div>
          <div className={styles.floatChild}>
            <RadioGroup id="radioRight" aria-label="filter" color="#556cd6" name="filter" value={sort} onChange={(ev: React.ChangeEvent<HTMLInputElement>,
            ): void => setSort(ev.target.value)}>
              <FormControlLabel className={styles.radioSort} value="asc" control={<Radio color="primary" />} label="Asc" />
              <FormControlLabel className={styles.radioSort} value="dsc" control={<Radio color="primary" />} label="Desc" />
            </RadioGroup>
          </div>
        </div>
      </FormControl>
    </div>
    <SearchBar className={styles.searchBar} onChange={e => { setQuery(e) }} onRequestSearch={() => console.log(query)} onCancelSearch={() => setQuery('')} />
    <div>
      <List className={styles.searchResult}>
        {protestEntries}
      </List>
    </div>
  </React.Fragment>;
}
