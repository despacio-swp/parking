import React from 'react';
import AppMenu from '../components/AppMenu';
import {Grid, Menu, MenuItem, TextField, Button, IconButton, Fab} from '@material-ui/core';
import {Card, CardHeader, CardContent, CardActions, Collapse} from '@material-ui/core';
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';
import {MoreVert, ExpandMore, Add} from '@material-ui/icons';
import styles from './lots.module.scss';

interface Lot {
    name: string;
    location: string;
    size: number;
    capacity: number;
    price: number;
}

function LotCard(props: any) {
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
                    <Button disabled> {props.lot.capacity} / {props.lot.size} </Button>
                    <IconButton className={styles.expand} onClick={() => setExpanded(!expanded)}>
                        <ExpandMore />
                    </IconButton>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        empty
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
    const [size, setSize] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);

    const handleOpenAddDialog = () => {
        setName("");
        setLocation("");
        setSize("");
        setPrice("");
        setOpenAddDialog(true);
    };

    const handleOpenEditDialog = (lot: Lot) => {
        setName(lot.name);
        setLocation(lot.location);
        setSize(lot.size.toString());
        setPrice(lot.price.toString());
        setOpenEditDialog(true);
    };

    const handleEdit = (lot: Lot) => {
        lot.name = name;
        lot.location = location;
        lot.size = +size;
        lot.price = +price
        setOpenEditDialog(false);
    };

    const handleAdd = (name: string, location: string, size: number, price: number) => {
        const lot: Lot = {name, location, size, capacity: 0, price};
        setLots([...lots, lot]);
        setOpenAddDialog(false);
    };

    const handleDelete = (lot: Lot) => {
        setLots(lots.filter(item => item !== lot));
    };

    const error = (type: string) => {
        switch (type) {
            case "name":
                return name === "";
            case "location":
                return location === "";
            case "size":
                return !size.match("^([1-9]|[1-9][0-9]{0,2})$");
            case "price":
                return !price.match("^([1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$");
            default:
                return name === "" || location === "" || !size.match("^([1-9]|[1-9][0-9]{0,2})$") || !price.match("^([1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$");
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
                <React.Fragment>
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
                            <TextField value={size} label="Spaces" margin="normal" fullWidth 
                                onChange={event =>  {
                                    if (event.target.value.match("^([]*|[1-9]|[1-9][0-9]{0,2})$")) {
                                        setSize(event.target.value);
                                    }
                                }}
                                error={error("size")}
                                helperText={errorText("size")}
                                placeholder={lot.size.toString()}
                            />
                            <TextField value={price} label="Price (per hour)" margin="normal" fullWidth 
                                onChange={event =>  {
                                    if (event.target.value.match("^([]*|[1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$")) {
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
                    <TextField value={size} label="Size" margin="normal" fullWidth 
                        onChange={event =>  {
                            if (event.target.value.match("^([]*|[1-9]|[1-9][0-9]{0,2})$")) {
                                setSize(event.target.value);
                            }
                        }}
                        error={error("size")}
                        helperText={errorText("size")}
                    />
                    <TextField value={price} label="Price (per hour)" margin="normal" fullWidth
                        onChange={event =>  {
                            if (event.target.value.match("^([]*|[1-9]|[1-9][0-9]?|[1-9][.][0-9]{0,2}|[1-9][0-9][.][0-9]{0,2})$")) {
                                setPrice(event.target.value);
                            }
                        }}
                        error={error("price")}
                        helperText={errorText("price")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => setOpenAddDialog(false)}> Cancel </Button>
                    <Button disabled={error("")} color="primary" onClick={() => handleAdd(name, location, +size, +price)}> Create </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
