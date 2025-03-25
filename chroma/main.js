(function(){
var pendingLog = [];
var Tile = function(grid, x, y){
	this.type = 10; //0-9 reserved for special tiles
	//types = 0 dead pixel,    , 10 = colorable
	this.MAX_COLOR = 6;
	this.color = 10; //0-9 reserved for special tiles
	this.logicX = (typeof x === "number") ? x: -1;
	this.logicY = (typeof y === "number") ? y: -1;
	this.conquered = false;
	this.ghost = false;
	this.checked = false;
	this.secured = false;
	this.grid = grid;
};
Tile.prototype.setType = function(type){
	if(typeof type !== "number") type = 0;
	var wasConquerable = this.isConquerable();
	if(this.type !== type) this.getGrid().historyStack.lastChanges[this.logicX+"_"+this.logicY] = {c:this.getColor(), t:type};
	this.type = type;
	if(wasConquerable && (!this.isConquerable() && this.neverBecomesConquerable())) /*&& this.neverBecomesConquerable())*/ this.getGrid().removeFromRemaining(this); // && this.type !== 2
	return this;
};
Tile.prototype.getType = function(){
	return this.type;
};
Tile.prototype.setColor = function(color){
	if(typeof color !== "number") color = 10;
	this.color = color;
	return this;
};
Tile.prototype.getColor = function(){
	return this.color;
};
Tile.prototype.getLogicX = function(){
	return this.logicX;
};
Tile.prototype.getLogicY = function(){
	return this.logicY;
};
Tile.prototype.setGhost = function(isGhost){
	if(typeof isGhost !== "boolean") isGhost = true;
	this.ghost = isGhost;
	return this;
};
Tile.prototype.setConquered = function(isConquered){
	if(typeof isConquered !== "boolean") isConquered = true;
	if(this.conquered !== isConquered && (!isConquered || this.isConquerable())){
		this.conquered = isConquered;
		this.getGrid().historyStack.lastConquered.push(this.logicX+"_"+this.logicY);
		this.getGrid().removeFromRemaining(this);
		if(isConquered){
			if(!this.isSecured()) this.getGrid().addToConqueredNotSecuredStack(this.logicX+"_"+this.logicY);
			if(this.getType() === 1) this.getGrid().unlockLocks(this); //key
		}else this.getGrid().removeFromConqueredNotSecuredStack(this.logicX+"_"+this.logicY);
	}
	return this;
};
Tile.prototype.isConquered = function(){
	return this.conquered;
};
Tile.prototype.isConquerable = function(){
	return !this.ghost && this.isOnGrid && (this.type > 9 || this.type === 1);
};
Tile.prototype.neverBecomesConquerable = function(){
	return (this.type === 0 || this.type === 3);
};
Tile.prototype.setChecked = function(isChecked){
	if(typeof isChecked !== "boolean") isChecked = true;
	this.checked = isChecked;
	return this;
};
Tile.prototype.isChecked = function(){
	return this.checked;
};
Tile.prototype.setSecured = function(isSecured){
	if(typeof isSecured !== "boolean") isSecured = true;
	this.secured = isSecured;
	if(!isSecured){
		if(this.isConquered()) this.getGrid().addToConqueredNotSecuredStack(this.logicX+"_"+this.logicY);
	}else this.getGrid().removeFromConqueredNotSecuredStack(this.logicX+"_"+this.logicY);
	return this;
};
Tile.prototype.isSecured = function(){
	return this.secured;
};
Tile.prototype.isOnGrid = function(){
	return !this.ghost && this.logicX>=0 && this.logicX<this.getGrid().getWidth() && this.logicY>=0 && this.logicY<this.getGrid().getHeight();
};
Tile.prototype.setGrid = function(grid){
	if(typeof grid === "object") this.grid=grid;
	return this.grid;
};
Tile.prototype.getGrid = function(){
	return this.grid;
};
Tile.prototype.setLogic = function(x, y){
	if(typeof x !== "number") x = -1;
	if(typeof y !== "number") y = -1;
	this.logicX = x;
	this.logicY = y;
	return this;
};
Tile.prototype.getNeighbour = function(x,y){
	return this.getGrid().getTileAt(this.logicX+x,this.logicY+y);
};
/* Tile.prototype.getAllNeighbours = function(){
	return this.getGrid().getNeighboursOf(x,y);
};*/
Tile.prototype.randColor = function(){
	return this.setColor(10 + Math.floor(Math.random()*this.MAX_COLOR));
};

var Grid = function(){
	this.width = 0;
	this.height = 0;
	this.currentColor = 10;
	this.tiles = {count:0, remaining:0};
	this.conqueredNotSecured = {}; //opti
	this.logMeIAmFamous = false;
	this.historyStack = {lastConquered:[],lastChanges:{}};
	this.victoryType = 'conquer'; //color, flag.
	this.victoryTypeVal = -1;
};
Grid.prototype.setVictoryTypeVal = function(typeVal){
	if(typeof typeVal === "undefined") typeVal = -1;
	this.victoryTypeVal = typeVal;
	return this;
};
Grid.prototype.setVictoryType = function(type){
	if(typeof type === "object" && typeof type.length !== "undefined" && type.length>1) return this.setVictoryType(type[0]).setVictoryTypeVal(type[1]);
	if(typeof type !== "string") type = 'conquer';
	this.victoryType = type;
	return this;
};
Grid.prototype.removeFromRemaining = function(){
	this.tiles.remaining--;
};
Grid.prototype.getTilesCount = function(){
	return this.tiles.count;
};
Grid.prototype.getRemainingTilesCount = function(){
	return this.tiles.remaining;
};
Grid.prototype.getWidth = function(){
	return this.width;
};
Grid.prototype.getHeight = function(){
	return this.height;
};
Grid.prototype.setGridSize = function(w, h){
	if(typeof w === "number" && typeof h !== "number") h=w;
	if(typeof w !== "number") w = 5;
	if(typeof h !== "number") h = 5;
	this.width = w;
	this.height = h;
	this.tiles = {count:0};
	return this;
};
Grid.prototype.buildConqueredNotSecuredStack = function(){
	for(var x = 0; x<this.width; x++) for(var y = 0; y<this.height; y++) if(! this.tiles[x+"_"+y].isSecured() && this.tiles[x+"_"+y].isConquered()) this.addToConqueredNotSecuredStack(x+"_"+y);
};
Grid.prototype.addToConqueredNotSecuredStack = function(tileToAdd){
	if(typeof tileToAdd === "object" && typeof tileToAdd.color === "number") tileToAdd=tileToAdd.logicX+"_"+tileToAdd.logicY;
	if(typeof tileToAdd === "string"){
		this.conqueredNotSecured[tileToAdd] = true;
		if(!this.tiles[tileToAdd].isConquered()) this.tiles[tileToAdd].setConquered(true);
		if(this.tiles[tileToAdd].isSecured()) this.tiles[tileToAdd].setSecured(false);
	}else if(typeof tileToAdd === "object" && typeof tileToAdd.length === "number") for(var i=0; i<tileToAdd.length; i++) this.addToConqueredNotSecuredStack(tileToAdd[i]);
	return this;
};
Grid.prototype.removeFromConqueredNotSecuredStack = function(tileToRemove){
	if(typeof tileToRemove === "object" && typeof tileToRemove.color === "number") tileToRemove=tileToRemove.logicX+"_"+tileToRemove.logicY;
	if(typeof tileToRemove === "string")	delete	this.conqueredNotSecured[tileToRemove];
	else if(typeof tileToRemove === "object" && typeof tileToRemove.length === "number") for(var i=0; i<tileToRemove.length; i++) this.removeFromConqueredNotSecuredStack(tileToRemove[i]);
	return this;
};
Grid.prototype.populate = function(w, h, fill){
	if(typeof fill !== "boolean") fill = true;
	this.setGridSize(w, h);
	for(var x = 0; x<this.width; x++){
		for(var y = 0; y<this.height; y++){
			var aTile = new Tile(this).setLogic(x,y);
			if(fill) aTile.randColor();
			this.tiles[x+"_"+y] = aTile; 
		}
	}
	this.tiles.count = this.tiles.remaining = this.width*this.height;
	return this;
};
Grid.prototype.getTileAt = function(x, y, getGhosts){ //:Tile
	if(typeof x === "object" && typeof x.length !== "undefined" && x.length>1){ //is an array of coords
		y = parseInt(x[1]);
		x = parseInt(x[0]);
	}
	if(typeof x !== "number" || typeof y !== "number") console.error("missing coordinates : ", arguments);
	if(typeof this.tiles[x+"_"+y] === "undefined"){
		//Tile does not exist
		if(typeof getGhosts === "boolean" && getGhosts) return new Tile(this, x, y).setGhost(true);
		return false;
	}else return this.tiles[x+"_"+y];
};
Grid.prototype.addTileAt = function(tileToAdd, x, y){ //:Tile
	if(typeof tileToAdd === "undefined") console.error("missing tile");
	if(typeof tileToAdd === "object" && typeof tileToAdd.length === "number"){//array
		for(var aTile= 0; aTile<tileToAdd.length; aTile++) this.addTileAt(tileToAdd[aTile]);
		return this;
	}
	if(typeof x !== "number") x = tileToAdd.logicX;
	if(typeof y !== "number") y = tileToAdd.logicY;
	this.tiles[x+"_"+y] = tileToAdd.setGrid(this);
	return this;
};
Grid.prototype.getNeighboursOf = function(x, y, zone){ // or (tile) //:[Tile]
	if(typeof zone !== "string" || (zone !== "+" && zone !== "x" && zone !== "o")) zone = "+";
	var toRet = [], aNeighbor, coordsToTest;
	switch(zone){
		case "o": case "circle": case "around":
			coordsToTest = [[-1,-1],[1,-1],[1,1],[-1,1],[-1,0],[0,-1],[1,0],[0,1]]; 
		break;
		case "x": case "diag": case "diagonal": case "diagonals":
			coordsToTest = [[-1,-1],[1,-1],[1,1],[-1,1]]; 
		break;
		case "+": case "plus": case "cross":
		default:
			coordsToTest = [[-1,0],[0,-1],[1,0],[0,1]]; 
		break;
	}
	if(typeof y !== "number") y = 0;
	if(typeof x === "object" && typeof x.color !== "undefined"){ //is a tile
		y = x.logicY;
		x = x.logicX;
	}
	if(typeof x === "object" && typeof x.length !== "undefined" && x.length>1){ //is an array of coords
		y = parseInt(x[1]);
		x = parseInt(x[0]);
	}
	if(typeof x !== "number") x = 0;
	for(var aCoord = 0; aCoord<coordsToTest.length; aCoord++){
		aNeighbor = this.getTileAt(x + coordsToTest[aCoord][0], y + coordsToTest[aCoord][1]);
		if(aNeighbor && aNeighbor.isOnGrid()) toRet.push(aNeighbor);
	}
	return toRet;
};
Grid.prototype.getTilesMatching = function(toMatch, first){ //:[Tile] || Tile
	var toRet = [];
	if(typeof toMatch !== "object") toMatch = {};
	if(typeof first !== "boolean") first = false;
	loopTile:
		for(var aTile in this.tiles){
			if(! this.tiles.hasOwnProperty(aTile)) continue;
			loopCond:
				for(var something in toMatch){
					if(toMatch.hasOwnProperty(something) && typeof this.tiles[aTile][something] !== "undefined" && this.tiles[aTile][something] === toMatch[something]){
						//ok
					}else continue loopTile;
				}
			if(first) return this.tiles[aTile];
			toRet.push(this.tiles[aTile]);
		}
	return (first) ? false : toRet;
};
Grid.prototype.uncheckAllTiles = function(){
	for(var x=0;x<this.width;x++) for(var y=0;y<this.height;y++) this.tiles[x+"_"+y].setChecked(false);
	return this;
};
Grid.prototype.getFirstTileMatching = function(toMatch){ //:Tile
	return this.getTilesMatching(toMatch, true);
};
Grid.prototype.getClone = function(){
	var newGrid = (new Grid()).setGridSize(this.width, this.height);
	for(var x = 0; x<this.width; x++){
		for(var y = 0; y<this.height; y++){
			newGrid.tiles[x+"_"+y] = new Tile(newGrid)
									.setLogic(x, y)
									.setConquered(this.tiles[x+"_"+y].isConquered())
									.setColor(this.tiles[x+"_"+y].getColor())
									.setType(this.tiles[x+"_"+y].getType())
									.setChecked(this.tiles[x+"_"+y].isChecked())
									.setSecured(this.tiles[x+"_"+y].isSecured());
		}
	}
	return newGrid;
};
Grid.prototype.conquerTile = function(x, y){
	this.getTileAt(x, y).setConquered();
	return this;
};
Grid.prototype.fetchNewlyConquered = function(clearHistory){
	if(typeof clearHistory !== "boolean") clearHistory = true;
	var toRet=JSON.stringify(this.historyStack);
	if(clearHistory) this.historyStack = {lastConquered:[],lastChanges:{}};
	return toRet;
};
Grid.prototype.applyToPattern = function(pattern, type, color){
	try{
		if(typeof pattern === "string") pattern = JSON.parse(pattern);
		for(var aTile = 0; aTile<pattern.length; aTile++){
			var tileInPattern = this.getTileAt(pattern[aTile].split("_"));
			if(typeof type === "number") tileInPattern.setType(type);
			if(typeof color === "number") tileInPattern.setColor(color);
		}
		if(typeof type === "number" && type === 3) this.setVictoryType('flag');
	}catch(e){}
	this.historyStack = {lastConquered:[],lastChanges:{}};
	return this;
};
Grid.prototype.spread = function(_currentColor){
	var startOfComputing = window.performance.now(), nbTilesChecked = 0;
	var currentColor = (typeof _currentColor === "number") ? _currentColor : this.currentColor;
	var tilesKeysToCheck = Object.keys(this.conqueredNotSecured), checkedTilesNb = 0, preventInfinite = this.width*this.height*4, aTileToCheck;
	while(preventInfinite > 0 && (aTileToCheck = tilesKeysToCheck.pop())){
		preventInfinite--;
		var tileCoords = aTileToCheck.split("_"), neighbours = this.getNeighboursOf(tileCoords), conqueredNeighbours=0;
		for(var i=0; i<neighbours.length; i++){
			//conquer rules
			if(neighbours[i].isConquered() || neighbours[i].neverBecomesConquerable()){
				conqueredNeighbours++;
			}else if(neighbours[i].isConquerable() && neighbours[i].getColor() === currentColor){
				neighbours[i].setConquered();
				tilesKeysToCheck.push(neighbours[i].logicX+"_"+neighbours[i].logicY);
			}
			nbTilesChecked++;
		}
		this.getTileAt(tileCoords).setChecked();
		//speed-up next spread
		if(conqueredNeighbours === neighbours.length){
			this.getTileAt(tileCoords).setSecured();
		}
	}
	pendingLog.push("Spread v2 (" + nbTilesChecked + ") took "+ Math.round(window.performance.now() - startOfComputing)+ "ms to proceed");
	return this;
};
Grid.prototype.changeColorTo = function(newColor){
	if(typeof newColor !== "number"){
		var aFirstConqueredTile = this.getFirstTileMatching({conquered:true});
		newColor = (aFirstConqueredTile) ? aFirstConqueredTile.getColor() : 10;
	}
	if(newColor < 10 || newColor > 16) console.error("not a true color");
	this.uncheckAllTiles();
	var startOfComputing = window.performance.now(), currentConqueredTiles = this.getTilesMatching({conquered: true});
	for(var a=0; a<currentConqueredTiles.length; a++) currentConqueredTiles[a].setColor(newColor);
	this.currentColor = newColor;
	pendingLog.push("colouring took "+ Math.round(window.performance.now() - startOfComputing)+ "ms to proceed");
	return this;
};
Grid.prototype.log = function(clearConsole){
	if(!this.logMeIAmFamous) return;
	if(typeof clearConsole === "boolean" && clearConsole) window.console.clear();
	var pad = function(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	};
	for(var y=0; y<this.height; y++){
		var toLog = "";
		for(var x=0; x<this.width; x++){
			var format = ((this.tiles[x+"_"+y].isConquered()) ? ((this.tiles[x+"_"+y].isSecured()) ? "+" : "-") : " "), tileStatus;
			switch(this.tiles[x+"_"+y].getType()){
				default:
				case 0:
					tileStatus = "##";
					format = "|";
				break;
				case 2:
					tileStatus = "@@";
				break;
				case 3:
					tileStatus = "Fl";
				break;
				case 1:
					format = "k";
				case 10:
					tileStatus = pad(this.tiles[x+"_"+y].getColor(),2);
				break;
			}
			toLog+="[" + format + tileStatus + format+"] ";
		}
		/*window.console.log(toLog)*/;
	}
	for(var aLog=0; aLog<pendingLog.length; aLog++) /*window.console.log(pendingLog[aLog])*/;
	pendingLog = [];
	return this;
};
Grid.prototype.isDone = function(asInt){
	if(typeof asInt !== "boolean") asInt = true;
	var isVictory=false;
	switch(this.victoryType){// = 'conquer'; //color, flag.
		case 'flag':
			isVictory = true;
			
			var flags = this.getTilesMatching({type:3});
			loopFlags:
			for(var i=0; i<flags.length; i++){
				var tilesToCheck = this.getNeighboursOf(flags[i], '', 'o');
				// for(var j=0; j<tilesToCheck.length; j++) if((!tilesToCheck[j].neverBecomesConquerable() && !tilesToCheck[j].isConquerable()/* */ ) || (tilesToCheck[j].isConquerable() && !tilesToCheck[j].isConquered())){	isVictory=false;	break loopFlags;	break; }		
				for(var j=0; j<tilesToCheck.length; j++) if(!tilesToCheck[j].isConquered() && (tilesToCheck[j].isConquerable() || !tilesToCheck[j].neverBecomesConquerable())){	isVictory=false;	break loopFlags;	break; }		
			}
		break;
		case 'color':
			isVictory = (this.getRemainingTilesCount() === 0 && this.currentColor === this.victoryTypeVal);
		break;
		case 'conquer':
		default:
			isVictory = (this.getRemainingTilesCount() === 0);
		break;
	}
	if(asInt) return (isVictory) ? 1:0;
	return isVictory;
};
Grid.prototype.unlockLocks = function(keyTile){
	var locks = this.getTilesMatching({type:2});
	for(var i=0; i<locks.length; i++){
		while(locks[i].randColor().getColor() === keyTile.getColor());
		locks[i].setType(10); //.randColor(); => works, but we prefer to be sure the locked tile were not the same color as he key
	}
	return this;
};
Grid.prototype.buildFrom = function(simplifiedGrid){
	if(typeof simplifiedGrid === "string"){
		try{	simplifiedGrid = JSON.parse(simplifiedGrid);	}catch(e){	console.log("not a genuine grid");	return this;	}
	}
	if(typeof simplifiedGrid !== "object"){	console.log("not a genuine grid.");	return this;	}
	var gridW=0, gridH=0;
	for(var aTile in simplifiedGrid){
		if( !simplifiedGrid.hasOwnProperty(aTile)) continue;
		var tileCoords = aTile.split("_");
		if(gridW<parseInt(tileCoords[0])) gridW=parseInt(tileCoords[0]);
		if(gridH<parseInt(tileCoords[1])) gridH=parseInt(tileCoords[1]);
	}//Math.sqrt(Object.keys(simplifiedGrid)); //<= can only handle squared grid
	//console.log("building grid of : ", gridW, gridH);
	this.populate(gridW+1, gridH+1, false); // reset grid, no coloring
	for(var aTile in simplifiedGrid){
		if( !simplifiedGrid.hasOwnProperty(aTile)) continue;
		var theTile = this.getTileAt(aTile.split("_"));
		if(typeof simplifiedGrid[aTile].c === "number") theTile.setColor(simplifiedGrid[aTile].c);
		if(typeof simplifiedGrid[aTile].t === "number") theTile.setType(simplifiedGrid[aTile].t);
	}
	return this;
};

var GameMain = function(){
	this.grid;
	this.startX;
	this.startY;
	this.shouldLog=false;
};
GameMain.prototype.newGrid = function(w, h, startX, startY){
	if(typeof startX !== "number" || startX<0 || startX>=w) startX = 0;
	if(typeof startY !== "number" || startY<0 || startY>=h) startY = 0;
	this.grid = (new Grid()).populate(w, h);
	this.grid.logMeIAmFamous = this.shouldLog;
	this.startX = startX;
	this.startY = startY;
	return this.grid;
};
GameMain.prototype.playColor = function(color){
	this.grid.changeColorTo(color).spread().log();
	return this;
};
GameMain.prototype.playRandom = function(times){
	for(var i=0; i<times-1; i++) this.grid.changeColorTo(10+Math.floor(Math.random()*6)).spread();
	this.grid.changeColorTo(10+Math.floor(Math.random()*6)).spread().log();
	return this;
};
GameMain.prototype.fetchNewlyConquered = function(clearHistory){
	return this.grid.fetchNewlyConquered();
};
GameMain.prototype.activateLog = function(shouldLog){
	if(typeof shouldLog !== "boolean") shouldLog = false;
	this.shouldLog = shouldLog;
	return this;
};
GameMain.prototype.getCurrentGridSimplified = function(){
	var toRet = {};
	for(var x=0;x<this.grid.width;x++) for(var y=0;y<this.grid.height;y++){
		var type = this.grid.tiles[x+"_"+y].getType();
		toRet[x+"_"+y] = {c:this.grid.tiles[x+"_"+y].getColor()};
		if(type !== 10) toRet[x+"_"+y].t=type;
	}
	return JSON.stringify(toRet);
};
GameMain.prototype.getCurrentColor = function(){
	return this.grid.getTileAt(this.startX, this.startY).getColor();
};
GameMain.prototype.isDone = function(asInt){
	return this.grid.isDone(asInt);
};
//////// init
if(typeof(window.playtouch) !== "object") window.playtouch = {};
playtouch.gameMain = new GameMain();
})();

