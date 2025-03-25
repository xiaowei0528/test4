;(function(){

/////////////////////////////////////
// var
	var C2FUNC = {
		updateCase	: "updateCase",
		createCase	: "createCase",
		flashcase	: "flashCase",
		destroyCase	: "destroyCase",
		launchBullet: "launchBullet",
		caseOut		: "caseOut",
		failLaunch  : "failLaunch",
		gameOverC2	: "gameOverC2"
	};
	
	var GLOBAL_VARS = {
		dist_check : 8,
		posToCheckAllPos : [[[-1,0],[1,0],[-1,-1],[0,-1]],
							[[-1,0],[1,0],[0,-1],[1,-1]]],
		radius_check : 11,
		posNeighbor : [[[-1,0],[1,0],[-1,-1],[0,-1,],[-1,1],[0,1]],
						[[-1,0],[1,0],[0,-1],[1,-1],[0,1],[1,1]]]
	};
/////////////////////////////////////

/////////////////////////////////////
// GAME MAIN
	
	var gameMain = function(){};
	gameMain.prototype.grid = [];
	gameMain.prototype.gridInfo = {};
	gameMain.prototype.allNeighbor = [];

	gameMain.prototype.init = function(gridWidth,gridHeight,nbTypeOFCase,caseWidth,caseHeight,rowOffset,ld){
		this.grid = [];
		this.gridInfo.GRID_WIDTH = gridWidth;
		this.gridInfo.GRID_HEIGHT = gridHeight;
		this.gridInfo.GRID_ROW_OFFSET = rowOffset;
		this.gridInfo.CASE_TYPE_NB = nbTypeOFCase;
		this.gridInfo.CASE_WIDTH = caseWidth;
		this.gridInfo.CASE_HEIGHT = caseHeight;
		//this.infoLvl = ld[lvl];

		this.createGrid(gridWidth, gridHeight);
		this.fillGrid(nbTypeOFCase);

		this.isInit = true;
	};

	gameMain.prototype.createGrid = function(gridWidth,gridHeight) {
		for (var x = 0; x < gridWidth; x++) {
			this.grid.push([]);
			for (var y = 0; y < gridHeight; y++) {
				this.grid[x].push(new caseGrid().create(x,y));
			};
		};
	};

	gameMain.prototype.fillGrid = function(nbTypeOFCase) {
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(y < 9){
					this.grid[x][y].type = Math.floor(Math.random()*this.gridInfo.CASE_TYPE_NB);
					this.grid[x][y].createC2();
				}else{
					this.grid[x][y].type = -1;
				}
			};
		};
	};

	gameMain.prototype.getInfoCase = function(logicX,logicY) {
		return this.grid[logicX,logicY].type&"_"&this.grid[logicX,logicY].id;
	};

	gameMain.prototype.getType = function(logicX,logicY) {
		return this.grid[logicX][logicY].type;
	};

	gameMain.prototype.getGridLogic = function(x, y) {
		var gridY = Math.round(y / this.gridInfo.CASE_HEIGHT);

		var xOffset = 0;
		if ((gridY + this.gridInfo.GRID_ROW_OFFSET) % 2) {
			xOffset = this.gridInfo.CASE_WIDTH/ 2;
		}
		var gridX = Math.round((x - xOffset) / this.gridInfo.CASE_WIDTH);


		if (gridX<this.grid.length && gridX>=0 && gridY>=0 && gridY < this.grid[gridX].length){
			return this.grid[gridX][gridY];
		}
		return {logicX: gridX , logicY: gridY};
	};

	gameMain.prototype.getGridPhysic = function(logicX, logicY) {
		var physicY =logicY * this.gridInfo.CASE_HEIGHT;

		var xOffset = 0;
		if ((logicY + this.gridInfo.GRID_ROW_OFFSET) % 2) {
			xOffset = this.gridInfo.CASE_WIDTH/ 2;
		}
		var physicX = (logicX * this.gridInfo.CASE_WIDTH) + xOffset;

		return {x:physicX,y:physicY};
	};

	gameMain.prototype.checkBubbleTarget = function(startX,startY,angle){
		var x2 = 0;
		var y2 = 0;
		var actualTile = {type:-1,x:startX,y:startY};
		var lastTile,isCollide;
		var path = [];

		while(actualTile.type == -1){
			x2 = actualTile.x + Math.cos(degToRad(angle)) * GLOBAL_VARS.dist_check;
			y2 = actualTile.y + Math.sin(degToRad(angle)) * GLOBAL_VARS.dist_check;

			actualTile = this.getGridLogic(x2, y2);
			isCollide = this.checkNearestCaseCollision(x2,y2,actualTile);
			if(typeof(actualTile.type)=="undefined"){
				if(actualTile.logicX < 0 && angle < 270 ||
				actualTile.logicX > this.grid.length-1 && angle > 270){
					path.push({x:x2,y:y2});
					var nextAngle = 180 - angle;
					angle = (nextAngle < 0)?360 + nextAngle:nextAngle;
				}
				if(actualTile.logicY < 0) {
					break;
				}
				actualTile = {type: -1,x:x2,y:y2};
			}else if(isCollide && typeof(lastTile) != "undefined"){
				this.allNeighbor = [];
				this.resetChecked();
				this.checkNeigbor(lastTile, false,false,false);
				if(this.allNeighbor.length <=0){
					this.allNeighbor = [];
					this.resetChecked();
					this.checkNeigbor({logicX:isCollide.logicX,logicY:isCollide.logicY,type:-1}, false,false,true);
					var nearestCase,physicPos;
					var nearestDistance = Infinity;
					for(var i in this.allNeighbor){
						physicPos = this.getGridPhysic(this.allNeighbor[i].logicX, this.allNeighbor[i].logicY);
						if((physicPos.x-x2)*(physicPos.x-x2)+(physicPos.y-y2)*(physicPos.y-y2) < nearestDistance){
							nearestCase = this.allNeighbor[i];
						}
					}
					lastTile = nearestCase;
					//console.log("DEBUG !!!!!!!! NO I TAKE THE NEAREST OF COLLIDE");
				}
				actualTile = {type: 99999,x:x2,y:y2};
			}
			else{
				if(actualTile.type == -1) {
					lastTile = actualTile;
				}
				actualTile = {type: actualTile.type,x:x2,y:y2};
			}
		}

		if(!lastTile){
			c2_callFunction(C2FUNC.gameOverC2,[]);
			return;
		}
		var physicPos = this.getGridPhysic(lastTile.logicX, lastTile.logicY);

		path.push({x:physicPos.x,y:physicPos.y});
		for(var i = 0;i < path.length-1;i++){
			if(path[i].y < path[i+1].y){
				path.splice(i,1);
			}
		}

		lastTile.type = Math.floor(Math.random()*this.gridInfo.CASE_TYPE_NB);
		c2_callFunction("launchBullet",[this.pathToString(path),lastTile.type,lastTile.setNewId()]);
	};
	
	gameMain.prototype.pathToString = function(path) {
		var ret = "";
		for(var i in path){
			ret += path[i].x+"_"+path[i].y+"|";
		}
		return ret;
	};

	gameMain.prototype.checkNearestCaseCollision = function(physicX,physicY,caseGrid) {
		var caseToCheck;

		var posToCheck = GLOBAL_VARS.posToCheckAllPos[0];
		if ((caseGrid.logicY + this.gridInfo.GRID_ROW_OFFSET) % 2) {
			posToCheck = GLOBAL_VARS.posToCheckAllPos[1];
		}

		for(var i in posToCheck){
			caseToCheck = this.getCaseByLogicAndOffset(caseGrid.logicX, caseGrid.logicY, posToCheck[i][0], posToCheck[i][1]);
			if(typeof(caseToCheck) == "undefined" || caseToCheck.type == -1){continue;}
			var isCollide = this.circleCollisionByLogic(physicX, physicY, GLOBAL_VARS.radius_check, caseToCheck.logicX, caseToCheck.logicY, GLOBAL_VARS.radius_check);
			if(isCollide){return caseToCheck;}
		}
		return false;
	};

	gameMain.prototype.circleCollisionByLogic = function(lX1,lY1,r1,lX2,lY2,r2){
		var pos2 = this.getGridPhysic(lX2, lY2);
		return circleCollision(lX1, lY1, r1, pos2.x, pos2.y, r2);
	}

	gameMain.prototype.rowGoDown = function() {
		this.gridInfo.GRID_ROW_OFFSET ++;

		for(var i =0;i < this.gridInfo.GRID_WIDTH;i++){
			if(this.grid[i][this.gridInfo.GRID_HEIGHT-1].type != -1){
				c2_callFunction(C2FUNC.gameOverC2,[]);
				break;
			}
		}
		var i = 0;
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = this.grid[x].length -2; y >= 0; y--) {
				this.grid[x][y+1].type = this.grid[x][y].type;
				this.grid[x][y+1].id = this.grid[x][y].id;
			};
		};

		for (var x = 0; x < this.grid.length; x++) {
			this.grid[x][0].logicY --;
			this.grid[x][0].type = Math.floor(Math.random()*this.gridInfo.CASE_TYPE_NB);
			this.grid[x][0].createC2();
			this.grid[x][0].logicY ++;

		};
	};
		
	gameMain.prototype.rowGoUp = function() {
		this.gridInfo.GRID_ROW_OFFSET ++;;
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 1 ; y < this.grid[x].length; y++) {
				this.grid[x][y-1].type = this.grid[x][y].type;
				this.grid[x][y-1].id = this.grid[x][y].id;
				this.grid[x][y].type = -1;
				this.grid[x][y].id = undefined;
				
			};
		};
	};

	gameMain.prototype.setColorBubbleById = function(id,type){
		this.getCaseById(id).type = type;
	};

	gameMain.prototype.getCaseById = function(id) {
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].id == id){
					return this.grid[x][y];
				}
			};
		};
	};

	gameMain.prototype.checkCaseDestroy = function(id) {
		var caseStart = this.getCaseById(id);
		this.allNeighbor = [];

		this.resetChecked();

		this.allNeighbor.push(caseStart);
		caseStart.checked = true;
		this.checkNeigbor(caseStart,true,true,false);
		var lengthM = this.allNeighbor.length;
		if(this.allNeighbor.length >= 3){
			for(var i in this.allNeighbor){
				this.allNeighbor[i].type = -1;
				setTimeout(function(a){
					a.destroy();
				}.bind(this,this.allNeighbor[i]),i*50);
			}
		}

		setTimeout(function(){
			this.checkFloatingCase();
		}.bind(this),lengthM*50);

		if(lengthM < 3){
			c2_callFunction(C2FUNC.failLaunch,[]);
		}
	};

	gameMain.prototype.checkNeigbor = function(caseGrid,sameType,recursive,keepVoid) {
		var caseToCheck;
		
		var posToCheck = GLOBAL_VARS.posNeighbor[0];
		if ((caseGrid.logicY + this.gridInfo.GRID_ROW_OFFSET) % 2) {
			posToCheck = GLOBAL_VARS.posNeighbor[1];
		}

		for(var i in posToCheck){
			caseToCheck = this.getCaseByLogicAndOffset(caseGrid.logicX, caseGrid.logicY, posToCheck[i][0], posToCheck[i][1]);
			if(typeof(caseToCheck) == "undefined"){continue;}
			if(caseToCheck.type == -1 && !keepVoid){continue;}
			if(caseToCheck.type != caseGrid.type && sameType){continue;}
			if(caseToCheck.checked){continue;}
			caseToCheck.checked = true;
			this.allNeighbor.push(caseToCheck);
			if(recursive){
				this.checkNeigbor(caseToCheck,sameType,recursive,keepVoid);

			}
		}
	};

	gameMain.prototype.resetChecked = function(){
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				this.grid[x][y].checked = false;
			};
		};
	}

	gameMain.prototype.getCaseByLogicAndOffset = function(logicX,logicY,offsetX,offsetY) {
		if(!this.grid[logicX + offsetX]){return undefined;}
		if(!this.grid[logicX + offsetX][logicY + offsetY]){return undefined;}
		return this.grid[logicX + offsetX][logicY + offsetY];
	};

	gameMain.prototype.checkFloatingCase = function() {
		var floatingCase = [];
		var isFloating = true;

		this.resetChecked();

		
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].type == -1){continue;}
				if(this.grid[x][y].checked){continue;}
				this.allNeighbor = [];
				this.checkNeigbor(this.grid[x][y], false,true,false);
				isFloating = true;
				if(this.allNeighbor.length <=0){
					this.allNeighbor.push(this.grid[x][y]);
				}
				for(var i in this.allNeighbor){
					if(this.allNeighbor[i].logicY == 0){
						isFloating = false;
						break;
					}
				}

				if(isFloating){
					floatingCase = floatingCase.concat(this.allNeighbor);
					//floating.push(this.allNeighbor);
				}
			};
		};

		for(var i in floatingCase){
			floatingCase[i].destroy();
		}
	};

	gameMain.prototype.checkCaseToDestroy  = function(allCase){
		var allId = {};
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				allId[this.grid[x][y].id] = 1;
			}
		}

		for(var i in allCase){
			if(allId[i] == undefined){
				c2_callFunction(C2FUNC.destroyCase,[i]);
			}
		}
	}
