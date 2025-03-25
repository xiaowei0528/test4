//V1.0.11

// Board
///////////////////////////////////////////////////////////

    function Board() {
        this.gridWidth = 0; // length on x
        this.gridHeight = 0; // length on y
        this.grid = []; // array to store tiles
        this.gameInitialised = 0; // param to know if board has been created or not
        this.changeLog = {}; // object to store changes on board after a move
        this.moves = 0; //number of moves left to play
        this.maxMoves = 0; //max number of moves allowed to play
        this.tileFocus = ""; //the tile to focus for each merge
    };

    // creates all elements of the game board
    Board.prototype.init = function(gridWidth, gridHeight, maxMoves, moves, savedGameData) {
        
        if (typeof gridWidth !== "number" || gridWidth < 1) gridWidth = 5;
        if (typeof gridHeight !== "number" || gridHeight < 1) gridHeight = gridWidth;
        if (typeof maxMoves !== "number" || maxMoves < 1) maxMoves = 5;
        if (typeof moves !== "number"){
            moves = maxMoves;
        }else{
            if (moves < 1) moves = 0;
        }
        if (typeof savedGameData == "undefined"){
            var parameter = defaultMaxVal;
        }else{
            var parameter = savedGameData;
        }

        Tile.prototype.currId = 0;
        return this.boardLog("initializeBoardLog")
                .setWidth(gridWidth)
                .setHeight(gridHeight)
                .setMaxMoves(maxMoves)
                .setMoves(moves)
                .createTiles()
                .populateTiles(parameter)
                .setTileFocus("")
                .setGameInitialised();
    };

    // creates all empty tiles for the board during initialisation
    Board.prototype.createTiles = function() {

        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();

        for (var logicY = 0; logicY < boardHeight; logicY++) {
            for (var logicX = 0; logicX < boardWidth; logicX++) {

                this.grid[logicX + "_" + logicY] = new Tile()
                    .setBoard(this)
                    .setLogicX(logicX)
                    .setLogicY(logicY);
            }
        }

        return this;
    };

    // sets value of empty tiles
    Board.prototype.populateTiles = function(parameter) {

        var isLoadingSavedGame = false;
        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        
        if (typeof parameter == "string" && this.validateSavedData(boardWidth, boardHeight, parameter)) isLoadingSavedGame = true;
        
        if (isLoadingSavedGame){
            var savedGameData = parameter;
            var savedDataArray = savedGameData.split(",");
            for (var logicY = 0; logicY < boardHeight; logicY++) {
                for (var logicX = 0; logicX < boardWidth; logicX++) {
                    var importedValue = parseInt(savedDataArray.shift());
                    this.getTileAt(logicX, logicY).setValue(importedValue);
                    this.boardLog("create", this.getTileAt(logicX, logicY));
                }
            }

        }else{
            var maxVal = parameter;
            if (typeof maxVal !== "number") maxVal = defaultMaxVal;
            var zeroCount = this.getZeroCount();
            if (zeroCount < 1) return this;
           
            for (var logicY = 0; logicY < boardHeight; logicY++) {
                for (var logicX = 0; logicX < boardWidth; logicX++) {
                    var tile = this.getTileAt(logicX, logicY);
                    if (tile.getValue() === 0){
                        this.getSuitableRandomValueForTile(tile);
                        this.boardLog("create", tile);
                    }
                }
            }
        }
        if (DEBUG_MODE == 1) this.log();
        return this;
    };

    // sets value of tiles to zero
    Board.prototype.resetTile = function(logicX, logicY) {

        this.getTileAt(logicX, logicY).setValue(0);

        return this;
    };

    // returns game board array
    Board.prototype.log = function() {

        var returnString = "";
        var logicX = 0;
        var logicY = 0;
        var newLine = "\n";
        var axisX = "";
        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var maxWidth = (this.getMaxDataWidth() < 3) ? 3 : this.getMaxDataWidth();


        for (logicX = 0; logicX < boardWidth; logicX++) {

            axisX += (padValue(logicX, maxWidth)).replace("[", " ").replace("]", " ");
        }

        returnString += (padValue("Y\\X", maxWidth)).replace("[", " ").replace("]", " ") + axisX;

        for (logicY = 0; logicY < boardHeight; logicY++) {
            for (logicX = 0; logicX < boardWidth; logicX++) {

                if (logicX === 0) {

                    returnString += newLine +
                        (padValue(logicY, maxWidth)).replace("[", " ").replace("]", " ") +
                        (padValue(this.getTileAt(logicX, logicY).getValue(), maxWidth));

                } else {

                    returnString += padValue(this.getTileAt(logicX, logicY).getValue(), maxWidth);

                }
            }
        }

        //window.console.clear();
        window.console.log("%c" + returnString, "color: DodgerBlue");
        window.console.log("%c" + "Moves: "+this.getMoves(), "color: Yellow");
        window.console.log("%c" + "Combo: "+(this.changeLog.count - 1), "color: Yellow");
        return this;
    };

    // verifies if savedGameData string contains enough values to fill grid and if all values are valid
    Board.prototype.validateSavedData = function(gridWidth, gridHeight, savedGameData) {

        var savedDataArray = savedGameData.split(",");
        var arrayCount = savedDataArray.length;
        var gridCount = gridHeight * gridWidth;
        if (gridCount !== arrayCount) return false;

        for (var i = 0; i < arrayCount - 1; i++) {

            var currentData = parseInt(savedDataArray[i]);

            if (typeof currentData !== "number" || currentData < 1) return false;
        }
        return true;
    };

    // verifies if all consecutive tiles in arrayPos share either the same logic X or the same logic Y
    Board.prototype.validateString = function(arrayPos) {

        for (var i = 0; i < arrayPos.length - 1; i++) {

            var firstTile = this.getTileAt(
                parseInt(arrayPos[i].split("_")[0]),
                parseInt(arrayPos[i].split("_")[1])
            );

            var secondTile = this.getTileAt(
                parseInt(arrayPos[i + 1].split("_")[0]),
                parseInt(arrayPos[i + 1].split("_")[1])
            );

            if (this.areEqual(firstTile, secondTile)) {

                if (this.checkIfNeighbour(firstTile, secondTile) === false) return false;

            } else {

                return false;
            }
        }
        return true;
    };

    Board.prototype.areEqual = function(firstTile, secondTile) {

        if (firstTile.value == secondTile.value && firstTile.value !== 0) {

            return true;

        } else {

            return false;
        }
    };

    Board.prototype.checkIfNeighbour = function(firstTile, secondTile) {

        var diff = [{
            x: 0,
            y: 1
        }, {
            x: 0,
            y: -1
        }, {
            x: 1,
            y: 0
        }, {
            x: -1,
            y: 0
        }];

        for (var i = 0; i < diff.length; i++) {

            if (this.getTileAt(firstTile.getLogicX() + diff[i].x, firstTile.getLogicY() + diff[i].y).getId() === secondTile.getId()) return true;

        }
        return false;
    };

    // sets all merged tile values to zero and calls this.getMergedValue(total) to get value of final tile
    Board.prototype.merge = function(arrayPos, active) {

        var logicX = 0;
        var logicY = 0;
        var total = 0;

        for (var i = 0; i < arrayPos.length; i++) {

            var pos = arrayPos[i].split("_");

            logicX = parseInt(pos[0]);
            logicY = parseInt(pos[1]);
            total = this.getTileAt(logicX, logicY).getValue();

            if(active){
                if (i == 0) {
                	
                    this.getTileAt(logicX, logicY).setValue(this.getMergedValue(total));
                    this.boardLog("merge", this.getTileAt(logicX, logicY));
                } else {
                    this.resetTile(logicX, logicY);
                    this.boardLog("destroy", this.getTileAt(logicX, logicY));
                }
            }
        }

        if(!active) return this.getMergedValue(total);
        if (DEBUG_MODE == 1) this.log();
        return this;
    };

    Board.prototype.checkForGameOver = function() {

        if (this.getMoves() <= 0) return true;

        return false;
    };

    // collapses every columns
    Board.prototype.collapseAll = function() {

        var boardWidth = this.getWidth();

        if (this.gameInitialised == 1) {

            for (var logicX = 0; logicX < boardWidth; logicX++) {

                this.collapseColumn(logicX);
            }
        }
        return this;
    };

    // collapses single column
    Board.prototype.collapseColumn = function(logicX) {

        var logicY = 0;
        var secondTileLogicY = 0;
        var count = 0;
        var boardHeight = this.getHeight();

        for (logicY = 0; logicY < boardHeight; logicY++) {

            if (this.getTileAt(logicX, logicY).getValue() == 0) count++;
            if (count == boardHeight) return this;
        }
        for (logicY = boardHeight - 1; logicY > 0; logicY--) {
            if (this.getTileAt(logicX, logicY).getValue() == 0) {
                var firstTile = this.getTileAt(logicX, logicY);
                for (secondTileLogicY = logicY - 1; secondTileLogicY >= 0; secondTileLogicY--) {
                    if (this.getTileAt(logicX, secondTileLogicY).getValue() !== 0) {
                        var secondTile = this.getTileAt(logicX, secondTileLogicY);
                        this.swapValues(firstTile, secondTile);
                        this.boardLog("posChange", firstTile, this.getStringifiedTileLogic(secondTile));
                        break;
                    }
                }
            }
        }
        return this;
    };

    Board.prototype.swapValues = function(firstTile, secondTile) {

        var valueBuffer = firstTile.getValue();

        firstTile.setValue(secondTile.getValue());
        secondTile.setValue(valueBuffer);

        return this;
    };

    Board.prototype.incrementTile = function(tile) {

        var valueBuffer = tile.getValue();

        tile.setValue(valueBuffer + 1);

        return this;
    };

    Board.prototype.decrementTile = function(tile) {

        var valueBuffer = tile.getValue();
        
        if (valueBuffer > 1 ) {tile.setValue(valueBuffer - 1);}

        return this;
    };

    Board.prototype.incrementMoves = function() {

        var valueBuffer = this.getMoves();

        if (valueBuffer < this.getMaxMoves()){
            this.setMoves(valueBuffer + 1);
        }else{
            this.setMoves(this.getMaxMoves());
        }

        return this;
    };

    Board.prototype.decrementMoves = function() {

        var valueBuffer = this.getMoves();
        
        if (valueBuffer > 0){
            this.setMoves(valueBuffer - 1);
        }else{
            this.setMoves(0);
        }

        return this;
    };

    Board.prototype.incrementMaxMoves = function() {

        var valueBuffer = this.getMaxMoves();
        this.setMaxMoves(valueBuffer + 1);
        return this;
    };

    Board.prototype.decrementMaxMoves = function() {

        var valueBuffer = this.getMaxMoves();
        
        if (valueBuffer > 0){
            this.setMaxMoves(valueBuffer - 1);
        }else{
            this.setMaxMoves(0);
        }

        return this;
    };

    Board.prototype.exportGameData = function(){

        return this.getStringifiedTileValuesByPos();
    };

    Board.prototype.boardLog = function(command, tile, paramStr) {


        switch (command) {

            case "initializeBoardLog":
                this.changeLog = {"isInUse":false, "count":1, "log":[{"changeTileVal":[], "merge":{}, "destroy":[], "posChange":[], "create":[]}]};
                break;

            case "refresh":
                if (this.changeLog.isInUse) {
                    this.changeLog = {"isInUse":false, "count":1, "log":[{"changeTileVal":[], "merge":{}, "destroy":[], "posChange":[], "create":[]}]};
                }
                this.setTileFocus("");
                break;

            case "addLog":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.log.push({"changeTileVal":[], "merge":{}, "destroy":[], "posChange":[], "create":[]});
                this.changeLog.count++;
                break;

            case "export":
                if (this.changeLog.isInUse) {
                    this.changeLog.isInUse = this.changeLog.isInUse.asInt();
                    var exportString = JSON.stringify(this.changeLog);
                    this.boardLog("refresh");
                    return exportString;
                }else{
                    return false;
                }
                break;
                
            case "changeTileVal":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.log[this.changeLog.count - 1].changeTileVal.push(
                {
                "logicX":tile.getLogicX(),
                "logicY":tile.getLogicY(),
                "value":tile.getValue()
                }
                );
                break;

            case "merge":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.log[this.changeLog.count - 1].merge =  {
                "logicX":tile.getLogicX(),
                "logicY":tile.getLogicY(),
                "value":tile.getValue()
                };
                break;

            case "destroy":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.log[this.changeLog.count - 1].destroy.push(
                {
                "logicX":tile.getLogicX(),
                "logicY":tile.getLogicY()
                }
                );
                break;

            case "posChange":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.log[this.changeLog.count - 1].posChange.push(
                {
                "initLogicX":this.getTileByStringifiedTileLogic(paramStr).getLogicX(),
                "initLogicY":this.getTileByStringifiedTileLogic(paramStr).getLogicY(),
                "finalLogicX":tile.getLogicX(),
                "finalLogicY":tile.getLogicY()
                }
                );
                break;

            case "create":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.log[this.changeLog.count - 1].create.push(
                {
                "logicX":tile.getLogicX(),
                "logicY":tile.getLogicY(),
                "value":tile.getValue()
                }
                );
                break;

            default:
                return false;
        }
        return this;
    };

    Board.prototype.computeX = function(logicX, offsetX, gridCellWidth){
        var positionX = offsetX + (0.5 + logicX)*gridCellWidth;
        return ((Math.floor(positionX*10))/10);
    };

    Board.prototype.computeY = function(logicY, offsetY, gridCellHeight){
        var positionY = offsetY + (0.5 + logicY)*gridCellHeight;
        return ((Math.floor(positionY*10))/10);
    };

    Board.prototype.computePowerValue = function(exponent){
        if(typeof exponent !== "number" || exponent < 1) return false;
        return Math.pow(2, exponent);
    };

    //solution = 2^(floor(log n/log 2)
    Board.prototype.processArrayPosForMerge = function(arrayPos){

        this.incrementMoves();
        this.setTileFocus(this.getNextTileLocationLogicString(arrayPos[0]));
       	this.merge(arrayPos, true).collapseAll().populateTiles(this.getMaxVal());

 

       	if(this.getTileFocus() == ""){
    		
       		return this;
       	} else {

       		var newTile = this.getTileByStringifiedTileLogic(this.getTileFocus());
       		if(!newTile.isGhost()){
                    
                    var newArrayPos = this.getTileLogicArrayFromTilesArray(this.getAllConnectedSameTiles(newTile));
                    
                    if(newArrayPos.length > 2){
                  
                        this.boardLog("addLog");
                        this.processArrayPosForMerge(newArrayPos);
                    }
            }

            this.setTileFocus("");
	    	return this;
       	}
    };

    Board.prototype.getNextTileLocationLogicString = function(logicX_logicY){

    	var logicX = parseInt(logicX_logicY.split("_")[0]),
        	logicY = parseInt(logicX_logicY.split("_")[1]),
        	tileValue =  this.getTileByStringifiedTileLogic(logicX_logicY).getValue(),
        	returnString = logicX_logicY;

        if (logicY === (this.getHeight() - 1)) return returnString;

        for (var i = logicY + 1; i < this.getHeight(); i++) {

        	if (this.getTileAt(logicX,i).getValue() != tileValue) break;
        	returnString = logicX + "_" + i;

        }

        return returnString;
    };

    Board.prototype.checkWholeBoardForMerge = function(){

        var boardWidth = this.getWidth();
        var boardHeight = this.getHeight();

        for(var i = boardHeight-1; i >= 0; i--){
            for(var j = 0; j < boardWidth; j++){

                var tile = this.getTileAt(j,i);
                if(!tile.isGhost()){
                    var arrayPos = this.getTileLogicArrayFromTilesArray(this.getAllConnectedSameTiles(tile));
                    if(arrayPos.length > 2) {
                        this.boardLog("addLog");
                        this.processArrayPosForMerge(arrayPos);
                        return this.checkWholeBoardForMerge();
                    }
                }
            }
        }

        return this;
    };

    Board.prototype.getRoute = function(tileLogic,destLogic){

    	var tileX = tileLogic.split("_")[0],
    		tileY = tileLogic.split("_")[1],
    		destX = destLogic.split("_")[0],
    		destY = destLogic.split("_")[1],
    		val = this.getTileByStringifiedTileLogic(tileLogic).getValue(),
    		route = [destLogic];

    	

    		return route;
    };

