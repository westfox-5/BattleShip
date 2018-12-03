import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ChatService } from '@serv/chat.service';
import { UserService } from '@serv/user.service';
import { SocketService } from '@serv/socket.service';
import { Subscription } from 'rxjs';
import { GameService } from '@serv/game.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  list: Boolean;
  game: Boolean = this._router.url.includes('game');

  contacts = [];
  saved = [];

  chat: {
    id, nickname, messages
  };

  userInfo: {
    id, nickname, win, lose, isOnline, isInRoom, idRoom, isInGame;
  };

  subscribers: Subscription[] = [];

  constructor(
    private _us: UserService,
    private _ss: SocketService,
    private _cs: ChatService,
    private _toastr: ToastrManager,
    private _gs: GameService,
    private _router: Router) {
      this.chat = {id: null, nickname: null, messages: []};
      this.userInfo = {
        id: null, nickname: null, win: null, lose: null, isOnline: null, isInRoom: null, idRoom: null, isInGame: null
      };
    }

  ngOnInit() {
    this.subscribers.push(this._us.init.subscribe(
      i => { if (i) { this.init(); } }
    ));

  }

  init() {

    if ( !this._us.getToken() ) {
      this._router.navigateByUrl('login');
      return;
    }
    if (this.game) {
      this.subscribers.push(this._gs.enemyID.subscribe(_id => {
        this.subscribers.push(this._gs.nickname.subscribe(_n => {
          this.loadChat({id: _id, nickname: _n});
        }));
      }));


    } else {

      this.list = true;

      this.subscribers.push(this._cs.getUsers().subscribe(
        (data) => {
          this.contacts = data.list;

          this.saved = this.contacts;
          this.sortContacts();
        }
      ));

      this.subscribers.push(this._ss.onStatusChange()
      .subscribe(
        data => {
          let trovato = false;

          this.contacts.forEach(c => {
            if (c.id === data.user.userId) {
              c.isOnline = data.isOnline;
              trovato = true;
            }
          });

          if ( !trovato && data.user.userId !== this._us.getId() ) {
            if (data.user.userId !== null) {
              this.contacts.push( {
                nickname: data.user.nickname,
                id: data.user.userId,
                timestamp: -1,
                isOnline: data.isOnline
              });
            }
          }

          this.sortContacts();
        }
      ));
    }


    // socket sempre attivo per la ricezione dei messaggi
    this.subscribers.push(this._ss.onNewMessage()
    .subscribe(
      (data: any) => {
        if (data.from === this.chat.id) {
          this.chat.messages.push(data);
        }

        if (!this.game && (this.list || (this.chat.id !== data.from && data.from !== this._us.getId())) ) {
          let text: string = data.text;
          text = text.length < 20 ? text : text.slice(0, 20).concat(' . . .');
          this._toastr.infoToastr(text, 'Messaggio da ' + data.from_name);
        }
      }
    ));


  }

  loadChat(user) {
    this.list = false;

    this.chat.messages = [];
    this.chat.id = user.id;
    this.chat.nickname = user.nickname;


    this.subscribers.push(this._cs.getChatFrom(user.id).subscribe(
      (data) => {
        this.chat.messages = data.list;
      }
    ));

  }

  send(text) {
    if (text === '') { return; }

    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    this.subscribers.push(this._cs.send(text, this.chat.id).subscribe(
      (data) => {},
      err => { this._toastr.errorToastr(err.error.message, 'Errore invio'); }
    ));
  }

  goBack() {
    this.list = true;
    this.chat = {id: null, nickname: null, messages: []};
  }

  sortContacts() {
    this.contacts.sort((a, b) => {

      // ordinamento: utenti online e offline
      // se entrambi online o offline allora ordina secondo timestamp più recente
      return (a.isOnline && !b.isOnline) ? -1 :
          (!a.isOnline && b.isOnline) ? 1 :
          (b.timestamp === -1) ? -1 :
          (a.timestamp === -1) ? 1 :
          (a.timestamp < b.timestamp) ? 1 :
          (a.timestamp > b.timestamp) ? -1 : 0;

    });
  }

  search(nickname: string) {
    nickname = nickname.toLowerCase();
    this.contacts = this.saved;
    this.contacts = this.contacts.filter( c => (c.nickname.toLowerCase().search(nickname) !== -1));
  }

  info( user ) {
    this.subscribers.push(this._us.getStatus(user.id).subscribe(
      (data) => {
        this.userInfo = data.info;
        document.getElementById('openInfoModal').click();
      }
    ));
  }

  updateScroll() {
    const element = document.getElementById('chat_list');
    element.scrollTo(0, element.scrollHeight);
  }

  ngOnDestroy(): void {
    this.subscribers.forEach(e => e.unsubscribe());
  }
}
