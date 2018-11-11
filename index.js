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

function addClickEvent(turnText){
    boxes.forEach(function(box, index){
        if (box.children.length > 0 && box.children[0].classList.contains(turnText)){
            box.addEventListener('click', setOrigin);
        }

        if (box.children.length === 0){
            box.addEventListener('click', setDestination);
        }
    });
}

function removeClickEvent(turnText) {
    boxes.forEach(function (box, index) {
        if (box.children.length > 0 && box.children[0].classList.contains(turnText)) {
            box.removeEventListener('click', setOrigin);
        }

        if (box.children.length === 0) {
            box.removeEventListener('click', setDestination);
        }
    });


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
    let player;
   
    if(this.children.length === 0 ){
        return;
    }
    
    var previousClicked = document.getElementsByClassName('clicked');
    
    if(previousClicked.length > 0) {
        previousClicked[0].classList.remove('clicked');
    }

    if (previousClicked === this || previousClicked.length === 0) {
        this.classList.toggle('clicked');
    }
    
    if(this.classList.contains('clicked')){
        origin = {
            row: parseInt(this.dataset.row),
            column: parseInt(this.dataset.column)
        }
    }
    
}

function setDestination(e){
    e.preventDefault();
    e.stopPropagation();
    destination = {
        row: parseInt(this.dataset.row),
        column: parseInt(this.dataset.column)
    }

    if(origin !== {}){
        moveToken();
    }  
}

function moveToken(){

    let isHere = false, movementsOpponent;

    if(turn === 'player1'){
        player1.origin =  origin;
        player1.destination = destination;
        player1.addMovements(destination);
        movementsOpponent = player2.getMovements()


        console.log(player1);

        if (player1.origin.row === player1.destination.row || player1.origin.row > player1.destination.row){
            alert('You only can move forward, diagonally to the left and diagonally to the right ');
            return;
        }

        //move forward
        if (player1.origin.row + 1 === player1.destination.row && player1.origin.column === player1.destination.column){
            //don't move if opponent is in front of my token
            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player1.destination.row && movement.destination.column === player1.destination.column) {
                        isHere = true;
                        return;
                    }
                });
                if(!isHere){
                    paintNewToken(player1);
                }
                
            }else{
                paintNewToken(player1);
            }
            
        }

        //move diagonally to the left 
        else if(player1.origin.column - 1 === player1.destination.column){
            //don't move if opponent is in diagonally to the left
            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player1.destination.row && movement.destination.column === player1.destination.column) {
                        isHere = true;
                        return;
                    }
                });
                if (!isHere) {
                    paintNewToken(player1);
                }
            } else {
                paintNewToken(player1);
            } 
        }

        //move diagonally to the right
        else if (player1.origin.column + 1 === player1.destination.column) {
            //don't move if opponent is in diagonally to the right
            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player1.destination.row && movement.destination.column === player1.destination.column) {
                        isHere = true;
                        return;
                    }
                });
                if (!isHere) {
                    paintNewToken(player1);
                }
            } else {
                paintNewToken(player1);
            }
        
         
        } 
        
        //eat my opponent if in front of my token, (I have to move to more steps)
        else if (player1.origin.row + 2 === player1.destination.row && player1.origin.column === player1.destination.column){
            //check if in front of me
            if (movementsOpponent.length > 0){
                movementsOpponent.forEach(function(movement, index){
                   if (movement.destination.row === player1.origin.row + 1 && movement.destination.column === player1.origin.column){
                        deleteOpponentToken(movement);
                        reduceOpponentTokens(player2);
                        movementsOpponent.splice(index, 1);                       
                        paintNewToken(player1);
                        return;
                   }
               });
           }
        } 
        
         //eat my opponent if in diagonally to the right, (I have to move to more steps)
        else if (player1.origin.row + 2 === player1.destination.row && player1.origin.column + 2 === player1.destination.column) {
            //check if in diagonally to the right
            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player1.origin.row + 1 && movement.destination.column  === player1.origin.column + 1) {
                        deleteOpponentToken(movement);
                        reduceOpponentTokens(player2);
                        movementsOpponent.splice(index, 1);
                        paintNewToken(player1);
                        return;
                    }
                });
            }
        }

        //eat my opponent if in diagonally to the left, (I have to move to more steps)
        else if (player1.origin.row + 2 === player1.destination.row && player1.origin.column - 2 === player1.destination.column) {
            //check if in diagonally to the left
            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player1.origin.row + 1 && movement.destination.column === player1.origin.column - 1) {
                        deleteOpponentToken(movement);
                        reduceOpponentTokens(player2);
                        movementsOpponent.splice(index, 1);
                        paintNewToken(player1);
                        return;
                    }
                });
            }
        }
        
        else {
            alert('Try again!');
            return;
        }

    } else {
        player2.origin = origin;
        player2.destination = destination;
        player2.addMovements(destination);

        movementsOpponent = player1.getMovements()

        console.log(player2);
        if (player2.origin.row === player2.destination.row || player2.origin.row < player2.destination.row) {
            alert('You only can move forward, diagonally to the left and diagonally to the right ');
            return;
        }

        if (player2.origin.row - 1 === player2.destination.row && player2.origin.column === player2.destination.column) {
            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player2.destination.row && movement.destination.column === player2.destination.column) {
                        isHere = true;
                        return;
                    }
                });
                if (!isHere) {
                    paintNewToken(player2);
                }
            } else {
                paintNewToken(player2);
            }

        }

        else if (player2.origin.column + 1 === player2.destination.column) {
            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player2.destination.row && movement.destination.column === player2.destination.column) {
                        isHere = true;
                        return;
                    }
                });
                if (!isHere) {
                    paintNewToken(player2);
                }
            } else {
                paintNewToken(player2);
            }

        }

        else if (player2.origin.column - 1 === player2.destination.column) {
            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player2.destination.row && movement.destination.column === player2.destination.column) {
                        isHere = true;
                        return;
                    }
                });
                if (!isHere) {
                    paintNewToken(player2);
                }
            } else {
                paintNewToken(player2);
            }
        }

        else if (player2.origin.row - 2 === player2.destination.row && player2.origin.column === player2.destination.column) {

            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player2.origin.row - 1 && movement.destination.column === player2.origin.column) {
                        deleteOpponentToken(movement);
                        reduceOpponentTokens(player1);
                        movementsOpponent.splice(index, 1);
                        paintNewToken(player2);
                        return;
                    }
                });
            }
        }

        else if (player2.origin.row - 2 === player2.destination.row && player2.origin.column - 2 === player2.destination.column) {

            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player2.origin.row - 1 && movement.destination.column === player2.origin.column - 1) {
                        deleteOpponentToken(movement);
                        reduceOpponentTokens(player1);
                        movementsOpponent.splice(index, 1);
                        paintNewToken(player2);
                        return;
                    }
                });
            }
        }

        else if (player2.origin.row - 2 === player2.destination.row && player2.origin.column + 2 === player2.destination.column) {

            if (movementsOpponent.length > 0) {
                movementsOpponent.forEach(function (movement, index) {
                    if (movement.destination.row === player2.origin.row - 1 && movement.destination.column === player2.origin.column + 1) {
                        deleteOpponentToken(movement);
                        reduceOpponentTokens(player1);
                        movementsOpponent.splice(index, 1);
                        paintNewToken(player2);
                        return;
                    }
                });
            }
        }

        else {
            alert('Try again!');
            return;
        }
    }
    
}