// Board - Player Moves/spells
///////////////////////////////////////////////////////////

    Board.prototype.playerMove = function(selectedTileStringLogic) {

        if (this.getMoves() == 0)return false;

        var tile = this.getTileByStringifiedTileLogic(selectedTileStringLogic);

        if (!tile.isGhost() === true) {
            
            this.incrementTile(tile);
            this.decrementMoves();
            var arrayPos = this.getTileLogicArrayFromTilesArray(this.getAllConnectedSameTiles(tile));
            this.boardLog("refresh");

            if(arrayPos.length > 2) {
                
                this.processArrayPosForMerge(arrayPos);
            }else{

                this.boardLog("changeTileVal", tile);               
            }
            
            this.checkWholeBoardForMerge();
            return this.boardLog("export");

        } else {

            return false;
        }
    };

    Board.prototype.removeOne = function(selectedTileStringLogic) {

        var tile = this.getTileByStringifiedTileLogic(selectedTileStringLogic);

        if (!tile.isGhost() === true && tile.getValue() > 1) {
            
            this.decrementTile(tile);

            var arrayPos = this.getTileLogicArrayFromTilesArray(this.getAllConnectedSameTiles(tile));
            this.boardLog("refresh");

            if(arrayPos.length > 2) {
                
                this.processArrayPosForMerge(arrayPos);
            }else{

                this.boardLog("changeTileVal", tile);               
            }
            
            this.checkWholeBoardForMerge();
            return this.boardLog("export");

        } else {

            return false;
        }
    };

    Board.prototype.addTwo = function(selectedTileStringLogic) {

        var tile = this.getTileByStringifiedTileLogic(selectedTileStringLogic);

        if (!tile.isGhost() === true && tile.getValue() < 4) {
            
            this.incrementTile(tile);
            this.incrementTile(tile);

            var arrayPos = this.getTileLogicArrayFromTilesArray(this.getAllConnectedSameTiles(tile));
            this.boardLog("refresh");

            if(arrayPos.length > 2) {
                
                this.processArrayPosForMerge(arrayPos);
            }else{

                this.boardLog("changeTileVal", tile);               
            }
            
            this.checkWholeBoardForMerge();
            return this.boardLog("export");

        } else {

            return false;
        }
    };

    Board.prototype.eliminateTile = function(logicX_logicY) {
        var logicX = parseInt(logicX_logicY.split("_")[0]);
        var logicY = parseInt(logicX_logicY.split("_")[1]);
        var tile = this.getTileAt(logicX, logicY);
        this.boardLog("refresh");
        this.boardLog("destroy", tile);
        this.resetTile(logicX, logicY).collapseColumn(logicX).populateTiles(this.getMaxVal());
        this.checkWholeBoardForMerge();
        return this.boardLog("export");
    };

    Board.prototype.recoverOneMove = function(){

    	this.boardLog("refresh");
        this.incrementMoves();
        return this.boardLog("export");
    };

    Board.prototype.increaseMovesLimit = function(){

    	this.boardLog("refresh");
        this.incrementMaxMoves();
        this.setMoves(this.getMaxMoves());
        return this.boardLog("export");
    };

    Board.prototype.shuffleTiles = function() {

        var logicX = 0;
        var logicY = 0;
        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var shuffledIdArray = shuffleArray(this.getArrayTileIdsByPos());
        var valuesArrayById = this.getArrayTileValuesById();

        this.boardLog("refresh");
        for (logicY = 0; logicY < boardHeight; logicY++) {
            for (logicX = 0; logicX < boardWidth; logicX++) {
                var shuffledId = shuffledIdArray.shift();
                this.getTileAt(logicX, logicY).setValue(valuesArrayById[shuffledId]);
                this.boardLog("posChange", this.getTileAt(logicX, logicY), this.getStringifiedTileLogic(this.getTileById(shuffledId)));

            }
        }
        if (DEBUG_MODE == 1) this.log();
        return this.boardLog("export");
    };

    Board.prototype.swapTiles = function(swapString) {
        var swapArray = swapString.split(",");
        if (swapArray.length > 2) return false;

        var firstTile = this.getTileAt(
            parseInt(swapArray[0].split("_")[0]),
            parseInt(swapArray[0].split("_")[1])
        );

        var secondTile = this.getTileAt(
            parseInt(swapArray[1].split("_")[0]),
            parseInt(swapArray[1].split("_")[1])
        );
        if (this.checkIfNeighbour(firstTile, secondTile) && !this.areEqual(firstTile, secondTile)) {

            this.boardLog("refresh");
            this.swapValues(firstTile, secondTile);
            this.boardLog("posChange", firstTile, this.getStringifiedTileLogic(secondTile));
            this.boardLog("posChange", secondTile, this.getStringifiedTileLogic(firstTile));
            return this.boardLog("export");
        }
        return false;
    };

    Board.prototype.mergeAllX = function(logicX_logicY) {

        var logicX = 0;
        var logicY = 0;
        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var mergeArray = [];
        var lastTile = this.getTileAt(
            parseInt(logicX_logicY.split("_")[0]),
            parseInt(logicX_logicY.split("_")[1])
        );
        var valueToMerge = lastTile.getValue();

        this.boardLog("refresh");

        for (logicY = 0; logicY < boardHeight; logicY++) {
            for (logicX = 0; logicX < boardWidth; logicX++) {

                if (this.getTileAt(logicX, logicY).getValue() !== valueToMerge) continue;

                if (this.getTileAt(logicX, logicY).getId() == lastTile.getId()) continue;

                mergeArray.push(this.getStringifiedTileLogic(this.getTileAt(logicX, logicY)));

            }
        }

        mergeArray.push(logicX_logicY);
        this.merge(mergeArray, true).collapseAll().populateTiles(this.getMaxVal());
        return this.boardLog("export");
    };

