import { Component, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UserService } from '@serv/user.service';
import { GameService } from '@serv/game.service';
import { SocketService } from '@serv/socket.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit, OnDestroy {
  rooms = [];

  roomsToShow = [];

  currentPage;
  lastpg;

  itemsPerPage = 10;

  subscribers: Subscription[] = [];

  constructor(private _ss: SocketService,
    private _us: UserService,
    private _gs: GameService,
    private _router: Router,
    private toastr: ToastrManager) { }

  ngOnInit(): void {

    this.subscribers.push(this._us.init.subscribe(
      i => { if (i) { this.init(); } }
    ));

  }

  init() {
    if ( this._us.getToken() ) {
      // appena entro nella homepage, scarico tutte le partite
      // poi faccio la paginazione
      this.subscribers.push(this._gs.getHostedMatches()
      .subscribe(
        (data) => {
          // setta l'array ricevuto
          this.rooms = data.rooms;

          this.currentPage = 0;
          this.pagination(0);

        }, (err) => {
          // se il token è scaduto, reindirizza alla pagina di login
           this.toastr.errorToastr(err.error.message, 'Errore');
        }));

      // ad ogni update del socket, aggiorna l'array
      // può essere una rimozione di una stanza o
      // l'aggiunta di una nuova
      this.subscribers.push(this._ss.onRoomsUpdate()
      .subscribe((obj) => {
        // se l'update è per una delete, filtro l'array di rooms per eliminarla
        if (obj.delete) {
          this.rooms = this.rooms.filter( (elem) => elem._id !== obj.room._id );
        } else {
          // altrimenti aggiungi la room
          this.rooms.push(obj.room);
        }

        this.currentPage = 0;
        this.pagination(0);

      }));

      // se sono un host, qui so se qualcuno ha partecipato
      // alla mia partita
      this._ss.onJoinGame()
      .subscribe((obj) => {
          // setta il game e nickname per passarlo al component successivo
          this._gs.setEnemyId(obj.a_id);
          this._gs.setNickname(obj.a_nickname);

          this._router.navigate(['/game']);
      });
    }
  }

  // join ad una partita della lista
  joinMatch(room) {
    this.subscribers.push(this._gs.joinMatch(room._id).pipe(first())
    .subscribe(
      (data: any) => {
        // setta il game e nickname per passarlo al component successivo
        this._gs.setEnemyId(room.host_id);
        this._gs.setNickname(room.nickname);

        this._router.navigate(['/game']);
      },
      err => {
          this.toastr.errorToastr(err.error.message, 'Errore partecipazione stanza');
      }
    ));
  }

  // cambio pagina delle partite
  // val può essere:
  //  -1 : vai alla pagina precedente
  //   1 : vai alla pagina successiva
  //   0 : carica la paginazione e basta
  pagination(val) {
    this.currentPage += val;

    const totalRooms = this.rooms.length - 1;

    this.lastpg = Math.floor( totalRooms / this.itemsPerPage );

    this.roomsToShow = this.rooms.slice( this.currentPage * this.itemsPerPage, (this.currentPage + 1) * this.itemsPerPage);
  }


  ngOnDestroy(): void {
    this.subscribers.forEach(e => e.unsubscribe());
  }
}
