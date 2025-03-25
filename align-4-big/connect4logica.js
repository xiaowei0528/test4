
var connect4LogicLoaded = true;

// connect4 functions

function Connect4(rows,columns,level) {
    this.rows = rows;              	// Heigth
    this.columns = columns;       	// Width
    this.gameState = 0;				// 0: running, 1: win_1, 2: win_2, 3: tie
    this.level = level;           	// search depth
    this.score = 100000;        	// Win/loss score
    this.iterations = 0;			// Iteration count
	this.iterativePlayer = 0;
	this.board;
	this.initialize();
};

Connect4.prototype.initialize = function() {
    var boardArray = new Array(this.rows);
	for (var i = 0; i < boardArray.length; i++) {
		boardArray[i] = new Array(this.columns);
		for (var j = 0; j < boardArray[i].length; j++) {
			boardArray[i][j] = 0;
		}
	}
    this.board = new Board(this, boardArray, 0);
};

Connect4.prototype.getBestMove = function(player) {
	if (this.board.getBoardScore() !== this.score && this.board.getBoardScore() !== -this.score && !this.board.isFull()) {
		if (this.board.isEmpty()){
			return(3);
		}else if(this.board.getFilledColumnsNb == this.columns - 1){
			for(var i =0; i<this.columns;i++){
				if (this.board.checkIfColumnIsFull(i) == false){
					return i;
				}
			}
		}else{
			this.iterations = 0;
			this.iterativePlayer = player;

			var bestMove = this.maximizePlay(this.board, this.level);

			return(bestMove[0]);
		}
	}	
};

Connect4.prototype.getGameState = function() {
	var	updatedGameState = 0;
	if (this.board.getBoardScore() == -this.score){
		updatedGameState = 1;		
	}else if (this.board.getBoardScore() == this.score){
        updatedGameState = 2;
	}else if (this.board.isFull()){
        updatedGameState = 3;
    }
	this.gameState = updatedGameState;
	return this.gameState;
};

Connect4.prototype.getPlayerToken = function(player){
if (player == 1) {
		return 1;
    }else {
		return 2;
	}
};

Connect4.prototype.getNextPlayer = function(player){
	if (player == 1) {
		return 2;
    }else {
		return 1;
	}
};

Connect4.prototype.maximizePlay = function(board, level, alpha, beta) {

	var score = board.getBoardScore();
	
	if (board.isFinished(level, score)) return [null, score];
	
	var max = [null, -99999];
    
	for (var column = 0; column < this.columns; column++) {
	
		var clonedBoard = board.copy();
		
		if (clonedBoard.setToken(column, this.iterativePlayer)) {

			this.iterations++;
			this.iterativePlayer = this.getNextPlayer(this.iterativePlayer);
	
			var next_move = this.minimizePlay(clonedBoard, level - 1, alpha, beta);

			if (max[0] === null || next_move[1] > max[1]){
				max[0] = column;
				max[1] = next_move[1];
				alpha = next_move[1];
			}
			if (alpha >= beta) return max;
		}
    }
    return max;
};

Connect4.prototype.minimizePlay = function(board, level, alpha, beta) {

	var score = board.getBoardScore();
    
	if (board.isFinished(level, score)) return [null, score];
    
	var min = [null, 99999];
    
	for (var column = 0; column < this.columns; column++) {
	
		var clonedBoard = board.copy();		

		if (clonedBoard.setToken(column, this.iterativePlayer)){

			this.iterations++;
			this.iterativePlayer = this.getNextPlayer(this.iterativePlayer);
			
			var next_move = this.maximizePlay(clonedBoard, level - 1, alpha, beta);

			if (min[0] === null || next_move[1] < min[1]){
				min[0] = column;
				min[1] = next_move[1];
				beta = next_move[1];
			}
			if (alpha >= beta) return min;
		}
    }
    return min;
};


// board functions

function Board(connect4, boardArray, player){
	this.connect4 = connect4;
	this.boardArray = boardArray;
	this.player = player;	// 1: p1, 2: p2
	this.tag ="default";
	this.winningArray = [];
	this.winningArrayP1 = [];
	this.winningArrayP2 = [];
};

Board.prototype.getBoardArrayString = function(){
	var boardArrayString = "";
    for (var i = 0; i < this.connect4.rows; i++){
		for (var j = 0; j < this.connect4.columns; j++) {
			boardArrayString += this.boardArray[i][j];
		}
    }
	return boardArrayString;
};

Board.prototype.getWinningArrayString = function(){
	var returnString = "";
	if(this.winningArray.length === 0){
		return returnString;
	}else{
		for(var i =0; i<this.winningArray.length; i++){
			returnString += this.winningArray[i][0]+"_"+this.winningArray[i][1];
			if (i !== this.winningArray.length-1){
				returnString += ",";
			}
		}
	return returnString;
	}
};

Board.prototype.isFinished = function(level, score){
	if(level === 0 || score == this.connect4.score || score == -this.connect4.score || this.isFull()){
		return true;
	}
	return false;
};

Board.prototype.isFull = function(){
	if (this.getFilledColumnsNb() == this.connect4.columns){
		return true;
	}else{
		return false;	
	}
};

Board.prototype.getFilledColumnsNb = function(){
	var columnCheck = 0;
	var firstRow = 0;
    for (var i = 0; i < this.connect4.columns; i++){
        if (this.checkIfColumnIsFull(i)){
			columnCheck++;
        }
    }
	return columnCheck;
};