// Board - setters and getters
///////////////////////////////////////////////////////////

    Board.prototype.setWidth = function(gridWidth) {

        if (typeof gridWidth === "number") this.gridWidth = gridWidth;

        return this;
    };

    Board.prototype.getWidth = function() {

        return this.gridWidth;
    };

    Board.prototype.setHeight = function(gridHeight) {

        if (typeof gridHeight === "number") this.gridHeight = gridHeight;

        return this;
    };

    Board.prototype.getHeight = function() {

        return this.gridHeight;
    };

    Board.prototype.setMoves = function(moves) {

        if (typeof moves === "number") this.moves = moves;

        return this;
    };

    Board.prototype.getMoves = function() {

        return this.moves;
    };

    Board.prototype.setMaxMoves = function(maxMoves) {

        if (typeof maxMoves === "number") this.maxMoves = maxMoves;

        return this;
    };

    Board.prototype.getMaxMoves = function() {

        return this.maxMoves;
    };

    Board.prototype.setTileFocus = function(logicX_logicY) {

        if (typeof logicX_logicY === "string") this.tileFocus = logicX_logicY;

        return this;
    };

    Board.prototype.getTileFocus = function() {

        return this.tileFocus;
    };

    Board.prototype.setGameInitialised = function() {

        this.gameInitialised = 1;
        return this;
    };

    Board.prototype.getArrayRandom = function(zeroCount, maxVal) {

        if (zeroCount < 1) return false;

        var arrayRandom = [];

        for (var i = 0; i < zeroCount; i++) {

            arrayRandom[i] = generateRandom(maxVal);
        }
        return arrayRandom;
    };

    Board.prototype.getSuitableRandomValueForTile = function(tile){

        var funcCheck = false;

        while (!funcCheck){

            tile.setValue(generateRandom(this.getMaxVal()));
            
            if (!this.checkIfTileHas2OrMoreConnections(tile)) funcCheck = true;
        }

        return this;
    }
    
    Board.prototype.getCountOfNeihbouringTilesHavingThisValue = function(firstTile, value){
        
        var returnArray = [];
        var diff = [{
                        x: 0,
                        y: 1
                    }, {
                        x: 0,
                        y: -1
                    }, {
                        x: 1,
                        y: 0
                    }, {
                        x: -1,
                        y: 0
                    }];

        for (var i = 0; i < diff.length; i++) {

            var secondTile = this.getTileAt(firstTile.getLogicX() + diff[i].x, firstTile.getLogicY() + diff[i].y);

            if ( !secondTile.isGhost() && (secondTile.getValue() === value) ) returnArray.push(secondTile);
        }
        
        return returnArray.length;
    };

    Board.prototype.getZeroCount = function() {

        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var zeroCount = 0;

        for (var logicY = 0; logicY < boardHeight; logicY++) {
            for (var logicX = 0; logicX < boardWidth; logicX++) {

                if (this.getTileAt(logicX, logicY).getValue() === 0) zeroCount++;
            }
        }
        return zeroCount;
    };

    Board.prototype.getValueCount = function(value) {

        if(typeof value !== "number" || value < 1) return false.asInt();

        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var valueCount = 0;

        for (var logicY = 0; logicY < boardHeight; logicY++) {
            for (var logicX = 0; logicX < boardWidth; logicX++) {

                if (this.getTileAt(logicX, logicY).getValue() == value) valueCount++;
            }
        }
        return valueCount;
    };

    Board.prototype.getMaxVal = function() {

        /*var valueArray = this.getTileValuesArrayByPos();
        var distinctValues = {};

        for (var i = 0; i < valueArray.length; i++) {

            if (valueArray[i] === 0) continue;

            if (typeof distinctValues["val_" + valueArray[i]] === "undefined") distinctValues["val_" + valueArray[i]] = 0;
            distinctValues["val_" + valueArray[i]]++;
        }

        return (Math.log(this.getHighestFrequencyKeyValue(distinctValues)) / Math.log(2));*/
        //return (Math.log(generateRandom(2)) / Math.log(2));
        return defaultMaxVal;
    };

    Board.prototype.getHighestFrequencyKeyValue = function(objectToSort) {

        var currValue = 0;
        var hiFreqKey = "";
        var hiFreqArray = [];
        var hiFreqValue;

        for (var currKey in objectToSort) {

            if (currValue < parseInt(objectToSort[currKey])) {

                currValue = objectToSort[currKey];
                hiFreqKey = currKey;
            }
        }

        hiFreqArray = hiFreqKey.split("_");
        hiFreqValue = parseInt(hiFreqArray[1]);

        return hiFreqValue;
    };

    // when addition of all tile values is n, --- > solution = 2^(floor(log n/log 2)
    Board.prototype.getMergedValue = function(total) {

        //return this.computePowerValue(Math.floor(this.computeExponentValue(total)));
        return total + 1;
    };

    // returns tiles at params(logicX, logicY)
    Board.prototype.getTileAt = function(logicX, logicY) {

        if (typeof this.grid[logicX + "_" + logicY] === "undefined") return (new Tile()).setLogicX(logicX).setLogicY(logicY).setGhost();

        return this.grid[logicX + "_" + logicY];
    };

    //  returns tile from Id (tileId)
    Board.prototype.getTileById = function(tileId) {

        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();

        if (typeof(tileId) === "number" && tileId >= 0 && tileId < boardHeight * boardWidth) {
            for (var logicY = 0; logicY < boardHeight; logicY++) {
                for (var logicX = 0; logicX < boardWidth; logicX++) {
                    if (this.getTileAt(logicX, logicY).getId() === tileId) return this.grid[logicX + "_" + logicY];
                }
            }
        } else {
            return (new Tile()).setLogicX(-1).setLogicY(-1).setGhost();
        }
    };

    //  returns a string containing containing the values of all the tiles on board 
    //  using the formula tileValuePositionInString = logicX + logicY*board.height
    Board.prototype.getTileValuesArrayByPos = function() {

        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var valuesArray = [];

        for (var logicY = 0; logicY < boardHeight; logicY++) {
            for (var logicX = 0; logicX < boardWidth; logicX++) {

                valuesArray.push(this.getTileAt(logicX, logicY).getValue());
            }
        }
        return valuesArray;
    };

    // returns array of tile values
    // using the formula tileValuePositionInString = logicX + logicY*board.height
    Board.prototype.getArrayTileValuesById = function() {

        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var valuesArray = [];

        for (var id = 0; id < boardHeight * boardWidth; id++) {

            valuesArray.push(this.getTileById(id).getValue());
        }
        return valuesArray;
    };

    //  returns array of tile IDs
    //  using the formula tileIDPositionInString = logicX + logicY*board.height 
    Board.prototype.getArrayTileIdsByPos = function() {

        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var idArray = [];

        for (var logicY = 0; logicY < boardHeight; logicY++) {
            for (var logicX = 0; logicX < boardWidth; logicX++) {

                idArray.push(this.getTileAt(logicX, logicY).getId());

            }
        }
        return idArray;
    };

    //  get width of largest tile value
    Board.prototype.getMaxDataWidth = function() {

        var logicX = 0;
        var logicY = 0;
        var maxWidth = 0;
        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();

        for (logicY = 0; logicY < boardHeight; logicY++) {
            for (logicX = 0; logicX < boardWidth; logicX++) {

                var localWidth = this.getTileAt(logicX, logicY).getValueWidth();

                if (maxWidth < localWidth) maxWidth = localWidth;

            }
        }
        return maxWidth;
    };

    //  returns position of tile in a string in format "logicX_logicY" if tile exists on board else returns false
    Board.prototype.getStringifiedTileLogic = function(tile) {

        if (tile.isGhost()) return false;

        return tile.getLogicX() + "_" + tile.getLogicY();
    };

    Board.prototype.getStringifiedHint = function() {

        return stringifyArray(this.getHint(), ",");
    };

    Board.prototype.getHint = function() {

        var logicX = 0;
        var logicY = 0;
        var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();
        var hintArray = [];
        for (logicY = 0; logicY < boardHeight; logicY++) {
            for (logicX = 0; logicX < boardWidth; logicX++) {
                var firstTile = this.getTileAt(logicX, logicY);
                var secondTile = this.getTileAt(logicX + 1, logicY);
                var thirdTile = this.getTileAt(logicX, logicY + 1);
                if (this.areEqual(firstTile, secondTile)) {
                    hintArray.push(this.getStringifiedTileLogic(firstTile));
                    hintArray.push(this.getStringifiedTileLogic(secondTile));

                    return hintArray;
                } else {
                    if (this.areEqual(firstTile, thirdTile)) {
                        hintArray.push(this.getStringifiedTileLogic(firstTile));
                        hintArray.push(this.getStringifiedTileLogic(thirdTile));

                        return hintArray;
                    }
                }

            }
        }
        return false;
    };

    Board.prototype.getStringifiedTileValuesByPos = function(){

        return stringifyArray(this.getTileValuesArrayByPos(), ",");
    };

    Board.prototype.getTileByStringifiedTileLogic = function(logicX_logicY){
        var logicX = parseInt(logicX_logicY.split("_")[0]);
        var logicY = parseInt(logicX_logicY.split("_")[1]);
        return this.getTileAt(logicX, logicY);
    };

    Board.prototype.getMergeStringTotalValue = function(mergeString) {
        var arrayPos = mergeString.split(",");
        if (this.validateString(arrayPos) === true) {
            return this.merge(arrayPos, false);
        } else {
            return false;
        }
    };

    Board.prototype.getSurroundingSameValueTiles = function(firstTile){
        
        var returnArray = [];
        var diff = [{
                        x: 0,
                        y: 1
                    }, {
                        x: 0,
                        y: -1
                    }, {
                        x: 1,
                        y: 0
                    }, {
                        x: -1,
                        y: 0
                    }];

        for (var i = 0; i < diff.length; i++) {

            var secondTile = this.getTileAt(firstTile.getLogicX() + diff[i].x, firstTile.getLogicY() + diff[i].y);

            if ( !secondTile.isGhost() && this.areEqual(firstTile,secondTile)) returnArray.push(secondTile);
        }

        return returnArray;
    };

    Board.prototype.getArrayOfConnectedSameValueTiles = function(tile, checkedArray){

        var newTilesArray = this.getSurroundingSameValueTiles(tile),
            returnArray = [];

        if (newTilesArray.length > 0) {

            for (var i = 0; i < newTilesArray.length; i++){

                if (!this.checkIfArrayContainsTile(checkedArray,newTilesArray[i])) returnArray.push(newTilesArray[i]);
            }

        }

        return returnArray;
    };

    Board.prototype.getAllConnectedSameTiles = function(startTile){

        var solutionArray = this.getSurroundingSameValueTiles(startTile),
            checkedArray = [startTile];

        solutionArray.unshift(startTile);

        if (solutionArray.length > 1){
            
            for (var loopIndex = 1; loopIndex < solutionArray.length; loopIndex++){

                var tileTocheck = solutionArray[loopIndex];
                var newSolnArray = this.getArrayOfConnectedSameValueTiles(tileTocheck, checkedArray);

                if (newSolnArray.length > 0){
                    for (var i = 0; i < newSolnArray.length; i++){

                        if (!this.checkIfArrayContainsTile(solutionArray,newSolnArray[i])){
                            
                            solutionArray.push(newSolnArray[i]);

                        }
                    }
                }

                checkedArray.push(tileTocheck);
            }
        }

        return solutionArray;
    };

    Board.prototype.checkIfTileHas2OrMoreConnections = function(startTile){

        var solutionArray = this.getSurroundingSameValueTiles(startTile),
            checkedArray = [startTile];

        solutionArray.unshift(startTile);

        if (solutionArray.length > 1){
            
            for (var loopIndex = 1; loopIndex < solutionArray.length; loopIndex++){

                var tileTocheck = solutionArray[loopIndex];
                var newSolnArray = this.getArrayOfConnectedSameValueTiles(tileTocheck, checkedArray);

                if (newSolnArray.length > 0){
                    for (var i = 0; i < newSolnArray.length; i++){

                        if (!this.checkIfArrayContainsTile(solutionArray,newSolnArray[i])){
                            
                            solutionArray.push(newSolnArray[i]);

                        }
                    }
                }

                if(solutionArray.length > 2) return true;
                checkedArray.push(tileTocheck);
            }
        }

        return false;
    };

    Board.prototype.getStringifiedTileLogicArrayFromTilesArray = function(arrayTiles){

        var logicArray = [];

        for (var i = 0; i < arrayTiles.length; i++){

            logicArray.push(this.getStringifiedTileLogic(arrayTiles[i]));
        }

        return stringifyArray(logicArray, ",");
    };

    Board.prototype.getTileLogicArrayFromTilesArray = function(arrayTiles){

        var logicArray = [];

        for (var i = 0; i < arrayTiles.length; i++){

            logicArray.push(this.getStringifiedTileLogic(arrayTiles[i]));
        }

        return logicArray;
    };

    Board.prototype.checkIfTilesAreNeighboursAndAreEqual = function(firstLogicString, secondLogicString){
        var firstTile = this.getTileByStringifiedTileLogic(firstLogicString);
        var secondTile = this.getTileByStringifiedTileLogic(secondLogicString);
        if(this.checkIfNeighbour(firstTile, secondTile) && this.areEqual(firstTile, secondTile)) return true;
        return false;
    };

    Board.prototype.customCheckIfTilesAreNeighbours = function(firstLogicString, secondLogicString){
        var firstTile = this.getTileByStringifiedTileLogic(firstLogicString);
        var secondTile = this.getTileByStringifiedTileLogic(secondLogicString);
        if(this.checkIfNeighbour(firstTile, secondTile)) return true;
        return false;
    };

    Board.prototype.customCheckIfTilesAreEqual = function(firstLogicString, secondLogicString){
        var firstTile = this.getTileByStringifiedTileLogic(firstLogicString);
        var secondTile = this.getTileByStringifiedTileLogic(secondLogicString);
        if(this.areEqual(firstTile, secondTile)) return true;
        return false;
    };

    Board.prototype.checkIfArrayContainsTile = function(array, tile){

        if (array.length == 0) return false;

        for (var i = 0; i < array.length; i++){

            if (array[i].getId() == tile.getId()) return true;
        }

        return false;
    };

    Board.prototype.getLargestTileOnBoard = function(){

        var logicX = 0,
            logicY = 0,
            val = 0,
            boardHeight = this.getHeight(),
            boardWidth = this.getWidth();

    
        for (logicY = 0; logicY < boardHeight; logicY++) {
            for (logicX = 0; logicX < boardWidth; logicX++) {
             
                var tileValue = this.getTileAt(logicX, logicY).getValue();
                
                if (tileValue > val) val = tileValue;
                
            }
        }

        return val;
    }

