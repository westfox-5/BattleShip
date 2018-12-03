
const game = require('../models/game');
const room = require('../models/room');

class SocketService {
    
    constructor(io) {
        this.io = io;
        this.sockets = [];
    }

    createSocket(userID, socket) {
        if( !this.checkIfExist(userID) )
            this.sockets.push({ 'userID': userID, 'socket' : socket });
    }

    deleteSocket(socket) {
        this.sockets = this.sockets.filter( (elem) => { return elem.socket !== socket; } );
    }

    checkIfExist(userID) {
        return this.getSocket(userID) !== undefined;
    }

    getSocket(userID) {
        const elem = this.sockets.find((elem)=>{return elem.userID == userID})
        return elem?elem.socket:undefined;

    }

    sendBroadcast(event, data) {
        this.io.emit(event, data);
    }

    sendTo(userID, event, data){
        // console.log("UserId:", userID, "event:", event,"data", data);
        if(this.checkIfExist(userID)){
            this.getSocket(userID).emit(event, data);
        }
    }
    
    async disconnect(userID){
        try{
            const room_ = await room.getModel().findOneAndDelete({host_id: userID});
            if (room_) {
                this.sendBroadcast(this.ROOM_DELETE, {
                    _id: room_._id,
                    host_id: userID
                });
            }
            else{
                const game_ = await game.getModel().findOne({ $or: [{ 'player1_id': userID }, { 'player2_id': userID}]}).exec();
                if(game_){
                    let player1= game_.isPlayerOne(userID);
                    game_.surrend(player1?1:2);
                    this.sendTo(player1?game_.player2_id:game_.player1_id, this.GAME_SURRENDER, { });
                }
            }   
        }catch(e){
            
        }         
    }

    get USER_OFFLINE() { return 'user-offline'; }
    get USER_ONLINE() { return 'user-online'; }
    get USER_DELETE() { return 'user-delete'; }
    get ROOM() { return 'room'; }
    get ROOM_DELETE() { return 'delete-room'; }
    get GAME() { return 'game'; }
    get GAME_START() { return 'start-game'; }
    get GAME_MOVE() { return 'game-move'; }
    get GAME_SURRENDER() { return 'surrend'; }
    get MESSAGE() { return 'message'; }


}

module.exports = SocketService;