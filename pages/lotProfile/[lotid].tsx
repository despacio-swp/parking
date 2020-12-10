import React, { useEffect } from 'react';
import Head from 'next/head';
import AppMenu from '../../components/AppMenu';
import { Paper, Box, TextField, Typography, Grid, Dialog, DialogContentText } from '@material-ui/core';
import styles from './userProfile.module.scss';
import Button from '@material-ui/core/Button';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import accountsService from '../../client/accountsService';

export default function profile() {
  let userid = accountsService.userId;
  let router = useRouter();
  let lotid = router.query.lotid as string | undefined;

  let [open, setOpen] = React.useState(false);
  let [lotData, setLotData] = React.useState({ capacity: 0, location: '', price: 0, description: '' });
  let [lotCount, setLotCount] = React.useState(0);
  let [plateName, setPlate] = React.useState('');
  let [parked, setParked] = React.useState(false);
  let [vehicleList, setVehicleList] = React.useState<JSX.Element[]>([<></>]); // stupid placeholder
  //let [plates, setPlates] = React.useState<string[]>([]);
  let plateList: string[] = [];

  async function getData() {
    let response;
    try {
      response = await axios.get('/api/v1/lots/' + lotid);

      let occ;
      if (await getOccupancy()) {
        occ = await getOccupancy();
      }
      let count = 0;
      if (occ) {
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
    } catch (err) {
      return null;
    }
    return response;
  }
  const handleClose = () => {
    setOpen(false);
  };

  const handlePark = async (plateid: string) => {
    let response = await axios.post('/api/v1/presence/lots/' + lotid + '/' + plateid);
    setParked(true);
    handleClose();
  };

  useEffect(() => {
    if (userid === null) return;
    let response;
    let curr: AxiosResponse<any>;
    (async () => {
      await getData();
      try {
        response = await axios.get('/api/v1/vehicles/user/self/');
      } catch (err) {
        return null;
      }
      response.data.vehicles.forEach((vehicle: any) => {
        plateList.push(vehicle.plateid);
      })
      try {
        curr = await axios.get('/api/v1/presence/lots/current');
        let lots: string[] = [];
        curr.data.lots.forEach((lot: any) => {
          if(lot.lotid === lotid) {
            lots.push(lot.plateid);
          }
        });
        console.log('Lots');
        console.log(lots);
        console.log('PlateLists');
        console.log(plateList);
        plateList.forEach((plate: string) => {
          if(lots.includes(plate)) {
            console.log(plate + " already parked here!");
            setParked(true);
          } else {
            console.log(plate + " not parked here!")
          }
        });

        /* plateList.forEach((plate: string) => {
          if (lots.includes(plate)) {
            lots.forEach((lot: any) => {
              if (lot.plateid === plate) {
                console.log(plate + " Already Parked Here!");
                setParked(true);
              }
            });
          } else {
            console.log("Not Parked!");
          }

        }); */
      } catch (err) {
        return null;
      }
      setVehicleList(vehicleList.concat(getPlateList()));
    })();
  }, [userid]);

  function getPlateList() {
    let platesList: JSX.Element;
    if (!plateList.length) {
      platesList = <p>You have no vehicles!</p>;
    } else {
      platesList = <div>
        {plateList.map((plate: string) => (
          // change this later if it looks ugly i guess
          // I ADDED A TO STRING!
          <p key={plate} onClick={() => handlePark(plate)}><b>License plate:</b> {plate}</p>
        ))}
      </div>;
    }
    return platesList;
  }

  let parkMessage: JSX.Element;
  if (parked) {
    parkMessage = <Typography variant="h6" align="left">You are parked in this lot!</Typography>
  } else {
    parkMessage = <Typography variant="h6" align="left">You are currently not parked in this lot</Typography>
  }


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
        {parkMessage}
        <Button variant="contained" onClick={() => setOpen(true)} >Park Here</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogContentText>Choose the vehicle that you would like to use to park with.</DialogContentText>
          {vehicleList}
          <Link href={"/searchLots/"} passHref>
            <Button variant="contained" onClick={() => handleClose()}> Cancel </Button>
          </Link>
        </Dialog>
        <Link href={"/searchLots/"} passHref>
          <Button variant="contained" onClick={() => handleClose()}> Cancel </Button>
        </Link>
      </Grid>
    </Paper>
  </React.Fragment>;
}