// Tile
///////////////////////////////////////////////////////////

    function Tile() {

        this.logicX = -1; // column number
        this.logicY = -1; // row number
        this.id = Tile.prototype.currId++; // tile unique id
        this.value = 0; // tile value will store the numbers
        this.ghost = false; // feature to test against inexisting tiles using the this.isGhost() function
        this.board = {}; // the board on which the tile is
    };

    Tile.prototype.loadConfig = function(config) {

        for (var aVal in config)
            if (config.hasOwnProperty(aVal) && typeof this[aVal] !== "undefined") this[aVal] = config[aVal];

        return this;
    };

// Tile - setters and getters
///////////////////////////////////////////////////////////

    Tile.prototype.getValue = function() {

        if (this.ghost) return -1;
        return this.value;
    };

    Tile.prototype.getValueWidth = function() {

        if (this.ghost) return -1;
        return ("" + this.value).length;
    };

    Tile.prototype.setValue = function(value) {

        if (typeof value === "number") this.value = value;

        return this;
    };

    Tile.prototype.getBoard = function() {

        return this.board;
    };

    Tile.prototype.setBoard = function(board) {

        if (typeof board === "object") this.board = board;

        return this;
    };

    Tile.prototype.isGhost = function() {

        return this.ghost;
    };

    Tile.prototype.setGhost = function(ghost) {

        if (typeof ghost !== "boolean") ghost = true;

        this.ghost = ghost;
        this.id = -1;

        return this;
    };

    Tile.prototype.getId = function() {

        return this.id;
    };

    Tile.prototype.getLogicX = function() {

        return this.logicX;
    };

    Tile.prototype.setLogicX = function(logicX) {

        if (typeof logicX === "number") this.logicX = logicX;

        return this;
    };

    Tile.prototype.getLogicY = function() {

        return this.logicY;
    };

    Tile.prototype.setLogicY = function(logicY) {

        if (typeof logicY === "number") this.logicY = logicY;

        return this;
    };

