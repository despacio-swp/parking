import React, { useEffect } from 'react';
import AppMenu from '../components/AppMenu';
import {Grid, Menu, MenuItem, TextField, Button, IconButton, Fab} from '@material-ui/core';
import {Card, CardHeader, CardContent, CardActions, Collapse} from '@material-ui/core';
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';
import {MoreVert, ExpandMore, Add} from '@material-ui/icons';
import styles from './lots.module.scss';
import axios from 'axios';

interface Protest {
    id: string;
    name: string;
    description: string;
    location: string;
    time: string;
}

function ProtestCard(props: any) {
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
                    title={props.protest.name}
                    subheader={props.protest.location}
                />
                <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                    <MenuItem onClick={handleOpenEdit}> Edit </MenuItem>
                    <MenuItem onClick={handleDelete}> Delete </MenuItem>
                </Menu>
                <CardActions disableSpacing>
                    <Button disabled> {props.protest.time} </Button>
                    <IconButton className={styles.expand} onClick={() => setExpanded(!expanded)}>
                        <ExpandMore />
                    </IconButton>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        {props.protest.description}
                    </CardContent>
                </Collapse>
            </Card>
        </Grid>
    );
}

export default function ProtestPage() {
    const [protests, setProtests] = React.useState<Protest[]>([]);
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [time, setTime] = React.useState("");
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);

    useEffect(() => void (async () => {
        let response = await axios.get('/api/v1/protests/all');
        console.log('initial fetch', response.data.protests);
        setProtests(response.data.protests.map((protest: any) => ({
            id: protest.protestId,
            name: protest.protestName,
            description: protest.protestDescription,
            location: protest.protestAddress,
            time: protest.protestDate
        })));
    })(), []);

    const handleOpenAddDialog = () => {
        setName("");
        setDescription("");
        setLocation("");
        setTime("");
        setOpenAddDialog(true);
    };

    const handleOpenEditDialog = (protest: Protest) => {
        setName(protest.name);
        setDescription(protest.description);
        setLocation(protest.location);
        setTime(protest.time);
        setOpenEditDialog(true);
    };

    const handleEdit = async (protest: Protest) => {
        let response = await axios.put('/api/v1/protests/' + protest.id, { protestName: name, protestAddress: location, protestDate: time, protestDescription: description });
        let data = response.data;
        let newData = Object.assign({}, protest, {
            id: data.protestId,
            name: data.protestName,
            description: data.protestDescription,
            location: data.protestAddress,
            time: data.protestDate
        });
        setProtests([newData, ...protests.filter(item => item !== protest)]);
        setOpenEditDialog(false);
    };

    const handleAdd = async (name: string, description: string, location: string, time: string) => {
        let response = await axios.put('/api/v1/protests/protest', { protestName: name, protestAddress: location, protestDate: time, protestDescription: description });
        let data = response.data;
        setProtests([...protests, {
            id: data.protestId,
            name: data.protestName,
            description: data.protestDescription,
            location: data.protestAddress,
            time: data.protestDate
        }]);
        setOpenAddDialog(false);
    };

    const handleDelete = async (protest: Protest) => {
        let response = await axios.delete('/api/v1/protests/' + protest.id);
        setProtests(protests.filter(item => item !== protest));
    };

    const error = (value: string) => {
        return value === "";
    };

    const errorText = (value: string) => {
        return error(value) ? "Empty field!" : "";
    };

    const anyError = name === "" || description === "" || location === "" || time === "";

    return (
        <React.Fragment>
            <AppMenu page="Protests"/>
            <Grid container direction="column" alignItems="center">
                {protests.map(protest =>
                <React.Fragment>
                    <ProtestCard protest={protest}
                        openEdit={() => handleOpenEditDialog(protest)}
                        onEdit={() => handleEdit(protest)}
                        onDelete={() => handleDelete(protest)}
                    />
                    <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                        <DialogTitle> Edit Protest </DialogTitle>
                        <DialogContent>
                            <DialogContentText> Edit the protest name, description, location, and time of the protest </DialogContentText>
                            <TextField value={name} label="Name" margin="normal" fullWidth 
                                onChange={event => setName(event.target.value)} 
                                error={error(name)}
                                helperText={errorText(name)}
                                placeholder={protest.name}
                            />
                            <TextField value={description} label="Description" margin="normal" fullWidth 
                                onChange={event => setDescription(event.target.value)} 
                                error={error(description)}
                                helperText={errorText(description)}
                                placeholder={protest.description}
                            />
                            <TextField value={location} label="Location" margin="normal" fullWidth 
                                onChange={event => setLocation(event.target.value)} 
                                error={error(location)}
                                helperText={errorText(location)}
                                placeholder={protest.location}
                            />
                             <TextField value={time} label="Time" margin="normal" fullWidth 
                                onChange={event => setTime(event.target.value)} 
                                error={error(time)}
                                helperText={errorText(time)}
                                placeholder={protest.time}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button color="primary" onClick={() => setOpenEditDialog(false)}> Cancel </Button>
                            <Button disabled={anyError} color="primary" onClick={() => handleEdit(protest)}> Save </Button>
                        </DialogActions>
                    </Dialog>
                </React.Fragment>)}
            </Grid>
            <Fab className={styles.fab} onClick={handleOpenAddDialog} color="primary">
                <Add />
            </Fab>
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle> New Protest </DialogTitle>
                <DialogContent>
                    <DialogContentText> Create a new protest with a name, description, location, and time of the protest </DialogContentText>
                    <TextField value={name} label="Name" margin="normal" fullWidth 
                        onChange={event => setName(event.target.value)} 
                        error={error(name)}
                        helperText={errorText(name)}
                    />
                    <TextField value={description} label="Description" margin="normal" fullWidth 
                        onChange={event => setDescription(event.target.value)} 
                        error={error(description)}
                        helperText={errorText(description)}
                    />
                    <TextField value={location} label="Location" margin="normal" fullWidth 
                        onChange={event => setLocation(event.target.value)} 
                        error={error(location)}
                        helperText={errorText(location)}
                    />
                    <TextField value={time} label="Time" margin="normal" fullWidth 
                        onChange={event => setTime(event.target.value)} 
                        error={error(time)}
                        helperText={errorText(time)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => setOpenAddDialog(false)}> Cancel </Button>
                    <Button disabled={anyError} color="primary" onClick={() => handleAdd(name, description, location, time)}> Create </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}