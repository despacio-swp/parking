import React, { FormEvent, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { useRouter } from 'next/router';
import Button from '@material-ui/core/Button';
import AppMenu from '../components/AppMenu';
import { Paper, TextField, Typography, Grid } from '@material-ui/core';
import styles from './login.module.scss';
import Link from 'next/link';
import accountsService from '../client/accountsService';

export default function Login() {
  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
  let [firstName, setFirstName] = useState('');
  let [lastName, setLastName] = useState('');
  let [requestError, setRequestError] = useState<string | null>(null);
  let [requestSuccess, setRequestSuccess] = useState(false);
  let router = useRouter();

  async function doRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let response;
    try {
      // TODO: move this
      response = await axios.post('/api/v1/accounts/register', {
        email, password, firstName, lastName
      });
    } catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    if (response.data.status !== 'ok') {
      setRequestError(response.data.description);
      return;
    } else {
      setRequestError(null);
    }
    let result = await accountsService.doLogin(email, password);
    if (result.status === 'error') setRequestError(result.description);
    else {
      setRequestError(null);
      setRequestSuccess(true);
      setTimeout(() => router.push('/profiles/self'), 1000);
    }
  }

  return <React.Fragment>
    <Head>
      <title>login page</title>
    </Head>
    <AppMenu page="Register" />
    <Paper className={styles.loginBox} elevation={3}>
      <form onSubmit={doRegister}>
        <Grid container spacing={2} direction="column">
          <Grid item>
            <Typography variant="h5" align="center">Create an account</Typography>
          </Grid>
          <Grid item>
            <TextField label="Email" fullWidth={true} value={email} onChange={ev => setEmail(ev.target.value)} />
          </Grid>
          <Grid item>
            <TextField type="password" label="Password" fullWidth={true} value={password} onChange={ev => setPassword(ev.target.value)} />
          </Grid>
          <Grid item>
            <TextField label="First name" fullWidth={true} value={firstName} onChange={ev => setFirstName(ev.target.value)} />
          </Grid>
          <Grid item>
            <TextField label="Last name" fullWidth={true} value={lastName} onChange={ev => setLastName(ev.target.value)} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" type="submit" style={{ float: 'right' }}>
              Register
            </Button>
          </Grid>
          {
            requestError
              ? <Grid item>
                <span style={{ color: 'red' }}><b>Registration failed:</b> {requestError}</span>
              </Grid>
              : null
          }
          {
            requestSuccess && <span style={{ color: 'green' }}><b>Registration success</b></span>
          }
        </Grid>
      </form>
    </Paper>
  </React.Fragment>;
}
