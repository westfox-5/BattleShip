import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UserService } from '@serv/user.service';
import { SocketService } from '@serv/socket.service';
import { GameService } from '@serv/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {


  nickname: String;
  isAdmin: Boolean;
  hosting: Boolean;

  subscribers: Subscription[] = [];

  constructor(
    private _us: UserService,
    private _router: Router,
    private _gs: GameService,
    private _ss: SocketService,
    private toastr: ToastrManager) {
  }

  ngOnInit() {
    this._ss.disconnect();
    this._us.setInit(false);


    if ( !this._us.getToken() ) {
      this._router.navigateByUrl('login');
      return;
    }

    this.subscribers.push(this._us.renew().pipe(first()).subscribe(
      data => {
        this._ss.initSocket(this._us.getCryptedToken());
        this.hosting = false;
        this.nickname = this._us.getNickname();
        this.isAdmin = this._us.isAdmin();


        this._us.setInit(true);
      },
      err => {
        if (err.error.message === 'jwt expired') {
          this.toastr.warningToastr('Effettua il login', 'Sessione scaduta!');
          this.logout();
        } else {
          this.logout();
        }
      }
    ));

    }

  // click su CREA PARTITA
  createMatch() {
    // POST /game
    this.subscribers.push(this._gs.host().pipe(first())
    .subscribe(
      data => {
        // grafica in attesa
        this.hosting = true;
      },
      err => {
        if (err.error.message === 'jwt expired') {
          this.toastr.warningToastr('Effettua il login', 'Sessione scaduta!');
          this.logout();
        } else {
          this.toastr.errorToastr(err.error.message, 'Errore');
        }
      }));
  }

  // click su ANNULLA
  removeMatch(showError: boolean) {
    // rimuovi la room
    this.subscribers.push(this._gs.removeHost().pipe(first())
    .subscribe(
      data => {
        // grafica non più in attesa
        this.hosting = false;
      },
      err => {
        if (showError) {
          this.toastr.errorToastr(err.error.message, 'Errore rimozione');
        }
        this.hosting = false;
      }));
  }

  logout() {
    this._us.logout();
    this._router.navigateByUrl('login');
    return;
  }

  ngOnDestroy(): void {
    this.subscribers.forEach(e => e.unsubscribe());
  }
}
