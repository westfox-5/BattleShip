import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  UserService
} from '@serv/user.service';
import {
  Subscription
} from 'rxjs';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit, OnDestroy {

  index: number;

  subscribers: Subscription[] = [];

  scoreboards: [{
      nickname: string,
      win: number,
      lose: number,
      id: string
    } [],
    {
      nickname: string,
      win: number,
      lose: number,
      id: string
    } [],
    {
      nickname: string,
      win: number,
      lose: number,
      id: string
    } []
  ];

  constructor(private _us: UserService) {
    this.index = 0;
  }

  ngOnInit() {
    this.scoreboards = [
      [],
      [],
      []
    ];

    if (this._us.getToken()) {
      this.setScoreboard();
    }

  }

  change(idx) {
    this.index = idx;
    this.setScoreboard();
  }

  setScoreboard() {
    this.subscribers.push(this._us.scoreboard(this.index)
      .subscribe(
        (data) => {
          this.scoreboards[this.index] = data.list;
        }
      ));
  }


  ngOnDestroy() {
    this.subscribers.forEach(e => e.unsubscribe());
  }

}
