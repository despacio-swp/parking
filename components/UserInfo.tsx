import React from 'react';
import { observer } from 'mobx-react';
import accountsService from '../client/accountsService';
import { Button } from '@material-ui/core';

function UserInfo() {
  let account = accountsService;
  if (account.loggedIn) {
    return <div>
      {account.firstName} {account.lastName} ({account.email})
      <Button color="inherit" onClick={() => account.logOut()}>Log out</Button>
    </div>;
  } else {
    return <div>Not logged in</div>;
  }
}

export default observer(UserInfo);
