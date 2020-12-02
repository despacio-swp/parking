import React, { useEffect } from 'react';
import AppMenu from '../components/AppMenu';
import {Grid, Menu, MenuItem, TextField, Button, IconButton, Fab, Typography} from '@material-ui/core';
import {Card, CardHeader, CardContent, CardActions, Collapse, List, ListItem, ListItemText} from '@material-ui/core';
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';
import {MoreVert, ExpandMore, Add} from '@material-ui/icons';
import styles from './lots.module.scss';
import axios from 'axios';

interface Lot {
    id: number;
    name: string;
    location: string;
    capacity: number;
    occupancy: number;
    price: number;
}

interface Occupant {
    name: string;
    license: string;
}

function LotCard(props: any) {
    const [occupants, setOccupants] = React.useState<Occupant[]>([]);
    const [expanded, setExpanded] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpenMenu = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleOpenEdit = () => {
        props.openEdit();
        handleCloseMenu();
    };

    const handleDelete = () => {
        props.onDelete();
        handleCloseMenu();
    };

    return (
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
                    <IconButton className={styles.expand} onClick={() => setExpanded(!expanded)}>
                        <ExpandMore />
                    </IconButton>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <List>
                            {occupants.map(occupant => {
                                <ListItem dense>
                                    <ListItemText primary={occupant.name} secondary={occupant.license} />
                                </ListItem>
                            })}
                        </List>
                    </CardContent>
                </Collapse>
            </Card>
        </Grid>
    );
}

export default function LotPage() {
    const [lots, setLots] = React.useState<Lot[]>([]);
    const [name, setName] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [capacity, setCapacity] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);

    useEffect(() => void (async () => {
        let response = await axios.get('/api/v1/lots/all');
        setLots(response.data.lots.map((lot: any) => ({
            id: lot.lotid,
            name: lot.lotdescription,
            location: lot.lotaddress,
            capacity: lot.capacity,
            occupancy: 0,
            price: lot.priceperhour
        })));
    })(), []);

    const handleOpenAddDialog = () => {
        setName("");
        setLocation("");
        setCapacity("");
        setPrice("");
        setOpenAddDialog(true);
    };

    const handleOpenEditDialog = (lot: Lot) => {
        setName(lot.name);
        setLocation(lot.location);
        setCapacity(lot.capacity.toString());
        setPrice(lot.price.toString());
        setOpenEditDialog(true);
    };

    const handleEdit = async (lot: Lot) => {
        let response = await axios.post('/api/v1/lots/' + lot.id, {capacity: +capacity, lotAddress: location, pricePerHour: +price, lotDescription: name});
        // TODO: error handling if necessary or loading state
        let data = response.data;
        let newData = Object.assign({}, lot, {
            name: data.lotDescription,
            location: data.lotAddress,
            capacity: data.capacity,
            price: data.pricePerHour
        });
        setLots([newData, ...lots.filter(item => item !== lot)]);
        setOpenEditDialog(false);
    };

    const handleAdd = async (name: string, location: string, capacity: number, price: number) => {
        let response = await axios.post('/api/v1/lots/lot', {capacity: capacity, lotAddress: location, pricePerHour: price, lotDescription: name});
        let data = response.data;
        console.log(data);
        setLots([...lots, { id: data.lotId, name: data.lotDescription, location: data.lotAddress, capacity: data.capacity, occupancy: 0, price: data.pricePerHour }]);
        setOpenAddDialog(false);
    };

    const handleDelete = async (lot: Lot) => {
        let response = await axios.delete('/api/v1/lots/' + lot.id);
        setLots(lots.filter(item => item !== lot));
    };

    const error = (type: string) => {
        switch (type) {
            case "name":
                return name === "";
            case "location":
                return location === "";
            case "capacity":
                return !capacity.match(/^([1-9]|[1-9][0-9]{0,2})$/);
            case "price":
                return !price.match(/^([1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/);
            default:
                return name === "" || location === "" || !capacity.match(/^([1-9]|[1-9][0-9]{0,2})$/) || !price.match(/^([1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/);
        }
    };

    const errorText = (type: string) => {
        return error(type) ? "Empty field!" : "";
    };

    return (
        <React.Fragment>
            <AppMenu page="Lots"/>
            <Grid container direction="column" alignItems="center">
                {lots.map(lot =>
                <React.Fragment key={lot.name}>
                    <LotCard lot={lot}
                        openEdit={() => handleOpenEditDialog(lot)}
                        onEdit={() => handleEdit(lot)}
                        onDelete={() => handleDelete(lot)}
                    />
                    <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                        <DialogTitle> Edit Lot </DialogTitle>
                        <DialogContent>
                            <DialogContentText> Edit the lot name, location, and amount of parking spaces </DialogContentText>
                            <TextField value={name} label="Name" margin="normal" fullWidth 
                                onChange={event => setName(event.target.value)} 
                                error={error("name")}
                                helperText={errorText("name")}
                                placeholder={lot.name}
                            />
                            <TextField value={location} label="Location" margin="normal" fullWidth 
                                onChange={event => setLocation(event.target.value)} 
                                error={error("location")}
                                helperText={errorText("location")}
                                placeholder={lot.location}
                            />
                            <TextField value={capacity} label="Spaces" margin="normal" fullWidth 
                                onChange={event =>  {
                                    if (event.target.value.match(/^([]*|[1-9]|[1-9][0-9]{0,2})$/)) {
                                        setCapacity(event.target.value);
                                    }
                                }}
                                error={error("capacity")}
                                helperText={errorText("capacity")}
                                placeholder={lot.capacity.toString()}
                            />
                            <TextField value={price} label="Price (per hour)" margin="normal" fullWidth 
                                onChange={event =>  {
                                    if (event.target.value.match(/^([]*|[1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/)) {
                                        setPrice(event.target.value);
                                    }
                                }}
                                error={error("price")}
                                helperText={errorText("price")}
                                placeholder={lot.price.toString()}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button color="primary" onClick={() => setOpenEditDialog(false)}> Cancel </Button>
                            <Button disabled={error("")} color="primary" onClick={() => handleEdit(lot)}> Save </Button>
                        </DialogActions>
                    </Dialog>
                </React.Fragment>)}
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
                        error={error("name")}
                        helperText={errorText("name")}
                    />
                    <TextField value={location} label="Location" margin="normal" fullWidth 
                        onChange={event => setLocation(event.target.value)} 
                        error={error("location")}
                        helperText={errorText("location")}
                    />
                    <TextField value={capacity} label="Spaces" margin="normal" fullWidth 
                        onChange={event =>  {
                            if (event.target.value.match(/^([]*|[1-9]|[1-9][0-9]{0,2})$/)) {
                                setCapacity(event.target.value);
                            }
                        }}
                        error={error("capacity")}
                        helperText={errorText("capacity")}
                    />
                    <TextField value={price} label="Price (per hour)" margin="normal" fullWidth
                        onChange={event =>  {
                            if (event.target.value.match(/^([]*|[1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$/)) {
                                setPrice(event.target.value);
                            }
                        }}
                        error={error("price")}
                        helperText={errorText("price")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => setOpenAddDialog(false)}> Cancel </Button>
                    <Button disabled={error("")} color="primary" onClick={() => handleAdd(name, location, +capacity, +price)}> Create </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
