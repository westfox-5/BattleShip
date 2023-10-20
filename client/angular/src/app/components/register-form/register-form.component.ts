import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { UserService } from "@serv/user.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-register-form",
  templateUrl: "./register-form.component.html",
  styleUrls: ["./register-form.component.css"],
})
export class RegisterFormComponent implements OnInit, OnDestroy {
  subscribers: Subscription[] = [];

  model: {
    nickname: string;
    password: string;
    cpassword: string;
  };

  constructor(private _auth: UserService, private toastr: ToastrService) {}

  ngOnInit() {
    this.model = {
      nickname: "",
      password: "",
      cpassword: "",
    };
  }

  onRegister(f: FormGroup) {
    if (this.model.nickname === "") {
      this.toastr.error("Inserisci un nickname", "Errore registrazione!");
      return;
    }

    const user = {
      nickname: this.model.nickname
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;")
        .replace(/\s*$/, ""),
      password: this.model.password,
    };

    this.subscribers.push(
      this._auth.register(user).subscribe(
        (res) => {
          this.toastr.success("Effettua il login", "Registrazione avvenuta!");

          for (const key in f.controls) {
            if (f.controls.hasOwnProperty(key)) {
              const element = f.controls[key];
              element.setValue("");
              element.setErrors(null);
            }
          }
        },
        (err) => {
          this.toastr.error(
            err.error.message || err.err.errormessage,
            "Errore registrazione!"
          );

          for (const key in f.controls) {
            if (f.controls.hasOwnProperty(key)) {
              const element = f.controls[key];
              element.setValue("");
              element.setErrors(null);
            }
          }
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscribers.forEach((e) => e.unsubscribe());
  }
}
