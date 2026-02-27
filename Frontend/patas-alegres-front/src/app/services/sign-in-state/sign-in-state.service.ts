import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignInStateService {

  private accountData: any;
  private shelterData: any;

  setAccount(data: any) {
    this.accountData = data;
  }

  getAccount() {
    return this.accountData;
  }

  setShelter(data: any) {
    this.shelterData = data;
  }

  getShelter() {
    return this.shelterData;
  }

  clear() {
    this.accountData = null;
    this.shelterData = null;
  }
}