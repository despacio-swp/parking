import React, { useEffect } from 'react';
import Head from 'next/head';
import AppMenu from '../components/AppMenu';
import { Paper, Box, TextField, Typography, Grid, makeStyles, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, Button } from '@material-ui/core';
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
  let [open, setOpen] = React.useState(false);
  let [firstName, setFirstName] = React.useState('');
  let [lastName, setLastName] = React.useState('');
  let [model, setModel] = React.useState('');
  let [make, setMake] = React.useState('');
  let [plate, setPlate] = React.useState('');

  let [firstNameTemp, setFirstNameTemp] = React.useState('');
  let [lastNameTemp, setLastNameTemp] = React.useState('');
  let [modelTemp, setModelTemp] = React.useState('');
  let [makeTemp, setMakeTemp] = React.useState('');
  let [plateTemp, setPlateTemp] = React.useState('');

  const changeProfile =
  (firstNameTemp: string, lastNameTemp: string, modelTemp: string, makeTemp: string, plateTemp: string) => {
    setFirstName(firstNameTemp);
    setLastName(lastNameTemp);
    setModel(modelTemp);
    setMake(makeTemp);
    setPlate(plateTemp);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setFirstName('');
    setLastName('');
    setModel('');
    setMake('');
  };
  const classes = useStyle();
  return <React.Fragment>
    <Head>
      <title>User Profile</title>
    </Head>;
    <AppMenu page="User Profile" />
    <Paper className={styles.profileBox} elevation = {3}>
      <Grid>
        <Avatar className={classes.large}/>
      </Grid>
      <Grid>
        <Typography variant="h6" align="left">User Name: {firstName} {lastName}</Typography>
        <Typography variant="h6" align="left">Car Information</Typography>
        <Typography variant="h6" align="left">Make: {make} </Typography>
        <Typography variant="h6" align="left">Model: {model}</Typography>
        <Typography variant="h6" align="left">Plate ID: {plate}</Typography>
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
        <TextField value={makeTemp} label="Make" variant="outlined" margin="normal" fullWidth required onChange={event => setMakeTemp(event.target.value)}>{make}</TextField>
        <TextField value={modelTemp} label="Model" variant="outlined" margin="normal" fullWidth required onChange={event => setModelTemp(event.target.value)}>{model}</TextField>
        <TextField value={plateTemp} label="Model" variant="outlined" margin="normal" fullWidth required onChange={event => setPlateTemp(event.target.value)}>{plate}</TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}> Cancel </Button>
        <Button onClick={() => changeProfile(firstNameTemp, lastNameTemp, makeTemp, modelTemp, plateTemp)}>
        Edit
        </Button>
      </DialogActions>
    </Dialog>
  </React.Fragment>;
}
