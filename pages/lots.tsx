import React, { useEffect } from 'react';
import AppMenu from '../components/AppMenu';
import { Grid, Menu, MenuItem, TextField, Button, IconButton, Fab, Typography } from '@material-ui/core';
import { Card, CardHeader, CardContent, CardActions, Collapse, List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Add from '@material-ui/icons/Add';
import styles from './lots.module.scss';
import axios from 'axios';

/* eslint-disable @typescript-eslint/indent */

interface Lot {
    id: string;
    name: string;
    location: string;
    capacity: number;
    occupancy: number;
    price: number;
}

interface EditLot {
    id: string;
    name: string;
    location: string;
    capacity: number;
    price: number
}

interface Occupant {
    id: string;
    lotId: string;
    name: string;
    license: string;
    email: string;
}

function LotCard(props: { lot: Lot, onEdit: (lot: EditLot) => any, onDelete: (lotId: string) => any }) {
    let [occupantsReady, setOccupantsReady] = React.useState(false);
    const [occupants, setOccupants] = React.useState<Occupant[]>([]);
    const [expanded, setExpanded] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);

    let [editOpen, setEditOpen] = React.useState(false);

    let lot: Lot = props.lot;

    // state used for editing lots
    const [name, setName] = React.useState(lot.name);
    const [location, setLocation] = React.useState(lot.location);
    const [capacity, setCapacity] = React.useState(lot.capacity.toString());
    const [price, setPrice] = React.useState(lot.price.toString());

    const handleOpenMenu = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleOpenEdit = () => {
        setEditOpen(true);
        handleCloseMenu();
    };

    const handleDelete = async () => {
        await props.onDelete(lot.id);
        handleCloseMenu();
    };

    let handleEdit = async () => {
        await props.onEdit({ id: lot.id, name, location, capacity: +capacity, price: +price });
        setEditOpen(false);
    };

    async function toggleExpand() {
        if (expanded) {
            setExpanded(false);
            setOccupantsReady(false);
            return;
        } else {
            setExpanded(true);
            setOccupantsReady(false);
            // fetch occupants
            let response = await axios.get('/api/v1/presence/users/' + lot.id);
            setOccupants(response.data.users.map((occupant: any) => ({
                id: occupant.userid,
                lotId: occupant.lotid,
                name: occupant.firstname + ' ' + occupant.lastname,
                license: occupant.plateid,
                email: occupant.email
            })));
            setOccupantsReady(true);
        }
    }

    const error = (type: string) => {
        switch (type) {
            case 'name':
                return name === '';
            case 'location':
                return location === '';
            case 'capacity':
                return !capacity.match(/^([1-9]|[1-9][0-9]{0,2})$/);
            case 'price':
                return !price.match(/^([1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/);
            default:
                return name === '' || location === '' || !capacity.match(/^([1-9]|[1-9][0-9]{0,2})$/) || !price.match(/^([1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/);
        }
    };

    const errorText = (type: string) => {
        return error(type) ? 'Empty field!' : '';
    };

    let occupantsView: JSX.Element[];
    if (!expanded) {
        occupantsView = [];
    } else if (occupantsReady) {
        occupantsView = occupants.map(occupant => (
            <ListItem dense key={occupant.id}>
                <ListItemText primary={occupant.name + ' (' + occupant.email + ')'} secondary={occupant.license} />
            </ListItem>
        ));
    } else {
        occupantsView = [<ListItem dense key="loading">Loading...</ListItem>];
    }

    return <>
        <Grid item>
            <Card className={styles.card}>
                <CardHeader
                    action={
                        <IconButton onClick={handleOpenMenu}>
                            <MoreVert />
                        </IconButton>
                    }
                    title={props.lot.name}
                    subheader={props.lot.location}
                />
                <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                    <MenuItem onClick={handleOpenEdit}> Edit </MenuItem>
                    <MenuItem onClick={handleDelete}> Delete </MenuItem>
                </Menu>
                <CardActions disableSpacing>
                    <Button disabled> {props.lot.occupancy} / {props.lot.capacity} </Button>
                    <IconButton className={styles.expand} onClick={toggleExpand}>
                        <ExpandMore />
                    </IconButton>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <List style={{ maxHeight: 300 }}>
                            <ListSubheader> Current Occupents </ListSubheader>
                            {occupantsView}
                        </List>
                    </CardContent>
                </Collapse>
            </Card>
        </Grid>
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
            <DialogTitle> Edit Lot </DialogTitle>
            <DialogContent>
                <DialogContentText> Edit the lot name, location, and amount of parking spaces </DialogContentText>
                <TextField value={name} label="Name" margin="normal" fullWidth
                    onChange={event => setName(event.target.value)}
                    error={error('name')}
                    helperText={errorText('name')}
                    placeholder={lot.name}
                />
                <TextField value={location} label="Location" margin="normal" fullWidth
                    onChange={event => setLocation(event.target.value)}
                    error={error('location')}
                    helperText={errorText('location')}
                    placeholder={lot.location}
                />
                <TextField value={capacity} label="Spaces" margin="normal" fullWidth
                    onChange={event => {
                        if (event.target.value.match(/^(|[1-9]|[1-9][0-9]{0,2})$/)) {
                            setCapacity(event.target.value);
                        }
                    }}
                    error={error('capacity')}
                    helperText={errorText('capacity')}
                    placeholder={lot.capacity.toString()}
                />
                <TextField value={price} label="Price (per hour)" margin="normal" fullWidth
                    onChange={event => {
                        if (event.target.value.match(/^(|[1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/)) {
                            setPrice(event.target.value);
                        }
                    }}
                    error={error('price')}
                    helperText={errorText('price')}
                    placeholder={lot.price.toString()}
                />
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => setEditOpen(false)}> Cancel </Button>
                <Button disabled={error('')} color="primary" onClick={handleEdit}> Save </Button>
            </DialogActions>
        </Dialog>
    </>;
}

export default function LotPage() {
    const [lots, setLots] = React.useState<Lot[]>([]);

    // state used for adding lots
    const [name, setName] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [capacity, setCapacity] = React.useState('');
    const [price, setPrice] = React.useState('');

    const [openAddDialog, setOpenAddDialog] = React.useState(false);

    useEffect(() => void (async () => {
        let response = await axios.get('/api/v1/lots/self');
        setLots(response.data.lots.map((lot: any) => ({
            id: lot.lotid,
            name: lot.lotdescription,
            location: lot.lotaddress,
            capacity: lot.capacity,
            occupancy: +lot.occupancy,
            price: +lot.priceperhour
        })));
    })(), []);

    const handleOpenAddDialog = () => {
        setName('');
        setLocation('');
        setCapacity('');
        setPrice('');
        setOpenAddDialog(true);
    };

    const handleEdit = async (lot: EditLot) => {
        let response = await axios.put('/api/v1/lots/' + lot.id, {
            capacity: lot.capacity,
            lotAddress: lot.location,
            pricePerHour: lot.price,
            lotDescription: lot.name
        });
        let data = response.data;
        let oldLotIndex = lots.findIndex(item => item.id === lot.id);
        let oldLot = lots[oldLotIndex];
        let newData: Lot = Object.assign({}, oldLot, {
            name: data.lotDescription,
            location: data.lotAddress,
            capacity: data.capacity,
            price: data.pricePerHour
        });
        let newLots = lots.slice();
        newLots[oldLotIndex] = newData;
        setLots(newLots);
    };

    const handleAdd = async (name: string, location: string, capacity: number, price: number) => {
        let response = await axios.post('/api/v1/lots/lot', { capacity: capacity, lotAddress: location, pricePerHour: price, lotDescription: name });
        let data = response.data;
        setLots([...lots, {
            id: data.lotId,
            name: data.lotDescription,
            location: data.lotAddress,
            capacity: data.capacity,
            occupancy: 0,
            price: data.pricePerHour
        }]);
        setOpenAddDialog(false);
    };

    const handleDelete = async (lotId: string) => {
        let response = await axios.delete('/api/v1/lots/' + lotId);
        setLots(lots.filter(item => item.id !== lotId));
    };

    const error = (type: string) => {
        switch (type) {
            case 'name':
                return name === '';
            case 'location':
                return location === '';
            case 'capacity':
                return !capacity.match(/^([1-9]|[1-9][0-9]{0,2})$/);
            case 'price':
                return !price.match(/^([1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/);
            default:
                return name === '' || location === '' || !capacity.match(/^([1-9]|[1-9][0-9]{0,2})$/) || !price.match(/^([1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/);
        }
    };

    const errorText = (type: string) => {
        return error(type) ? 'Empty field!' : '';
    };

    return (
        <React.Fragment>
            <AppMenu page="Lots"/>
            <Grid container direction="column" alignItems="center">
                {lots.map(lot =>
                    <LotCard
                        key={lot.id}
                        lot={lot}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </Grid>
            <Fab className={styles.fab} onClick={handleOpenAddDialog} color="primary">
                <Add />
            </Fab>
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle> New Lot </DialogTitle>
                <DialogContent>
                    <DialogContentText> Create a new lot with a name, location, and amount of parking spaces </DialogContentText>
                    <TextField value={name} label="Name" margin="normal" fullWidth
                        onChange={event => setName(event.target.value)}
                        error={error('name')}
                        helperText={errorText('name')}
                    />
                    <TextField value={location} label="Location" margin="normal" fullWidth
                        onChange={event => setLocation(event.target.value)}
                        error={error('location')}
                        helperText={errorText('location')}
                    />
                    <TextField value={capacity} label="Spaces" margin="normal" fullWidth
                        onChange={event => {
                            if (event.target.value.match(/^(|[1-9]|[1-9][0-9]{0,2})$/)) {
                                setCapacity(event.target.value);
                            }
                        }}
                        error={error('capacity')}
                        helperText={errorText('capacity')}
                    />
                    <TextField value={price} label="Price (per hour)" margin="normal" fullWidth
                        onChange={event => {
                            if (event.target.value.match(/^(|[1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/)) {
                                setPrice(event.target.value);
                            }
                        }}
                        error={error('price')}
                        helperText={errorText('price')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => setOpenAddDialog(false)}> Cancel </Button>
                    <Button disabled={error('')} color="primary" onClick={() => handleAdd(name, location, +capacity, +price)}> Create </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
