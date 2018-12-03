import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UserService } from '@serv/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit, OnDestroy {

  subscribers: Subscription[] = [];

  model = { nickname: '', password: '', cpassword: '' };

  constructor(
    private _auth: UserService,
    private toastr: ToastrManager) { }

  ngOnInit() {

  }

  onRegister(f: FormGroup) {


  const user = {
    nickname: this.model.nickname.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/\s*$/, ''),
    password: this.model.password
  };

  this.subscribers.push(this._auth.register(user).subscribe(
    res => {
        this.toastr.successToastr('Effettua il login', 'Registrazione avvenuta!');
          // resetta la form
        for (const key in f.controls) {
          if (f.controls.hasOwnProperty(key)) {
            const element = f.controls[key];
            element.setValue('');
            element.setErrors(null);
          }
        }
      },
    err => {
      // mostra messaggio d'errore
      this.toastr.errorToastr(err.error.message || err.err.errormessage, 'Errore registrazione!');
      for (const key in f.controls) {
        if (f.controls.hasOwnProperty(key)) {
          const element = f.controls[key];
          element.setValue('');
          element.setErrors(null);
        }
      }
    }));
  }

  ngOnDestroy() {
    this.subscribers.forEach(e => e.unsubscribe());
  }
}
