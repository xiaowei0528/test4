;(function(){
var VERSION = "1.3";

/////////////////////////////////////
// var
	var C2FUNC = {
		objListMoved 		: "objListMoved",
		objListRemoved 		: "objListRemoved",
		listEndMoved 		: "listEndMoved"
	};

	var ORIENTATION = {
		VERTICAL	: "vertical",
		HORIZONTAL	: "horizontal"
	}
/////////////////////////////////////

/////////////////////////////////////
// waitingListManager
	var waitingListManager = function(){};
	waitingListManager.prototype.C2_RUNTIME = cr_getC2Runtime();
	waitingListManager.prototype.waitList = {};
	waitingListManager.prototype.isInit = false;

	waitingListManager.prototype.init = function(typeMap){
		if(this.isInit){return;}
		this.isInit = true;
		this.waitList = {};

		return this;
	};

	waitingListManager.prototype.createList = function(listName,orientation,startPos,height,offset) {
		if(this.waitList[listName]){return;}
		var listName	= listName;
		var startPos	= (typeof(startPos) != "undefined")?startPos:0;
		var height		= (typeof(height) != "undefined")?height:0;
		var orientation	= (typeof(orientation) != "undefined" && (orientation === ORIENTATION.HORIZONTAL || orientation === ORIENTATION.VERTICAL))?orientation:ORIENTATION.VERTICAL;
		var offset		= (typeof(offset) != "undefined")?offset:0;

		this.waitList[listName] = new WaitingList().create(this, listName,orientation,startPos,height,offset);
		this.checkListCount(true);
	};

	waitingListManager.prototype.removeList = function(listName) {
		if(!this.waitList[listName]){return;}
		delete this.waitList[listName];
		this.checkListCount(false);
	};

	waitingListManager.prototype.checkListCount = function(isAdding) {
		var count = 0;
		for(var i in this.waitList){
			count++;
		}
		if(count === 0){
			this.C2_RUNTIME.untick2Me(this);
		}
		if(count === 1 && isAdding){
			this.C2_RUNTIME.tick2Me(this);
		}
	};

	waitingListManager.prototype.tick2 = function() {
		for(var i in this.waitList){
			this.waitList[i].update(this.C2_RUNTIME.getDt());
		}
	};

	// _________________________SETTER________________________________________________________________
	waitingListManager.prototype.setActivated = function(listName,activated) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setActivated(!!activated);
	};
	waitingListManager.prototype.setStartPos = function(listName,startPos) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setStartPos((typeof(startPos) != "undefined")?startPos:0);
	};
	waitingListManager.prototype.setOrientation = function(listName,orientation) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setOrientation((typeof(orientation) != "undefined" && (orientation === ORIENTATION.HORIZONTAL || orientation === ORIENTATION.VERTICAL))?orientation:ORIENTATION.VERTICAL);
	};
	waitingListManager.prototype.setOffset = function(listName,offset) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setOffset((typeof(offset) != "undefined")?offset:0);
	};
	waitingListManager.prototype.setHeight = function(listName,height) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setHeight((typeof(height) != "undefined")?height:0);
	};
	waitingListManager.prototype.setOffsetStart = function(listName,offsetStart) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setOffsetStart((typeof(offsetStart) != "undefined")?offsetStart:0);
	};
	waitingListManager.prototype.setRoundScroll = function(listName,roundScroll,smoothActive,smoothSpeed) {
		//speed is more like an acceleration
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setRoundScroll(!!((typeof(roundScroll) != "undefined")?roundScroll:false),!!((typeof(smoothActive) != "undefined")?smoothActive:false),(typeof(smoothSpeed) != "undefined")?smoothSpeed:10);
	};
	waitingListManager.prototype.setClampObject = function(listName,clampMin,clampMax,offsetBetweenClamp) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setClampObject((typeof(clampMin) != "undefined")?clampMin:null,(typeof(clampMax) != "undefined")?clampMax:null,(typeof(offsetBetweenClamp) != "undefined")?offsetBetweenClamp:0);
	};
	waitingListManager.prototype.setCanMoveByUid = function(listName,uid,canMove) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setCanMoveByUid(uid,!!canMove);
	};
	waitingListManager.prototype.setVisibleObject = function(listName,uid,visible) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setVisibleObject(uid,!!visible);
	};
	waitingListManager.prototype.setTemporaryPosDrop = function(listName,temporaryPos) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setTemporaryPosDrop(temporaryPos);
	};
	waitingListManager.prototype.setActiveCallbackByName = function(listName,callbackName,active) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setActiveCallbackByName(callbackName,!!active);
	};
	//_________________________GETTER_________________________________________________________________
	waitingListManager.prototype.getPercentScrollList = function(listName) {
		if(!this.waitList[listName]){return;}
		return this.waitList[listName].getPercentScrollList();
	};
	waitingListManager.prototype.getPercentObjectOnList = function(listName,uid) {
		if(!this.waitList[listName]){return;}
		return this.waitList[listName].getPercentObjectOnList(uid);
	};
	waitingListManager.prototype.getVisibleObjectCount = function(listName) {
		if(!this.waitList[listName]){return;}
		return this.waitList[listName].getVisibleObject();
	};
	waitingListManager.prototype.getObjectCount = function(listName) {
		if(!this.waitList[listName]){return;}
		return this.waitList[listName].getObjectCount();
	};
	waitingListManager.prototype.getPosObjectByUid = function(listName,uid) {
		if(!this.waitList[listName]){return -1;}
		return this.waitList[listName].getPosObjectByUid(uid);
	};
	waitingListManager.prototype.uidIsOnList = function(listName,uid) {
		if(!this.waitList[listName]){return false;}
		return this.waitList[listName].uidIsOnList(uid);
	};
	waitingListManager.prototype.getRandomObjectOnList = function(listName) {
		if(!this.waitList[listName]){return false;}
		return this.waitList[listName].getRandomObjectOnList();
	};
	waitingListManager.prototype.getRandomObjectVisibleOnList = function(listName) {
		if(!this.waitList[listName]){return false;}
		return this.waitList[listName].getRandomObjectVisibleOnList();
	};
	waitingListManager.prototype.isOnMovement = function(listName) {
		if(!this.waitList[listName]){return false;}
		return this.waitList[listName].isOnMovement();
	};
	//_________________________SCROLLING______________________________________________________________
	waitingListManager.prototype.endMove = function(listName){
		if(!this.waitList[listName]){return;}
		this.waitList[listName].endMove();
	};
	waitingListManager.prototype.resetMove = function(listName){
		if(!this.waitList[listName]){return;}
		this.waitList[listName].resetMove();
	};
	waitingListManager.prototype.move = function(listName,scrollAdd){
		if(!this.waitList[listName]){return;}
		this.waitList[listName].addScroll(scrollAdd);
	};
	waitingListManager.prototype.moveTo = function(listName,pos){
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setScroll(pos);
	};
	waitingListManager.prototype.movePercent = function(listName,scrollPercentAdd){
		if(!this.waitList[listName]){return;}
		this.waitList[listName].setScrollPercent(scrollPercentAdd);
	};
	waitingListManager.prototype.moveToPercent = function(listName,posPercent){
		if(!this.waitList[listName]){return;}
		this.waitList[listName].addScrollPercent(posPercent);
	};
	waitingListManager.prototype.addImpulsion = function(listName,inertialVelocity){
		if(!this.waitList[listName]){return;}
		this.waitList[listName].addImpulsion(inertialVelocity);
	};
	waitingListManager.prototype.stopImpulsion = function(listName){
		if(!this.waitList[listName]){return;}
		this.waitList[listName].stopImpulsion();
	};
	//________________________________________________________________________________________________
	waitingListManager.prototype.addToList = function(listName,uid,pos) {
		if(!this.waitList[listName]){return;}
		var object = this.C2_RUNTIME.getObjectByUID(uid);
		this.waitList[listName].addToList(uid,object,pos);
	};
	waitingListManager.prototype.removeToList = function(listName,uid) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].removeToList(uid);
	};
	waitingListManager.prototype.removeAllToList = function(listName) {
		if(!this.waitList[listName]){return;}
		this.waitList[listName].removeAll();
	};
