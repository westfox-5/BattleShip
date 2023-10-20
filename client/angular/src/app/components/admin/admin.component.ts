import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { UserService } from "@serv/user.service";
import { SocketService } from "@serv/socket.service";
import { Observable, Subscription } from "rxjs";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit, OnDestroy {
  nickname: string;
  isAdmin: Boolean;
  users: any;
  usersToShow: any;
  loaded = false;

  currentPage;
  lastpg;

  itemsPerPage = 10;

  userToRemove: any;
  userToEvolve: any;

  subscribers: Subscription[] = [];

  constructor(
    private _us: UserService,
    private _rt: Router,
    private toastr: ToastrService,
    private _ss: SocketService
  ) {}

  ngOnInit() {
    this._ss.disconnect();

    if (!this._us.getToken()) {
      this._rt.navigateByUrl("/login");
      return;
    }

    this.nickname = this._us.getNickname();
    this.isAdmin = this._us.isAdmin();
    this.users = [];
    this.usersToShow = [];
    this.userToRemove = {};
    this.userToEvolve = {};

    if (!this._us.isAdmin()) {
      this._rt.navigateByUrl("/home");
      return;
    }

    this._ss.initSocket(this._us.getCryptedToken());
    this.loadUser();
  }

  loadUser() {
    this.subscribers.push(
      this._us.getAllUsers().subscribe(
        (data) => {
          this.users = data.list;
          this.currentPage = 0;
          this.pagination(0);
          this.loaded = true;
        },
        (err) => {
          this.toastr.error(err.error.message, "Errore richiesta");
        }
      )
    );
  }

  // cambio pagina delle partite
  // val può essere:
  //  -1 : vai alla pagina precedente
  //   1 : vai alla pagina successiva
  //   0 : carica la paginazione e basta
  pagination(val) {
    this.currentPage += val;

    const totalUsers = this.users.length - 1;

    this.lastpg = Math.floor(totalUsers / this.itemsPerPage);

    this.usersToShow = this.users.slice(
      this.currentPage * this.itemsPerPage,
      (this.currentPage + 1) * this.itemsPerPage
    );
  }

  openDeleteModal(user) {
    this.userToRemove = user;
    document.getElementById("openDeleteModal").click();
  }

  openAdminModal(user) {
    this.userToEvolve = user;
    document.getElementById("openAdminModal").click();
  }

  evolveInAdmin() {
    this.subscribers.push(
      this._us.evolveUser(this.userToEvolve.id).subscribe(
        (data) => {
          this.toastr.info("È un amministratore.", this.userToEvolve.nickname);
          this.loadUser();
        },
        (err) => {
          this.toastr.error(err.error.message, "Errore.");
        }
      )
    );
  }

  deleteUser(reason: string) {
    reason.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

    this.subscribers.push(
      this._us.deleteUser(this.userToRemove.id, reason).subscribe(
        (data) => {
          this.toastr.info("È stato eliminato.", this.userToRemove.nickname);
          this.loadUser();
        },
        (err) => {
          this.toastr.error(err.error.message, "Errore.");
        }
      )
    );
  }

  logout() {
    this._us.logout();
  }

  ngOnDestroy(): void {
    this.subscribers.forEach((e) => e.unsubscribe());
  }
}