/**To enable logs
playtouch.gameMain.activateLog(true);
*/

/**To init a grid of 26x26
playtouch.gameMain.newGrid(26);
*/

/**To check if done
playtouch.gameMain.isDone();
*/

/**To play a color       	  vv-> 10-15
playtouch.gameMain.playColor( 10 );
*/

/** To play randomly 20 times
playtouch.gameMain.playRandom(20);
*/

/** To fetch the newly conquered tiles (since last fetch)    you can pass `false` as parameter to prevent flush
playtouch.gameMain.fetchNewlyConquered();
*/

/** To get the number of the current color
playtouch.gameMain.getCurrentColor();
*/

/** Grid samples
// basic 5x5
playtouch.gameMain.activateLog(true).newGrid(5).conquerTile(0, 0).changeColorTo('auto').spread().log();

// 5x5 with black dots
playtouch.gameMain.activateLog(true).newGrid(5).conquerTile(0, 0).changeColorTo('auto').applyToPattern(["1_1","2_2","3_3","4_4"], 0, 0).spread().log();

// 5x5 with black dots + key/locks + flag
playtouch.gameMain.activateLog(true).newGrid(5).conquerTile(0, 0).changeColorTo('auto').applyToPattern(["0_4","1_3","3_1","4_0"], 0, 0).applyToPattern(["2_2"], 2).applyToPattern(["3_0"], 1).applyToPattern(["3_3"], 3).spread().log();

//for the tuto  :
var gridSnapshot = '{"0_0":{"c":14},"0_1":{"c":15},"0_2":{"c":11},"0_3":{"c":11},"1_0":{"c":10},"1_1":{"c":11},"1_2":{"c":11},"1_3":{"c":11},"2_0":{"c":10},"2_1":{"c":11},"2_2":{"c":11},"2_3":{"c":13},"3_0":{"c":10},"3_1":{"c":11},"3_2":{"c":11},"3_3":{"c":13}}';
playtouch.gameMain.activateLog(true).newGrid().buildFrom(gridSnapshot).conquerTile(0, 0).changeColorTo('auto').spread().log();
playtouch.gameMain.activateLog(true).newGrid(    5    ).conquerTile(0, 0).changeColorTo('auto');
//
playtouch.gameMain.activateLog(true).newGrid(    7    ).conquerTile(0, 0).changeColorTo('auto')
playtouch.gameMain.grid.applyToPattern(["2_4","2_2","4_2","4_4"], 0, 0); //p
playtouch.gameMain.grid.applyToPattern(["3_4","4_3","3_2","2_3"], 2); //l
playtouch.gameMain.grid.applyToPattern(["6_0","0_6"], 1); //k
playtouch.gameMain.grid.applyToPattern(["3_3"], 3); //f
//playtouch.gameMain.grid.setVictoryType(['color',10+Math.floor(Math.random()*6)]);
playtouch.gameMain.grid.spread().log();

*/