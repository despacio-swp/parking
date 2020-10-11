import React from 'react';
import Head from 'next/head';
import Button from '@material-ui/core/Button';
import AppMenu from '../components/AppMenu';
import { Box, TextField, Typography } from '@material-ui/core';
import styles from './login.module.scss';

// testing css modules, delete when done
export default function Login() {
  return <React.Fragment>
    <Head>
      <title>example test</title>
    </Head>
    <AppMenu page="Login" />
    <Box className={styles.centeredBox} mt="50px" padding={3}>
      <Typography variant="h5" align="center">Login</Typography>
      <TextField id="standard-basic" label="Email" />
      <TextField id="standard-basic" label="Password" />
      <Box display="flex" flexDirection="row" justifyContent="space-between" mt="20px">
        <Button color="primary">
          Register
        </Button>
        <Button variant="contained" color="primary">
          Login
        </Button>
      </Box>
    </Box>
  </React.Fragment>;
}
