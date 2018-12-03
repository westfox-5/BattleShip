import { Component, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UserService } from '@serv/user.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit, OnDestroy {
  model: any = {};
  title = 'BattleShip';

  subscribers: Subscription[] = [];

  constructor(
    private _userService: UserService,
    private _router: Router,
    private toastr: ToastrManager) {}

  ngOnInit() {
  }

  onLogin(f) {

    const user = {
      nickname: this.model.nickname.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/\s*$/, ''),
      password: this.model.password
    };

    this.subscribers.push(this._userService.login(user)
    .pipe(first())
    .subscribe(
      data => {
        this._router.navigateByUrl('home');
        this.toastr.successToastr('Login avvenuto!');
      },
      err => {
        // resetta la form dopo eventuali errori
        for (const key in f.controls) {
          if (f.controls.hasOwnProperty(key)) {
            const element = f.controls[key];
            element.setValue('');
            element.setErrors(null);
          }
        }
        // mostra messaggio d'errore
        if (err.error.text) {
          this.toastr.errorToastr('Motivo: ' + err.error.text, 'Utente eliminato');
        } else {
          this.toastr.errorToastr(err.error.message, 'Errore login');
        }
      }));
   }


   ngOnDestroy() {
     this.subscribers.forEach(e => e.unsubscribe() );
   }
}
