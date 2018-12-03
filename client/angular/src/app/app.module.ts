import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ng6-toastr-notifications';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { ConfirmPasswordDirective } from '@dir/confirm-password.directive';
import { AppRoutes } from 'app/app.routes';

import { AppComponent } from 'app/app.component';
import { HomepageComponent } from '@comp/homepage/homepage.component';
import { LoginFormComponent } from '@comp/login-form/login-form.component';
import { RegisterFormComponent } from '@comp/register-form/register-form.component';
import { ChatComponent } from '@comp/chat/chat.component';
import { LoginComponent } from '@comp/login/login.component';
import { GameListComponent } from '@comp/game-list/game-list.component';
import { GameComponent } from '@comp/game/game.component';
import { ProfileComponent } from '@comp/profile/profile.component';
import { AdminComponent } from '@comp/admin/admin.component';
import { ScoreboardComponent } from '@comp/scoreboard/scoreboard.component';

import { SocketService } from '@serv/socket.service';
import { UserService } from '@serv/user.service';
import { GameService } from '@serv/game.service';
import { ChatService } from '@serv/chat.service';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    LoginFormComponent,
    RegisterFormComponent,
    ChatComponent,
    ConfirmPasswordDirective,
    LoginComponent,
    GameListComponent,
    GameComponent,
    ProfileComponent,
    AdminComponent,
    ScoreboardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(AppRoutes, {useHash: true}),
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [
    UserService,
    GameService,
    SocketService,
    ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
