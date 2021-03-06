'use strict';

const boxes = document.querySelectorAll('.box'),
      numTokens = 12;

var origin = {},
    destination = {},
    turn = 'player1',
    player1 = new Player('player1', origin, destination),
    player2 = new Player('player2', origin, destination);

this.paintBoard();
this.paintBoxes();
this.addClickEvent('player1');
this.changeBackgroundColor();

function changeBackgroundColor(){
    let body = document.querySelector('body');
    if(turn === 'player1'){
        body.classList.add('background-player1');
        body.classList.remove('background-player2');
    } else {
        body.classList.add('background-player2');
        body.classList.remove('background-player1');
    }
    
}

function addClickEvent(){
    this.setOrigin = this.setOrigin.bind(this);
    this.setDestination = this.setDestination.bind(this);

    boxes.forEach(function(box, index){
        if (box.children.length > 0 && box.children[0].classList.contains(turn)){
            box.addEventListener('click', this.setOrigin);
        }

        if (box.children.length === 0){
            box.addEventListener('click', this.setDestination);
        }
    }.bind(this));
}

function removeClickEvent() {

    boxes.forEach(function (box, index) {
        if (box.children.length > 0 && box.children[0].classList.contains(turn)) {
            box.removeEventListener('click', this.setOrigin);
        }

        if (box.children.length === 0) {
            box.removeEventListener('click', this.setDestination);
        }
    }.bind(this));


}

function paintBoard(){
    let column = 0, row = 0, toggle = false;
    boxes.forEach(function (box, index) {
        box.dataset.row = row+1;
        box.dataset.column = column+1;

        if (index % 2 === 0) {
            if(toggle){
                box.classList.add('black');
            } else{
                box.classList.add('white');
            }
            
        } else {
            if (toggle) {
                box.classList.add('white');
            } else {
                box.classList.add('black');
            }
        }

        column++;

        if (column === Math.sqrt(boxes.length)) {
            toggle = !toggle;
            column = 0;
            row++;
        }      
    });
}

function paintBoxes(){
    this.paintPlayer1Boxes();
    this.paintPlayer2Boxes();
}

function paintPlayer1Boxes(){
    let counter = 0, toggle = false;
    for(var i=0; i < Math.sqrt(boxes.length) * 3; i++){
        
        if(!toggle){
            if (i % 2 !== 0) {
                boxes[i].innerHTML = '<div class="player player1"></div>';
            }
        }
        else{
            if (i % 2 === 0) {
                boxes[i].innerHTML = '<div class="player player1"></div>';
            }
        }           
        counter++;

        if (counter === Math.sqrt(boxes.length)) {
            toggle = !toggle;
            counter = 0;
        }        
    }
}

function paintPlayer2Boxes() {
    let counter = 0, toggle = false;
    for (var i = boxes.length - 1; i >= boxes.length - Math.sqrt(boxes.length) * 3; i--) {

        if (!toggle) {
            if (i % 2 === 0) {
                boxes[i].innerHTML = '<div class="player player2"></div>';
            }
        }
        else {
            if (i % 2 !== 0) {
                boxes[i].innerHTML = '<div class="player player2"></div>';
            }
        }
        counter++;

        if (counter === Math.sqrt(boxes.length)) {
            toggle = !toggle;
            counter = 0;
        }
    }
}

function setOrigin(e){
    e.preventDefault();
    e.stopPropagation();
   
    if(e.currentTarget.children.length === 0 ){
        return;
    }
    
    let previousClicked = document.getElementsByClassName('clicked');
    
    if(previousClicked.length > 0) {
        previousClicked[0].classList.remove('clicked');
    }

    if (previousClicked === e.target || previousClicked.length === 0) {
        e.currentTarget.classList.toggle('clicked');
    }
    
    if (e.currentTarget.classList.contains('clicked')){
        origin = {
            row: parseInt(e.currentTarget.dataset.row),
            column: parseInt(e.currentTarget.dataset.column)
        }
    }
    
}

function setDestination(e){
    e.preventDefault();
    e.stopPropagation();
    
    destination = {
        row: parseInt(e.currentTarget.dataset.row),
        column: parseInt(e.currentTarget.dataset.column)
    }

    if(origin !== {}){
        this.moveToken();
    }  
}

