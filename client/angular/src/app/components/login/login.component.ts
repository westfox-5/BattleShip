import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '@serv/socket.service';
import { UserService } from '@serv/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private _ss: SocketService, private _us: UserService, private _rt: Router) { }

  ngOnInit() {
    this._ss.disconnect();

    if (this._us.getToken()) {
      this._rt.navigateByUrl('/home');
      return;
    }

  }

}
