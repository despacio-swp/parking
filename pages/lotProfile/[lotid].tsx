import React, { useEffect } from 'react';
import Head from 'next/head';
import AppMenu from '../../components/AppMenu';
import { Paper, Box, TextField, Typography, Grid, makeStyles } from '@material-ui/core';
import styles from './userProfile.module.scss';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function profile() {

  let lotid : string | undefined = "";

  let [lotData, setLotData] = React.useState({ capacity: 0, location: '', price: 0, description: ''});
  let [lotCount, setLotCount] = React.useState(0);

  async function getData() {
    let response;
    try {
      const last = window.location.href.split('/lotProfile/').pop();
      lotid = last;

      response = await axios.get('/api/v1/lots/' + last);
      console.log(response);

      let occ;
      if(await getOccupancy()) {
        occ = await getOccupancy();
      }
      let count = 0;
      if(occ){
        occ.data.plates.forEach((lot: any) => {
          count++;
        });
      }
      setLotCount(count);
      setLotData({ capacity: response.data.capacity, location: response.data.lotAddress, price: response.data.pricePerHour, description: response.data.lotDescription });
    } catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    return response;
  }

  async function getOccupancy() {
    let response;
    try {
      response = await axios.get('/api/v1/presence/lots/' + lotid);
    }
    catch (err) {
      return null;
    }
    return response
  }

  async function park() {

  }

  useEffect(() => {
    (async () => {
      //const {lotid} = router.query;
      await getData();
    })();
  }, []);


  return <React.Fragment>
    <Head>
      <title>Lot Profile</title>
    </Head>
    <AppMenu page="Lot Profile" />
    <Paper className={styles.profileBox} elevation={3}>
      <Grid>
        <Typography variant="h6" align="left">Lot Information</Typography>
        <Typography variant="h6" align="left">Location: {lotData.location}</Typography>
        <Typography variant="h6" align="left">Available Space: {lotCount}/{lotData.capacity}</Typography>
        <Typography variant="h6" align="left">Description: {lotData.description}</Typography>
        <Typography variant="h6" align="left">Price Per Hour: ${lotData.price}/hr</Typography>
        <Button variant="contained" onChange={park()}>Park Here</Button>
      </Grid>
    </Paper>
  </React.Fragment>;
}
