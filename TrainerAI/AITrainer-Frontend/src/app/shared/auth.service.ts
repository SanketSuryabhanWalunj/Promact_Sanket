import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: any = '';
  decodedToken: any = '';

  constructor(
    private router: Router
  ) { }

  isLoggedIn() {
    this.token = null;
    this.token = localStorage.getItem("accessToken");
    if (this.token) {
      return true;
    }
    return false;
  }

  userRole() {
    this.token = null;
    this.token = localStorage.getItem("accessToken");
    if (!this.token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    this.decodedToken = jwt_decode(this.token);
    return this.decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  }

  checkRole(role: string) {
    let userRole = this.userRole();
    if(role == userRole) {
      this.decodedToken = null;
      return true;
    }
    return false;
  }

  checkSuperAdminRole(role: string) {
    this.token = null;
    this.token = localStorage.getItem("accessToken");
    if (!this.token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    this.decodedToken = jwt_decode(this.token);
    let userRole = this.decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if(role == userRole) {
      this.decodedToken = null;
      this.token = null;
      return true;
    }
    return false;
  }

}
