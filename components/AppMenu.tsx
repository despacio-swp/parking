import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import theme from '../client/theme';

const AppMenu: React.FC<{ page: string }> = ({ page }) => (
  <AppBar position="static">
    <Toolbar>
      <IconButton edge="start" color="inherit" style={{ marginRight: theme.spacing(2) }}>
        <Menu />
      </IconButton>
      <Typography variant="h6">
        {page}
      </Typography>
    </Toolbar>
  </AppBar>
);

export default AppMenu;
