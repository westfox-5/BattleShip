import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UserService } from '@serv/user.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient, private _us: UserService) { }

  getUsers(): Observable<any> {
    return this.http.get( environment.server_url + '/message?limit=1000', this._us.setOptions());
  }

  getChatFrom(userID: string): Observable<any> {
    return this.http.get( environment.server_url + '/message/' + userID, this._us.setOptions());
  }

  send(msg, toID): Observable<any> {
    return this.http.post( environment.server_url + '/message/' + toID, {text: msg} , this._us.setOptions());
  }
}