function deleteOpponentToken(opponentMovement){
    let opponentToken = document.querySelector(`[data-row="${opponentMovement.destination.row}"][data-column="${opponentMovement.destination.column}"] `);  

    opponentToken.removeEventListener('click', setOrigin);
    opponentToken.addEventListener('click', setDestination);

    opponentToken.innerHTML = ``;

}

function reduceOpponentTokens(opponent){
    opponent.reduceTokens();

    if(opponent.getTokenCounter === 0){
        finishGame();
    }
}

function paintNewToken(player){
    console.log('paint')
    let boxDestination = document.querySelector(`[data-row="${player.destination.row}"][data-column="${player.destination.column}"] `),
        boxOrigin = document.querySelector(`[data-row="${player.origin.row}"][data-column="${player.origin.column}"] `);

    boxDestination.innerHTML = `<div class="player ${turn}"></div>`;
    boxOrigin.innerHTML = '';

    boxOrigin.classList.remove('clicked');

    boxOrigin.removeEventListener('click', setOrigin);
    boxDestination.removeEventListener('click', setDestination);

    boxOrigin.addEventListener('click', setDestination);
    boxDestination.addEventListener('click', setOrigin);

    player.removeMovement(player.origin);

    checkIfWinner(player);
    
    nextTurn();
}

function nextTurn(){

    origin = {};
    destination = {};

    removeClickEvent(turn);

    if(turn === 'player1'){      
        turn = 'player2';
        addClickEvent('player2');
    } else {
        turn = 'player1';
        addClickEvent('player1');
    }
}

function checkIfWinner(player){
    if(turn === 'player1'){
        if(player.destination.row === 8){
            finishGame();                   
        }
    } else {
        if (player.destination.row === 1) {
            finishGame();
        }
    }
}


function finishGame(){
    alert(`Congratulations ${turn} you won!` );
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
            destination: this.destination
        });
    }

    this.removeMovement = function(origin){
        movements.forEach(function(movement, index){
            if (movement.destination.row === origin.row && movement.destination.column === origin.column){
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



