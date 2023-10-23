"use strict";

const colors = require("colors");
colors.enabled = true;
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport"); // auth middleware per express
const {expressjwt: jwt} = require("express-jwt"); // JWT parsing middleware per express
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = 8080;

/*
const result = require("dotenv").config();
if (result.error) {
  console.log("File .env non trovato");
  process.exit(-1);
}
*/

if (!process.env.JWT_SECRET) {
  console.log("Chiave JWT_SECRET non trovata");
  process.exit(-1);
}
// Middleware per JWT
const auth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"]
});

const socket = new (require("./services/socket"))(io);
const utils = require("./utils");
const error_string = require("./error_string");

utils.setSocket(socket);

// Abilitare middleware utilizati da express
app.use(cors({
  origin: [process.env.FE_URL || 'http://localhost:4200']
}));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(passport.initialize());

//root request
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/endpoint.json");
});

const auth_router = require("./router/auth");
app.use("/auth", auth_router);

const user_router = require("./router/user");
app.use("/users", auth, user_router);

const game_router = require("./router/game");
app.use("/game", auth, game_router);

const room_router = require("./router/room");
app.use("/room", auth, room_router);

const message_router = require("./router/message");
app.use("/message", auth, message_router);

const admin_router = require("./router/admin");
app.use("/admin", auth, admin_router);

app.use(function (err, req, res, next) {
  if (Object.keys(err).length !== 0) {
    console.log("Errore richiesta: ".red + JSON.stringify(err));
    res.status(err.statusCode || 500).json(err);
  }
});

app.use((req, res, next) => {
  res.status(404).json({
    statusCode: 404,
    error: true,
    message: error_string.ENDPOINT,
  });
});

mongoose.set("useCreateIndex", true);
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
  })
  .then(
    function onconected() {
      console.log("Database connesso".green);
      utils.startDB();

      http.listen(PORT, () => {
        io.on("connection", (s) => {
          s.on("auth", (tk) => {
            try {
              const decodedToken = utils.decodeToken(tk);

              socket.createSocket(decodedToken.id, s);

              socket.sendBroadcast(socket.USER_ONLINE, {
                userId: decodedToken.id,
                nickname: decodedToken.nickname,
              });

              s.on("disconnect", () => {
                socket.deleteSocket(s);
                socket.disconnect(decodedToken.id);
                socket.sendBroadcast(socket.USER_OFFLINE, {
                  userId: decodedToken.id,
                  nickname: decodedToken.id,
                });
              });
            } catch (e) {
              console.log("Token invalido".red);
            }
          });
        });
        console.log(`Server in ascolto sulla porta ${PORT}`.green);
      });
    },

    function onrejected() {
      console.log("Errore connessione database.".red);
      process.exit(-2);
    }
  );
