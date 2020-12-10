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

interface EditProtest {
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

    const [name, setName] = React.useState(props.protest.name);
    const [description, setDescription] = React.useState(props.protest.description);
    const [location, setLocation] = React.useState(props.protest.location);
    const [time, setTime] = React.useState(props.protest.time);
    const [email, setEmail] = React.useState(props.protest.email);

    const [openEditDialog, setOpenEditDialog] = React.useState(false);


    const handleOpenMenu = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleOpenEdit = () => {
        setOpenEditDialog(true);
        handleCloseMenu();
    };

    const handleDelete = async () => {
        await props.onDelete(props.protest.id);
        handleCloseMenu();
    };

    let handleEdit = async () => {
        await props.onEdit({ id: props.protest.id, name, description, location, time, email });
        setOpenEditDialog(false);
    };

    const error = (value: string) => {
        return value === "";
    };

    const errorText = (value: string) => {
        return error(value) ? "Empty field!" : "";
    };

    const anyError = name === "" || description === "" || location === "" || time === "" || email === "";

    return <>
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
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
            <DialogTitle> Edit Protest </DialogTitle>
            <DialogContent>
                <DialogContentText> Edit the protest name, description, location, and time of the protest </DialogContentText>
                <TextField value={name} label="Name" margin="normal" fullWidth 
                    onChange={event => setName(event.target.value)} 
                    error={error(name)}
                    helperText={errorText(name)}
                    placeholder={props.protest.name}
                />
                <TextField value={description} label="Description" margin="normal" fullWidth 
                    onChange={event => setDescription(event.target.value)} 
                    error={error(description)}
                    helperText={errorText(description)}
                    placeholder={props.protest.description}
                />
                <TextField value={location} label="Location" margin="normal" fullWidth 
                    onChange={event => setLocation(event.target.value)} 
                    error={error(location)}
                    helperText={errorText(location)}
                    placeholder={props.protest.location}
                />
                <TextField value={time} label="Time" margin="normal" fullWidth 
                    onChange={event => setTime(event.target.value)} 
                    error={error(time)}
                    helperText={errorText(time)}
                    placeholder={props.protest.time}
                />
                <TextField value={email} label="Email" margin="normal" fullWidth 
                    onChange={event => setEmail(event.target.value)} 
                    error={error(email)}
                    helperText={errorText(email)}
                    placeholder={props.protest.email}
                />
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => setOpenEditDialog(false)}> Cancel </Button>
                <Button disabled={anyError} color="primary" onClick={handleEdit}> Save </Button>
            </DialogActions>
        </Dialog>
    </>;
}

export default function ProtestPage() {
    const [protests, setProtests] = React.useState<Protest[]>([]);

    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [time, setTime] = React.useState("");
    const [email, setEmail] = React.useState("");

    const [openAddDialog, setOpenAddDialog] = React.useState(false);

    useEffect(() => void (async () => {
        let response = await axios.get('/api/v1/protests/self');
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

    const handleEdit = async (protest: EditProtest) => {
        let response = await axios.put('/api/v1/protests/' + protest.id, {
            protestName: protest.name,
            protestDescription: protest.description,
            protestAddress: protest.location,
            protestDate: protest.time,
            email: protest.email
        });
        let data = response.data;
        let oldProtestIndex = protests.findIndex(item => item.id === protest.id);
        let oldProtest = protests[oldProtestIndex];
        let newData: Protest = Object.assign({}, oldProtest, {
            name: data.protestName,
            description: data.protestDescription,
            location: data.protestAddress,
            time: data.protestDate,
            email: data.email
        });
        let newProtests = protests.slice();
        newProtests[oldProtestIndex] = newData;
        setProtests(newProtests);
    };

    const handleAdd = async (name: string, description: string, location: string, time: string, email: string) => {
        let response = await axios.post('/api/v1/protests/protest', { protestDate: time, protestName: name, email: email, protestAddress: location, protestDescription: description });
        let data = response.data;
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

    const handleDelete = async (protestId: string) => {
        let response = await axios.delete('/api/v1/protests/' + protestId);
        setProtests(protests.filter(item => item.id !== protestId));
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
                    <ProtestCard 
                        key={protest.id} 
                        protest={protest}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
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