import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Grid } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import theme from '../client/theme';
import UserInfo from './UserInfo';
import Link from 'next/link';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const AppMenu: React.FC<{ page: string }> = ({ page }) => {
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setOpen(open);
  };
  const pages = [
    ['login', 'Login'],
    ['register', 'Register'], 
    ['userProfile', 'Profile'], 
    ['searchLots', 'Search Lots'], 
    ['lotProfile', 'Current Lot'],
    ['lots', 'My Lots'], 
    ['protests', 'My Protests']
  ];

  const divider = (divide: boolean) => {
    if (divide) {
      return <Divider />;
    }
    return;
  };

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Grid justify="space-between" container direction="row" alignItems="center">
            <Grid item>
              <IconButton onClick={toggleDrawer(true)} edge="start" color="inherit" style={{ marginRight: theme.spacing(2) }}>
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
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <List style={{width: 300}}>
          {pages.map(text => (
            <React.Fragment>
              <Link href={'/' + text[0]}>
                <ListItem button key={text[1]} onClick={toggleDrawer(false)}>
                  <ListItemText primary={text[1]} />
                </ListItem>
              </Link>
              {divider(text[0] === 'lotProfile')}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </React.Fragment>
  );
};

export default AppMenu;
