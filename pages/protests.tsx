import React, { useEffect } from 'react';
import AppMenu from '../components/AppMenu';
import {Grid, Menu, MenuItem, TextField, Button, IconButton, Fab} from '@material-ui/core';
import {Card, CardHeader, CardContent, CardActions, Collapse} from '@material-ui/core';
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';
import {MoreVert, ExpandMore, Add} from '@material-ui/icons';
import styles from './lots.module.scss';
import axios from 'axios';

interface Protest {
    protestId: string;
    protestDate: string;
    protestName: string;
    email: string;
    protestAddress: string;
    protestDescription: string;
    
    
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
                    title={props.protest.protestName}
                    subheader={props.protest.protestAddress}
                />
                <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                    <MenuItem onClick={handleOpenEdit}> Edit </MenuItem>
                    <MenuItem onClick={handleDelete}> Delete </MenuItem>
                </Menu>
                <CardActions disableSpacing>
                    <Button disabled> {props.protest.protestDate} </Button>
                    <IconButton className={styles.expand} onClick={() => setExpanded(!expanded)}>
                        <ExpandMore />
                    </IconButton>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        {props.protest.protestDescription}
                    </CardContent>
                </Collapse>
            </Card>
        </Grid>
    );
}

export default function ProtestPage() {
    const [protests, setProtests] = React.useState<Protest[]>([]);
    const [protestName, setProtestName] = React.useState('');
    const [protestDescription, setprotestDescription] = React.useState('');
    const [protestAddress, setprotestAddress] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [protestDate, setprotestDate] = React.useState('');
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [protestCards, setProtestCards] = React.useState<JSX.Element[]>([]);

    useEffect(() => void (async () => {
        let response = await axios.get('/api/v1/protests/all');
        console.log('initial fetch', response.data.protests);
        let elems = response.data.protests.map((protest: any) => ({
            protestId: protest.protestid,
            protestDate: protest.protestdate,
            protestName: protest.protestname,
            email: protest.email,
            protestAddress: protest.protestaddress,
            protestDescription: protest.protestdescription
        }));
        console.log(protests.concat(elems));
        setProtests(protests.concat(elems));
        console.log('getting prots', protests);
        setProtestCards(renderProtestCards());
    })(), [openEditDialog]);

    const handleOpenAddDialog = () => {
        setprotestDate("");
        setProtestName("");
        setEmail("");
        setprotestAddress("");
        setprotestDescription("");
        setOpenAddDialog(true);
    };

    const handleOpenEditDialog = (protest: Protest) => {
        setprotestDate(protest.protestDate);
        setProtestName(protest.protestName);
        setEmail(protest.email);
        setprotestAddress(protest.protestAddress);
        setprotestDescription(protest.protestDescription);
        setOpenEditDialog(true);
    };

    const handleEdit = async (protest: Protest) => {
        let response = await axios.put('/api/v1/protests/' + protest.protestId, { protestDate: protestDate,protestName: protestName, email: email, protestAddress: protestAddress, protestDescription: protestDescription });
        let data = response.data;
        let newData = Object.assign({}, protest, {
            protestId: data.protestId,
            protestDate: data.protestDate,
            protestName: data.protestName,
            email: data.email,
            protestAddress: data.protestAddress,
            protestDescription: data.protestDescription
        });
        setProtests([newData, ...protests.filter(item => item !== protest)]);
        setOpenEditDialog(false);
    };

    const handleAdd = async (protestDate: string, protestName: string, email: string, protestAddress: string, protestDescription: string) => {
        let response = await axios.post('/api/v1/protests/protest', { protestDate: protestDate, protestName: protestName, email: email, protestAddress: protestAddress, protestDescription: protestDescription});
        let data = response.data;
        setProtests([...protests, {
            protestId: data.protestId,
            protestDate: data.protestDate,
            protestName: data.protestName,
            email: data.email,
            protestAddress: data.protestAddress,
            protestDescription: data.protestDescription
        }]);
        setOpenAddDialog(false);
    };

    const handleDelete = async (protest: Protest) => {
        let response = await axios.delete('/api/v1/protests/' + protest.protestId);
        setProtests(protests.filter(item => item !== protest));
    };

    const error = (value: string) => {
        return value === "";
    };

    const errorText = (value: string) => {
        return error(value) ? "Empty field!" : "";
    };

    const anyError =  protestDate === "" || protestName === "" || email === "" || protestAddress === "" || protestDescription === "" ;

    const renderProtestCards = () => {
        return protests.map(protest =>
            <React.Fragment>
                <ProtestCard protest={protest}
                    openEdit={() => handleOpenEditDialog(protest)}
                    onEdit={() => handleEdit(protest)}
                    onDelete={() => handleDelete(protest)}
                />
                <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                    <DialogTitle> Edit Protest </DialogTitle>
                    <DialogContent>
                        <DialogContentText> Edit the protest name, description, protestAddress, and protestDate of the protest </DialogContentText>
                        <TextField value={protestName} label="Name" margin="normal" fullWidth 
                            onChange={event => setProtestName(event.target.value)} 
                            error={error(name)}
                            helperText={errorText(protestName)}
                            placeholder={protest.protestName}
                        />
                        <TextField value={protestDate} label="protestDate" margin="normal" fullWidth 
                           onChange={event => setprotestDate(event.target.value)} 
                           error={error(protestDate)}
                           helperText={errorText(protestDate)}
                           placeholder={protest.protestDate}
                       />
                       <TextField value={email} label="email" margin="normal" fullWidth 
                           onChange={event => setEmail(event.target.value)} 
                           error={error(email)}
                           helperText={errorText(email)}
                           placeholder={protest.email}
                       />
                       <TextField value={protestAddress} label="protestAddress" margin="normal" fullWidth 
                           onChange={event => setprotestAddress(event.target.value)} 
                           error={error(protestAddress)}
                           helperText={errorText(protestAddress)}
                           placeholder={protest.protestAddress}
                       />
                        <TextField value={protestDescription} label="Description" margin="normal" fullWidth 
                            onChange={event => setprotestDescription(event.target.value)} 
                            error={error(protestDescription)}
                            helperText={errorText(protestDescription)}
                            placeholder={protest.protestDescription}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => setOpenEditDialog(false)}> Cancel </Button>
                        <Button disabled={anyError} color="primary" onClick={() => handleEdit(protest)}> Save </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>)
    };

    return (
        <React.Fragment>
            <AppMenu page="Protests"/>
            <Grid container direction="column" alignItems="center">
                {protestCards}
            </Grid>
            <Fab className={styles.fab} onClick={handleOpenAddDialog} color="primary">
                <Add />
            </Fab>
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle> New Protest </DialogTitle>
                <DialogContent>
                    <DialogContentText> Create a new protest with a name, description, protestAddress, and protestDate of the protest </DialogContentText>

                    <TextField value={protestDate} label="protestDate" margin="normal" fullWidth 
                        onChange={event => setprotestDate(event.target.value)} 
                        error={error(protestDate)}
                        helperText={errorText(protestDate)}
                    />
                    <TextField value={protestName} label="Name" margin="normal" fullWidth 
                        onChange={event => setProtestName(event.target.value)} 
                        error={error(protestName)}
                        helperText={errorText(protestName)}
                    />
                    <TextField value={email} label="protestEmail" margin="normal" fullWidth 
                        onChange={event => setEmail(event.target.value)} 
                        error={error(email)}
                        helperText={errorText(email)}
                    />
                    <TextField value={protestAddress} label="protestAddress" margin="normal" fullWidth 
                        onChange={event => setprotestAddress(event.target.value)} 
                        error={error(protestAddress)}
                        helperText={errorText(protestAddress)}
                    />
                    <TextField value={protestDescription} label="protestDescription" margin="normal" fullWidth 
                        onChange={event => setprotestDescription(event.target.value)} 
                        error={error(protestDescription)}
                        helperText={errorText(protestDescription)}
                    />
                    
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => setOpenAddDialog(false)}> Cancel </Button>
                    <Button disabled={anyError} color="primary" onClick={() => handleAdd(protestDate, protestName, email, protestAddress, protestDescription)}> Create </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}