/////////////////////////////////////

/////////////////////////////////////
// WaitingList
	var WaitingList = function(){};

	WaitingList.prototype.create = function(waitingListManager,listName,orientation,startPos,height,offset) {
		this.activated = true;
		this.waitingListManager = waitingListManager;
		this.updateVisibility = true;
		this.listName = listName;
		this.orientation = orientation;
		this.startPos = startPos;
		this.offset = offset; //offset between object
		this.offsetScroll = this.offset/2; //offset made by scroll list
		this.offsetStart = 0; //offset before list
		this.roundScroll = false;
		this.listOfObjectVisible = 0;
		this.temporaryPos = -1;
		this.actualDirection = 0; // > 0 = right && < 0 = left; 0 = no previous direction(only on launch)

		this.activeCallback = {
			objListMoved	: false,
			objListRemoved	: false,
			listEndMoved	: false
		};

		this.roundScroll_smoothScrollToMove = 0;
		this.roundScroll_smoothSpeed = 10; //by second
		this.roundScroll_THRESHOLD = 2; //by second
		this.roundScroll_activeSmooth = false;

		this.INERTIA_SCROLL_FACTOR = 0.9;
		this.INERTIA_ACCELERATION = 0.97;
		this.INERTIA_THRESHOLD = 20;
		this.inertialVelocity = 0;

		this.clampMinPosObject = null;
		this.clampMaxPosObject = null;
		this.offsetBetweenClamp = 0;

		this.setHeight(height);

		this.maxScroll = 0;
		this.listOfObject = [];
		this.listOfObjectUid = {};

		return this;
	};

	WaitingList.prototype.isObjectOnListExist = function(uid) {
		return (typeof(this.listOfObjectUid[uid]) == "undefined")?false:true;
	};

	WaitingList.prototype.setActivated = function(activated) {
		this.activated = activated;
	};
	WaitingList.prototype.setStartPos = function(startPos) {
		this.startPos = startPos;
	};
	WaitingList.prototype.setOrientation = function(orientation) {
		this.orientation = orientation;
	};
	WaitingList.prototype.setOffset = function(offset) {
		this.offset = offset;
	};
	WaitingList.prototype.setHeight = function(height) {
		this.baseHeight = height;
		this.height = this.baseHeight-this.offsetStart;
	};
	WaitingList.prototype.setOffsetStart = function(offsetStart) {
		this.offsetStart = offsetStart;
		this.setHeight(this.baseHeight);
		this.calculMaxScroll();
	};
	WaitingList.prototype.setRoundScroll = function(roundScroll,smoothActive,smoothSpeed) {
		this.roundScroll = roundScroll;
		this.roundScroll_activeSmooth = smoothActive;
		this.roundScroll_smoothSpeed = smoothSpeed;
	};
	WaitingList.prototype.setClampObject = function(clampMin,clampMax,offsetBetweenClamp) {
		this.clampMinPosObject = clampMin;
		this.clampMaxPosObject = clampMax;
		this.offsetBetweenClamp = offsetBetweenClamp;
	};
	WaitingList.prototype.setCanMoveByUid = function(uid,canMove){
		if(!this.isObjectOnListExist(uid)){return false;}
		return this.listOfObjectUid[uid].setCanMove(canMove);
	};
	WaitingList.prototype.setVisibleObject = function(uid,visible) {
		if(!this.isObjectOnListExist(uid)){return false;}
		var asChanged = this.listOfObjectUid[uid].setVisible(visible);
		if(asChanged) this.updateVisibility = true;
	};
	WaitingList.prototype.setTemporaryPosDrop = function(temporaryPos) {
		this.temporaryPos = temporaryPos;
	};
	WaitingList.prototype.setActiveCallbackByName = function(callbackName,active) {
		this.activeCallback[callbackName] = active;
	};

	WaitingList.prototype.getPercentScrollList = function() {
		var min = this.offset/2;
		return (this.offsetScroll-min)*100/(this.maxScroll-min);
	};
	WaitingList.prototype.getPercentObjectOnList = function(uid) {
		if(!this.isObjectOnListExist(uid)){return false;}
		return this.listOfObjectUid[uid].getPercentOnList();
	};
	WaitingList.prototype.getVisibleObject = function() {
		return this.listOfObjectVisible;
	};
	WaitingList.prototype.getObjectCount = function() {
		return this.listOfObject.length;
	};
	WaitingList.prototype.getPosObjectByUid = function(uid) {
		if(!this.isObjectOnListExist(uid)){return -1;}
		return this.listOfObjectUid[uid].posToShow;
	};
	WaitingList.prototype.uidIsOnList = function(uid) {
		return this.isObjectOnListExist(uid);
	};
	WaitingList.prototype.getRandomObjectOnList = function() {
		if(this.listOfObject.length <= 0){return -1;}
		return this.listOfObject[Math.floor(Math.random()*this.listOfObject.length)].uid;
	};
	WaitingList.prototype.getRandomObjectVisibleOnList = function() {
		if(this.listOfObject.length <= 0){return -1;}
		var listVisible = [];
		for (var i = 0; i < this.listOfObject.length; i++) {
			if(this.listOfObject[i].visible){
				listVisible.push(this.listOfObject[i]);
			}
		};
		return (listVisible.length > 0)?listVisible[Math.floor(Math.random()*listVisible.length)].uid : -1;
	};
	WaitingList.prototype.isOnMovement = function() {
		if(this.listOfObject.length <= 0){return false;}
		if(this.inertialVelocity != 0){return true;}
		if(this.roundScroll_smoothScrollToMove != 0){return true;}
		return false;
	};

	// SCROLL------------------------------------------------------------------------------
	WaitingList.prototype.setActualPos = function(newPos) {
		if(newPos > this.offsetScroll){
			this.actualDirection = -1;
		}else if(newPos < this.offsetScroll){
			this.actualDirection = 1;
		}
	};
	WaitingList.prototype.resetMove = function() {
		this.actualDirection = 0;
		this.stopImpulsion();
		this.stopMoveRoundScroll();
	};
	WaitingList.prototype.setScroll = function(pos) {
		if(this.listOfObjectVisible * this.offset <= this.height) return;
		this.setActualPos(pos);
		this.offsetScroll = pos;
		this.clampScroll();
	};
	WaitingList.prototype.addScroll = function(scrollAdd) {
		this.setScroll(scrollAdd + this.offsetScroll);
	};
	WaitingList.prototype.setScrollPercent = function(percent) {
		this.setScroll(this.getScrollByPercent(percent));
	};
	WaitingList.prototype.addScrollPercent = function(percent) {
		this.setScrollPercent(percent + this.getScrollPercent());
	};
	//round Scroll
	WaitingList.prototype.endMove = function() {
		if(this.roundScroll){
			if(this.roundScroll_activeSmooth){
				if(this.listOfObjectVisible > 1){
					var newPos = this.offsetScroll;

					if(this.actualDirection < 0){
						newPos = this.getScrollByPercent(floorTo(this.getScrollPercent(), 100/(this.listOfObjectVisible-1)));
					}else if(this.actualDirection > 0){
						newPos = this.getScrollByPercent(ceilTo(this.getScrollPercent(), 100/(this.listOfObjectVisible-1)));
					}
					var offsetToMove = newPos - this.offsetScroll;
					this.roundScroll_smoothScrollToMove = offsetToMove;
					if(offsetToMove == 0){
						this.endMoveRoundScroll();
					}
				}
			}else{
				this.endMoveRoundScroll();
			}
		}else{
			if(this.activeCallback.listEndMoved) c2_callFunction(C2FUNC.listEndMoved,[this.listName]),"scrollList";
		}
	};
	WaitingList.prototype.endMoveRoundScroll = function() {
		if(this.roundScroll){
			if(this.listOfObjectVisible > 1){
				this.setScroll(this.getScrollByPercent(roundTo(this.getScrollPercent(), 100/(this.listOfObjectVisible-1))));
			}
			if(this.activeCallback.listEndMoved) c2_callFunction(C2FUNC.listEndMoved,[this.listName],"scrollList");
		}
	};
	WaitingList.prototype.stopMoveRoundScroll = function() {
		this.roundScroll_smoothScrollToMove = 0;
	};
	//-------
	WaitingList.prototype.getScrollPercent = function() {
		return Math.abs(((this.offsetScroll-this.offset/2)*100)/(this.maxScroll-this.offset/2));
	};
	WaitingList.prototype.getScrollByPercent = function(percent) {
		return ((this.maxScroll-this.offset/2)*percent/100)+this.offset/2;
	};
	WaitingList.prototype.addImpulsion = function(inertialVelocity){
		this.inertialVelocity = inertialVelocity;
	};
	WaitingList.prototype.stopImpulsion = function(){
		this.inertialVelocity = 0;
	};

	WaitingList.prototype.clampScroll = function() {
		this.offsetScroll = clamp(this.offsetScroll,this.maxScroll,this.offset/2);
	};

	WaitingList.prototype.calculMaxScroll = function() {
		this.maxScroll = (this.height + this.offset/2 - this.offset * this.listOfObjectVisible);
	};
	// ------------------------------------------------------------------------------

	WaitingList.prototype.addToList = function(uid,object,newPos) {
		if(this.isObjectOnListExist(uid)){
			this.listOfObjectUid[uid].update();
			return false;
		}
		newPos = (typeof(newPos) ==="undefined")?this.listOfObject.length:clamp(newPos, 0, this.listOfObject.length);
		//move to down all case
		for(var i =0; i < this.listOfObject.length;i++){
			if(this.listOfObject[i].pos >= newPos){
				this.listOfObject[i].moveCaseByLogic(1);
			}
		}

		var newObject = new WaitingListObj().create(this, object, newPos,true);
		this.listOfObjectUid[uid] = newObject;
		this.listOfObject.push(newObject);
		this.updateVisibility = true;

		this.calculMaxScroll();
		this.clampScroll();
	};

	WaitingList.prototype.removeToList = function(uid) {
		if(!this.isObjectOnListExist(uid)){return false;}
		var posList,posCaseToRemove;
		for(var i =0; i < this.listOfObject.length;i++){
			if(this.listOfObject[i].uid === uid){
				posList = i;
				posCaseToRemove = this.listOfObject[i].pos;
				break;
			}
		}
		if(typeof(posCaseToRemove) === "undefined"){console.log("NEW CASE TO REMOVE FROM THE LIST IS NOT FOUND"); return;}
		for(var i =0; i < this.listOfObject.length;i++){
			if(this.listOfObject[i].pos > posCaseToRemove){
				this.listOfObject[i].moveCaseByLogic(-1);
			}
		}
		if(this.listOfObject[posList].visible){
			this.listOfObjectVisible--;
		}
		var d = this.listOfObject[posList];
		delete this.listOfObjectUid[uid];
		this.listOfObject.splice(posList, 1);
		d.removeIt();
		d = undefined;

		this.updateVisibility = true;
		this.calculMaxScroll();
		this.clampScroll();
	}

	WaitingList.prototype.removeAll = function() {
		for(var i in this.listOfObjectUid){
			this.removeToList(parseInt(i));
		}
	};

	WaitingList.prototype.update = function(dt){
		
		if(!this.activated){return;}
		if(this.updateVisibility){
			this.updateObjVisibility();
		}
		if(this.inertialVelocity != 0){
			this.addScroll(this.inertialVelocity * this.INERTIA_SCROLL_FACTOR * dt);
			this.inertialVelocity = this.inertialVelocity * (1-(this.INERTIA_ACCELERATION*dt));
			var saveScroll = this.offsetScroll;
			if (Math.abs(this.inertialVelocity) < this.INERTIA_THRESHOLD || saveScroll != this.offsetScroll){
				this.inertialVelocity = 0;
				this.endMove();
			}
		}

		if(this.roundScroll_smoothScrollToMove != 0){
			var toRemove = this.roundScroll_smoothScrollToMove * this.roundScroll_smoothSpeed * dt;
			this.addScroll(toRemove);
			this.roundScroll_smoothScrollToMove -= toRemove;
			if(Math.abs(this.roundScroll_smoothScrollToMove) < this.roundScroll_THRESHOLD){
				this.roundScroll_smoothScrollToMove = 0;
				this.endMoveRoundScroll();
			}
		}


		for (var i = 0; i < this.listOfObject.length; i++) {
			this.listOfObject[i].update(dt);
		};
	};

	WaitingList.prototype.updateObjVisibility = function() {
		var idToShow = 0;
		this.listOfObject.sort(function(a,b){return a.pos - b.pos})

		for (var i = 0; i < this.listOfObject.length; i++) {
			this.listOfObject[i].posToShow = (this.listOfObject[i].visible)?idToShow++:-1;
		};
		this.listOfObjectVisible = idToShow;
		this.updateVisibility = false;
		this.calculMaxScroll();
		this.clampScroll();
	};
