import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { UserService } from "@serv/user.service";
import { SocketService } from "@serv/socket.service";
import { GameService } from "@serv/game.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit, OnDestroy {
  game: any;
  nickname: String;

  // tutte le navi a disposizione per il gioco
  boats;
  daAffondare;

  // nave selezionata per la rimozione
  boatRemove;

  // navi che possono essere inserite orizzontalmente
  // o verticalmente nella cella cliccata
  prepBoatsO = [];
  prepBoatsV = [];

  // booleano per sapere se sono ancora in fase di preparazione
  preparazione = true;
  arreso = false;
  attesa = true;

  // matrici dei campi di gioco
  public myBoard;
  public enemyBoard;

  turno: boolean;
  subscribers: Subscription[] = [];

  constructor(
    private _gs: GameService,
    private toastr: ToastrService,
    private _us: UserService,
    private _ss: SocketService,
    private router: Router
  ) {
    this.boats = this.initBoatArray();
    this.myBoard = this.initBoard();
    this.enemyBoard = this.initBoard();
  }

  ngOnInit() {
    if (!this._us.getToken()) {
      this.router.navigateByUrl("/home");
      return;
    }

    this.subscribers.push(
      this._us.getStatus(this._us.getId()).subscribe((data) => {
        if (!data.info.isInGame) {
          this.router.navigateByUrl("/home");
          return;
        } else {
          this.init();
        }
      })
    );
  }

  init() {
    // ricevi l'informazione dal gameList Component sul game e nickname
    this.subscribers.push(
      this._gs.nickname.subscribe((n) => (this.nickname = n))
    );

    // ricevi eventi dell'arresa dell'altro giocatore
    this.subscribers.push(
      this._ss.onSurrend().subscribe(() => {
        this.arreso = true;
        if (this.preparazione) {
          document.getElementById("openArresoModal").click();
        } else {
          document.getElementById("openArresoModalGame").click();
        }
      })
    );

    // l'altro giocatore è pronto
    this.subscribers.push(
      this._ss.onWaiting().subscribe(() => {
        this.attesa = false;
      })
    );

    // arriva mossa avversaria
    this.subscribers.push(
      this._ss.onMove().subscribe((data) => {
        this.turno = !this.turno;
        const r = data.coordX;
        const c = data.coordY;

        this.myBoard[r][c].colpita = true;
        if (data.affondata) {
          // la lunghezza è un valore univoco delle navi
          // senza riceve nulla dal server posso sapere quale nave ho
          // affondato contando quante celle affondo
          this.affondaBarca(r, c, this.myBoard);
        }

        if (data.vinto) {
          this.win(false);
        }
      })
    );
  }

  backHome() {
    this.router.navigateByUrl("/");
  }

  // crea una matrice 10x10 di solo 'mare' e la ritorna
  initBoard() {
    const board = [];
    for (let i = 0; i < 10; i++) {
      board[i] = [];
      for (let j = 0; j < 10; j++) {
        board[i][j] = {
          valid: 0,
          type: "sea",
          boat: null,
          index: null,
          affondata: false,
          colpita: false,
        };
      }
    }
    return board;
  }

  // crea l'array di navi iniziali
  initBoatArray() {
    return [
      {
        name: "Cacciatorpediniere",
        len: 2,
        num: 4,
        src: "assets/boats/Cacciatorpediniere.png",
      },
      {
        name: "Sottomarino",
        len: 3,
        num: 2,
        src: "assets/boats/Sottomarino.png",
      },
      {
        name: "Corazzata",
        len: 4,
        num: 2,
        src: "assets/boats/Corazzata.png",
      },
      {
        name: "Portaerei",
        len: 5,
        num: 1,
        src: "assets/boats/Portaerei.png",
      },
    ];
  }

  // controlla che tutte le barche siano state posizionate
  noBoatsLeft() {
    for (const boat of this.boats) {
      if (boat.num > 0) {
        return false;
      }
    }
    return true;
  }

  // metodo che, una volta cliccata una cella di tipo mare,
  // cerca tutte le navi (tra le disponibili) che possono essere piazzata
  // orizzontalmente o verticalmente a partire da quella cella.
  // Queste saranno poi mostrate nel modal di inserimento
  loadShips(i, j, orientamento) {
    const arr = [];

    // scorri ogni barca
    for (let index = 0; index < this.boats.length; index++) {
      const boat = this.boats[index];
      // check barca disponibilie
      if (boat.num > 0) {
        const lung = boat.len;

        let valid;

        if (orientamento === "orizzontale") {
          // assumo che sia una barca valida
          valid = true;
          // Per ogni cella orizzontale (fino alla lunghezza della barca) controlla che:
          // - non vada fuori dal campo
          // - la cella sia valida e non ci sia una nave già
          for (let col = j; col < j + lung; col++) {
            valid =
              col < 10 &&
              valid &&
              this.myBoard[i][col].valid === 0 &&
              !this.myBoard[i][col].boat;
          }

          // se è valida, aggiungila all'array di ritorno
          if (valid) {
            const tempBoat = {
              len: boat.len,
              num: boat.num,
              orientamento: orientamento,
              name: boat.name,
              boats_idx: index,
              src: boat.src,
            };
            arr.push(tempBoat);
          }
        } else {
          // stessi controlli nel caso dell'orientamento verticale,
          // ma scorrendo le righe

          valid = true;

          for (let row = i; row < i + lung; row++) {
            valid =
              row < 10 &&
              valid &&
              this.myBoard[row][j].valid === 0 &&
              !this.myBoard[row][j].boat;
          }

          if (valid) {
            const tempBoat = {
              len: boat.len,
              num: boat.num,
              orientamento: orientamento,
              name: boat.name,
              boats_idx: index,
              src: boat.src,
            };
            arr.push(tempBoat);
          }
        }
      }
    }

    return arr;
  }

  // metodo che piazza una nave a partire dalla posizione i,j.
  // l'orientamento è una proprietà della nave stessa.
  placeBoat(boat) {
    if (this.noBoatsLeft()) {
      return;
    }

    const titolo = document.getElementById("titolo-insert").innerHTML;

    // prende la i e j dal titolo del modale
    const i = Number(titolo.split(":")[1].split(",")[0].trim());
    const j = Number(titolo.split(":")[1].split(",")[1].split(" ")[0].trim());

    let fineX;
    let fineY;

    // calcola dove finirebbe, tenendo conto dell'orientamento
    if (boat.orientamento === "verticale") {
      fineX = i + boat.len;
      fineY = j + 1;
    } else {
      fineX = i + 1;
      fineY = j + boat.len;
    }

    // setta tutte le celle fino all'ultima (calcolata prima) di tipo nave
    // e rende invalide le adiacenti.
    let index = 0;
    for (let row = i; row < fineX; row++) {
      for (let col = j; col < fineY; col++) {
        this.myBoard[row][col].type = "boat";
        this.myBoard[row][col].boat = boat;
        this.myBoard[row][col].index = index;

        this.adjCells(row, col, false);

        index++;
      }
    }

    // diminuisce il numero disponibile per quella nave
    this.boats[boat.boats_idx].num--;
  }

  // metodo che rimuove sempre la nave 'boatRemove'.
  // questo metodo è chiamato dal modale di remove, quindi
  // sicuramente il campo boatRemove è stato settato dalla
  // funzione 'loadModal'.
  removeBoat() {
    const i = this.boatRemove.i;
    const j = this.boatRemove.j;

    // poichè posso cliccare su una cella che non è l'inizio
    // della nave che voglio rimuovere, devo calcolare dove inizia.
    let initX, initY;

    if (this.boatRemove.orientamento === "verticale") {
      // torna indietro di 'index' posizioni fino a quella iniziale
      initX = i - this.myBoard[i][j].index;
      initY = j;

      // dalle coordinate iniziali scorri per tutta la lunghezza della barca
      // e rendi le celle di tipo 'mare', rendendo valide le adiacenti
      for (let row = initX; row < initX + this.boatRemove.len; row++) {
        for (let col = initY; col < initY + 1; col++) {
          this.myBoard[row][col].type = "sea";
          this.myBoard[row][col].boat = null;

          this.myBoard[row][col].index = null;

          this.adjCells(row, col, true);
        }
      }
    } else {
      // stessi controlli per l'orientamento 'orizzontale'

      initX = i;
      initY = j - this.myBoard[i][j].index;

      for (let row = initX; row < initX + 1; row++) {
        for (let col = initY; col < initY + this.boatRemove.len; col++) {
          this.myBoard[row][col].type = "sea";
          this.myBoard[row][col].boat = null;

          this.myBoard[row][col].index = null;

          this.adjCells(row, col, true);
        }
      }
    }

    // una volta rimossa dal campo quella nave,
    // incrementa il numero a disposizione
    this.boats[this.boatRemove.boats_idx].num++;
  }

  // metodo che rende valide o invalide le cella adiacenti ad una cella i,j
  adjCells(i, j, validare) {
    for (let r = -1; r < 2; r++) {
      for (let c = -1; c < 2; c++) {
        // controllo che sia nel campo!
        if (
          i + r < 10 &&
          j + c < 10 &&
          i + r >= 0 &&
          j + c >= 0 &&
          this.myBoard[i + r][j + c]
        ) {
          if (validare) {
            this.myBoard[i + r][j + c].valid--;
          } else {
            this.myBoard[i + r][j + c].valid++;
          }
        }
      }
    }
  }

  // metodo che viene chiamato quando clicco su una cella.
  // prepara i modali di inserimento e rimozione, settando il titolo
  // ed eventuali parametri necessari alle altre funzioni
  loadModal(i, j, remove) {
    // se clicco su una cella che è una barca, 'remove' sarà true
    if (remove) {
      const boat = this.myBoard[i][j].boat;
      const titolo = document.getElementById("titolo-remove");
      titolo.innerHTML =
        "<b>" + boat.name + "  in posizione: " + i + "," + j + "</b>";

      // prepaaro la barca da rimuovere
      this.boatRemove = {
        i: i,
        j: j,
        orientamento: boat.orientamento,
        len: boat.len,
        boats_idx: boat.boats_idx,
      };
    } else {
      // altrimenti voglio inserire una barca nella cella i,j
      const titolo = document.getElementById("titolo-insert");
      titolo.innerHTML =
        "<b> Posiziona barca con inizio in: " + i + "," + j + " </b>";

      // preparo gli array di barche disponibili orizzontalmente
      // e verticalmente a partire dalla cella i,j
      this.prepBoatsO = this.loadShips(i, j, "orizzontale");
      this.prepBoatsV = this.loadShips(i, j, "verticale");
    }
  }

  // metodo che manda la richiesta al service per l'inizio della partita.
  // non ci sono controlli da fare perchè questo metodo può essere chiamato solo se
  // la funzione noBoatsLeft() ritorna true.
  startMatch() {
    const boatsToSend = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        // lato server si vuole sapere solo le coordinate iniziali di ogni barca posizionata,
        // la sua lunghezza e l'orientamento
        if (
          this.myBoard[i][j].type === "boat" &&
          this.myBoard[i][j].index === 0
        ) {
          const b = {
            row: i,
            col: j,
            length: this.myBoard[i][j].boat.len,
            orientation: this.myBoard[i][j].boat.orientamento,
          };
          boatsToSend.push(b);
        }
      }
    }

    // tramite il GameService manda una richiesta al server con l'array appena creato.
    // altri controlli per la validità del campo saranno svolti dal server.
    this.subscribers.push(
      this._gs.startMatch(boatsToSend).subscribe(
        (data1: any) => {
          this.preparazione = false;

          this.boats = this.initBoatArray();
          this.turno = data1.turn;
          this.daAffondare = 9;
        },
        (err) => {
          this.toastr.error(err.error.message, "Errore!");
        }
      )
    );
  }

  // funzione che manda una richiesta al GameService in segno d'arresa.
  // l'utente perde la partita.
  removeMatch() {
    this.subscribers.push(
      this._gs.surrend().subscribe(
        (data: any) => {
          this.arreso = true;
          this.backHome();
        },
        (err) => {
          this.toastr.error(err.error.message, "Errore!");
        }
      )
    );
  }

  shoot(r, c) {
    // ricevo
    // -err: err.error.message
    // -colpita: 'Nave' | 'Mare'
    // -affondata: boolean
    // -vinto: boolean
    if (!this.turno) {
      return;
    }
    this.turno = !this.turno;

    this.subscribers.push(
      this._gs.shoot(r, c).subscribe(
        (data: any) => {
          this.enemyBoard[r][c].colpita = true;

          if (data.colpita === "Mare") {
            this.enemyBoard[r][c].type = "sea";
          } else if (data.affondata) {
            // la lunghezza è un valore univoco delle navi
            // senza riceve nulla dal server posso sapere quale nave ho
            // affondato contando quante celle affondo
            this.enemyBoard[r][c].type = "boat";

            const len = this.affondaBarca(r, c, this.enemyBoard);

            // cerca la nave colpita in base alla lunghezza
            for (const b of this.boats) {
              if (b.len === len) {
                b.num--;
                this.daAffondare--;
              }
            }
          } else if (data.colpita === "Nave") {
            this.enemyBoard[r][c].type = "boat";
          }

          if (data.vinto) {
            this.win(true);
          }
        },
        (err) => {
          this.toastr.info(err.error.message);
          // ...
        }
      )
    );
  }

  affondaBarca(r, c, board) {
    // FUNZIONE RICORSIVA PER L'AFFONDAMENTO
    // se cella è : mare o affondata o fuori campo
    //    return 0
    // altrimenti
    //    affondata = true
    //    return 1 + ricorsione (alto, basso, destra, sinistra)
    if (
      r >= 10 ||
      c >= 10 ||
      r < 0 ||
      c < 0 ||
      board[r][c].type === "sea" ||
      board[r][c].affondata
    ) {
      return 0;
    } else {
      board[r][c].affondata = true;
      return (
        1 +
        this.affondaBarca(r - 1, c, board) + // sxs
        this.affondaBarca(r + 1, c, board) + // dx
        this.affondaBarca(r, c + 1, board) + // up
        this.affondaBarca(r, c - 1, board)
      ); // down
    }
  }

  win(me: boolean) {
    if (me) {
      document.getElementById("openWinModal").click();
    } else {
      document.getElementById("openEnemyWinModal").click();
    }
  }

  ngOnDestroy(): void {
    this.subscribers.forEach((e) => e.unsubscribe());
  }
}