/////////////////////////////////////	

/////////////////////////////////////
// caseGrid
	var caseGrid = function(){};
	caseGrid.id = 0;
	caseGrid.prototype.create = function(logicX,logicY) {
		this.logicX = logicX;
		this.logicY = logicY;
		this.type = -1; //color
		this.checked = false;
		return this;
	};

	caseGrid.prototype.setNewId = function() {
		return (this.id = caseGrid.id++);
	};

	caseGrid.prototype.createC2 = function() {
		c2_callFunction(C2FUNC.createCase,[this.logicX,this.logicY,this.type,this.setNewId()]);
	};

	caseGrid.prototype.flashCase = function() {
		c2_callFunction(C2FUNC.flashcase,[this.logicX,this.logicY]);
	};

	caseGrid.prototype.update = function() {
		c2_callFunction(C2FUNC.updateCase,[this.logicX,this.logicY,this.type,this.id]);
	};	

	caseGrid.prototype.destroy = function() {
		this.type = -1;
		c2_callFunction(C2FUNC.destroyCase,[this.id]);
	};
/////////////////////////////////////

/////////////////////////////////////
// UTILS
	function shuffle(array) {
		var m = array.length, t, i;
		// While there remain elements to shuffle…
		while (m) {
			i = Math.floor(Math.random() * m--);
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}

		return array;
	}

	function degToRad(angle) {
		return angle * (Math.PI / 180);
	}

	function radToDeg(angle) {
		return angle * (180 / Math.PI);
	}

	function circleCollision(x1,y1,r1,x2,y2,r2){
		var d2 = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
		if (d2 > (r1 + r2)*(r1 + r2)){
			return false;
		}
		return true;
	}
/////////////////////////////////////

/////////////////////////////////////
// object
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.gameMain = new gameMain();
/////////////////////////////////////

})();

