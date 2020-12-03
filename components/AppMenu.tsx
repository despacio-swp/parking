import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Grid, Drawer, List, ListItem, ListItemText } from '@material-ui/core';
import Menu from '@material-ui/icons/Menu';
import theme from '../client/theme';
import UserInfo from './UserInfo';
import Link from 'next/link';

const AppMenu: React.FC<{ page: string }> = ({ page }) => {
  let [menuOpen, setMenuOpen] = useState(false);

  return <>
    <AppBar position="static">
      <Toolbar>
        <Grid justify="space-between" container direction="row" alignItems="center">
          <Grid item>
            <IconButton edge="start" color="inherit" onClick={() => setMenuOpen(true)}
              style={{ marginRight: theme.spacing(2) }}
            >
              <Menu />
            </IconButton>
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
    <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
      <List>
        <Link href="/">
          <ListItem button>
            <ListItemText primary="Index" />
          </ListItem>
        </Link>
        <Link href="/login">
          <ListItem button>
            <ListItemText primary="Login" />
          </ListItem>
        </Link>
      </List>
    </Drawer>
  </>;
};

export default AppMenu;
