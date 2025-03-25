//V1.0.1

// Board
///////////////////////////////////////////////////////////

    function Board() {
        this.gridWidth = 0; // length on x
        this.gridHeight = 0; // length on y
        this.grid = []; // array to store tiles
        this.boardData = []; // array to store tiles
        this.solutionData = []; // array to store solutions
        this.changeLog = {}; // object to store changes on board after a move
        this.solutionsDisplay = {						//solutions display data
        							"maxLength":0,
        							"total":0, 
        							"data":[]
        						}; 
        this.gameInitialised = 0; // param to know if board has been created or not
    };

    Board.prototype.initLevelFromPack = function(levelData) {

        /* levelData sample format
        {
        "s": "3_3",
        "f": ["0_0_30", "0_1_11", "0_2_19", "1_0_13", "1_1_26", "1_2_5", "2_0_2", "2_1_10", "2_2_50"],
        "e": [{
            "i": ["0_0_30", "-1_-1_-", "0_1_11_0", "-1_-1_=", "0_2_19_0"]
        }, {
            "i": ["2_0_2_0", "-1_-1_*", "1_0_13", "-1_-1_=", "1_1_26_0"]
        }, {
            "i": ["2_2_50_0", "-1_-1_/", "2_1_10_0", "-1_-1_=", "1_2_5"]
        }]
        }

        */

        var gridWidth = parseInt((levelData.s).split("_")[0]);
        var gridHeight = parseInt((levelData.s).split("_")[1]);
        var boardData = this.transformArray(levelData.f,gridHeight);
        var solutionData = this.transformSolutionArray(levelData.e,gridHeight);

        Tile.prototype.currId = 0;
        return this.boardLog("initializeBoardLog")
                .setWidth(gridWidth)
                .setHeight(gridHeight)
                .setBoardData(boardData)
                .setSolutionData(solutionData)
                .createTiles()
                .assignTileValuesOnBoard()
                .setGameInitialised();
    };

    Board.prototype.transformLogicY = function(stringToTransform,gridHeight){
        
        var arrayToTransform = stringToTransform.split("_");
        var logicY = parseInt(arrayToTransform[1]);

        if(logicY == -1) return stringToTransform;

        arrayToTransform[1] = (gridHeight - logicY - 1);
        
        return stringifyArray(arrayToTransform, "_");;
    };

    Board.prototype.transformArray = function(arrayToTransform,gridHeight){
  
        var transformedArray = [];

        for(var i = 0; i < arrayToTransform.length; i++){
  
            transformedArray.push(this.transformLogicY(arrayToTransform[i],gridHeight));

        }

        return transformedArray;
    };

    Board.prototype.transformSolutionArray = function(solutionArrayToTransform,gridHeight){

        var transformedSolutionArray = [];

        for(var j = 0; j < solutionArrayToTransform.length; j++){

            var solutionSubArray = solutionArrayToTransform[j].i;
            var transformedSubArray = this.transformArray(solutionSubArray,gridHeight);

            this.addToSolutionsDisplayData(transformedSubArray);
            transformedSolutionArray[j] = [0].concat(transformedSubArray);
        }

        return transformedSolutionArray;
    };

    Board.prototype.transformSelectionStringArray = function(selectionStringArray){

    	var transformedSelectionStringArray = [];

    	for(var i = 0; i < selectionStringArray.length; i++){

    		var logicString = selectionStringArray[i];

    		transformedSelectionStringArray.push(this.getTileByStringifiedTileLogic(logicString).getTag());
    	}
    	return transformedSelectionStringArray;
    };

    Board.prototype.reduceDisplayTagToTileTag = function(displayTag){

    	var displayTagArray = displayTag.split("_");
    	var returnTagArray = [];

    	for (var i = 0; i < 3; i++){

    		returnTagArray[i] = displayTagArray[i];
    	}

    	return stringifyArray(returnTagArray,"_");
    };

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

    Board.prototype.assignTileValuesOnBoard = function() {

        var boardData = this.getBoardData();
        var index;

        for (index in boardData){

            var logicX = parseInt(boardData[index].split("_")[0]),
                logicY = parseInt(boardData[index].split("_")[1]),
                value = parseInt(boardData[index].split("_")[2]),
                tag = boardData[index],
                displayID = this.getDisplayIDWithTileTag(boardData[index]);

            this.getTileAt(logicX, logicY).setValue(value).setTag(tag).setDisplayID(displayID);
            this.boardLog("create", this.getTileAt(logicX, logicY));
        }

        if (DEBUG_MODE == 1) this.log();
        return this;
    };

    Board.prototype.validateSelectionStringArray = function(arraySelection, booleanParam) {

    	var solutionsArray = this.getSolutionData();
    	var isSelectionValid = false;
    	var index;

    	for(var i = 0; i < solutionsArray.length; i++){

    		var currSolution = solutionsArray[i];

    		if(currSolution[0] !== 0) continue;

    		var currValues = [];

    		for(var j = 1; j < currSolution.length; j++){

    			if(parseInt(currSolution[j].split("_")[0]) !== -1) currValues.push(this.reduceDisplayTagToTileTag(currSolution[j]));

    		}

    		if(JSON.stringify(arraySelection) == JSON.stringify(currValues)) {

    			isSelectionValid = true;
    			index = i;
    			break;
    		}
    	}

    	if(isSelectionValid){

    		if(booleanParam){

    				this.validateEquation(index);
    				return this;

    		}else{

    				return true;
    		}

    	}else{
 
    		return false;
    	}
    };

    Board.prototype.validateEquation = function(index){

        this.solutionData[index][0] = 1;
        return this;
    };

    Board.prototype.destroySelectionArray = function(selectionString){

    	this.boardLog("refresh");

    	var arraySelection = selectionString.split(",");

    	for(var i = 0; i < arraySelection.length; i++){

    		var currLogicString = arraySelection[i];
    		var logicX = parseInt(currLogicString.split("_")[0]);
       		var logicY = parseInt(currLogicString.split("_")[1]);
 			var tile = this.getTileAt(logicX,logicY);

 			this.boardLog("destroy", tile);
 			this.resetTile(logicX, logicY);
 			
    	}

        return this;
    };

    Board.prototype.checkForGameOver = function() {

    	var solutionsArray = this.getSolutionData();

    	for(var i = 0; i < solutionsArray.length; i++){

    		var currSolution = solutionsArray[i];

    		if(currSolution[0] == 0) return false;
    	}

        return true;
    };

    Board.prototype.addToSolutionsDisplayData = function(transformedSubArray){

    	var solutionLength = transformedSubArray.length,
    		maxLength = this.getSolutionsDisplayInfo("maxLength"),
    		total = this.getSolutionsDisplayInfo("total"),
    		solutionObj = this.convertArrayToSolutionDataObj(transformedSubArray);

    	if(solutionLength > maxLength) this.setSolutionsDisplayInfo("maxLength",solutionLength);
    	this.setSolutionsDisplayInfo("data",solutionObj,total);
    	total++;
    	this.setSolutionsDisplayInfo("total",total);

    	return this;
    };

    Board.prototype.convertArrayToSolutionDataObj = function(transformedSubArray){
    	
    	var solvedSolution = [], displaySolution = [];

    	for(var i = 0; i < transformedSubArray.length; i++){

    		var solvedOutput, displayOutput, tag = transformedSubArray[i];

    		if(parseInt(tag.split("_")[0]) == -1) {

    			solvedOutput = tag;
    			displayOutput = tag.split("_")[2];
    		
    		}else if(tag.split("_").length = 4 && parseInt(tag.split("_")[3]) == 0) {

    			solvedOutput = this.reduceDisplayTagToTileTag(tag);
    			displayOutput = "";
    		}else{

   				solvedOutput = this.reduceDisplayTagToTileTag(tag);
    			displayOutput = tag.split("_")[2];
    		}

    		solvedSolution.push(solvedOutput);
    		displaySolution.push(displayOutput);
    	}

    	var solutionObj = {	
    						"solvedSolution": solvedSolution,
    						"displaySolution": displaySolution
    						};

    	return solutionObj;
    };