// public functions & variables
///////////////////////////////////////////////////////////

    function shuffleArray(array) {

        var m = array.length,
            t, i;
        // While there remain elements to shuffle…
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    function emptyArray(arrayToEmpty) {

        if (arrayToEmpty.length !== 0) arrayToEmpty.length = 0;

        return arrayToEmpty;
    }

    function padValue(value, maxWidth) {

        var valueWidth = ("" + value).length;
        var leftPadding = "";
        var rightPadding = "";
        var j = 0;

        if (valueWidth < maxWidth) {

            for (j = 0; j < maxWidth - valueWidth; j++) {

                if (j % 2 === 0) {

                    leftPadding += " ";

                } else {

                    rightPadding += " ";

                }
            }
        }

        return "[ " + leftPadding + value + rightPadding + " ]";
    }

    function stringifyArray(arrayToStringify, delimiter) {

        var returnString = "";

        if (arrayToStringify.length == 0) return returnString;

        for (var i = 0; i < arrayToStringify.length; i++) {

            if (i === arrayToStringify.length - 1) {

                returnString += arrayToStringify[i];

            } else {

                returnString += arrayToStringify[i] + delimiter;

            }
        }
        return returnString;
    }

    function generateRandom(maxVal) {

        // defining the probabilities of our probability distribution table
       /* var tableProb = [0.2, 0.4, 0.6,0.8,1];
        var min = 0;
        var max = 0;

        if (maxVal < 2) maxVal = 2;

        // defining the possibilities of our probability distribution table
        var tableOutput = [maxVal - 2, maxVal - 1, maxVal, maxVal + 1, maxVal + 2];

        var random = Math.random();

        for (var i = 0; i < tableProb.length; i++) {

            min = 0;
            max = tableProb[i];

            if (i - 1 >= 0) min = tableProb[i - 1];

            if (min < random && random <= max) return tableOutput[i];

        }*/

        return Math.ceil(Math.random()*maxVal);
    }

    Boolean.prototype.asInt = function(){

        return (this.valueOf()) ? 1 : 0;
    };

    var logicaLoaded = true;
    var defaultMaxVal = 5;

// jS debug only -- game automatic launch in browser --
///////////////////////////////////////////////////////////

    var DEBUG_MODE = 0;
    
    
    
    //board.boardLog("export") does not work with debug. I do not know why...
/*
    if (DEBUG_MODE == 1) {
        var board = new Board();
        window.console.clear();
        board.init(5, 5, 5, 5);
        //board.init(5, 5, 5, 5, "2,4,2,2,2,8,2,2,4,2,2,2,2,8,4,8,2,8,4,2,4,8,2,2,8");
    }      
 */

// Game Preparation and External Command lines
///////////////////////////////////////////////////////////   

    if (typeof(window.playtouch) !== "object") window.playtouch = {};
    playtouch.Board = Board;


    /*
                external command lines
        
    
    To initialise a new board at start of the game with or without a savegame ----> 
    window.playtouch.gameMain = (new playtouch.Board()).init(gridWidth, gridHeight, maxVal, savedGameData);

    To make a move selecting tile 2_0 and tile 1_0 ----> 
    playtouch.gameMain.playerMove("1_0,2_0");

    To get the total of selected tiles with logic string 2_0 and 1_0 ----> 
    playtouch.gameMain.getMergeStringTotalValue("1_0,2_0");

    To shuffle tiles on board ----> 
    playtouch.gameMain.shuffleTiles();
    
    To swapTiles tiles 2_0 and 1_0 on board ----> 
    playtouch.gameMain.swapTiles("1_0,2_0");

    To eliminate Tile 1_0 on board ----> 
    playtouch.gameMain.eliminateTile("1_0");

    To merge All similar tiles onto 1_0 on board ----> 
    playtouch.gameMain.mergeAllX("1_0");

    To get x coordinate corresponding to logic X ----> 
    playtouch.gameMain.computeX(logicX, offsetX, gridCellWidth);

    To get y coordinate corresponding to logic Y ----> 
    playtouch.gameMain.computeY(logicY, offsetY, gridCellHeight);
    
    To get gameData for savegames or board updates ---->
    playtouch.gameMain.exportGameData();

    To get the power value of base 2 exponent (2^exponent) ---->
    playtouch.gameMain.computePowerValue(exponent);
    
    To check If 2 Tiles with stringified logics firstLogicString & secondLogicString Are Neighbours And Are Equal ----> 
    playtouch.gameMain.checkIfTilesAreNeighboursAndAreEqual(firstLogicString, secondLogicString);

    To get the number of tiles having value (value) ---->
    playtouch.gameMain.getValueCount(value);

    To get stringified hint of two string logic positions separated by "," ---->
    playtouch.gameMain.getStringifiedHint();

    To check For Game Over ---->
    playtouch.gameMain.checkForGameOver();
    
    */