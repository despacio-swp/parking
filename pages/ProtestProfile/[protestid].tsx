import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import AppMenu from '../../components/AppMenu';
import {
  Paper, Typography, Grid, List, ListItem, ListItemSecondaryAction, IconButton,
  Dialog, DialogTitle, DialogContent, Button, Link as MuiLink
} from '@material-ui/core';
import styles from './ProtestProfile.module.scss';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import Delete from '@material-ui/icons/Delete';
import LotAutocomplete, { AutocompleteOption } from '../../components/LotAutocomplete';

interface LinkDescriptor {
  linkId: string;
  protestId: string;
  lotId: string;
  lotDescription: string;
}

export default function protestProfile() {
  let [loaded, setLoaded] = useState(false);
  let [protestData, setProtestData] = useState({ date: '', name: '', location: '', email: '', description: '' });
  let [links, setLinks] = useState<LinkDescriptor[]>([]);
  let router = useRouter();
  let protestid = router.query.protestid as string | undefined;

  async function getData() {
    let response;
    try {
      response = await axios.get('/api/v1/protests/' + protestid);
      console.log(response.data);
      setProtestData({
        date: response.data.protestDate,
        name: response.data.protestName,
        location: response.data.protestAddress,
        email: response.data.email,
        description: response.data.protestDescription
      });
    } catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }

    let linksResponse = await axios.get<LinkDescriptor[]>('/api/v1/links/by-protest/' + protestid);
    setLinks(linksResponse.data);
    setLoaded(true);
    return response;
  }

  useEffect(() => {
    if (!protestid) return;
    (async () => {
      await getData();
    })();
  }, [protestid]);

  let [openAdd, setOpenAdd] = useState(false);
  let [linkedLotSelection, setLinkedLotSelection] = useState<AutocompleteOption | null>(null);

  function openLinkDialog() {
    setOpenAdd(true);
  }

  async function addLink(selection: AutocompleteOption) {
    let response = await axios.post('/api/v1/links/link', { protestId: protestid, lotId: selection.lotId });
    let data = response.data;
    setLinks([...links, {
      linkId: data.linkId,
      protestId: data.protestId,
      lotId: data.lotId,
      lotDescription: selection.name
    }]);
    setOpenAdd(false);
  }

  async function deleteLink(linkId: string) {
    await axios.delete('/api/v1/links/' + linkId);
    setLinks(links.filter(link => link.linkId !== linkId));
  }

  if (!loaded) return <div>Loading</div>;

  return <>
    <Head>
      <title>Protest Profile</title>
    </Head>
    <AppMenu page="Protest Profile" />
    <Paper className={styles.profileBox} elevation={3}>
      <Grid>
        <Typography variant="h6" align="left">Protest Name: {protestData.name}</Typography>
        <Typography variant="h6" align="left">Address: {protestData.location}</Typography>
        <Typography variant="h6" align="left">Description: {protestData.description}</Typography>
        <Typography variant="h6" align="left">Email: {protestData.email}</Typography>
        <Typography variant="h6" align="left">Linked protests:</Typography>
        <List>
          {links.map(link => <ListItem key={link.linkId}>
            <Link href={'/lotProfile/' + link.lotId} passHref>
              <MuiLink>{link.lotDescription}</MuiLink>
            </Link>
            <ListItemSecondaryAction>
              <IconButton onClick={() => deleteLink(link.linkId)}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>)}
        </List>
        <Button onClick={openLinkDialog}>Link a parking lot</Button>
      </Grid>
    </Paper>
    <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Link a parking lot</DialogTitle>
      <DialogContent>
        <LotAutocomplete onSelectionChange={setLinkedLotSelection} />
        <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
        <Button disabled={linkedLotSelection === null} onClick={() => addLink(linkedLotSelection!)} color="primary">
          Add
        </Button>
      </DialogContent>
    </Dialog>
  </>;
}
