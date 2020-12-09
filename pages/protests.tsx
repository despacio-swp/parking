import React, { useEffect } from 'react';
import AppMenu from '../components/AppMenu';
import {Grid, Menu, MenuItem, TextField, Button, IconButton, Fab} from '@material-ui/core';
import {Card, CardHeader, CardContent, CardActions, Collapse} from '@material-ui/core';
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';
import MoreVert from '@material-ui/icons/MoreVert';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Add from '@material-ui/icons/Add';
import styles from './lots.module.scss';
import axios from 'axios';

interface Protest {
    id: string;
    name: string;
    description: string;
    location: string;
    time: string;
    email: string;
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
    const [email, setEmail] = React.useState("");
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);

    useEffect(() => void (async () => {
        let response = await axios.get('/api/v1/protests/all');
        setProtests(response.data.protests.map((protest: any) => ({
            id: protest.protestid,
            name: protest.protestname,
            description: protest.protestdescription,
            location: protest.protestaddress,
            time: protest.protestdate,
            email: protest.email
        })));
    })(), []);

    const handleOpenAddDialog = () => {
        setName("");
        setDescription("");
        setLocation("");
        setTime("");
        setEmail("");
        setOpenAddDialog(true);
    };

    const handleOpenEditDialog = (protest: Protest) => {
        setName(protest.name);
        setDescription(protest.description);
        setLocation(protest.location);
        setTime(protest.time);
        setEmail(protest.email);
        setOpenEditDialog(true);
    };

    const handleEdit = async (protest: Protest) => {
        let response = await axios.put('/api/v1/protests/' + protest.id, { protestDate: time, protestName: name, email: email, protestAddress: location, protestDescription: description });
        let data = response.data;
        let newData = Object.assign({}, protest, {
            name: data.protestName,
            description: data.protestDescription,
            location: data.protestAddress,
            time: data.protestDate,
            email: data.email
        });
        setProtests([newData, ...protests.filter(item => item !== protest)]);
        setOpenEditDialog(false);
    };

    const handleAdd = async (name: string, description: string, location: string, time: string, email: string) => {
        let response = await axios.post('/api/v1/protests/protest', { protestDate: time, protestName: name, email: email, protestAddress: location, protestDescription: description });
        let data = response.data;
        console.log(data);
        setProtests([...protests, {
            id: data.protestId,
            name: data.protestName,
            description: data.protestDescription,
            location: data.protestAddress,
            time: data.protestDate,
            email: data.email
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

    const anyError = name === "" || description === "" || location === "" || time === "" || email === "";

    return (
        <React.Fragment>
            <AppMenu page="Protests"/>
            <Grid container direction="column" alignItems="center">
                {protests.map(protest =>
                <React.Fragment key={protest.name}>
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
                            <TextField value={email} label="Email" margin="normal" fullWidth 
                                onChange={event => setEmail(event.target.value)} 
                                error={error(email)}
                                helperText={errorText(email)}
                                placeholder={protest.email}
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
                    <TextField value={email} label="Email" margin="normal" fullWidth 
                        onChange={event => setEmail(event.target.value)}
                        error={error(email)}
                        helperText={errorText(email)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => setOpenAddDialog(false)}> Cancel </Button>
                    <Button disabled={anyError} color="primary" onClick={() => handleAdd(name, description, location, time, email)}> Create </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}