/////////////////////////////////////

/////////////////////////////////////
// WaitingListObj
	var WaitingListObj = function(){};
	
	WaitingListObj.prototype.create = function(list,object,pos,visible) {
		this.list = list;
		this.object = object;
		this.pos = (typeof(pos) != "undefined")?pos:-1;
		this.posToShow = this.pos;
		this.visible = (typeof(visible) != "undefined")?visible:true;
		this.uid = this.object.uid;
		this.canMove = true;
		//------------------------
		this.update();
		return this;
	};

	WaitingListObj.prototype.removeIt = function() {
		if(this.list.activeCallback.objListRemoved) c2_callFunction(C2FUNC.objListRemoved,[this.uid],"scrollList");
	};

	WaitingListObj.prototype.setCanMove = function(canMove) {
		this.canMove = canMove;
	};

	WaitingListObj.prototype.moveCaseByLogic = function(logic) {
		this.pos += logic;
		if(this.visible){
			this.posToShow += logic;
			this.update();
		}
	};

	WaitingListObj.prototype.update = function() {
		if(!this.list.activated){return;}
		if(!this.canMove){return;}
		if(this.posToShow == -2){return;}
		var dt = this.list.waitingListManager.C2_RUNTIME.getDt(this.object);
		var newX = (this.list.orientation == ORIENTATION.VERTICAL)?this.list.startPos:this.getPosObject();
		var newY = (this.list.orientation == ORIENTATION.HORIZONTAL)?this.list.startPos:this.getPosObject();

		//clamp
		if(this.list.clampMinPosObject != null && this.list.clampMaxPosObject != null){
			var clampMin = this.list.clampMinPosObject + (this.posToShow * this.list.offsetBetweenClamp);
			var clampMax = this.list.clampMaxPosObject - ((this.list.listOfObjectVisible-1 - this.posToShow) * this.list.offsetBetweenClamp);

			if(this.list.orientation == ORIENTATION.HORIZONTAL) newX = clamp(newX, clampMin, clampMax);
			if(this.list.orientation == ORIENTATION.VERTICAL) newY = clamp(newY, clampMin, clampMax);
		}
		//move if necessary
		if(newX != this.object.x || newY != this.object.y){
			this.object.x = newX;
			this.object.y = newY;
			this.object.set_bbox_changed();
			if(this.list.activeCallback.objListMoved) c2_callFunction(C2FUNC.objListMoved,[this.object.uid],"scrollList");
		}

		if(this.posToShow == -1){this.posToShow == -2}
	};

	WaitingListObj.prototype.setVisible = function(visible) {
		if(this.visible == visible) return false;
		this.visible = visible;
		return true;
	};

	WaitingListObj.prototype.getPosObject = function() {
		// console.log(this.list.temporaryPos);
		return this.list.offsetStart + this.list.offsetScroll + (this.posToShow + ((this.list.temporaryPos != -1 && this.posToShow >= this.list.temporaryPos)?1:0)) * this.list.offset;
	};

	//not sur it work correctly, is enought for what i want to do, but don't return the perfect position....
	WaitingListObj.prototype.getPercentOnList = function() {
		var pos = this.getPosObject()-this.list.offsetStart;
		var min = this.list.maxScroll;
		var max = this.list.height;
		var clampMin = 0;
		if(this.list.clampMinPosObject != null && this.list.clampMaxPosObject != null){

			//pos = this.getPosObject();
			clampMin = this.list.clampMinPosObject + (this.posToShow * this.list.offsetBetweenClamp)-this.list.offsetStart;
			var clampMax = this.list.clampMaxPosObject - ((this.list.listOfObjectVisible-1 - this.posToShow) * this.list.offsetBetweenClamp)-this.list.offsetStart;
			if(this.list.orientation == ORIENTATION.HORIZONTAL) pos = clamp(pos, clampMin, clampMax);
			if(this.list.orientation == ORIENTATION.VERTICAL) pos = clamp(pos, clampMin, clampMax);

			min = clampMin;
			max = clampMax;
		}
		if(pos <0 || clampMin < 0){
			return ((pos-min)*100)/(max-min); // if pos negative
		}
		return Math.abs((pos*100)/(max-min));
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

	function clamp(x, lower, upper) {
		return Math.min(upper, Math.max(lower, x));
	}

	function roundTo(value, round){
		return Math.round(value/round) * round;
	}

	function floorTo(value, round){
		return Math.floor(value/round) * round;
	}

	function ceilTo(value, round){
		return Math.ceil(value/round) * round;
	}
/////////////////////////////////////

/////////////////////////////////////
// object
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.waitingListManager = new waitingListManager().init();
	playtouch.waitingListManager.VERSION = VERSION;
/////////////////////////////////////

})();



//changelog:
//	1.3:
//		- add tag to c2_callFunction
//
//	1.2
//		- add function for enabled the callback function (disabled by default), use it only if necessary (can be big)
//			objListMoved,objListRemoved,listEndMoved
//		- add function "getPercentScrollList"
//			
//	1.1
//		-add function "isOnMovement" return if a waitingList is on Movement