Board.prototype.checkIfColumnIsFull = function(columnToCheck){
	var firstRow = 0;
	if (this.boardArray[firstRow][columnToCheck] === 0){
		return false;
	}else{
		return true;	
	}
};

Board.prototype.isEmpty = function(){
	var columnCheck = 0;
	var lastRow = this.connect4.rows - 1;
    for (var i = 0; i < this.connect4.columns; i++){
        if (this.boardArray[lastRow][i] === 0){
			columnCheck++;
        }
    }
	if (columnCheck == this.connect4.columns){
		return true;
	}else{
		return false;	
	}
};

Board.prototype.copy = function() {
	var new_board = new Array();
    for (var i = 0; i < this.boardArray.length; i++) {
        new_board.push(this.boardArray[i].slice());
    }
	var c = new Board(this.connect4, new_board, this.player);
    c.tag = "clone"+this.connect4.iterations;
	return c;	
};

Board.prototype.setToken = function(column,player){
	if (this.boardArray[0][column] === 0 && column >= 0 && column < this.connect4.columns) {
		for (var i = this.connect4.rows - 1; i >= 0; i--){
			if (this.boardArray[i][column] === 0){
				this.boardArray[i][column] = this.connect4.getPlayerToken(player);
				break;			
			}
		}
		return true;
	}else {
		return false;
	}	
};

Board.prototype.getPositionScore = function(row, column, delta_y, delta_x) {
	var pointsPlayer1 = 0;
    var pointsPlayer2 = 0;
	this.winningArrayP1 = [];
	this.winningArrayP2 = [];
	this.winningArray = [];
    for (var i = 0; i < 4; i++) {
        if (this.boardArray[row][column] == this.connect4.getPlayerToken(1)){
            this.winningArrayP1.push([row, column]);
			pointsPlayer1++;
        }else if (this.boardArray[row][column] == this.connect4.getPlayerToken(2)) {
            this.winningArrayP2.push([row, column]);
			pointsPlayer2++;
        }
		row += delta_y;
		column += delta_x;
    }
	if (pointsPlayer1 == 4) {
		this.winningArray = this.winningArrayP1;
		return -this.connect4.score;
	}else if (pointsPlayer2 == 4) {
		this.winningArray = this.winningArrayP2;
		return this.connect4.score;
	} else {
		var scoreReturn = 0;
		switch(this.connect4.iterativePlayer){
			case 1:
				scoreReturn = pointsPlayer1;
				break;
			case 2:
				scoreReturn = pointsPlayer2;
				break;
			default:
				scoreReturn = pointsPlayer2;
				break;
		}
		return scoreReturn;
	}
};

Board.prototype.getBoardScore = function() {
    var points = 0;
    var vertical_points = 0;
    var horizontal_points = 0;
    var diagonal_points1 = 0;
    var diagonal_points2 = 0;
    var row, column, score;
    // Vertical points
    for ( row = 0; row < this.connect4.rows - 3; row++) {
        for ( column = 0; column < this.connect4.columns; column++) {
             score = this.getPositionScore(row, column, 1, 0);
            if (score == this.connect4.score) return this.connect4.score;
            if (score == -this.connect4.score) return -this.connect4.score;
            vertical_points += score;
        }
    }
    // Horizontal points
    for ( row = 0; row < this.connect4.rows; row++) {
        for ( column = 0; column < this.connect4.columns - 3; column++) { 
             score = this.getPositionScore(row, column, 0, 1);   
            if (score == this.connect4.score) return this.connect4.score;
            if (score == -this.connect4.score) return -this.connect4.score;
            horizontal_points += score;
        }
    }
    // Diagonal points 1 (left-bottom)
    for ( row = 0; row < this.connect4.rows - 3; row++) {
        for ( column = 0; column < this.connect4.columns - 3; column++) {
             score = this.getPositionScore(row, column, 1, 1);
            if (score == this.connect4.score) return this.connect4.score;
            if (score == -this.connect4.score) return -this.connect4.score;
            diagonal_points1 += score;
        }            
    }
    // Diagonal points 2 (right-bottom)
    for ( row = 3; row < this.connect4.rows; row++) {
        for ( column = 0; column < this.connect4.columns - 3; column++) {
             score = this.getPositionScore(row, column, -1, 1);
            if (score == this.connect4.score) return this.connect4.score;
            if (score == -this.connect4.score) return -this.connect4.score;
            diagonal_points2 += score;
        }
    }
    points = horizontal_points + vertical_points + diagonal_points1 + diagonal_points2;
	return points;
};

	window.playtouch = window.playtouch || {};
	window.playtouch.connect4 = Connect4;

/* 											
										external command lines

>	start new Game 					------> var newGame = new Connect4(6,7,4);
"window.playtouch.gameMain = new playtouch.connect4("&int(tokenat(gridType,1,"x"))&","&int(tokenat(gridType,0,"x"))&","&connect4_AI_Level&");"

>	get board array string 			------> newGame.board.getBoardArrayString();
"playtouch.gameMain.board.getBoardArrayString();"

>	set token on board 				------> newGame.board.setToken(column, player);
"playtouch.gameMain.board.setToken(column, player);"

>	get best move on board 			------> newGame.getBestMove(player);
"playtouch.gameMain.getBestMove(player);"

>	get string of winning tokens 	------> newGame.board.getWinningArrayString();
"playtouch.gameMain.board.getWinningArrayString();"

>	get game State					------> newGame.getGameState();
"playtouch.gameMain.getGameState();"
				returnGameStates = 0 : ongoing, 1 : player 1 win, 2 : player 2 win, 3 : draw

*/