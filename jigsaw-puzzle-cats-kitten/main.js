;(function(){

/////////////////////////////////////
// var
	var C2FUNC = {
		createCase				: "createCase",
		updateCase				: "updateCase",
		updateBorderCase		: "updateBorderCase",
		endCreatePuzzle 		: "endCreatePuzzle",
		getXByLogicX			: "getXByLogicX",
		getYByLogicY			: "getYByLogicY",
		groupChanged			: "groupChanged",
		animCaseNeighboor		: "animCaseNeighboor",
		getRotation				: "getRotation",
		createCaseOuline		: "createCase_outline",
		endCreateOutline		: "endCreateOutline",
		caseIsOnList			: "caseIsOnList"
	};

	var NEIGHBOR_POS = [
		{x:-1, y:0},
		{x:1 , y:0},
		{x:0 , y:-1},
		{x:0 , y:1}
	];
/////////////////////////////////////

/////////////////////////////////////
// GAME gameMain
	var gameMain = function(){};
	gameMain.prototype.C2_RUNTIME = cr_getC2Runtime();

	gameMain.prototype.lvl_info = [];
	gameMain.prototype.listOfCase = [];
	gameMain.prototype.piecesToUpdate = {};
	gameMain.prototype.listOfGroup = {};
	gameMain.prototype.isInit = false;
	gameMain.prototype.isOnLoadingSave = false;

	gameMain.prototype.init = function(typeMap){
		if(this.isInit){return;}
		this.logicSize ={
			width: parseInt(typeMap.replace(/([0-9]+)x([0-9]+)/,"$1")),
			height: parseInt(typeMap.replace(/([0-9]+)x([0-9]+)/,"$2")),
		};
		this.isOnLoadingSave = false;
		this.lvl_info = this.map[typeMap];
		this.isInit = true;
		this.listOfCase = [];
		this.piecesToUpdate = {};
		this.listOfGroup = {};

		this.createMap();
	};

	gameMain.prototype.setMapJson = function(json) {
		this.map = json;
	};

	gameMain.prototype.setIsOnLoadSave = function(bool) {
		this.isOnLoadingSave = bool;
	};

	gameMain.prototype.endOfLayout = function() {
		this.isInit = false;
		this.lvl_info = [];
		this.listOfCase = [];
		this.listOfGroup = {};
	};

	gameMain.prototype.createMap = function() {
		//create all outline
		for (var i = 0; i < this.lvl_info.length; i++) {
			var logicX = i%this.logicSize.width;
			var logicY = Math.floor(i/this.logicSize.width);
			c2_callFunction(C2FUNC.createCaseOuline,[this.lvl_info[i].frame,logicX,logicY,this.lvl_info[i].x,this.lvl_info[i].y]);
		}
		//create all pieces
		for (var i = 0; i < this.lvl_info.length; i++) {
			var logicX = i%this.logicSize.width;
			var logicY = Math.floor(i/this.logicSize.width);
			//case
			if(!this.listOfCase[logicX]){ this.listOfCase[logicX] = [];}
			this.listOfCase[logicX].push(new CaseGrid().create(this,this.lvl_info[i].frame,logicX,logicY,this.lvl_info[i].x,this.lvl_info[i].y));
		}

		//add all neighbor
		var neighbor;
		for (var x = 0; x < this.listOfCase.length; x++) {
			for (var y = 0; y < this.listOfCase[x].length; y++) {
				neighbor = this.getAllNeighbor(x,y);
				for(var i=0;i < neighbor.length;i++){
					this.listOfCase[x][y].addNeigbor(neighbor[i]);
				}
			}
		}

		c2_callFunction(C2FUNC.endCreatePuzzle);
	};
	gameMain.prototype.piecesToUpdateIsVoid = function(){
		for(var i in this.piecesToUpdate){
			return true;
		}
		return false;
	}
	gameMain.prototype.updateNow = function() {
		for(var i in this.piecesToUpdate){
			this.piecesToUpdate[i].updateCaseC2();
		}
		this.piecesToUpdate = {};
	};

	//fast but work only if all caseGrid is on the good place on the board (good logic,logicY)
	gameMain.prototype.getAllNeighbor = function(x,y) {
		var neighbor = [];
		for(var i=0;i < NEIGHBOR_POS.length;i++){
			if(this.listOfCase[x + NEIGHBOR_POS[i].x] && this.listOfCase[x + NEIGHBOR_POS[i].x][y + NEIGHBOR_POS[i].y]){
				neighbor.push({
					caseGrid:this.listOfCase[x + NEIGHBOR_POS[i].x][y + NEIGHBOR_POS[i].y],
					fromX:NEIGHBOR_POS[i].x,
					fromY:NEIGHBOR_POS[i].y
				});
			}
		}
		return neighbor;
	};

	//more heavy than getAllNeighbor but can get every time the current neighbor of caseGrid
	gameMain.prototype.getActualNeighbor = function(x,y) {
		var neighbor = [];
		var actualNeighbor;
		for(var i=0;i < NEIGHBOR_POS.length;i++){
			actualNeighbor = this.getGridCaseByLogic(x + NEIGHBOR_POS[i].x, y + NEIGHBOR_POS[i].y)
			if(actualNeighbor) neighbor.push(actualNeighbor);
		}
		return neighbor;
	};

	gameMain.prototype.getGridCaseByLogic = function(logicX,logicY) {
		var allNeighbor= [];
		for (var x = 0; x < this.listOfCase.length; x++) {
			for (var y = 0; y < this.listOfCase[x].length; y++) {
				if(this.listOfCase[x][y].logicX == logicX && this.listOfCase[x][y].logicY === logicY){
					allNeighbor.push(this.listOfCase[x][y]);
				}
			}
		}
		return allNeighbor;
	};

	gameMain.prototype.checkNeigborByGroup = function(group,master) {
		if(!this.listOfGroup[group]){ return;}
		var caseGridToMove = [],neighbor,neighborNeighbor;
		// console.log("START CHECK");
		caseGridToMove.push(master);
		// boucle sur tous les membres du group
		for(var i in this.listOfGroup[group]){
			if(this.listOfGroup[group][i].isOnList()){return;}
			if(this.listOfGroup[group][i].getRotation() != 0){return;}
			//boucle sur tous les neihgbor de chaque membres du group
			for (var iN = this.listOfGroup[group][i].neighbor.length - 1; iN >= 0; iN--) {
				if(this.listOfGroup[group][i].neighbor[iN].caseGrid.isOnList()){continue;}
				if(this.listOfGroup[group][i].neighbor[iN].caseGrid.getRotation() != 0){continue;}
				neighbor = this.listOfGroup[group][i].neighbor[iN];
				neighborNeighbor = this.getGridCaseByLogic(this.listOfGroup[group][i].logicX + neighbor.fromX, this.listOfGroup[group][i].logicY + neighbor.fromY);
				for (var y = 0; y < neighborNeighbor.length; y++) {
					if(neighborNeighbor[y] && neighbor.caseGrid.id === neighborNeighbor[y].id){
						neighbor.caseGrid.removeNeigbor(this.listOfGroup[group][i]);
						this.listOfGroup[group][i].removeNeigbor(neighbor.caseGrid);
						caseGridToMove.push(neighbor.caseGrid);
						break;
					}
				}
			}
		}

		if(caseGridToMove.length <= 1){
			return;
		}

		
		for (var i = caseGridToMove.length - 1; i >= 0; i--) {
			for(var y in this.listOfGroup[caseGridToMove[i].group]){
				caseGridToMove.push(this.listOfGroup[caseGridToMove[i].group][y]);
			}
		};
		// console.log("NEW GROUP",group,this.getBiggestGroup(caseGridToMove));
		group = this.getBiggestGroup(caseGridToMove);
		
		for (var i = 0; i < caseGridToMove.length; i++) {
			caseGridToMove[i].addToGroup(group);
		};

		// anim
		if(caseGridToMove.length > 1 && typeof(master) != "undefined"){
			this.animCaseNear(master);
		}
		// console.log("_____________________________________");
	};

	gameMain.prototype.getBiggestGroup = function(listCase) {
		var groupList = {};
		var idBiggest,countBiggest = 0;

		for (var i = 0; i < listCase.length; i++) {
			// console.log(listCase[i],listCase[i].group);
			if(!groupList[listCase[i].group]){groupList[listCase[i].group] = 0}
			groupList[listCase[i].group]++;
		};

		for(var i in groupList){
			if(groupList[i] > countBiggest){
				countBiggest = groupList[i];
				idBiggest = i;
			}
		}
		// console.log("getBiggestGroup",listCase,groupList,countBiggest,idBiggest);
		return idBiggest;
	};

	gameMain.prototype.animCaseNear = function(caseGrid) {
		var arrayToAnim = [
			[-1,0,[
				[-2,0],
				[-1,-1],
				[-1,1]
			]],
			[0,-1,[
				[-1,-1],
				[0,-2],
				[1,-1]
			]],
			[0,1,[
				[-1,1],
				[0,2],
				[1,1]
			]],
			[1,0,[
				[1,-1],
				[2,0],
				[1,1]
			]],
		]; 

		var neighboor,neighboor2;
		caseGrid.animCase(0);
		for (var i = 0; i < arrayToAnim.length; i++) {
			if(this.animCaseNearCheck(caseGrid, arrayToAnim[i], 1)){
				for (var y = 0; y < arrayToAnim[i][2].length; y++) {
					this.animCaseNearCheck(caseGrid, arrayToAnim[i][2][y], 2);
				}
			}
		};
	};

	gameMain.prototype.animCaseNearCheck = function(caseGrid,arrayToAnim,depth) {
		var neighboor = this.getGridCaseByLogic(caseGrid.logicX + arrayToAnim[0], caseGrid.logicY + arrayToAnim[1]);
		for (var i = 0; i < neighboor.length; i++) {
			if(neighboor[i] && neighboor[i].group == caseGrid.group){
				neighboor[i].animCase(depth);
				return true;
			}
		}
		return false;
	};

	gameMain.prototype.resetAnimFlag = function() {
		for (var x = 0; x < this.listOfCase.length; x++) {
			for (var y = 0; y < this.listOfCase[x].length; y++) {
				this.listOfCase[x][y].isFlagedAnim = false;
			}
		}	
	};

	gameMain.prototype.getNearestPos = function(posX,posY) {
		var nearestDist = {dist:Infinity,x:Infinity,y:Infinity,logicX:-1,logicY:-1};
		var dist;
		for (var x = 0; x < this.logicSize.width; x++) {
			for (var y = 0; y < this.logicSize.height; y++) {
				dist = distance(posX, posY, c2_callFunction(C2FUNC.getXByLogicX,[x]), c2_callFunction(C2FUNC.getXByLogicX,[y]));
				if(dist < nearestDist.dist){
					nearestDist = {dist:dist,logicX:x,logicY:y};
				}
			}
		}
		return nearestDist;
	};

	gameMain.prototype.addToGroup = function(CaseGrid,group) {
		if(!this.listOfGroup[group]){ this.listOfGroup[group] = {};}
		this.listOfGroup[group][CaseGrid.id] = CaseGrid;
		c2_callFunction(C2FUNC.groupChanged);
	};

	gameMain.prototype.removeFromGroup = function(CaseGrid,group) {
		if(!this.listOfGroup[group]){ return;}
		delete this.listOfGroup[group][CaseGrid.id];
		c2_callFunction(C2FUNC.groupChanged);
	};

	gameMain.prototype.isAloneInGroup = function(group) {
		var count = 0;
		for(var i in this.listOfGroup[group]){
			count++;
			if(count >1){
				return false;
			}
		}
		if(count < 1){
			return false;
		}
		return true;
	};

	gameMain.prototype.onDrop = function(logicX,logicY,x,y,masterDrop,asToClamp){
		// replace it
		var nLogicX = c2_callFunction("getLogicXByX",[x]);
		var nLogicY = c2_callFunction("getLogicYByY",[y]);
		if(masterDrop){
			this.onDropMasterOffsetX = nLogicX;
			this.onDropMasterOffsetY = nLogicY;
			if(asToClamp) nLogicX = (masterDrop)?clamp(nLogicX, 0, this.logicSize.width-1):nLogicX;
			if(asToClamp) nLogicY = (masterDrop)?clamp(nLogicY, 0, this.logicSize.height-1):nLogicY;
			this.onDropMasterOffsetX = nLogicX - this.onDropMasterOffsetX;
			this.onDropMasterOffsetY = nLogicY - this.onDropMasterOffsetY;
		}

		//add offset if not the masterPiece who drop
		this.listOfCase[logicX][logicY].replace(
			nLogicX+((masterDrop)?0:this.onDropMasterOffsetX),
			nLogicY+((masterDrop)?0:this.onDropMasterOffsetY)
		);
	};
	gameMain.prototype.onDropEnd = function(logicX,logicY) {
		delete this.onDropMasterOffsetY;
		delete this.onDropMasterOffsetX;
		this.checkNeigborByGroup(this.listOfCase[logicX][logicY].group, this.listOfCase[logicX][logicY]);
	};

	gameMain.prototype.onRotateEnd = function(logicX,logicY) {
		this.checkNeigborByGroup(this.listOfCase[logicX][logicY].group, this.listOfCase[logicX][logicY]);
	};

	gameMain.prototype.setLogicNull = function(logicX,logicY) {
		this.listOfCase[logicX][logicY].logicX = -1;
		this.listOfCase[logicX][logicY].logicY = -1;
	};

	gameMain.prototype.resetDragDxDy = function(uid) {
		var gsDragBehaviorArray = this.C2_RUNTIME.getObjectByUID(uid);
		for(var i =0;i < gsDragBehaviorArray.behavior_insts.length;i++){
			if(gsDragBehaviorArray.behavior_insts[i].type.name == "DragDrop"){
				gsDragBehaviorArray.behavior_insts[i].dx = 0;
				gsDragBehaviorArray.behavior_insts[i].dy = 0;
				break;
			}
		}
	};

	gameMain.prototype.getPercentBase50 = function(percent) {
		if(percent < 50){
			return percent*100/50;
		}else if(percent>50){
			return (100-percent)*100/50;
		}
		return 100;
	};

	gameMain.prototype.updateBorderObj = function() {
		for (var x = 0; x < this.listOfCase.length; x++) {
			for (var y = 0; y < this.listOfCase[x].length; y++) {
				c2_callFunction(C2FUNC.updateBorderCase,[this.listOfCase[x][y].id,(this.listOfCase[x][y].isEdge())?1:0]);
			}
		}
	};

	gameMain.prototype.getCountOfGroup = function() {
		var count = 0;
		for(var i in this.listOfGroup){
			for(var y in this.listOfGroup[i]){
				count ++;
				break;
			}
		}
		return count;
	};

	// save encode/Decode
	gameMain.prototype.encodeSavePuzzle = function(json){
		//frst way : 21caracter / pieces >> 629 = 13209
		// return JSON.stringify(this.convertJsonToBase(json)).replace(/\"/g,"").replace(/},/g, ";").replace(/:{/g, "_");
		//second way: 2 to 5 character /pieces >> 629 = 1886 to 3774
		//third way: 3 to 9 character /pieces >> 629 = 2516 to 6290
		var ret = "";
		var first = true;
		var json = this.convertJsonToBase(json);
		for(var i in json){
			if(!first){ ret += ",";}else{first=false;}
			//if they are on the good place, copy only 1time
			if((json[i].i+""+json[i].j) == (json[i].x+""+json[i].y)){
				ret += json[i].i+"|"+json[i].j;
			}else{
				ret += json[i].i+"|"+json[i].j+"|"+json[i].x+"|"+json[i].y;
			}
			// if angle not 0, we save it
			if(json[i].a == 90){ret+="|1";}
			if(json[i].a == 180){ret+="|2";}
			if(json[i].a == 270){ret+="|3";}
		}
		return ret;
	}

	gameMain.prototype.decodeSavePuzzle = function(str){
		//frst way
		// return JSON.stringify(this.convertJsonToInt(JSON.parse(str.replace(/[-0-9a-zA-Z\.]+/g,function(a){return '"'+a+'"';}).replace(/_/g,":{").replace(/;/g,"},"))));
		if(str == ""){return "";}
		var array = str.split(",");
		var arrayPiece;
		var jsonRet = {};
		for (var i = 0; i < array.length; i++) {
			arrayPiece = array[i].split("|");
			if(arrayPiece.length <= 3){
				arrayPiece.unshift(arrayPiece[1]);
				arrayPiece.unshift(arrayPiece[1]);
			}
			jsonRet[i] = {
				i:arrayPiece[0],
				j:arrayPiece[1],
				x:arrayPiece[2],
				y:arrayPiece[3],
				a:((arrayPiece[4] == 1)?90:((arrayPiece[4] == 2)?180:((arrayPiece[4] == 3)?270:0)))
			};
		};
		return JSON.stringify(this.convertJsonToInt(jsonRet));
	}

	gameMain.prototype.convertJsonToBase = function(json){
		var base = 36;
		var dId;
		var d = {};
		for(var i in json){
			dId = convertToBase(i, base);
			d[dId] = {};
			for(var y in json[i]){
				if(y == "a"){d[dId][y] = json[i][y];continue;}
				d[dId][y] = convertToBase(json[i][y], base);
			}
		}
		return d;
	};

	gameMain.prototype.convertJsonToInt = function(json){
		var base = 36;
		var dId;
		var d = {};
		for(var i in json){
			dId = convertToInt(i, base);
			d[dId] = {};
			for(var y in json[i]){
				if(y == "a"){d[dId][y] = json[i][y];continue;}
				d[dId][y] = convertToInt(json[i][y], base);
			}
		}
		return d;
	};
/////////////////////////////////////

/////////////////////////////////////
// CaseGrid
	var CaseGrid = function(){};
	CaseGrid.id = 0;
	
	CaseGrid.prototype.create = function(gameMain,frame,logicX,logicY,fakeX,fakeY) {
		this.id = CaseGrid.id++;
		this.gameMain = gameMain;
		//---------------------
		this.flatEdge = 0;
		this.neighbor = [];
		this.caseLinked = [];
		this.frame = frame;
		this.base_angle = 0;
		this.base_logicX = logicX;
		this.base_logicY = logicY;
		this.isFlagedAnim = false;
		//---------------------
		this.angle = this.base_angle;
		this.logicX = this.base_logicX;
		this.logicY = this.base_logicY;
		this.group = -1;
		//---------------------
		this.addToGroup(this.id);
		this.createC2(fakeX,fakeY);
		return this;
	};

	CaseGrid.prototype.addToGroup = function(group) {
		group = parseInt(group);
		if(this.group != group){
			this.gameMain.removeFromGroup(this, this.group);
			this.gameMain.addToGroup(this, group);
			this.group = group;
			this.updateCase();
		}
	};

	CaseGrid.prototype.addNeigbor = function(neighbor) {
		this.neighbor.push(neighbor);
		this.flatEdge ++;
	};

	CaseGrid.prototype.removeNeigbor = function(neighbor) {
		for(var i = this.neighbor.length - 1; i >= 0; i--) {
			if(this.neighbor[i].caseGrid.id === neighbor.id) {
				this.neighbor.splice(i, 1);
				this.caseLinked.push(neighbor);
			}
		}
	};

	CaseGrid.prototype.replace = function(logicX,logicY) {
		this.logicX = logicX;
		this.logicY = logicY;
		this.updateCase();
	};

	CaseGrid.prototype.isEdge = function() {
		if(this.flatEdge != 4){
			return true;
		}
		return false;
	};

	CaseGrid.prototype.animCase = function(child) {
		c2_callFunction(C2FUNC.animCaseNeighboor,[this.id,child]);
	};

	CaseGrid.prototype.updateCase = function() {
		this.gameMain.piecesToUpdate[this.id] = this;
	};

	CaseGrid.prototype.updateCaseC2 = function() {
		c2_callFunction(C2FUNC.updateCase,[this.logicX,this.logicY,this.angle,this.id,this.group]);
	};

	CaseGrid.prototype.createC2 = function(fakeX,fakeY) {
		c2_callFunction(C2FUNC.createCase,[this.frame,this.base_logicX,this.base_logicY,this.base_angle,this.id,fakeX,fakeY,this.group]);
	};

	CaseGrid.prototype.getRotation = function() {
		return c2_callFunction(C2FUNC.getRotation,[this.id]);
	};

	CaseGrid.prototype.isOnList = function() {
		// return playtouch.waitingListManager.uidIsOnList("listPuzzleGM",this.listOfGroup[group][i])
		return c2_callFunction(C2FUNC.caseIsOnList,[this.id]);
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

	function randomIntFromInterval(min,max){
		return Math.floor(Math.random()*(max-min+1)+min);
	}

	function sqr(a) {
		return a*a;
	}

	function distance(x1, y1, x2, y2) {
		return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
	}

	function clamp(x, lower, upper) {
		return Math.min(upper, Math.max(lower, x));
	}

	function convertToBase(value,base){
		return (value).toString(base);
	}

	function convertToInt(value,base){
		return parseInt(value,base);
	}
/////////////////////////////////////

/////////////////////////////////////
// object
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.gameMain = new gameMain();
/////////////////////////////////////

})();

