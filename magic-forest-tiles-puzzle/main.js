;(function(){



/////////////////////////////////////
// var
	var C2FUNC = {
		updateCase     		: "updateCase",
		createCase     		: "createCase",
		flashcase      		: "flashCase",
		waitForDestroyCase	: "waitForDestroyCase",
		pathCreate     		: "pathCreate",
		startMove      		: "startMove",
		addPathToCase  		: "addPathToCase",
		updateIsTouched		: "updateIsTouched",
		moveCase			: "moveCase",
		noMoreMoove			: "noMoreMoove",
		isTuto				: "isTutoGameMain",
		canTouchAgain		: "canTouchAgain",
		caseIsMoving		: "caseIsMoving"
	};
	
/////////////////////////////////////

/////////////////////////////////////
// GAME MAIN
	
	var gameMain = function(){};
	gameMain.prototype.grid = [];
	gameMain.prototype.gridInfo = {};
	gameMain.prototype.idCasePrepared = [];
	gameMain.prototype.lastCaseTouched = false;
	gameMain.prototype.allTips = [];
	gameMain.prototype.useWorker = false;
	gameMain.prototype.worker = {};
	gameMain.prototype.needChange = false;
	gameMain.prototype.infoLvl = {};
	gameMain.prototype.isInit = false;
	gameMain.prototype.isCheckingGravity = false;
	gameMain.prototype.isOnCheckNeedShuffle = false;
	gameMain.prototype.timerForTips;
	gameMain.prototype.timerForShuffle;

	gameMain.prototype.init = function(gridWidth,gridHeight,nbTypeOFCase,maxAngle,lvl,ld,useGravity){
		this.runtime = cr_getC2Runtime();
		this.grid = [];
		this.allTips = [];
		this.idCasePrepared = [];
		this.lastCaseTouched = false;
		this.gridInfo.GRID_WIDTH = gridWidth;
		this.gridInfo.GRID_HEIGHT = gridHeight;
		this.gridInfo.CASE_TYPE_NB = nbTypeOFCase;
		this.gridInfo.GAME_CASE_ANGLE = maxAngle;
		this.infoLvl = ld[(lvl%10 ==0)?10:lvl%10];
		this.infoTuto = ld["tuto"];
		this.useGravity = useGravity;
		this.isOnGetTips = false;
		clearTimeout(this.timerForShuffle);

		this.createGrid(gridWidth, gridHeight);
		this.fillGrid(nbTypeOFCase);
		clearTimeout(this.timerForTips);
		this.timerForTips = setTimeout(this.getTips.bind(this,true),1000);
		if (window.Worker){
			this.useWorker = true;
			this.worker = new Worker("work.js");
			this.worker.onmessage = function(gameMain,e) {
				if(e.data.action == "shuffle"){
					gameMain.shuffleResponse(e.data.grid);
				}else if(e.data.actuib = "getTips"){
					gameMain.getTipsResponse(e.data.allTips);
				}
			}.bind(this,this);
		}

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
				if(y == 0 || y == (this.grid[x].length-1) || x == 0 || x == (this.grid.length-1)){
					this.grid[x][y].canBeTouched = false;
					this.grid[x][y].idCase = 0;
				}else{
					this.grid[x][y].idCase = 1;
				}
			};
		};
		if(c2_callFunction(C2FUNC.isTuto)){ this.infoLvl.gravity.top = true;}
		this.applyLD();
		this.prepareIdCase(nbTypeOFCase);
		if(c2_callFunction(C2FUNC.isTuto)){
			this.applyTuto();
			return;
		}

		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].idCase != -1 && this.grid[x][y].idCase != 0){
					this.grid[x][y].canBeTouched = true;
					this.grid[x][y].idCase = this.idCasePrepared.pop();
				}
				this.grid[x][y].createC2();
			};
		};		
	};

	gameMain.prototype.applyLD = function() {
		//case block
		if(this.infoLvl.top){
			for(var i in this.grid){
				this.grid[i][0].idCase = -1;
				this.grid[i][0].canBeTouched = false;
			}
		}
		if(this.infoLvl.right){
			for(var i in this.grid[this.gridInfo.GRID_WIDTH-1]){
				this.grid[this.gridInfo.GRID_WIDTH-1][i].idCase = -1;
				this.grid[this.gridInfo.GRID_WIDTH-1][i].canBeTouched = false;
			}
		}
		if(this.infoLvl.bottom){
			for(var i in this.grid){
				this.grid[i][this.gridInfo.GRID_HEIGHT-1].idCase = -1;
				this.grid[i][this.gridInfo.GRID_HEIGHT-1].canBeTouched = false;
			}
		}
		if(this.infoLvl.left){
			for(var i in this.grid[0]){
				this.grid[0][i].idCase = -1;
				this.grid[0][i].canBeTouched = false;
			}
		}
		for(var i in this.infoLvl.special){
			this.grid[this.infoLvl.special[i].x][this.infoLvl.special[i].y].idCase = -1;
			this.grid[this.infoLvl.special[i].x][this.infoLvl.special[i].y].canBeTouched = false;
		}

		//gravity
		if(this.infoLvl.gravity.top && this.infoLvl.gravity.bottom){
			for (var x = 1; x < this.grid.length-1; x++) {
				for (var y = 1; y < this.grid[x].length-1; y++) {
					if(y <= (this.grid[x].length-2) /2){
						this.grid[x][y].gravityDirection = 0;
					}else{
						this.grid[x][y].gravityDirection = 2;
					}
				}
			}
		}
		else if(this.infoLvl.gravity.right && this.infoLvl.gravity.left){
			for (var x = 1; x < this.grid.length-1; x++) {
				for (var y = 1; y < this.grid[x].length-1; y++) {
					if(x <= (this.grid.length-2) /2){
						this.grid[x][y].gravityDirection = 3;
					}else{
						this.grid[x][y].gravityDirection = 1;
					}
				}
			}
		}
		else{
			var gravityDirection = (this.infoLvl.gravity.top)?0:(this.infoLvl.gravity.right)?1:(this.infoLvl.gravity.bottom)?2:(this.infoLvl.gravity.left)?3:-1;
			if(gravityDirection < 0){this.useGravity = false;return;}

			for(var x in this.grid){
				for(var y in this.grid[x]){
					this.grid[x][y].gravityDirection = gravityDirection;
				}
			}
		}
	};

	gameMain.prototype.applyTuto = function(){
		//tuto
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].idCase != -1 && this.grid[x][y].idCase != 0){
					this.grid[x][y].canBeTouched = true;
				}else{
					this.grid[x][y].canBeTouched = false;
				}
				this.grid[x][y].idCase = this.infoTuto.map.shift();
				this.grid[x][y].createC2();
			};
		};
	}

	gameMain.prototype.updateAllCases = function() {
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				this.grid[x][y].update();
			};
		};
	};

	gameMain.prototype.prepareIdCase = function(nbTypeOFCase) {
		this.idCasePrepared = [];
		//var caseTotal = (this.gridInfo.GRID_WIDTH-2) * (this.gridInfo.GRID_HEIGHT-2);
		var idCase = 1;

		var caseTotal = 0;
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].idCase != -1 && this.grid[x][y].idCase != 0){
					caseTotal ++;
				}
			};
		};		

		for(var i=0;i < caseTotal/2;i++){
			this.idCasePrepared.push(idCase);
			this.idCasePrepared.push(idCase);
			idCase ++;
			if(idCase > nbTypeOFCase){ idCase = 1;}
		}

		shuffle(this.idCasePrepared);
	};

	gameMain.prototype.shuffleGrid = function() {
		if(this.useWorker){
			this.worker.postMessage({action:"shuffle",grid:this.grid});
			return 1;
		}

		var array = [];
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].idCase != 0 && this.grid[x][y].idCase != -1){
					array.push(this.grid[x][y].idCase);
				}
			};
		};
		shuffle(array);
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].idCase != 0 && this.grid[x][y].idCase != -1){
					this.grid[x][y].idCase = array.pop();
				}
			};
		};

		this.needChange = true;
		setTimeout(this.updateAllCases.bind(this),600);
		clearTimeout(this.timerForTips);
		this.timerForTips = setTimeout(this.getTips.bind(this,true),1000);
		return 1;
	};

	gameMain.prototype.shuffleResponse = function(data){
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].idCase != 0 && this.grid[x][y].idCase != -1){
					this.grid[x][y].idCase = data[x][y].idCase;
				}
			};
		};

		this.needChange = true;
		setTimeout(this.updateAllCases.bind(this),600);
		clearTimeout(this.timerForTips);
		this.timerForTips = setTimeout(this.getTips.bind(this,true),1000);
	}

	gameMain.prototype.checkPathBetweenCases = function(actualCase,caseEnd,isTest) {
		this.isRuningPath = true;
		this.checkPath(actualCase, actualCase, caseEnd, [0,-1], 0, [], {id:-1}, isTest);
		this.checkPath(actualCase, actualCase, caseEnd, [1,0] , 0, [], {id:-1}, isTest);
		this.checkPath(actualCase, actualCase, caseEnd, [0,1] , 0, [], {id:-1}, isTest);
		this.checkPath(actualCase, actualCase, caseEnd, [-1,0], 0, [], {id:-1}, isTest);
		this.isRuningPath = false;
	};

	gameMain.prototype.checkPath = function(actualCase,caseStart,caseEnd,direction,count,path,parent,isTest) {
		if(!this.isRuningPath){return;}
		if(count >this.gridInfo.GAME_CASE_ANGLE){return;}
		var possibleDirection = [[0,-1],[1,0],[0,1],[-1,0]];
		var neighbor;
		var nDir;
		path.push(actualCase);
		for(var i in possibleDirection){
			if(!this.isRuningPath){return;}
			nDir = possibleDirection[i];
			var neighbor = this.getNeighbor(actualCase, nDir[0], nDir[1]);
			if(this.neighborIsVoid(actualCase, nDir[0],nDir[1])){
				if(parent.id == neighbor.id){continue;}
				this.checkPath(neighbor,caseStart, caseEnd, nDir, ((direction[0] == nDir[0] && direction[1] == nDir[1])?count:(count+1)), path,actualCase,isTest);
			}else if(neighbor){
				if(((direction[0] == nDir[0] && direction[1] == nDir[1])?count:(count+1)) > this.gridInfo.GAME_CASE_ANGLE){continue;}
				if(neighbor.id == caseEnd.id){
					path.push(neighbor);
					if(isTest){
						this.allTips.push([neighbor,caseStart]);
					}else{
						for (var i = 0; i < path.length-1; i++) {
							c2_callFunction(C2FUNC.pathCreate,[path[i].logicX,path[i].logicY,path[i+1].logicX,path[i+1].logicY]);
							c2_callFunction(C2FUNC.addPathToCase,[caseStart.logicX,caseStart.logicY,path[i+1].logicX,path[i+1].logicY]);
						};
						c2_callFunction(C2FUNC.startMove,[caseStart.logicX,caseStart.logicY,caseStart.idCase]);
						neighbor.destroy();
						caseStart.destroy();
					}
					this.isRuningPath = false;
				}
			}
		}
		path.pop();
	};

	gameMain.prototype.neighborIsVoid = function(caseGrid,logicX,logicY) {
		if(caseGrid.logicX + logicX >= this.gridInfo.GRID_WIDTH ||
			caseGrid.logicY + logicY >= this.gridInfo.GRID_HEIGHT ||
			caseGrid.logicX + logicX < 0 ||
			caseGrid.logicY + logicY < 0 ){return;}
		var neighbor = this.grid[caseGrid.logicX + logicX][caseGrid.logicY + logicY];
		if(!neighbor){return false}
		if(neighbor.idCase == 0){return true}
		else{return false}
	};

	gameMain.prototype.getNeighbor = function(caseGrid,logicX,logicY) {
		if(caseGrid.logicX + logicX >= this.gridInfo.GRID_WIDTH ||
			caseGrid.logicY + logicY >= this.gridInfo.GRID_HEIGHT ||
			caseGrid.logicX + logicX < 0 ||
			caseGrid.logicY + logicY < 0 ){return;}
		if(!caseGrid){return false}
		var neighbor = this.grid[caseGrid.logicX + logicX][caseGrid.logicY + logicY]
		if(!neighbor){return false}
		return neighbor;
	};

	gameMain.prototype.touchCase = function(logicX,logicY) {
		if(logicX >= this.gridInfo.GRID_WIDTH){return;}
		if(logicX < 0){return;}
		if(logicY >= this.gridInfo.GRID_HEIGHT){return;}
		if(logicY < 0){return;}
		var caseTouched = this.grid[logicX][logicY];
		if(this.isRuningPath){return;}
		if(caseTouched.isTouched){return;}
		if(!caseTouched.canBeTouched){return;}
		this.isCheckingGravity = false;
		if(this.lastCaseTouched){
			if(this.lastCaseTouched.idCase == caseTouched.idCase){
				this.lastCaseTouched.setIsTouched(false);
				this.checkPathBetweenCases(this.lastCaseTouched, caseTouched,false);
				this.lastCaseTouched = false;
				//this.getTips(true);
				clearTimeout(this.timerForTips);
				this.timerForTips = setTimeout(this.getTips.bind(this,true),1000);
			}else{
				this.lastCaseTouched.setIsTouched(false);
				this.lastCaseTouched = caseTouched;
				caseTouched.setIsTouched(true);
			}
		}else{
			this.lastCaseTouched = caseTouched;
			caseTouched.setIsTouched(true);
		}
	};

	gameMain.prototype.getTips = function(onlyCheck) {
		if(this.isOnGetTips){return 0;}
		if(this.isOnCheckNeedShuffle){return 0;}
		this.isOnCheckNeedShuffle = (onlyCheck)?true:false;
		this.isOnGetTips = true;
		this.allTips = [];
		if(this.isRuningPath){return 0;}
		if(this.useWorker){
			this.isRuningPath = true;
			this.worker.postMessage({
				action:"getTips",
				gridInfo:this.gridInfo,
				grid:this.grid});
			return 1;
		}

		for (var x = 0; x < this.grid.length-1; x++) {
			for (var y = 0; y < this.grid[x].length-1; y++) {
				if(this.grid[x][y].idCase == 0 || this.grid[x][y].idCase == -1){continue;}
				for (var x2 = 0; x2 < this.grid.length-1; x2++) {
					for (var y2 = 0; y2 < this.grid[x2].length-1; y2++) {
						if(this.grid[x2][y2].idCase == 0 || this.grid[x2][y2].idCase == -1){continue;}
						if(x == x2 && y == y2){continue;}
						if(this.grid[x][y].idCase == this.grid[x2][y2].idCase){
							this.checkPathBetweenCases(this.grid[x][y], this.grid[x2][y2],true);
						}
					};
				};
			};
		};		
		this.isOnGetTips = false;
		if(this.allTips.length <= 0){
			clearTimeout(this.timerForShuffle);
			this.timerForShuffle = setTimeout(this.needShuffleNoMoreMoove.bind(this),100);
			this.isOnCheckNeedShuffle = false;
			return 0;
		}
		if(this.isOnCheckNeedShuffle){this.isOnCheckNeedShuffle = false;return;}
		var random = Math.floor(Math.random()*(this.allTips.length));
		// this.allTips[random][0].flashCase();
		// this.allTips[random][1].flashCase();
		this.allTips[random][0].destroy();
		this.allTips[random][1].destroy();
		this.isCheckingGravity = false;
		clearTimeout(this.timerForTips);
		this.timerForTips = setTimeout(this.getTips.bind(this,true),1000);
		return 1;
	};

	gameMain.prototype.getTipsResponse = function(allTips) {
		this.isRuningPath = false;
		this.allTips = allTips;
		this.isOnGetTips = false;
		if(this.allTips.length <= 0){
			clearTimeout(this.timerForShuffle);
			this.timerForShuffle = setTimeout(this.needShuffleNoMoreMoove.bind(this),100);
			this.isOnCheckNeedShuffle = false;
			return 0;
		}
		if(this.isOnCheckNeedShuffle){this.isOnCheckNeedShuffle = false;return;}
		var random = Math.floor(Math.random()*(this.allTips.length));

		// this.grid[this.allTips[random][0].logicX][this.allTips[random][0].logicY].flashCase();
		// this.grid[this.allTips[random][1].logicX][this.allTips[random][1].logicY].flashCase();
		this.grid[this.allTips[random][0].logicX][this.allTips[random][0].logicY].destroy();
		this.grid[this.allTips[random][1].logicX][this.allTips[random][1].logicY].destroy();
		this.isCheckingGravity = false;
		clearTimeout(this.timerForTips);
		this.timerForTips = setTimeout(this.getTips.bind(this,true),1000);
	};

	gameMain.prototype.needShuffleNoMoreMoove = function() {
		if(c2_callFunction(C2FUNC.canTouchAgain) && !c2_callFunction(C2FUNC.caseIsMoving)){
			this.shuffleGrid();
			c2_callFunction(C2FUNC.noMoreMoove);
		}else{
			clearTimeout(this.timerForShuffle);
			this.timerForShuffle = setTimeout(this.needShuffleNoMoreMoove.bind(this),100);
		}
		//prevent spam in other layout
		if(this.runtime.running_layout.name != "GameMain"){
			clearTimeout(this.timerForShuffle);
		}
	};

	gameMain.prototype.getNeedChange = function(){
		if(this.needChange){
			this.needChange = false;
			return 1;
		}
		return 0;
	};

	gameMain.prototype.getInfoCase = function(logicX,logicY) {
		return this.grid[logicX,logicY].idCase&"_"&this.grid[logicX,logicY].id;
	};

	gameMain.prototype.getType = function(logicX,logicY) {
		return this.grid[logicX][logicY].idCase;
	};

	gameMain.prototype.checkAllCaseGravity = function() {
		if(this.isCheckingGravity){return;}
		if(!this.useGravity){return;}
		this.isCheckingGravity = true;

		var arraycaseToDown = {};
		var gravDir;
		var gD = {x:0,y:0};//gravityDirection
		for (var x = 1; x < this.grid.length-1; x++) {
			for (var y = 1; y < this.grid[x].length-1; y++) {
				if(this.grid[x][y].idCase == 0){
					gD.x = x;
					gD.y = y;
					gravDir = this.grid[x][y].gravityDirection;
					gD = this.applyGravity(gD,x,y);
					while(typeof(this.grid[gD.x]) != "undefined" && typeof(this.grid[gD.x][gD.y]) != "undefined"){
						if(gravDir != this.grid[gD.x][gD.y].gravityDirection){break;}
						if(this.grid[gD.x][gD.y].idCase == 0 || this.grid[gD.x][gD.y].gravityDirection == -1){gD = this.applyGravity(gD,x,y);continue;}
						if(typeof(arraycaseToDown[gD.x+"_"+gD.y]) == "undefined"){
							arraycaseToDown[gD.x+"_"+gD.y] = {
								logicX:gD.x,
								logicY:gD.y,
								count:0
							}
						}
						arraycaseToDown[gD.x+"_"+gD.y].count ++;
						gD = this.applyGravity(gD,x,y);
					}
				}
			};
		};


		//sort Object
		var arraySort= [];
		for(var i in arraycaseToDown){
			arraySort.push(arraycaseToDown[i]);
		}

		arraySort.sort(function(a, b){
			var aO = this.grid[a.logicX][a.logicY];
			var bO = this.grid[b.logicX][b.logicY];
			if(aO.gravityDirection != bO.gravityDirection || aO.gravityDirection == -1 || bO.gravityDirection == -1){
				return a - b;
			}
			if(aO.gravityDirection == 0){
				return a.logicY-b.logicY;
			}
			if(aO.gravityDirection == 1){
				return b.logicX-a.logicX;
			}
			if(aO.gravityDirection == 2){
				return b.logicY-a.logicY;
			}
			if(aO.gravityDirection == 3){
				return a.logicX-b.logicX;
			}
		}.bind(this))

		for(var i in arraySort){
			var a = arraySort[i];
			gD = this.applyGravity({x:0,y:0},a.logicX,a.logicY);
			c2_callFunction(C2FUNC.moveCase,[a.logicX,a.logicY,-gD.x,-gD.y,a.count]);

			this.grid[a.logicX + (-gD.x*a.count)][a.logicY + (-gD.y*a.count)].idCase = this.grid[a.logicX][a.logicY].idCase;
			this.grid[a.logicX + (-gD.x*a.count)][a.logicY + (-gD.y*a.count)].canBeTouched = true;

			this.grid[a.logicX][a.logicY].idCase = 0;
			this.grid[a.logicX][a.logicY].canBeTouched = false;

		}
	};

	gameMain.prototype.applyGravity = function(direction,x,y) {

		switch(this.grid[x][y].gravityDirection){
			case 0:
				direction.y ++;
			break;
			case 1:
				direction.x --;
			break;
			case 2:
				direction.y --;
			break;
			case 3:
				direction.x ++;
			break;
		}
		return direction;
	};

	gameMain.prototype.isEnd = function() {
		if(! this.isInit){ return 0;}
		if(c2_callFunction(C2FUNC.isTuto)){return 0;}
		for (var x = 0; x < this.grid.length; x++) {
			for (var y = 0; y < this.grid[x].length; y++) {
				if(this.grid[x][y].canBeTouched){
					return 0;
				}
			};
		};
		return 1;
	};

	gameMain.prototype.setTouchableCase = function(isTouchable,logicX,logicY) {
		if(logicX >= this.gridInfo.GRID_WIDTH){return;}
		if(logicX < 0){return;}
		if(logicY >= this.gridInfo.GRID_HEIGHT){return;}
		if(logicY < 0){return;}

		var caseSelected = this.grid[logicX][logicY];
		if(isTouchable){
			caseSelected.canBeTouched = true;
		}else{
			caseSelected.canBeTouched = false;
		}
	};

