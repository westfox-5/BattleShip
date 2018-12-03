import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jwtDecode from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _init = new BehaviorSubject<boolean>(false);
  init = this._init.asObservable();

  constructor( private http: HttpClient ) { }

  setInit(b: boolean) {
    this._init.next(b);
  }


  setOptions(): any {
    const tk = localStorage.getItem('auth_tk');
    if ( !tk || tk.length < 1 ) {
      return throwError({err: {errormessage: 'No token found in local storage'}});
    }

    return {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + tk,
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };
  }

  login(user): Observable<any> {

    const options = {
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa( user.nickname + ':' + user.password),
        'cache-control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
      })
    };

    return this.http.get( environment.server_url + '/auth',  options ).pipe(
      tap( (data) => {
        localStorage.setItem('auth_tk', data.token );
      }));
  }

  register( user ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.post( environment.server_url + '/auth', user, options );
  }

  renew(): Observable<any> {
    return this.http.get( environment.server_url + '/auth/renew', this.setOptions()).pipe(
      tap( (data) => {
        localStorage.setItem('auth_tk', data.token);
      })
    );
  }

  deleteUser(userID: string, reason: string): Observable<any> {
    return this.http.post( environment.server_url + '/admin/' + userID, {reason: reason }, this.setOptions());
  }

  evolveUser(userID: string): Observable<any> {
    return this.http.put( environment.server_url + '/admin/' + userID, { }, this.setOptions());
  }

  getAllUsers(): Observable<any> {
    return this.http.get( environment.server_url + '/admin/users' , this.setOptions());
  }

  getStatus(userID: string): Observable<any> {
    return this.http.get( environment.server_url + '/users/' + userID, this.setOptions());
  }

  scoreboard(idx: number): Observable<any> {
    return this.http.get( environment.server_url + '/users/scoreboard?order=' + idx, this.setOptions());
  }

  getMyInfo(): Observable<any> {
    return this.http.get( environment.server_url + '/users/profile?limit=1000', this.setOptions());
  }

  logout() {
    localStorage.clear();
  }

  getToken() {
    const tk = localStorage.getItem('auth_tk');
    return tk ? jwtDecode(tk) : null;
  }

  getCryptedToken() {
    const tk = localStorage.getItem('auth_tk');
    return tk ? tk : null;
  }

  isAdmin() {
    return this.getToken() ? this.getToken().admin : '';
  }
  getNickname() {
    return this.getToken() ? this.getToken().nickname : '';
  }
  getId() {
    return this.getToken() ? this.getToken().id : '';
  }
}
