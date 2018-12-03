# BattleShip

Project for [Web technologies and applications][taw] course.   

## Introduction
This project consists in a multiplayer version of the classic game  _BattleShip_.

The game is available to play at: [battleship.now.sh](https://battleship.now.sh).

## Get Started
This guide lets you install the game and play with your local server. This means you can only play with other users connected to your server. You cannot see real time changes (like new games added from other players). 

    cd ~/Desktop
    git clone https://github.com/westfox-5/BattleShip
    cd BattleShip
---

#### Install all dependencies
   
    npm run install

Or choose what to install

    npm run install-server
    npm run install-web
    npm run install-desktop
    npm run install-android
---
### Start the local Database

    npm run start-db

#### Start the server
    
    npm run start-server
Server runs at [localhost:8080][s-url]

---

#### Build & Execute clients
Choose what to execute
    
* Web:  [_localhost:4200_][c-url]

        npm run start-web

* Desktop:
  
        npm run build-desktop
        npm run start-desktop
        npm run generate-desktop :: generete an executable file in `releases/desktop` folder.


* Android:
        
        npm run build-android
        npm run generate-android :: generate an APK file in `releases/android` folder.


## [Server documentation][s]
## [Client documentation][c]
  


[taw]:http://www.dsi.unive.it/~bergamasco/webtech.html
[s]: /server/README.md
[c]: /client/README.md
[s-url]: localhost:8080
[c-url]: localhost:4200