/////////////////////////////////////	

/////////////////////////////////////
// caseGrid
	var caseGrid = function(){};
	caseGrid.id = 0;
	caseGrid.prototype.create = function(logicX,logicY) {
		this.id = caseGrid.id++;
		this.logicX = logicX;
		this.logicY = logicY;
		this.canBeTouched = false;
		this.isTouched = false;
		this.idCase = -1; //-1 = block -- 0 = canPass -- other = RealId
		this.gravityDirection = -1; //-1noGravity, 0top - 1right - 2bottom - 3left

		return this;
	};

	caseGrid.prototype.createC2 = function() {
		c2_callFunction(C2FUNC.createCase,[this.logicX,this.logicY,this.idCase,this.id]);
	};

	caseGrid.prototype.flashCase = function() {
		c2_callFunction(C2FUNC.flashcase,[this.logicX,this.logicY]);
	};

	caseGrid.prototype.update = function() {
		c2_callFunction(C2FUNC.updateCase,[this.logicX,this.logicY,this.idCase,this.id]);
	};	

	caseGrid.prototype.setIsTouched = function(bool) {
		this.isTouched = bool;
		c2_callFunction(C2FUNC.updateIsTouched,[this.logicX,this.logicY,this.idCase,((bool)?1:0)]);
	};

	caseGrid.prototype.destroy = function() {
		this.canBeTouched = false;
		this.idCase = 0;
		c2_callFunction(C2FUNC.waitForDestroyCase,[this.logicX,this.logicY]);
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
/////////////////////////////////////

/////////////////////////////////////
// object
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.gameMain = new gameMain();
/////////////////////////////////////

})();

