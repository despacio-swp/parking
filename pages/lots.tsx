import React from 'react';
import AppMenu from '../components/AppMenu';
import { Grid, Card, CardContent, Typography, Button, TextField, Fab, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@material-ui/core';
import styles from './lots.module.scss';
import AddIcon from '@material-ui/icons/Add';

interface Lot {
  name: string;
  location: string;
  size: number;
  capacity: number;
}

function LotCard(lot: Lot) {
  return <Grid item className={styles.lotCard}>
    <Card>
      <CardContent>
        <Grid container>
          <Grid item xs={6}>
            <Typography variant="h5"> {lot.name} </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right"> {lot.capacity} / {lot.size} </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2"> {lot.location} </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </Grid>;
}

export default function Lots() {
  let [lots, setLots] = React.useState([]);
  let [open, setOpen] = React.useState(false);
  let [name, setName] = React.useState('');
  let [location, setLocation] = React.useState('');
  let [size, setSize] = React.useState('');

  const handleAddLot = (name: string, location: string, size: number) => {
    // @ts-ignore
    setLots([...lots, LotCard({ name: name, location: location, size: size, capacity: 0 })]);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
    setLocation('');
    setSize('');
  };

  return <React.Fragment>
    <AppMenu page="Lots"/>
    <Grid container direction="column" alignItems="center" spacing={1}>
      {lots}
    </Grid>
    <Fab className={styles.fab} onClick={() => setOpen(true)} color="primary">
      <AddIcon />
    </Fab>
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle> Create Lot </DialogTitle>
      <DialogContent>
        <DialogContentText> Fill out this forum and click "Add" to create a new lot, or "Cancel" to close this forum </DialogContentText>
        <TextField value={name} label="Name" variant="outlined" margin="normal" fullWidth required onChange={event => setName(event.target.value)}/>
        <TextField value={location} label="Location" variant="outlined" margin="normal" fullWidth required onChange={event => setLocation(event.target.value)}/>
        <TextField value={size} label="Size" variant="outlined" margin="normal" fullWidth required onChange={event => setSize(event.target.value)}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}> Cancel </Button>
        <Button onClick={() => handleAddLot(name, location, +size)}> Add </Button>
      </DialogActions>
    </Dialog>
  </React.Fragment>;
}
