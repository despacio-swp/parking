import React, { useState } from 'react';
import Head from 'next/head';
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
  let [loginError, setLoginError] = useState<string | null>(null);
  let [loginSuccess, setLoginSuccess] = useState(false);
  let router = useRouter();

  async function doLogin() {
    let result = await accountsService.doLogin(email, password);
    if (result.status === 'error') setLoginError(result.description);
    else {
      setLoginError(null);
      setLoginSuccess(true);
      setTimeout(() => router.push('/'), 1000);
    }
  }

  return <React.Fragment>
    <Head>
      <title>login page</title>
    </Head>
    <AppMenu page="Login" />
    <Paper className={styles.loginBox} elevation={3}>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Typography variant="h5" align="center">Login</Typography>
        </Grid>
        <Grid item>
          <TextField id="standard-basic" label="Email" fullWidth={true} value={email} onChange={ev => setEmail(ev.target.value)} />
        </Grid>
        <Grid item>
          <TextField id="standard-basic" label="Password" fullWidth={true} value={password} onChange={ev => setPassword(ev.target.value)} />
        </Grid>
        <Grid item container justify="space-between">
          <Grid item>
            <Link href="/register" passHref>
              <Button color="primary">
                Register
              </Button>
            </Link>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={doLogin}>
              Login
            </Button>
          </Grid>
        </Grid>
        {
          loginError
            ? <Grid item>
              <span style={{ color: 'red' }}><b>Login failed:</b> {loginError}</span>
            </Grid>
            : null
        }
        {
          loginSuccess && <span style={{ color: 'green' }}><b>Login success</b></span>
        }
      </Grid>
    </Paper>
  </React.Fragment>;
}
