import React, { useEffect } from 'react';
import Head from 'next/head';
import AppMenu from '../../components/AppMenu';
import { Paper, Typography, Grid} from '@material-ui/core';
import styles from './ProtestProfile.module.scss';
import axios, { AxiosResponse } from 'axios';


export default function protestProfile() {
    let [protestData, setProtestData] = React.useState({ date: '', name: '', location: '', email: '',  description: '' });
    let protestid: string | undefined = "";
    
    async function getData() {
        let response;
        try {
          const last = window.location.href.split('/ProtestProfile/').pop();
          console.log('protestid: ' + last);
          protestid = last;
          response = await axios.get('/api/v1/protests/' + last);
          console.log(response.data);
          setProtestData({ date: response.data.protestDate, name:response.data.protestName, location: response.data.protestAddress, email: response.data.email, description: response.data.protestDescription });
        }
          catch (err) {
          if (err.response) response = err.response;
          else throw err;
        }
        return response;
    }
    
    useEffect(() => {
        (async () => {
          await getData();
        })();
    }, [protestid]);

    return <React.Fragment>
    <Head>
      <title>Protest Profile</title>
    </Head>
    <AppMenu page="Protest Profile" />
    <Paper className={styles.profileBox} elevation={3}>
      <Grid>
        <Typography variant="h6" align="left">Protest Name: {protestData.name}</Typography>
        <Typography variant="h6" align="left">Address: {protestData.location}</Typography>
        <Typography variant="h6" align="left">Description: {protestData.description}</Typography>
        <Typography variant="h6" align="left">email: {protestData.email}</Typography>
      </Grid>
    </Paper>
  </React.Fragment>;
}