import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Grid } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import theme from '../client/theme';
import UserInfo from './UserInfo';
import Link from 'next/link';
import Drawer from '@material-ui/core/Drawer';
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
          {['login', 'searchLots', 'lotProfile', 'register', 'userProfile', 'lots', 'protests'].map((text, index) => (
            <Link href={'/' + text}>
              <ListItem button key={text} onClick={toggleDrawer(false)}>
                <ListItemText primary={text} />
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
    </React.Fragment>
  );
};

export default AppMenu;
