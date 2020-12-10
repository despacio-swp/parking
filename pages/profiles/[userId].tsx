import React, { useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import AppMenu from '../../components/AppMenu';
import {
  Paper, TextField, Typography, Grid, makeStyles, Dialog, DialogTitle,
  DialogActions, DialogContent, DialogContentText, Button, IconButton
} from '@material-ui/core';
import styles from './userProfile.module.scss';
import { Avatar, Fab } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import Add from '@material-ui/icons/Add';
import { useRouter } from 'next/router';
import accountsService from '../../client/accountsService';
import { observer } from 'mobx-react';
import Delete from '@material-ui/icons/Delete';

/* eslint-disable max-len */

const useStyle = makeStyles(theme => ({
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  }
}));

function profile() {
  let router = useRouter();
  let userId: string | null = router.query.userId as string;
  if (userId === 'self') userId = accountsService.userId;

  let [open, setOpen] = React.useState(false);
  let [openAdd, setOpenAdd] = React.useState(false);
  let [loading, setLoading] = React.useState(true);
  let [found, setFound] = React.useState(true);
  let [firstName, setFirstName] = React.useState('');
  let [lastName, setLastName] = React.useState('');
  let [email, setEmail] = React.useState('');
  let [updateLoading, setUpdateLoading] = React.useState(false);
  let [plateName, setPlate] = React.useState('');
  let [plates, setPlates] = React.useState<string[]>([]);

  useEffect(() => {
    if (userId === null || userId === undefined) return;
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
      setEmail(response.data.email);
      setPlates(response.data.vehicles);
      setLoading(false);
    })();
  }, [userId]);

  let [firstNameTemp, setFirstNameTemp] = React.useState('');
  let [lastNameTemp, setLastNameTemp] = React.useState('');
  let [emailTemp, setEmailTemp] = React.useState('');
  // let [plateTemp, setPlateTemp] = React.useState('');

  const changeProfile = async (firstNameTemp: string, lastNameTemp: string, emailTemp: string) => {
    setUpdateLoading(true); // add new state for loading spinner on submit or something
    let response = await axios.post('/api/v1/profiles/self', {
      firstName: firstNameTemp,
      lastName: lastNameTemp,
      email: emailTemp
    });
      // also TODO: error handling, but that can happen later
      // you want to use firstName, lastName, and email from the response in case server modified them, for example to remove profanity
    setFirstName(response.data.firstName);
    setLastName(response.data.lastName);
    setEmail(response.data.email);
    setFirstNameTemp(response.data.firstName);
    setLastNameTemp(response.data.lastName);
    setEmailTemp(response.data.email);
    // we are done loading
    setUpdateLoading(false);
    setOpen(false);
    accountsService.checkLoginState();
  };

  let [addPlateLoading, setAddPlateLoading] = React.useState(false);

  const addPlate = async (plateName: string) => {
    setAddPlateLoading(true);
    // TODO: handle errors
    try {
      await axios.put('/api/v1/profiles/self/vehicles/' + plateName);
    } catch (err) {
      setAddPlateLoading(false);
      return;
    }
    // this should be correct
    setPlates(arr => [...arr, plateName]);
    setAddPlateLoading(false);
    setOpenAdd(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const classes = useStyle();

  const handleRemoveItem = async (target: string) => {
    let response = await axios.delete('/api/v1/profiles/self/vehicles/' + target);
    setPlates(plates.filter(item => target !== item));
  };

  let platesList: JSX.Element;
  if (!plates.length) {
    platesList = <p>You have no vehicles!</p>;
  } else {
    platesList = <>
      {plates.map(plate => (
        // change this later if it looks ugly i guess
        <p key={plate}><b>License plate:</b> {plate} <span>
          <IconButton onClick={() => handleRemoveItem(plate)}>
            <Delete/>
          </IconButton>
        </span></p>
      ))}
    </>;
  }

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
          <Typography variant="h6" align="left">Email: {email}</Typography>
          <Typography variant="h6" align="left">Car Information</Typography>
          {platesList}
          <Button variant="contained" onClick={() => setOpenAdd(true)} >Add Vehicle</Button>
        </Grid>
      </Paper>
      <Fab className={styles.fab} onClick={() => setOpen(true)} color="primary" aria-label="edit">
        <EditIcon />
      </Fab>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle> Edit Profile </DialogTitle>
        <DialogContent>
          <DialogContentText> Edit  This form to edit your Profile</DialogContentText>
          <TextField value={firstNameTemp} label="First Name" variant="outlined" margin="normal" fullWidth required onChange={event => setFirstNameTemp(event.target.value)}>{firstName}</TextField>
          <TextField value={lastNameTemp} label="Last Name" variant="outlined" margin="normal" fullWidth required onChange={event => setLastNameTemp(event.target.value)}>{lastName}</TextField>
          <TextField value={emailTemp} label="Email" variant="outlined" margin="normal" fullWidth required onChange={event => setEmailTemp(event.target.value)}>{email}</TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()}> Cancel </Button>
          <Button onClick={() => changeProfile(firstNameTemp, lastNameTemp, emailTemp)}>
          Edit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle> Add Vehicle License Plate </DialogTitle>
        <DialogContent>
          <TextField  label="License Plate" variant="outlined" margin="normal" fullWidth required onChange={event => setPlate(event.target.value)}></TextField>
          <Button onClick={() => handleCloseAdd()}> Cancel </Button>
          <Button onClick={() => addPlate(plateName)}>
            Add
          </Button>
          {addPlateLoading ? <p>Adding vehicle...</p> : null}
        </DialogContent>
      </Dialog>
    </>;
  }
  return <React.Fragment>
    <Head>
      <title>User Profile</title>
    </Head>
    <AppMenu page="User Profile" />
    {contents}
  </React.Fragment>;
}

export default observer(profile);