function moveToken(){

    let currentPlayer, opponentPlayer, moveForward;

    if(turn === 'player1'){
        this.setPlayerData(player1);

        currentPlayer = player1;
        opponentPlayer = player2;

        moveForward = 1;

    } 
    else{
        this.setPlayerData(player2);

        currentPlayer = player2;
        opponentPlayer = player1;

        moveForward = -1;
    }

    if (this.checkIfValidPosition(currentPlayer)) {
        currentPlayer.addMovements(destination);

        //move forward
        if (currentPlayer.origin.row + moveForward === currentPlayer.destination.row && currentPlayer.origin.column === currentPlayer.destination.column) {
            //don't move if opponent is in front of my token
            if (!this.checkOpponentPosition(opponentPlayer, currentPlayer)) {
                this.paintNewToken(currentPlayer);
            }
        }

        //move diagonally to the left 
        else if (currentPlayer.origin.column - 1 === currentPlayer.destination.column) {
            //don't move if opponent is in diagonally to the left
            if (!this.checkOpponentPosition(opponentPlayer, currentPlayer)) {
                this.paintNewToken(currentPlayer);
            }
        }

        //move diagonally to the right
        else if (currentPlayer.origin.column + 1 === currentPlayer.destination.column) {
            //don't move if opponent is in diagonally to the right
            if (!this.checkOpponentPosition(opponentPlayer, currentPlayer)) {
                this.paintNewToken(currentPlayer);
            }
        }

        //eat my opponent if in front, diagonally to the left or right of my token, (I have to move two more steps)
        else {
            this.eatOpponent(opponentPlayer, currentPlayer);
        }
    }  
    
}

function checkIfValidPosition(currentPlayer){
    let isValid = true,
        board = document.querySelector('.board');

    board.addEventListener('animationend', function(e){
        board.classList.remove('shake');
    });
    
    if(currentPlayer.playerName === 'player1'){
        if (currentPlayer.origin.row === currentPlayer.destination.row || currentPlayer.origin.row > currentPlayer.destination.row) {
            board.classList.add('shake');
            isValid = false;
        }
    } else {
        if (currentPlayer.origin.row === currentPlayer.destination.row || currentPlayer.origin.row < currentPlayer.destination.row) {
            board.classList.add('shake');
            isValid = false;
        }
    }

    return isValid;
}

//set origin, destination and add movement
function setPlayerData(currentPlayer){
    currentPlayer.origin = origin;
    currentPlayer.destination = destination;
    
}

//check if opponent is in selected destination
function checkOpponentPosition(opponentPlayer, currentPlayer){

    let opponentPlayerMovements = opponentPlayer.getMovements,
        isInDestination = false;

    if (opponentPlayerMovements.length > 0) {
        opponentPlayerMovements.forEach(function (movement, index) {
            if (movement.position.row === currentPlayer.position.row && movement.position.column === currentPlayer.position.column) {
                isInDestination = true;
                return;
            }
        });
    } 

    return isInDestination;
}

//check if you can eat your opponent
function eatOpponent(opponentPlayer, currentPlayer){

    let moveRight = 1, moveLeft = -1, moveForward = 0, opponentPlayerMovements = opponentPlayer.getMovements();

    if(turn === 'player1'){
        moveForward = 1;
    } else {
        moveForward = -1;
    }

    //if currentPlayer moved 2 positions forward
    if (currentPlayer.origin.row + (2 * moveForward) === currentPlayer.destination.row && currentPlayer.origin.column === currentPlayer.destination.column) {
        //check if in front of me
        if (opponentPlayerMovements.length > 0) {
            opponentPlayerMovements.forEach(function (movement, index) {
                if (movement.position.row === currentPlayer.origin.row + moveForward && movement.position.column === currentPlayer.origin.column) {
                    this.eatOpponentToken(movement, opponentPlayerMovements, index, opponentPlayer, currentPlayer);
                    return;
                }
            }.bind(this));
        }
    }

    //eat my opponent if in diagonally to the right, (I have to move to more steps)
    else if (currentPlayer.origin.row + (2 * moveForward) === currentPlayer.destination.row && currentPlayer.origin.column + (2* moveRight) === currentPlayer.destination.column) {
        //check if in diagonally to the right
        if (opponentPlayerMovements.length > 0) {
            opponentPlayerMovements.forEach(function (movement, index) {
                if (movement.position.row === currentPlayer.origin.row + moveForward && movement.position.column === currentPlayer.origin.column + moveRight) {
                    this.eatOpponentToken(movement, opponentPlayerMovements, index, opponentPlayer, currentPlayer);
                    return;
                }
            }.bind(this));
        }
    }

    //eat my opponent if in diagonally to the left, (I have to move to more steps)
    else if (currentPlayer.origin.row + (2 * moveForward) === currentPlayer.destination.row && currentPlayer.origin.column + (2 * moveLeft) === currentPlayer.destination.column) {
        //check if in diagonally to the left
        if (opponentPlayerMovements.length > 0) {
            opponentPlayerMovements.forEach(function (movement, index) {
                if (movement.position.row === currentPlayer.origin.row + moveForward && movement.position.column === currentPlayer.origin.column + moveLeft) {
                    this.eatOpponentToken(movement, opponentPlayerMovements, index, opponentPlayer, currentPlayer);
                    return;
                }
            }.bind(this));
        }
    }
}

