import React, { useEffect } from 'react';
import Head from 'next/head';
import AppMenu from '../components/AppMenu';
import { Paper, Box, TextField, Typography, Grid, makeStyles } from '@material-ui/core';
import styles from './userProfile.module.scss';
import { Avatar, Fab } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';


const useStyle = makeStyles(theme => ({
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  }
}));

export default function profile() {
  const classes = useStyle();
  return <React.Fragment>
    <Head>
      <title>User Profile</title>
    </Head>
    <AppMenu page="User Profile" />
    <Paper className={styles.profileBox} elevation = {3}>
      <Grid>
        <Avatar className={classes.large}/>
      </Grid>
      <Grid>
        <Typography variant="h6" align="left">Annie Caroline</Typography>
        <Typography variant="h6" align="left">Car: </Typography>
        <Typography variant="h6" align="left">Make: Ford </Typography>
        <Typography variant="h6" align="left">Model: Escort</Typography>
        <Typography variant="h6" align="left">Plate ID:  FDT357</Typography>
      </Grid>
    </Paper>
    <Fab className={styles.fab} color="secondary" aria-label="edit">
      <EditIcon />
    </Fab>
  </React.Fragment>;
}
