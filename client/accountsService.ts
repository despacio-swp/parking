import axios from 'axios';
import { makeObservable, observable, computed, action, flow, runInAction } from 'mobx';

// TODO: move this to common
export interface ErrorResponse {
  status: 'error';
  error: string;
  description: string;
}
export type SessionInfoResponse = {
  status: 'ok';
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
} | ErrorResponse;
export type LoginResponse = {
  status: 'ok';
  userId: string;
  expiry: number | null;
  token: string;
  firstName: string;
  lastName: string;
} | ErrorResponse;

export class AccountsService {
  public userId: string | null = null;
  public email: string | null = null;
  public firstName: string | null = null;
  public lastName: string | null = null;
  public ready = false;

  constructor() {
    makeObservable(this, {
      userId: observable,
      email: observable,
      firstName: observable,
      lastName: observable,
      ready: observable,

      loggedIn: computed,
      logOut: action
    });

    this.checkLoginState();
  }

  get loggedIn() {
    return this.userId !== null;
  }

  async checkLoginState() {
    if (typeof window === 'undefined') return;
    let response;
    // FIXME: there is probably a better way to do this
    try {
      response = await axios.get<SessionInfoResponse>('/api/v1/accounts/session');
    } catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    let data = response.data;
    runInAction(() => {
      this.ready = true;
      if (data.status !== 'ok') return;
      this.userId = data.userId;
      this.email = data.email;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
    });
    return data;
  }

  async doLogin(email: string, password: string) {
    let response;
    try {
      response = await axios.post<LoginResponse>('/api/v1/accounts/login', {
        email, password
      });
    } catch (err) {
      if (err.response) response = err.response;
      else throw err;
    }
    let data = response.data;
    runInAction(() => {
      if (data.status !== 'ok') return;
      this.userId = data.userId;
      this.email = email;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
    });
    return data;
  }

  logOut() {
    this.userId = null;
    this.email = null;
    this.firstName = null;
    this.lastName = null;

    // result not needed
    axios.post('/api/v1/accounts/logout');
  }
}

const accountsService = new AccountsService();
export default accountsService;
