import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { environment } from '@env/environment';

// Classe per la gestione della comunicazione tramite socket.

@Injectable({
  providedIn: 'root'
})
export class SocketService {
    private socket;

    connected = false;

    public initSocket(tk) {
        this.socket = io(environment.ws_url);
        this.connected = true;
        this.socket.emit('auth', tk );
    }

    public disconnect() {
        if (this.connected) {
            this.socket.disconnect();

            this.connected = false;
        }
    }

    // metodo per gli eventi riguardanti
    // l'aggiunta o la rimozione di una stanza
    public onRoomsUpdate() {
        return new Observable<any>(observer => {
            this.socket.on('room', (room) => observer.next({room: room, delete: false}));
            this.socket.on('delete-room', (room) => observer.next({room: room, delete: true}));
        });
    }

    // medoto per gli eventi riguardanti l'inizio di una partita
    // ( quando sono l'host ricevo tramite socket questa informazione )
    public onJoinGame() {
        return new Observable<any>(observer => {
            this.socket.on('start-game', (player) => observer.next(player));
        });
    }

    public onWaiting() {
        return new Observable<any>(observer => {
            this.socket.on('game', (player) => observer.next(player));
        });
    }

    public onMove() {
        return new Observable<any>(observer => {
            this.socket.on('game-move', (obj) => observer.next(obj));
        });
    }

    public onSurrend() {
        return new Observable<any>( observer => {
            this.socket.on('surrend', () => observer.next());
        });
    }

    public onNewMessage() {
        return new Observable<any>( observer => {
            this.socket.on('message', (data) => observer.next(data));
        });
    }

    public onStatusChange() {
        return new Observable<any>(observer => {
            this.socket.on('user-online', (data) => observer.next({isOnline: true, user: data}));
            this.socket.on('user-offline', (data) => observer.next({isOnline: false, user: data}));
        });
    }
}
