import React, { useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import AppMenu from '../../components/AppMenu';
import { Paper, Box, TextField, Typography, Grid, makeStyles, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, Button } from '@material-ui/core';
import styles from './userProfile.module.scss';
import { Avatar, Fab } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { useRouter } from 'next/router';
import accountsService from '../../client/accountsService';

/* eslint-disable max-len */

const useStyle = makeStyles(theme => ({
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  }
}));

export default function profile() {
  let router = useRouter();
  let userId: string | null = router.query.userId as string;
  if (userId === 'self') userId = accountsService.userId;

  let [open, setOpen] = React.useState(false);
  let [loading, setLoading] = React.useState(true);
  let [found, setFound] = React.useState(true);
  let [firstName, setFirstName] = React.useState('');
  let [lastName, setLastName] = React.useState('');
  // let [plate, setPlate] = React.useState('');

  useEffect(() => {
    if (userId === null) return;
    setLoading(true);
    (async () => {
      let response;
      try {
        response = await axios.get('/api/v1/profiles/' + userId);
      } catch (err) {
        setLoading(false);
        setFound(false);
        return;
      }
      setFound(true);
      console.log(response.data);
      setFirstName(response.data.firstName);
      setLastName(response.data.lastName);
      setLoading(false);
    })();
  }, [userId]);

  let [firstNameTemp, setFirstNameTemp] = React.useState('');
  let [lastNameTemp, setLastNameTemp] = React.useState('');
  // let [plateTemp, setPlateTemp] = React.useState('');

  const changeProfile =
  (firstNameTemp: string, lastNameTemp: string) => {
    setFirstName(firstNameTemp);
    setLastName(lastNameTemp);
    // setPlate(plateTemp);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setFirstName('');
    setLastName('');
  };

  const classes = useStyle();

  let contents: JSX.Element;
  if (userId === null) {
    contents = <Paper className={styles.profileBox} elevation = {3}>
      {router.query.userId === 'self' ? 'You are not logged in' : 'User does not exist'}
    </Paper>;
  } else if (!found) {
    contents = <Paper className={styles.profileBox} elevation = {3}>
      User does not exist
    </Paper>;
  } else if (loading) {
    contents = <Paper className={styles.profileBox} elevation = {3}>LOADING</Paper>;
  } else {
    contents = <>
      <Paper className={styles.profileBox} elevation = {3}>
        <Grid>
          <Avatar className={classes.large}/>
        </Grid>
        <Grid>
          <Typography variant="h6" align="left">User Name: {firstName} {lastName}</Typography>
          <Typography variant="h6" align="left">Car Information</Typography>
          {/*
          <Typography variant="h6" align="left">Make: {make} </Typography>
          <Typography variant="h6" align="left">Model: {model}</Typography>
          <Typography variant="h6" align="left">Plate ID: {plate}</Typography>
          */}
        </Grid>
      </Paper>
      <Fab className={styles.fab} onClick={() => setOpen(true)} color="secondary" aria-label="edit">
        <EditIcon />
      </Fab>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle> Create Lot </DialogTitle>
        <DialogContent>
          <DialogContentText> Edit  This form to edit your Profile</DialogContentText>
          <TextField value={firstNameTemp} label="First Name" variant="outlined" margin="normal" fullWidth required onChange={event => setFirstNameTemp(event.target.value)}>{firstName}</TextField>
          <TextField value={lastNameTemp} label="Last Name" variant="outlined" margin="normal" fullWidth required onChange={event => setLastNameTemp(event.target.value)}>{lastName}</TextField>
          {/*
          <TextField value={makeTemp} label="Make" variant="outlined" margin="normal" fullWidth required onChange={event => setMakeTemp(event.target.value)}>{make}</TextField>
          <TextField value={modelTemp} label="Model" variant="outlined" margin="normal" fullWidth required onChange={event => setModelTemp(event.target.value)}>{model}</TextField>
          <TextField value={plateTemp} label="Model" variant="outlined" margin="normal" fullWidth required onChange={event => setPlateTemp(event.target.value)}>{plate}</TextField>
          */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()}> Cancel </Button>
          <Button onClick={() => changeProfile(firstNameTemp, lastNameTemp)}>
          Edit
          </Button>
        </DialogActions>
      </Dialog>
    </>;
  }
  return <React.Fragment>
    <Head>
      <title>User Profile</title>
    </Head>
    <AppMenu page="User Profile" />
    <p>test: userid {userId}</p>
    {contents}
  </React.Fragment>;
}
