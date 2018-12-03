BattleShip - Angular Client
======

This doucment contains the entire structure of the Angular app.

## Components
**path**: `src/app/components`

Name   | Include  | Description
:----: |:--------:| -----------
[homepage][h] | chat<br>scoreboard<br>game-list | Main page of the application<br>Shows the scoreboard, the chat list and the rooms list. From here the user can create a new room and move to _profile_ or _admin_ pages.
[admin][a] | | Shows the list of users that are neither admin and eliminated. Each user can be promoted to admin role or can be deleted.
[profile][p] | | Personal profile page.<br>The user can see the statistics of all of his games, with two types of ratio ( win/total, win/lose) and a chart that visually show these informations. More over there is a table with all the games of the user.
[game][g] | | Game page.<br>This page is only accessible is a user join a game room from the homepage. There are to phases: the game preparation phase, in which both players place his fleet in the game field, and the real game phase, only accessible when both players have concluded the deployment of all the boats.
[login][l] | login-form<br>register-form | Login page.<br>Allow pre-registered users to login in and the creation of new ones.
[chat][c] | | Ordered list of all the users. At the top there are online users, then there are offline users. Both groups are ordere by date of the last message send/received to the user. A simple search function is available. All info of a user are accessible by the info button placed next each user's nickname.<br>By clicking on a user from the list, it is possible to access to private messages shared between that user.
[scoreboard][s] | | Scoreboard of the 10 best users in the game. Three possible choices are allowed: greater number of wins, best ratio win/total, best ratio win/lose.
[game-list][gl] | | List of all rooms available. The user can choose which one join based also on win/lose ratio of the host user.
[login-form][lf] | | User login form, needs nickname and password.<br>User must be registered.
[register-form][rf] | | User registration form<br>It needs a nickname (not already choosen), a password and the confirmation of the password

## Services
**path**: `src/app/services`

Name | Description 
:---:|---------
[user][us] | User related requests (login, registration, stats, scoreboard, nickname and id getters).<br>Include a method that inserts the _JWT_ in a request header<br>Save the _JWT_ received from the server in the _Local Storage_.
[game][gs] | Requests for the creation or elimination of new rooms, start of a match and in game moves.
[chat][cs] | Requests for getting the users list and chats. Allow the send of a message.
[socket][ss] | Controls all communications between server via sockets<br>Each event is captured and controlled in an appropriate method.
[data][ds] | Service for the storing boolean variables during a game. This service is used because during a game, variables were being unexpectedly modified and don't worked as expected. Is the unique solution found for this problem.

## Routes 
**path**: `src/app/app.routes.ts`

Path | Destination component
:---:|:------------------------:|
/home| [homepage][h]
/profile| [profile][p]
/admin | [admin][a]
/game | [game][g]


[h]:src/app/components/homepage/homepage.component.ts
[a]:src/app/components/admin/admin.component.ts
[g]:src/app/components/game/game.component.ts
[p]:src/app/components/profile/profile.component.ts
[s]:src/app/components/scoreboard/scoreboard.component.ts
[c]:src/app/components/chat/chat.component.ts
[l]:src/app/components/login/login.component.ts
[gl]:src/app/components/game-list/game-list.component.ts
[lf]:src/app/component/login-form/login-form.component.ts
[rf]:src/app/component/register-form/register-form.component.ts

[us]:src/app/services/user.service.ts
[gs]:src/app/services/game.service.ts
[cs]:src/app/services/chat.service.ts
[ss]:src/app/services/socket.service.ts
[ds]:src/app/services/data.service.ts
