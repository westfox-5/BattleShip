class ErrorString {
    //user
    static get USER_NOT_FOUND() { return 'Utente non trovato'; }
    static get USER_MISS_PASSWORD() { return 'Password mancante'; }
    static get USER_INVALID_PASSWORD() { return 'Password non valida'; }
    static get USER_EXIST() { return 'Utente già presente'; }
    static get USER_ONLINE() { return 'Utente già online'; }
    static get USER_NOT_ONLINE() { return 'Utente non online'; }
    static get USER_DELETE() { return 'Utente eliminato'; }
    static get NICKNAME_INVALID() { return 'Nickname non valido'; }
    
    //ADMIN
    static get ADMIN_ONLY() { return 'Non sei amministratore'; }
    static get ALREADY_ADMIN() { return 'L\'utente è già amministratore'; }
    static get DELETE_ADMIN() { return 'Non puoi cancellare un amministratore'; }

    //MESSAGGI
    static get DEST_NOT_FOUND() { return 'Destinatario non trovato'; }

    //GAME
    static get USER_IN_GAME() { return 'Utente in game'; }
    static get GAME_SCHEMA_SENT() { return 'Schieramento già inviato'; }
    static get GAME_SCHEMA() { return 'Schema non valido'; }
    static get GAME_TURN() { return 'Non è il tuo turno'; }
    static get GAME_COOR_NOT_VALID() { return 'Coordinate non valide'; }
    static get GAME_COOR_HIT() { return 'Coordinata già colpita'; }
    static get GAME_NOT_FOUND() { return "Partita non trovata"; }

    //ROOM
    static get ROOM_NOT_FOUND() { return 'Room non esistente'; }
    static get YOUR_ROOM() { return 'Sei proprietario di una stanza'; }
    static get ROOM_FOUND() { return 'Stanza gioco già esistente'; }

    static get DATABASE_ERROR() { return 'Errore database'; }
    static get ERRORE() { return 'Errore'; }
    static get ENDPOINT() { return 'Endpoint invalido'; }
}

module.exports = ErrorString