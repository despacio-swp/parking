import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Grid } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import theme from '../client/theme';
import UserInfo from './UserInfo';
import Link from 'next/link';

const AppMenu: React.FC<{ page: string }> = ({ page }) => (
  <AppBar position="static">
    <Toolbar>
      <Grid justify="space-between" container direction="row" alignItems="center">
        <Grid item alignItems="center">
          <Link href="/" passHref>
            <IconButton edge="start" color="inherit" style={{ marginRight: theme.spacing(2) }}>
              <Menu />
            </IconButton>
          </Link>
          <Typography variant="h6" display="inline" style={{ verticalAlign: 'middle' }}>
            {page}
          </Typography>
        </Grid>
        <Grid item>
          <UserInfo />
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
);

export default AppMenu;
