import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  ToastrManager
} from 'ng6-toastr-notifications';
import {
  UserService
} from '@serv/user.service';
import {
  SocketService
} from '@serv/socket.service';
import {
  Chart
} from 'chart.js';
import {
  Subscription
} from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  nickname: string;
  isAdmin: Boolean;

  subscribers: Subscription[] = [];

  info: {
    win: Number;
    lose: Number;
    games: {
      win: Boolean;
      avv_id: String,
      avv_name: String,
      timestamp: String
    }[];
  };
  games: {
    win: Boolean;
    avv_id: String,
    avv_name: String,
    timestamp: String
  }[];

  constructor(private _us: UserService,
    private toastr: ToastrManager,
    private _ss: SocketService,
    private _rt: Router) {}

  ngOnInit() {

    this._ss.disconnect();

    this.nickname = this._us.getNickname();
    this.isAdmin = this._us.isAdmin();
    this._ss.initSocket(this._us.getCryptedToken());

    this.info = {win: 0, lose: 0, games: []};

    this.loadStats();
  }

  loadStats() {
    this.subscribers.push(this._us.getMyInfo().subscribe(
      (data) => {
        this.info = data.info;
        this.games = this.info.games.slice().reverse();
        this.loadChart();
      },
      (err) => {
        this.toastr.errorToastr(err.error.message);
      }
    ));
  }

  loadChart() {

    const arr: {
      data: string,
      vinte: number,
      perse: number
    } [] = [];

    for (let i = 0; i < this.info.games.length; ++i) {
      const object = {
        data: this.info.games[i].timestamp.slice(8, 10) + '/' +
          this.info.games[i].timestamp.slice(5, 7) + '/' +
          this.info.games[i].timestamp.slice(0, 4),
        vinte: this.info.games[i].win ? 1 : 0,
        perse: !this.info.games[i].win ? 1 : 0
      };

      let trovato = false;

      for (let j = 0; j < arr.length; j++) {
        if (arr[j].data === object.data) {
          arr[j].vinte += object.vinte;
          arr[j].perse += object.perse;
          trovato = true;
        }
      }

      if (!trovato) {
        arr.push(object);
      }
    }


    const chart = new Chart('chart', {
      type: 'line',
      data: {
        labels: arr.map(c => c.data),

        datasets: [{
          label: 'Vinte',
          data: arr.map(c => c.vinte),
          lineTension: 0,
          borderColor: 'green',
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
          borderWidth: 1
        }, {
          label: 'Perse',
          data: arr.map(c => c.perse),
          lineTension: 0,
          borderColor: 'red',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontColor: 'white',
            fontSize: 15
          }
        },
        scales: {
          yAxes: [{
            gridLines: {
              display: true,
              zeroLineColor: 'rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.2)'
            },
            ticks: {
              fontColor: 'white',
              beginAtZero: true,
              callback: function (value, index, values) {
                if (Math.floor(value) === value) {
                  return value;
                }
              }
            }
          }],
          xAxes: [{
            gridLines: {
              display: true,
              zeroLineColor: 'rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.2)'
            },
            ticks: {
              fontColor: 'white',
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  logout() {
    this._us.logout();
    this._rt.navigateByUrl('/login');
  }

  ngOnDestroy() {
    this.subscribers.forEach(e => e.unsubscribe());
  }
}
