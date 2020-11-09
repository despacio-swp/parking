import React, { useEffect } from 'react';
import Head from 'next/head';
import AppMenu from '../components/AppMenu';
import { Paper, Box, TextField, Typography, Grid, makeStyles } from '@material-ui/core';
import styles from './userProfile.module.scss';
import Button from '@material-ui/core/Button';

export default function profile() {
  return <React.Fragment>
    <Head>
      <title>Lot Profile</title>
    </Head>
    <AppMenu page="Lot Profile" />
    <Paper className={styles.profileBox} elevation = {3}>
      <Grid>
        <Typography variant="h6" align="left">Lot:</Typography>
        <Typography variant="h6" align="left">Location: </Typography>
        <Typography variant="h6" align="left">Available Spaces: </Typography>
        <Typography variant="h6" align="left">Desription: </Typography>
        <Button variant="contained">Park Here</Button>
      </Grid>
    </Paper>
  </React.Fragment>;
}