// ------------------------------------------------------------------------------------------------
////
    
    // creates all elements of the game board
    Board.prototype.init = function(gridWidth, gridHeight, meanValue, savedGameData) {
        
        if (typeof gridWidth !== "number" || gridWidth < 1) gridWidth = 5;
        if (typeof gridHeight !== "number" || gridHeight < 1) gridHeight = gridWidth;
        if (typeof savedGameData == "undefined"){
            var parameter = meanValue;
        }else{
            var parameter = savedGameData;
        }

        Tile.prototype.currId = 0;
        return this.boardLog("initializeBoardLog")
                .setWidth(gridWidth)
                .setHeight(gridHeight)
                .createTiles()
                .populateTiles(parameter)
                .setGameInitialised();
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
            var meanValue = parameter;
            if (typeof meanValue !== "number" || meanValue < 2) meanValue = 2;
            var zeroCount = this.getZeroCount();
            if (zeroCount < 1) return this;
            var arrayRandom = this.getArrayRandom(zeroCount, meanValue);
            for (var logicY = 0; logicY < boardHeight; logicY++) {
                for (var logicX = 0; logicX < boardWidth; logicX++) {
                    if (this.getTileAt(logicX, logicY).getValue() === 0){
                        this.getTileAt(logicX, logicY).setValue(arrayRandom.shift());
                        this.boardLog("create", this.getTileAt(logicX, logicY));
                    }
                }
            }
        }
        if (DEBUG_MODE == 1) this.log();
        return this;
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
            total += this.getTileAt(logicX, logicY).getValue();

            if(active){
            	if (i == arrayPos.length - 1) {
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

    // sets value of tiles to zero
    Board.prototype.resetTile = function(logicX, logicY) {

        this.getTileAt(logicX, logicY).setValue(0).setTag("").setDisplayID("");

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
        return this;
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
        var tagBuffer = firstTile.getTag();
        var displayIDBuffer = firstTile.getDisplayID();

        firstTile.setValue(secondTile.getValue()).setTag(secondTile.getTag()).setDisplayID(secondTile.getDisplayID());
        secondTile.setValue(valueBuffer).setTag(tagBuffer).setDisplayID(displayIDBuffer);

        return this;
    };

    Board.prototype.exportGameData = function(){

        return this.getStringifiedTileValuesByPos();
    };

    Board.prototype.boardLog = function(command, tile, paramStr) {

        switch (command) {

            case "initializeBoardLog":
                this.changeLog = {"isInUse":false,"merge":{}, "destroy":[], "posChange":[], "create":[]};
                break;

            case "refresh":
                if (this.changeLog.isInUse) {
                    this.changeLog = {"isInUse":false,"merge":{}, "destroy":[], "posChange":[], "create":[]};
                }
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

            case "merge":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.merge =  {
                                        "logicX":tile.getLogicX(),
                                        "logicY":tile.getLogicY(),
                                        "value":tile.getValue()
                                        };
                break;

            case "destroy":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.destroy.push(
                                            {
                                            "logicX":tile.getLogicX(),
                                            "logicY":tile.getLogicY()
                                            }
                                            );
                break;

            case "posChange":
                if (!this.changeLog.isInUse) this.changeLog.isInUse = true;
                this.changeLog.posChange.push(
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
                this.changeLog.create.push(
                                            {
                                            "logicX":tile.getLogicX(),
                                            "logicY":tile.getLogicY(),
                                            "value":tile.getValue(),
                                            "tag":tile.getTag()
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
    Board.prototype.computeExponentValue = function(powerValue){
        if(typeof powerValue !== "number" || powerValue < 1) return false;
        return Math.log(powerValue) / Math.log(2);
    };

// Board - Player Moves
///////////////////////////////////////////////////////////
    

    Board.prototype.old_playerMove = function(mergeString) {

        /*  returns "Invalid Move" if received mergeString is invalid
        calls "this.merge" if received mergeString is valid */

        var arrayPos = mergeString.split(",");

        if (this.validateString(arrayPos) === true) {
            this.boardLog("refresh");
            this.merge(arrayPos, true).collapseAll().populateTiles(this.getMeanValue());
            return this.boardLog("export");

        } else {

            return false;

        }
    };
  
    Board.prototype.playerMove = function(selectionString) {

       	if(this.checkForGameOver()) return false;

        var arraySelection = this.transformSelectionStringArray(selectionString.split(","));

        if (this.validateSelectionStringArray(arraySelection, false)) {

            this.boardLog("refresh");
            this.validateSelectionStringArray(arraySelection, true).destroySelectionArray(selectionString).collapseAll();

            if (DEBUG_MODE == 1) this.log();
            return this.boardLog("export");

        } else {

        	if (this.boardNeedToBeForceSolved()) return this.forceSolveFirstUnsolved();

            return false;
        }
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

    Board.prototype.eliminateTile = function(logicX_logicY) {
        var logicX = parseInt(logicX_logicY.split("_")[0]);
        var logicY = parseInt(logicX_logicY.split("_")[1]);
        var tile = this.getTileAt(logicX, logicY);
        this.boardLog("refresh");
        this.boardLog("destroy", tile);
        this.resetTile(logicX, logicY).collapseColumn(logicX).populateTiles(this.getMeanValue());
        return this.boardLog("export");
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
        this.merge(mergeArray, true).collapseAll().populateTiles(this.getMeanValue());
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

    Board.prototype.setBoardData = function(boardData){

        this.boardData = boardData;
        return this;
    };
    
    Board.prototype.getBoardData = function(){

        return this.boardData;
    };

    Board.prototype.getStringifiedBoardData = function(){

        var boardData = this.getBoardData();
        return stringifyArray(boardData,",");
    };

    Board.prototype.setSolutionData = function(solutionData){

        this.solutionData = solutionData;
        return this;
    };

    Board.prototype.getSolutionData = function(){

        return this.solutionData;
    };

    Board.prototype.getSolutionDataLength = function(){

        var solutionsArray = this.solutionData;
        return solutionsArray.length;
    };

    Board.prototype.getSolutionDataByIndex = function(index){

        return this.getSolutionData()[parseInt(index)];
    };

    Board.prototype.setSolutionsDisplayInfo = function(key,value,index){

    	switch(key) {

    		case "maxLength":
                if(typeof value === "number" && value >= 0) this.solutionsDisplay.maxLength = value;
                break;

            case "total":
                if(typeof value === "number" && value >= 0) this.solutionsDisplay.total = value;
                break;
                
            case "data":
                if(typeof value === "object") this.solutionsDisplay.data[index] = value;
                break;

            default:
            	break;
    	}

    	return this;
    };

    Board.prototype.getSolutionsDisplayInfo = function(key,index){

    	var queryReturn;

    	switch(key) {

    		case "maxLength":
                queryReturn = this.solutionsDisplay.maxLength;
                break;

            case "total":
                queryReturn = this.solutionsDisplay.total;
                break;
                
            case "data":
                queryReturn = this.solutionsDisplay.data[index];
                break;

            default:
            	queryReturn = this;
    	}

    	return queryReturn;
    };

    Board.prototype.getDisplayInfoMaxLength = function(){

        return this.getSolutionsDisplayInfo("maxLength");
    };

    Board.prototype.getDisplayInfoTotalSolutions = function(){

        return this.getSolutionsDisplayInfo("total");
    };

    Board.prototype.getSolvedSolutionByIndex = function(index){

    	var queryReturn = "";

    	if(typeof index == "number" && index < this.getSolutionsDisplayInfo("total") && index >= 0) {

    		queryReturn = this.getSolutionsDisplayInfo("data",index).solvedSolution;
    	}
    	
    	return queryReturn;
    };

    Board.prototype.getDisplaySolutionByIndex = function(index){

    	var queryReturn = "";

    	if(typeof index == "number" && index < this.getSolutionsDisplayInfo("total") && index >= 0) {

    		queryReturn = this.getSolutionsDisplayInfo("data",index).displaySolution;
    	}
    	
    	return queryReturn;
    };

    Board.prototype.getStringifiedSolvedSolutionByIndex = function(index){

        return stringifyArray(this.getSolvedSolutionByIndex(index),",");
    };

    Board.prototype.getStringifiedDisplaySolutionByIndex = function(index){

        return stringifyArray(this.getDisplaySolutionByIndex(index),",");
    };

    Board.prototype.getSolvedSolutionTileTagByDisplayID = function(displayID){

    	var index = parseInt(displayID.split("_")[0]),
    		cell = parseInt(displayID.split("_")[1]);

    	return this.getSolvedSolutionByIndex(index)[cell];
    };

    Board.prototype.getDisplaySolutionTileValueByDisplayID = function(displayID){

    	var index = parseInt(displayID.split("_")[0]),
    		cell = parseInt(displayID.split("_")[1]);

    	return this.getDisplaySolutionByIndex(index)[cell];
    };

    Board.prototype.getDisplayIDWithTileTag = function(tag){

    	var solution = 0, index = 0, totalSol = this.getDisplayInfoTotalSolutions();

    	for(var sol = 0; sol < totalSol; sol++){

    		var solvedSolArr = this.getSolvedSolutionByIndex(sol);
    		
    		for (var leng in solvedSolArr){

    			if (!solvedSolArr.hasOwnProperty(leng)) continue;
    			var displayID = sol+"_"+leng;

    			if(tag == this.getSolvedSolutionTileTagByDisplayID(displayID)){

    				return displayID;
    			}
    		}
    	}
    	return "";
    };

    Board.prototype.getTileByTag = function(tag){

		var boardHeight = this.getHeight();
        var boardWidth = this.getWidth();

        for (var logicY = 0; logicY < boardHeight; logicY++) {
            for (var logicX = 0; logicX < boardWidth; logicX++) {

                var tile = this.getTileAt(logicX,logicY);

                if (tile.getTag() === tag) return tile;
            }
        }

    	return (new Tile()).setLogicX(logicX).setLogicY(logicY).setGhost();
    };

    Board.prototype.getTileSolutionIndexWithStringifiedLogic = function(logicString){

    	return parseInt(this.getTileByStringifiedTileLogic(logicString).getDisplayID().split("_")[0]);
    };

    Board.prototype.setGameInitialised = function() {

        this.gameInitialised = 1;
        return this;
    };

    Board.prototype.getArrayRandom = function(zeroCount, meanValue) {

        if (zeroCount < 1) return false;

        var arrayRandom = [];

        for (var i = 0; i < zeroCount; i++) {

            arrayRandom[i] = this.computePowerValue(generateRandom(meanValue));
        }
        return arrayRandom;
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

		if(typeof value !== "number" || value < 2) return false.asInt();

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

    Board.prototype.getMeanValue = function() {

        /*var valueArray = this.getTileValuesArrayByPos();
        var distinctValues = {};

        for (var i = 0; i < valueArray.length; i++) {

            if (valueArray[i] === 0) continue;

            if (typeof distinctValues["val_" + valueArray[i]] === "undefined") distinctValues["val_" + valueArray[i]] = 0;
            distinctValues["val_" + valueArray[i]]++;
        }

        return (Math.log(this.getHighestFrequencyKeyValue(distinctValues)) / Math.log(2));*/
        return (Math.log(generateRandom(2)) / Math.log(2));
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

        return this.computePowerValue(Math.floor(this.computeExponentValue(total)));
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

    Board.prototype.getTileTag = function(logicString){

    	var tile = this.getTileByStringifiedTileLogic(logicString);

    	return tile.getTag();
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

    Board.prototype.getUnsolvedEquationCount = function(){

    	var totalEquations = this.getDisplayInfoTotalSolutions();
    	var unsolvedCount = 0;

    	for (var index = 0; index < totalEquations; index++){

    		if (this.getSolutionDataByIndex(index)[0] === 0) unsolvedCount += 1;
    	}

    	return unsolvedCount;
    };

    Board.prototype.boardNeedToBeForceSolved = function(){

    	if (this.getHint().length === 0 && this.getUnsolvedEquationCount() > 0) return true;
    	return false;
    };
    
    Board.prototype.forceSolveFirstUnsolved = function(){

    	var totalEquations = this.getDisplayInfoTotalSolutions();

    	for (var index = 0; index < totalEquations; index++){

    		if (this.getSolutionDataByIndex(index)[0] === 0) {

    			var selectionString = this.getSolutionSelectionString(index);
    			return this.playerMove(selectionString)
    		}
    	}

        return this;
    };

    Board.prototype.getNextUnsolvedSelectionStringAndIndex = function(){

    	var totalEquations = this.getDisplayInfoTotalSolutions();
    	var selectionString_index = 0;

    	for (var index = 0; index < totalEquations; index++){

    		if (this.getSolutionDataByIndex(index)[0] === 0) {

    			var returnArray = [];
    			returnArray[0] = this.getSolutionSelectionString(index);
    			returnArray[1] = index;
    			return returnArray;
    		}
    	}

    	return [];
    };

    Board.prototype.getSolutionSelectionString = function(index){

    	var numberTilesTag = this.returnNbTilesTagArrayFromEquation(this.getSolvedSolutionByIndex(index));
    	var logicArray = this.convertTagArrayToTileLogiStringArray(numberTilesTag);

    	return stringifyArray(logicArray, ",");
    };

    Board.prototype.getStringifiedHint = function() {

        return stringifyArray(this.getHint(), ",");
    };

	Board.prototype.getHint = function() {

        var hintArray = [];
        var totalSolutions = this.getDisplayInfoTotalSolutions();

        for (var index = 0; index < totalSolutions; index++){

        	if (this.solutionData[index][0] === 1) continue;

        	var numberTilesTag = this.returnNbTilesTagArrayFromEquation(this.getSolvedSolutionByIndex(index));

            hintArray = this.returnHintTilesContainingSolution(numberTilesTag);

            if (hintArray.length < 3) {

                hintArray = [];
            }else{

                return hintArray;
            }
        }

        return [];
    };

    Board.prototype.returnValuesFromEquation = function(equationCells) {
 
        var valuesOnlyArray = [];

		// equationCells format ["1_1_8", "-1_-1_/", "0_1_2", "-1_-1_=", "0_0_4"]

        for (var i = 0; i < equationCells.length; i++){

            if (parseInt(equationCells[i].split("_")[0]) === -1) continue;

            var value = parseInt(equationCells[i].split("_")[2]);
            valuesOnlyArray.push(value);
        }

        return valuesOnlyArray;
    };

    Board.prototype.returnNbTilesTagArrayFromEquation = function(solutionArray){

    	var numbersOnlyArray = [];

		// solutionArray format ["1_1_8", "-1_-1_/", "0_1_2", "-1_-1_=", "0_0_4"]

        for (var i = 0; i < solutionArray.length; i++){

        	var tag = solutionArray[i];

            if (parseInt(tag.split("_")[0]) === -1) continue;

            numbersOnlyArray.push(tag);
        }

        return numbersOnlyArray;
    };

    Board.prototype.returnHintTilesContainingSolution = function (numberTilesTag) {

        for (var i = 0; i < numberTilesTag.length - 1; i++){

        	var firstTile = this.getTileByTag(numberTilesTag[i]+""),
        		secondTile = this.getTileByTag(numberTilesTag[i+1]+"");

        	if (!this.checkIfNeighbour(firstTile, secondTile)) return [];
            
        }

        return this.convertTagArrayToTileLogiStringArray(numberTilesTag);
    };

    Board.prototype.convertTagArrayToTileLogiStringArray = function(numberTilesTag){

    	var logicArray = [];

    	for (var i = 0; i < numberTilesTag.length; i++){

        	var tile = this.getTileByTag(numberTilesTag[i]+"");
        	logicArray.push(this.getStringifiedTileLogic(tile));
        }

        return logicArray;
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


// Tile
///////////////////////////////////////////////////////////

    function Tile() {

        this.logicX = -1; // column number
        this.logicY = -1; // row number
        this.id = Tile.prototype.currId++; // tile unique id
        this.value = 0; // tile value will store the numbers
        this.tag = ""; // tile tag will store the tile identifier text
        this.displayID = ""; // tile displayID will store the solutions display identifier
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

    Tile.prototype.getTag = function() {

        if (this.ghost) return "";
        return this.tag;
    };

    Tile.prototype.setTag = function(tag) {

        if (typeof tag === "string") this.tag = tag;

        return this;
    };

    Tile.prototype.getDisplayID = function() {

        if (this.ghost) return "";
        return this.displayID;
    };

    Tile.prototype.setDisplayID = function(displayID) {

        if (typeof displayID === "string") this.displayID = displayID;

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

    function generateRandom(meanValue) {

        // defining the probabilities of our probability distribution table
        var tableProb = [0.5, 0.8, 1];
        var min = 0;
        var max = 0;

        if (meanValue < 2) meanValue = 2;

        // defining the possibilities of our probability distribution table
        var tableOutput = [meanValue - 1, meanValue, meanValue + 1];

        var random = Math.random();

        for (var i = 0; i < tableProb.length; i++) {

            min = 0;
            max = tableProb[i];

            if (i - 1 >= 0) min = tableProb[i - 1];

            if (min < random && random <= max) return tableOutput[i];

        }
    }

    Boolean.prototype.asInt = function(){

        return (this.valueOf()) ? 1 : 0;
    };

    var logicaLoaded = true;

// jS debug only -- game automatic launch in browser --
///////////////////////////////////////////////////////////

    var DEBUG_MODE = 0;
    
    //board.boardLog("export") does not work with debug. I do not know why...
    /*
    if (DEBUG_MODE == 1) {
        var board = new Board();
        window.console.clear();
        board.initLevelFromPack({
        "s": "3_3",
        "f": ["0_0_30", "0_1_11", "0_2_19", "1_0_13", "1_1_26", "1_2_5", "2_0_2", "2_1_10", "2_2_50"],
        "e": [{
            "i": ["0_0_30", "-1_-1_-", "0_1_11_0", "-1_-1_=", "0_2_19_0"]
        }, {
            "i": ["2_0_2_0", "-1_-1_*", "1_0_13", "-1_-1_=", "1_1_26_0"]
        }, {
            "i": ["2_2_50_0", "-1_-1_/", "2_1_10_0", "-1_-1_=", "1_2_5"]
        }]
        });
        //board.init(5, 5, "2,4,2,2,2,8,2,2,4,2,2,2,2,8,4,8,2,8,4,2,4,8,2,2,8");
    }
    */
   
    
// Game Preparation and External Command lines
///////////////////////////////////////////////////////////   

    if (typeof(window.playtouch) !== "object") window.playtouch = {};
    playtouch.Board = Board;
    /*
                external command lines
        
    
    To initialise a new board at start of the game with or without a savegame ----> 
    window.playtouch.gameMain = (new playtouch.Board()).init(gridWidth, gridHeight, meanValue, savedGameData);

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