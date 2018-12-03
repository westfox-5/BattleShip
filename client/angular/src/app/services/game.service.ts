import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '@env/environment';
import { UserService } from '@serv/user.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor( private http: HttpClient, private _us: UserService) {}

  private _id = new BehaviorSubject<string>('');
  enemyID = this._id.asObservable();
  private _nickname = new BehaviorSubject<String>('');
  nickname = this._nickname.asObservable();

  setEnemyId(id: string) {
    this._id.next(id);
  }

  setNickname(n: String) {
    this._nickname.next(n);
  }


  // hosta una nuova partita
  host(): Observable<any> {
    return this.http.post( environment.server_url + '/room', {},  this._us.setOptions());
  }

  // richiede la lista di tutte le stanze
  getHostedMatches(): Observable<any> {
    return this.http.get( environment.server_url + '/room?limit=1000', this._us.setOptions());
  }

  // rimuove la stanza dal database
  // (tramite lo userID presente nel token)
  removeHost(): Observable<any> {
    return this.http.delete( environment.server_url + '/room', this._us.setOptions());
  }

  // partecipazione ad una partita (dalla lista delle stanze)
  joinMatch(gameID) {
    return this.http.post(environment.server_url + '/room/' + gameID, {}, this._us.setOptions());
  }

  // manda lo schema del campo dopo la fase preparatoria
  startMatch(schema) {
    return this.http.post(environment.server_url + '/game/start', schema, this._us.setOptions());
  }

  // manda una richiesta di arresa
  surrend() {
    return this.http.get(environment.server_url + '/game/surrender', this._us.setOptions());
  }

  shoot(row, col) {
    return this.http.post(environment.server_url + '/game/move', {row: row, col: col} , this._us.setOptions());
  }
}
