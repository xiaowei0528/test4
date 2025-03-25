var pendingLog = [];
var Tile = function(grid, x, y){
	this.type = 10; //0-9 reserved for special tiles
	//types = 0 dead pixel,    , 10 = colorable
	this.color = 10; //0-9 reserved for special tiles
	this.logicX = (typeof x === "number") ? x: -1;
	this.logicY = (typeof y === "number") ? y: -1;
	this.ghost = false;
	this.checked = false;
	this.toCollapse = false;
	this.lastGridChanges = {};
	this.grid = grid;
	this.adjacentLinks = "0000"; // U R L D
};
Tile.prototype.setType = function(type){
	if(typeof type !== "number") type = 0;
	this.type = type;
	return this;
};
Tile.prototype.getType = function(){
	return this.type;
};
Tile.prototype.setColor = function(color){
	if(typeof color !== "number") color = 10;
	this.color = color;
	this.getGrid().setHighestColor(this.color);
	return this;
};
Tile.prototype.getColor = function(){
	return (this.isGhost) ? -1 : this.color;
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
Tile.prototype.setChecked = function(isChecked){
	if(typeof isChecked !== "boolean") isChecked = true;
	this.checked = isChecked;
	return this;
};
Tile.prototype.isChecked = function(){
	return this.checked;
};
Tile.prototype.setToCollapse = function(toCollapse){
	if(typeof toCollapse !== "boolean") toCollapse = true;
	this.toCollapse = toCollapse;
	return this;
};
Tile.prototype.toCollapse = function(){
	return this.toCollapse;
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
Tile.prototype.randColor = function(maxColor){
	if(typeof maxColor !== "number") maxColor = this.getGrid().getWidth(); //maxColor = 5;
	return this.setColor(10 + Math.floor(Math.random()*maxColor));
};
Tile.prototype.buildAdjacentLinks = function(withNeighbours){
	// this.adjacentLinks = "0000"; //should use binary
	if(this.isGhost) return;
	if(typeof withNeighbours !== "boolean") withNeighbours = true;
	this.adjacentLinks = "";
	var patterns = [[0,-1],[1,0],[0,1],[-1,0]];
	for(var offset in patterns){
		if(patterns.hasOwnProperty(offset)){
			var currTile = this.getGrid().getTileAt(this.logicX+patterns[offset][0], this.logicY+patterns[offset][1], true);
			this.adjacentLinks += ""+((currTile.getColor() === this.getColor()) ? "1" : "0");
		}
	}
	return this;
};
Tile.prototype.getAdjacentLinks = function(){
	return this.adjacentLinks;
};


var Grid = function(){
	this.width = 0;
	this.height = 0;
	this.tiles = {count:0};
	this.logMeIAmFamous = false;
	this.lastCollapsedTiles = [];
	this.lastCollapsedCenter = false;
	this.lowestColor = 999;
	this.highestColor = 0;
};
Grid.prototype.getTilesCount = function(){
	return this.tiles.count;
};
Grid.prototype.getWidth = function(){
	return this.width;
};
Grid.prototype.getLowestColor = function(){
	return this.lowestColor;
};
Grid.prototype.getHighestColor = function(){
	return this.highestColor;
};
Grid.prototype.setLowestColor = function(color){
	if(typeof color === "number") if(this.lowestColor > color) this.lowestColor = color;
	else this.lowestColor = this.findLowestColor();
	return this;
};
Grid.prototype.findLowestColor = function(){
	this.lowestColor = 999;
	for(var x = 0; x<this.width; x++) for(var y = 0; y<this.height; y++) if(!this.getTileAt(x,y).isChecked() && this.lowestColor > this.getTileAt(x,y).getColor()) this.lowestColor = this.getTileAt(x,y).getColor();
	return this;
};
Grid.prototype.setHighestColor = function(color){
	if(this.highestColor < color) this.highestColor = color;
	return this;
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
Grid.prototype.populate = function(w, h, fill){
	if(typeof fill !== "boolean") fill = true;
	this.setGridSize(w, h);
	for(var x = 0; x<this.width; x++){
		for(var y = 0; y<this.height; y++){
			var aTile = new Tile(this).setLogic(x,y);
			// if(fill) aTile.randColor();
			if(fill) aTile.setColor(this.getARandomColor(10, 14));
			this.tiles[x+"_"+y] = aTile; 
		}
	}
	this.tiles.count = this.width*this.height;
	return this;
};

Grid.prototype.getNeighboursOf = function(x, y, zone){ // or (tile) //:[Tile]
	if(typeof x === "object" && typeof x.getLogicY === "function"){ y = x.getLogicY(); x = x.getLogicX(); }
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
Grid.prototype.getSameColorNeighboursOf = function(x, y, zone){ // or (tile) //:[Tile]
	if(typeof x === "object" && typeof x.getLogicY === "function"){ y = x.getLogicY(); x = x.getLogicX(); }
	var neighbours = this.getNeighboursOf(x, y, zone), colorToCheck = this.getTileAt(x, y).getColor();
	for(var aNeighbour = neighbours.length-1; aNeighbour>=0; aNeighbour--) if(neighbours[aNeighbour] === false || neighbours[aNeighbour].getColor() !== colorToCheck) neighbours.splice(aNeighbour, 1);
	return neighbours;
};
Grid.prototype.getSameColorNotCheckedNeighboursOf = function(x, y, zone){ // or (tile) //:[Tile]
	if(typeof x === "object" && typeof x.getLogicY === "function"){ y = x.getLogicY(); x = x.getLogicX(); }
	var neighbours = this.getNeighboursOf(x, y, zone), colorToCheck = this.getTileAt(x, y).getColor();
	for(var aNeighbour = neighbours.length-1; aNeighbour>=0; aNeighbour--) if(neighbours[aNeighbour] === false || neighbours[aNeighbour].isChecked() || neighbours[aNeighbour].getColor() !== colorToCheck) neighbours.splice(aNeighbour, 1);
	return neighbours;
};
Grid.prototype.getTilesMatching = function(toMatch, first){ //:[Tile] || Tile
	if(typeof toMatch !== "object") toMatch = {};
	var toRet = [], toMatchNb = Object.keys(toMatch).length;
	if(typeof first !== "boolean") first = false;
	loopTile:
		for(var aTile in this.tiles){
			if(! this.tiles.hasOwnProperty(aTile)) continue;
			var matchedCondNb = 0;
			loopCond:
				for(var something in toMatch){
					if(matchedCondNb === toMatchNb) break loopCond;
					if(toMatch.hasOwnProperty(something) && typeof this.tiles[aTile][something] !== "undefined" && this.tiles[aTile][something] === toMatch[something]){
						matchedCondNb++;
					}else continue loopTile;
				}
			if(first) return this.tiles[aTile];
			toRet.push(this.tiles[aTile]);
		}
	return (first) ? false : toRet;
};
Grid.prototype.canTileFall = function(x, y){
	if(typeof x === "object" && typeof x.getLogicY === "function"){ y = x.getLogicY(); x = x.getLogicX(); }
	return (typeof this.tiles[x+"_"+(y+1)] !== "undefined" && this.tiles[x+"_"+(y+1)].isChecked());
};
	
Grid.prototype.getExpectedTileYAfterFallFrom = function(x, y){
	var fallTimes = 0;
	while(this.canTileFall(x, (y+fallTimes))){
		fallTimes++;
		this.canTileFall(x, (y+fallTimes));
	}
	return y+fallTimes;
};
	
Grid.prototype.moveTile = function(oldX, oldY, newX, newY, toDo){
	switch(toDo){
		case "delete": case "replace": case "overwrite":
		default:
			delete this.tiles[newX+"_"+newY];
			this.tiles[newX+"_"+newY] = this.tiles[oldX+"_"+oldY].setLogic(newX,newY);//.buildAdjacentLinks();
		break;
		case "swap":
			var tmp = this.tiles[newX+"_"+newY];
			this.tiles[newX+"_"+newY] = this.tiles[oldX+"_"+oldY].setLogic(newX,newY);//.buildAdjacentLinks();
			this.tiles[oldX+"_"+oldY] = tmp.setLogic(oldX,oldY);//.buildAdjacentLinks();
		break;
	}
	return this;
};


Grid.prototype.getARandomColor = function(min, max){
	//used to be :
	// return 10 + Math.floor(Math.random()*5);
	
	//now depending of the highest color :
	// return 10 + Math.floor(Math.random()*((this.getHighestColor() > 18) ? 5 : 4));
	
	//v3
	/*var max = 10 + Math.ceil(Math.max(12, this.getHighestColor()-10) / 3);
	var min = Math.min(Math.max(10, Math.min(this.getLowestColor(), this.getHighestColor() - 8)), Math.max(10, max-5));
	return Math.floor(min + Math.random()*(max-min));*/
	if(typeof min == "number" && typeof max === "number" && min <= max && min >= 10) return Math.floor(Math.random() * (max - min) + min);
	var rdmColor = Math.floor(Math.random() * 4) + this.getLowestColor();
	// console.log(min+"_"+max+": "+rdmColor);
	return parseInt(rdmColor);
	
	
};
Grid.prototype.spreadAt = function(x, y){
	if(typeof x === "object" && typeof x.getLogicY === "function"){ y = x.getLogicY(); x = x.getLogicX(); }
	var startOfComputing = window.performance.now(), nbTilesChecked = 0, nbTilesCollapsed = 0, initialTile = this.getTileAt(x, y);
	// this.lastCollapsedTiles = []; 
	this.lastCollapsedCenter = false;
	if(initialTile === false) console.error("Picking tile outside of board");
	var tilesToCheck = [initialTile], preventInfinite = this.width*this.height*4, aTileToCheck;
	//spread // "deletion"
	while(preventInfinite > 0 && (aTileToCheck = tilesToCheck.pop())){//
		preventInfinite--;
		nbTilesChecked++;
		if(!aTileToCheck.isChecked()) nbTilesCollapsed++;
		// this.lastCollapsedTiles.push(aTileToCheck.setChecked(true));//.setToCollapse(true);
		aTileToCheck.setChecked(true)
		if(aTileToCheck.getLogicX() !== initialTile.getLogicX() || aTileToCheck.getLogicY() !== initialTile.getLogicY()){ //only delete other checked tile (not the initial touch)
			this.lastGridChanges.deleted[aTileToCheck.getLogicX()+"_"+aTileToCheck.getLogicY()] = {x:aTileToCheck.getLogicX(),y:aTileToCheck.getLogicY(),c:aTileToCheck.getColor()};
			this.lastGridChanges.deletedCount++;
		}
		tilesToCheck = tilesToCheck.concat(this.getSameColorNotCheckedNeighboursOf(aTileToCheck.getLogicX(), aTileToCheck.getLogicY()));
	}
	
	if(nbTilesChecked === 1){ // No matching tile found (=only one tile)
		nbTilesCollapsed=0;
		this.lastCollapsedTiles = [];
		initialTile.setChecked(false);
		return this;
	}
	
	//change
	this.lastGridChanges.changedCount = 1;
	this.lastGridChanges.changed[initialTile.getLogicX()+"_"+initialTile.getLogicY()] = {x:initialTile.getLogicX(),y:initialTile.getLogicY(),c:initialTile.setColor(initialTile.getColor()+1).buildAdjacentLinks().getColor()};
	this.lastGridChanges.highestColor=this.getHighestColor();
	
	initialTile.setChecked(false);
	
	//fall
	for(var rx=0;rx<this.width;rx++){
		for(var ry=this.height-1;ry>=0;ry--){
			if(this.tiles[rx+"_"+ry].isChecked()) continue;
			var newY = this.getExpectedTileYAfterFallFrom(rx, ry);
			if(newY !== ry){ //there is an actual fall
				this.lastGridChanges.movedCount++;
				this.lastGridChanges.moved[rx+"_"+ry] = {from:{x:rx, y:ry,c:this.tiles[rx+"_"+ry].getColor()}, to:{x:rx, y:newY,c:this.tiles[rx+"_"+ry].getColor()}};
				this.moveTile(rx, ry, rx, newY, "swap");
			}
		}
	}
	
	this.findLowestColor();
	
	//"creations"
	for(var rx=0;rx<this.width;rx++) for(var ry=0;ry<this.height;ry++){
		if(this.tiles[rx+"_"+ry].isChecked()){
			// ^^^^ is equal to a simpler : for(aTileKey in this.lastGridChanges.deleted) ..
			this.tiles[rx+"_"+ry].setColor(this.getARandomColor()).setChecked(false);
			this.lastGridChanges.created[rx+"_"+ry] = {x:this.tiles[rx+"_"+ry].getLogicX(),y:this.tiles[rx+"_"+ry].getLogicY(),c:this.tiles[rx+"_"+ry].getColor()};
			this.lastGridChanges.createdCount++;
		}
	}
	pendingLog.push("Spread done. "+ nbTilesCollapsed +" tiles collapsed, it took " + nbTilesChecked + " checks in "+ Math.round(window.performance.now() - startOfComputing)+ "ms to proceed");
	return this;
};
Grid.prototype.getLastGridChanges = function(asJSON){
	if(typeof asJSON !== "boolean" || asJSON !== true) asJSON = false;
	if(!asJSON) return this.lastGridChanges;
	return JSON.stringify(this.lastGridChanges);
};
/*
Grid.prototype.getLastGridChanges = function(asJSON){
	if(typeof asJSON !== "boolean" || asJSON !== true) asJSON = false;
	if(!asJSON) return this.lastCollapsedTiles;
	var toRet = {collapingAt:this.lastCollapsedCenter.getLogicX()+"_"+this.lastCollapsedCenter.getLogicY(), count:this.lastCollapsedTiles.length, collapsedTiles:{}};
	for(var aTile in this.lastCollapsedTiles){
		if(this.lastCollapsedTiles.hasOwnProperty(aTile)) toRet.collapsedTiles[this.lastCollapsedTiles[aTile].getLogicX()+"_"+this.lastCollapsedTiles[aTile].getLogicY()] = {x:this.lastCollapsedTiles[aTile].getLogicX(), y:this.lastCollapsedTiles[aTile].getLogicY(),c:this.lastCollapsedTiles[aTile].getColor()};
	}
	return JSON.stringify(toRet);
};
*/
Grid.prototype.getLastGridChangesSimplified = function(){
	return this.getLastGridChanges(true);
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
									// .setConquered(this.tiles[x+"_"+y].isConquered())
									.setColor(this.tiles[x+"_"+y].getColor())
									.setType(this.tiles[x+"_"+y].getType())
									.setChecked(this.tiles[x+"_"+y].isChecked())
									// .setChecked(this.tiles[x+"_"+y].toCollapse())
									// .setSecured(this.tiles[x+"_"+y].isSecured());
		}
	}
	return newGrid;
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
		if(y===0){
			toLog += "=XX= "; for(var i=0; i<this.width; i++) toLog += "+"+pad(i,2)+"+ "; toLog += "\n";
			
		}
		for(var x=0; x<this.width; x++){
			if(x===0) toLog += "="+pad(y,2)+"= ";
			toLog+="[" + pad(this.tiles[x+"_"+y].getColor(),2) + "] ";
		}
		window.console.log(toLog);
	}
	for(var aLog=0; aLog<pendingLog.length; aLog++) window.console.log(pendingLog[aLog]);
	pendingLog = [];
	return this;
};


var GameMain = function(){
	this.grid;
	this.startX;
	this.startY;
	this.shouldLog=false;
};
GameMain.prototype.newGrid = function(w, h){
	this.grid = (new Grid()).populate(w, h);
	this.grid.logMeIAmFamous = this.shouldLog;
	return this.grid;
};
GameMain.prototype.getGrid = function(){
	return this.grid;
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
		toRet[x+"_"+y] = {x:this.grid.tiles[x+"_"+y].getLogicX(), y:this.grid.tiles[x+"_"+y].getLogicY(), c:this.grid.tiles[x+"_"+y].getColor()};
		if(type !== 10) toRet[x+"_"+y].t=type;
	}
	return JSON.stringify(toRet);
};
GameMain.prototype.getLastGridChanges = function(asJSON){
	return this.grid.getLastGridChanges(asJSON);
};
GameMain.prototype.getLastGridChangesSimplified = function(){
	return this.grid.getLastGridChangesSimplified();
};
GameMain.prototype.play = function(x, y){
	var selectedTile = this.grid.getTileAt(x, y);
	if(selectedTile === false) console.error("Picking Tile outside of grid");
	this.grid.lastGridChanges = {
		 played:{x:this.grid.tiles[x+"_"+y].getLogicX(), y:this.grid.tiles[x+"_"+y].getLogicY(), c:this.grid.tiles[x+"_"+y].getColor()}
		,deleted:{}
		,deletedCount:0
		,changed:{}
		,changedCount:0
		,moved:{}
		,movedCount:0
		,created:{}
		,createdCount:0
		,highestColor:this.grid.getHighestColor()
	}; //  this.lastGridChanges.deleted
	this.grid.spreadAt(x, y);
	return this;
};

GameMain.prototype.log = function(){
	this.grid.log();
	return this;
};

//////// init
if(typeof(window.playtouch) !== "object") window.playtouch = {};
playtouch.gameMain = new GameMain();


// init 
//playtouch.gameMain.activateLog(true).newGrid(2,2).log();
//play
//  playtouch.gameMain.play(3, 0).log().getLastGridChangesSimplified();