function eatOpponentToken(movement, opponentPlayerMovements, positionMovement, opponentPlayer, currentPlayer){
    opponentPlayerMovements.splice(positionMovement, 1);
    this.deleteOpponentToken(movement);
    this.reduceOpponentTokens(opponentPlayer);
    this.paintNewToken(currentPlayer);
}

function deleteOpponentToken(opponentMovement){
    let opponentToken = document.querySelector(`[data-row="${opponentMovement.position.row}"][data-column="${opponentMovement.position.column}"] `);

    opponentToken.removeEventListener('click', this.setOrigin);
    opponentToken.addEventListener('click', this.setDestination);

    opponentToken.children[0].classList.add('delete');

    opponentToken.addEventListener('transitionend', function(){
        opponentToken.innerHTML = ``;
    });  

}

function reduceOpponentTokens(opponent){
    opponent.reduceTokens();

    if(opponent.getTokenCounter === 0){
        this.finishGame();
    }
}

function paintNewToken(player){
    let boxDestination = document.querySelector(`[data-row="${player.destination.row}"][data-column="${player.destination.column}"] `),
        boxOrigin = document.querySelector(`[data-row="${player.origin.row}"][data-column="${player.origin.column}"] `);

    boxDestination.innerHTML = `<div class="player ${turn}"></div>`;
    boxOrigin.innerHTML = '';

    boxOrigin.classList.remove('clicked');

    this.removeBoxEvents(boxDestination, boxOrigin);

    player.removeMovement(player.origin);

    this.checkIfWinner(player);
    
    this.nextTurn();
}

function removeBoxEvents (boxDestination, boxOrigin){
    boxOrigin.removeEventListener('click', this.setOrigin);
    boxDestination.removeEventListener('click', this.setDestination);

    boxOrigin.addEventListener('click', this.setDestination);
    boxDestination.addEventListener('click', this.setOrigin);
}

function nextTurn(){

    origin = {};
    destination = {};

    this.removeClickEvent();

    if(turn === 'player1'){      
        turn = 'player2';
    } else {
        turn = 'player1';        
    }

    this.addClickEvent();

    this.changeBackgroundColor();
}

function checkIfWinner(player){
    
    if(turn === 'player1'){
        if(player.destination.row === 8){
            this.paintWinner(player);
            this.finishGame(player1, player2);                   
        }
    } else {
        if (player.destination.row === 1) {
            this.paintWinner(player);
            this.finishGame(player2, player1);
        }
    }
}

function paintWinner(player){
    let boxDestination = document.querySelector(`[data-row="${player.destination.row}"][data-column="${player.destination.column}"] `);

    boxDestination.children[0].classList.add('winner');
}

function finishGame(winner, loser){
    let board = document.querySelector('.board');
    board.classList.add('flip-board');

    let backBoard = document.querySelector('.back-board');
    backBoard.innerHTML = `<p> Congratulations, </br> ${winner.playerName} won</p><p>sorry ${loser.playerName}, </br>u mad? </p> <button>Play Again</button>`
    
    let button = document.querySelector('button');
    button.addEventListener('click', function(){
        location.reload();
    });
    return;
}

function Player(playerName, origin, destination){
    this.playerName = playerName;
    this.origin = origin;
    this.destination = destination;

    let movements = [];
    let tokenCounter = numTokens;

    this.addMovements = function(destination){
        movements.push({
            position: this.destination
        });
    }

    this.removeMovement = function(origin){
        movements.forEach(function(movement, index){
            if (movement.position.row === origin.row && movement.position.column === origin.column){
                movements.splice(index, 1);
            }
        });
    }

    this.getMovements = function(){
        return movements;
    }

    this.getTokenCounter = function(){
        return tokenCounter;
    }

    this.reduceTokens = function(){
        tokenCounter--;
    }

}



