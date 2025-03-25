;(function(){
	var PLIBS_VERSION = "1.5.3";
/*********************************************
			Event To Fire
*********************************************/
	if(typeof(window.eventToFire) == "undefined"){
		var eventToFire = {};

		eventToFire.events = {};
		eventToFire.registerEvent = function(eventName, callback, staticArgs){
			if(typeof(eventName) != 'string') return false;
			if(typeof(callback) != 'function' && typeof(callback) != 'string') return false;
			if(typeof(this.events[eventName]) == 'undefined')	this.events[eventName] = [];
			this.events[eventName].push({"func":callback, "staticArgs":staticArgs});
			return true;
		}
		eventToFire.fireEvent = function(eventName){
			if(typeof(eventName) != 'string') return false;
			if(typeof(this.events[eventName]) == 'undefined') return false;
			for(var i =0; i < this.events[eventName].length;i++){
				var func = this.events[eventName][i]["func"];
				if(typeof func === "string") if(typeof window[func] === "function") func = window[func]; else continue;
				var args = [].slice.call(arguments, 1);
				args.push(this.events[eventName][i]["staticArgs"]);
				func.apply(this,args);
			}
			return true;
		}
		eventToFire.getAllEvent = function(){
			return this.events;
		}

		window.eventToFire = eventToFire;

		//compatibility playzool/shell
		window.registerEvent = function(eventName, callback, args){
			window.eventToFire.registerEvent(eventName, callback, args);
		}
		window.fireEvent = function(eventName,args){
			window.eventToFire.fireEvent(eventName,args);
		}
	}

/*********************************************
			Base converter
*********************************************/
	/*********************************************
				var
	*********************************************/
	var baseConverter = {};
	baseConverter.version = "1.0.1";
	/*********************************************
				function
	*********************************************/
	baseConverter.IntToBase = function(value, base){
		var neg = (value<0); value=Math.abs(value);
		return (base>9 && value<10) ? parseInt((value).toString(base)) * (neg ? -1 : 1) : (neg ? "-" : "") + (value).toString(base);
	};
	
	baseConverter.baseToInt = function(value, base){
		if(isNaN(value)){
			var neg = (typeof value[0] !== "undefined" && value[0] === "-");
			return parseInt(value.slice(neg ? 1 : 0), base) * (neg ? -1 : 1);
		}
		return parseInt(value, base);
	};
	
/*********************************************
			Version check
*********************************************/
	/*********************************************
				var
	*********************************************/
	var versionChecker = {};
	versionChecker.version = "1.0.0";
	/*********************************************
				function
	*********************************************/
	versionChecker.versionStrToNum = function(str_vers){
		if(typeof str_vers === "undefined") return 0;
		if(typeof str_vers !== "string") str_vers += "";
		var versionSplitted = str_vers.split(".");
		if(versionSplitted.length > 3)  return 0;
		while(versionSplitted.length < 3)  versionSplitted.push(0);
		return versionSplitted[0] * 1000000 + versionSplitted[1] * 1000 + versionSplitted[2] * 1;
	};
	versionChecker.isVersionMin = function(str_vers, min, inclusive){
		if(typeof inclusive !== "boolean") inclusive = true;
		versionToCheck = versionStrToNum(str_vers);
		switch(typeof min){ case "undefined": min = 1; break; case "string": min = versionStrToNum(min); break; case "number": break; default: return false; break; }
		return (versionToCheck > min || (inclusive && versionToCheck == min));
	};

/*********************************************
			Array wait For Function
*********************************************/
	/*********************************************
				var
	*********************************************/
	var arrayWaitForFunction = function(){};
	arrayWaitForFunction.prototype.version = "1.0.1";
	arrayWaitForFunction.prototype.array = [];
	arrayWaitForFunction.prototype.id = 0;
	/*********************************************
				function
	*********************************************/
	arrayWaitForFunction.prototype.update = function(dt){
		for (var i = 0; i < this.array.length; i++) {
			this.array[i].time -= dt;
		};
		this.checkArrayEndOfTime();
	};

	arrayWaitForFunction.prototype.waitForFunction = function(timeToWait,callback,param,persistentLevel){
		//NaN is the only things not equal to itself in javascript
		param = (Number(param) !== Number(param))?param:Number(param);
		this.array.push({
			time:timeToWait,
			callback:callback,
			param:param,
			id:this.id,
			persistentLevel:((typeof(persistentLevel) === "undefined")?0:persistentLevel)
		});
		return this.id++;
	};

	arrayWaitForFunction.prototype.checkArrayEndOfTime = function(){
		var toDestroy;
		for (var i = this.array.length - 1; i >= 0; i--) {
			if(this.array[i].time <= 0){
				toDestroy = this.array.splice(i,1)[0];
				break;
			}
		};

		if(typeof(toDestroy) != 'undefined'){
			c2_callFunction(toDestroy.callback,[toDestroy.param]);
			this.checkArrayEndOfTime();
		}
	};

	arrayWaitForFunction.prototype.clearArrayWait = function(persistentLevel){
		var persistentLevel = ((typeof(persistentLevel) === "undefined")?0:persistentLevel);
		for (var i = this.array.length - 1; i >= 0; i--) {
			if(this.array[i].persistentLevel <= persistentLevel){
				this.array.splice(i,1)[0];
			}
		};
		// this.array = [];
	};

	arrayWaitForFunction.prototype.stopWaitById = function(id){
		for (var i = 0; i < this.array.length; i++) {
			if(this.array[i].id == id){
				this.array.splice(i,1);
				break;
			}
		};
	};

	arrayWaitForFunction.prototype.startWaitNowById = function(id){
		var toDestroy;
		for (var i = 0; i < this.array.length; i++) {
			if(this.array[i].id == id){
				toDestroy = this.array.splice(i,1)[0];
				break;
			}
		};
		if(typeof(toDestroy) != 'undefined'){
			c2_callFunction(toDestroy.callback,[toDestroy.param]);
		}
	};

/*********************************************
			Non Finite State Machine
*********************************************/
	/*********************************************
				var
	*********************************************/
	var nfsm = function(){};
	nfsm.prototype.version = "1.0.3";
	nfsm.prototype.currentState = "default";
	nfsm.prototype.nextState = "";
	/*********************************************
				function
	*********************************************/
	nfsm.prototype.setCurrentState = function(currentState){
		this.currentState = ""+currentState;
		window.eventToFire.fireEvent("c2:nfsm:setCurrentState",currentState);
	};

	nfsm.prototype.setNext = function(nextState){
		this.nextState = ""+nextState;
		window.eventToFire.fireEvent("c2:nfsm:setNext",nextState);
	};

	nfsm.prototype.next = function(state){
		if(state == undefined || state == ""){
			if(this.nextState == undefined || this.nextState == ""){
				console.error("no next state","next State is required");
				return;
			}
		}else{
			this.setNext(state);
		}
		state = this.nextState;
		var beforeExitActualState = c2_callFunction("beforeExit_"+this.currentState,[this.currentState,state,{current:this.currentState,nextState:state}]);
		var beforeEnterNextState = c2_callFunction("beforeEnter_"+state,[this.currentState,state,{current:this.currentState,nextState:state,beforeExitResult:beforeExitActualState}]);
		window.eventToFire.fireEvent("c2:nfsm:nextRequest",{current:this.currentState,current:this.currentState,beforeExit:beforeExitActualState,beforeEnter:beforeEnterNextState});
		if(beforeExitActualState == 0 && beforeEnterNextState == 0){
			c2_callFunction("onExit_"+this.currentState,[this.currentState,state,{current:this.currentState,next:this.nextState}]);
			var previousState = this.currentState;
			this.currentState = state;
			this.nextState = "";
			window.eventToFire.fireEvent("c2:nfsm:nextSucceed",{previous:this.previousState,current:this.currentState});
			c2_callFunction("onEnter_"+this.currentState,[this.currentState,previousState,{current:this.currentState,previous:previousState}]);
		}else{
			window.eventToFire.fireEvent("c2:nfsm:nextFailed",{current:this.currentState, rejected:state, next:this.nextState});
			c2_callFunction("onFailExit_"+this.currentState,[this.currentState,state,beforeExitActualState,beforeEnterNextState,{current:this.currentState,nextState:state,beforeExitActualState:beforeExitActualState,beforeEnterNextState:beforeEnterNextState}]);
			c2_callFunction("onFailEnter_"+state,[this.currentState,state,beforeExitActualState,beforeEnterNextState,{current:this.currentState,nextState:state,beforeExitActualState:beforeExitActualState,beforeEnterNextState:beforeEnterNextState}]);
		}
		window.eventToFire.fireEvent("c2:nfsm:next", state);
	};

/*********************************************
			Shell Time Notifier
*********************************************/
	/*********************************************
				var
	*********************************************/
	var timeNotifier = function(){};
	timeNotifier.prototype.saveKey = "timeNotifier";
	timeNotifier.prototype.version = "1.0.3";
	timeNotifier.prototype.state = {
		ACTIVE			: "active",
		PENDING			: "pending",
		UNACTIVE		: "unactive"
	};
	timeNotifier.prototype.arrayNotif = {};
	/*********************************************
				function
	*********************************************/
	timeNotifier.prototype.init = function() {
		this.load();
		this.checkNotif();
	};
	
	timeNotifier.prototype.getCompressedStr = function(obj) {
		var toRet = {};
		for(var anAC in obj){
			if(!obj.hasOwnProperty(anAC)) continue;
			toRet[anAC] = {};
			if(obj[anAC]["count"] !== 0) toRet[anAC]["c"] = obj[anAC]["count"];
			toRet[anAC]["s"] = baseConverter.IntToBase(obj[anAC]["timeStart"], 36);
			if(obj[anAC]["lastAck"] > -1) toRet[anAC]["a"] = baseConverter.IntToBase(Math.max(0, obj[anAC]["timeStart"] - obj[anAC]["lastAck"]), 36);
			if(obj[anAC]["time"] !== 86400) toRet[anAC]["t"] = baseConverter.IntToBase(obj[anAC]["time"], 36);
			if(obj[anAC]["timeEnd"] - obj[anAC]["time"] * 1000 !== obj[anAC]["timeStart"]) toRet[anAC]["d"] = baseConverter.IntToBase(Math.max(0, obj[anAC]["timeEnd"] - obj[anAC]["timeStart"]), 36);
			if(obj[anAC]["message"] !== "") toRet[anAC]["m"] = obj[anAC]["message"];
			if(obj[anAC]["state"] !== this.state.ACTIVE) toRet[anAC]["e"] = (obj[anAC]["state"] === this.state.UNACTIVE) ? 0 : 1;
		}
		return JSON.stringify(toRet);
	};

	timeNotifier.prototype.getUnCompressedObj = function(objStr) {
		var toRet = {};
		if(typeof objStr === "object"){ obj = objStr; }else{ try{	var obj = JSON.parse(objStr);	}catch(e){	return toRet;	} }
		for(var anAC in obj){
			if(!obj.hasOwnProperty(anAC)) continue;
			if(typeof obj[anAC]["name"] !== "undefined"){ toRet[anAC] = Object.assign({}, obj[anAC]); continue;	}
			toRet[anAC] = {"name":anAC};
			toRet[anAC]["time"] = (typeof obj[anAC]["t"] === "undefined") ? 86400 : baseConverter.baseToInt(obj[anAC]["t"], 36);
			toRet[anAC]["state"] = (typeof obj[anAC]["e"] === "undefined") ? this.state.ACTIVE : ((obj[anAC]["e"] == 0) ? this.state.UNACTIVE : this.state.PENDING);
			toRet[anAC]["message"] = (typeof obj[anAC]["m"] === "undefined") ? "" : obj[anAC]["m"];
			toRet[anAC]["timeStart"] = baseConverter.baseToInt(obj[anAC]["s"], 36);
			toRet[anAC]["lastAck"] = (typeof obj[anAC]["a"] === "undefined") ? -1 : toRet[anAC]["timeStart"] - baseConverter.baseToInt(obj[anAC]["a"], 36);
			toRet[anAC]["timeEnd"] = (typeof obj[anAC]["d"] === "undefined") ? toRet[anAC]["timeStart"] + toRet[anAC]["time"]*1000 : toRet[anAC]["timeStart"] + baseConverter.baseToInt(obj[anAC]["d"], 36);
			toRet[anAC]["count"] = (typeof obj[anAC]["c"] === "undefined") ? 0 : obj[anAC]["c"];
		}
		return toRet;
	};
	
	timeNotifier.prototype.load = function() {
		this.arrayNotif = this.getUnCompressedObj(c2_callFunction("readCustomData",[this.saveKey,"{}"]));
		window.eventToFire.fireEvent("c2:timeNotifier:load");
	};

	timeNotifier.prototype.save = function() {
		var count = 0;
		for(var i in this.arrayNotif){count++;break;}
		if(count == 0){return;}
		c2_callFunction("writeCustomData",[this.saveKey,this.getCompressedStr(this.arrayNotif),""]);
		window.eventToFire.fireEvent("c2:timeNotifier:save");
	};

	timeNotifier.prototype.set = function(eventName, eventTime, eventMessage,notifyDevice,notifMessage,notifTitle) {
		if(typeof this.arrayNotif[eventName] === "undefined"){this.arrayNotif[eventName] = {count:0,lastAck:-1};}
		this.arrayNotif[eventName].state		= this.state.ACTIVE;
		this.arrayNotif[eventName].name			= eventName;
		this.arrayNotif[eventName].time			= eventTime;
		this.arrayNotif[eventName].message		= eventMessage;
		this.arrayNotif[eventName].timeStart	= Date.now();
		this.arrayNotif[eventName].timeEnd		= Date.now() + eventTime*1000;
		this.save();
		if(notifyDevice){
			window.eventToFire.fireEvent("c2:timeNotifier:onSetNotification",this.arrayNotif[eventName],notifMessage,notifTitle);
		}
		window.eventToFire.fireEvent("c2:timeNotifier:set", eventName, eventTime, eventMessage,notifyDevice,notifMessage,notifTitle);
	};

	timeNotifier.prototype.ack = function(eventName) {
		if(typeof this.arrayNotif[eventName] === "undefined"){return;}
		if(this.arrayNotif[eventName].state != this.state.PENDING){return;}
		this.arrayNotif[eventName].count ++;
		this.arrayNotif[eventName].state = this.state.UNACTIVE;
		this.arrayNotif[eventName].lastAck = Date.now();
		this.save();
		window.eventToFire.fireEvent("c2:timeNotifier:ack", eventName);
	};

	timeNotifier.prototype.cancel = function(eventName) {
		if(typeof this.arrayNotif[eventName] === "undefined")	return false;
		this.arrayNotif[eventName].state = this.state.UNACTIVE;
		this.save();
		window.eventToFire.fireEvent("c2:timeNotifier:cancel", eventName);
		return true;
	};

	timeNotifier.prototype.get = function(eventName) {
		if(typeof this.arrayNotif[eventName] === "undefined")	return 0;
		return JSON.stringify(this.arrayNotif[eventName]);
	};

	timeNotifier.prototype.getValue = function(eventName, key, defaultRet) {
		if(typeof defaultRet === "undefined") defaultRet = -1;
		if(typeof this.arrayNotif[eventName] === "undefined" || typeof key === "undefined" || typeof this.arrayNotif[eventName][key] === "undefined") return defaultRet;
		return this.arrayNotif[eventName][key];
	};

	timeNotifier.prototype.getAll = function() {
		return JSON.stringify(this.arrayNotif);
	};

	timeNotifier.prototype.exist = function(eventName) {
		return (typeof this.arrayNotif[eventName] !== "undefined");
	};

	timeNotifier.prototype.checkNotifByName = function(eventName) {
		if(typeof this.arrayNotif[eventName] === "undefined"){return;}
		if(this.arrayNotif[eventName].state == this.state.UNACTIVE){return;}
		if(Date.now() < this.arrayNotif[eventName].timeEnd){ return;}
		
		this.arrayNotif[eventName].state = this.state.PENDING;
		c2_callFunction("timeNotifier_onNotification",[eventName,this.arrayNotif[eventName].eventMessage,JSON.stringify(this.arrayNotif[eventName])]);
		this.save();
		window.eventToFire.fireEvent("c2:timeNotifier:onNotification",this.arrayNotif[eventName]);
		window.eventToFire.fireEvent("c2:timeNotifier:"+eventName,this.arrayNotif[eventName]);
	};

	timeNotifier.prototype.checkNotif = function() {
		for(var i in this.arrayNotif){
			this.checkNotifByName(i);
		}
	};

	timeNotifier.prototype.getSecondBySpecificTime = function(hours,minutes,seconds) {
		var d = new Date();
		d.setHours(hours,minutes,seconds)
		if(d.getTime() - Date.now() < 0){
			d.setHours(hours+24)
		}
		return d.getTime();
	};
	
	timeNotifier.prototype.toHHMMSS = function(seconds){
		var sec_num = parseInt(seconds, 10);
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    return hours+':'+minutes+':'+seconds;
	}

/*********************************************
			Achievements
*********************************************/
	/*********************************************
				var
	*********************************************/
	var achievement = function(){};
	achievement.prototype.saveKey = "achievement";
	achievement.prototype.version = "1.0.4";
	achievement.prototype.state = {
		HIDDEN			: "HIDDEN",
		REVEALED		: "REVEALED",
		UNLOCKED		: "UNLOCKED"
	};
	achievement.prototype.type = {
		STANDARD		: "STANDARD",
		INCREMENTAL		: "INCREMENTAL"
	};
	achievement.prototype.arrayAchievement = {};
	/*********************************************
				function
	*********************************************/
	achievement.prototype.init = function() {
		this.load();

		var funcCallC2 = function(obj,stepsIncremented){
			c2_callFunction("achievement_onNotification",[
				obj.achievement_code,
				stepsIncremented,
				obj.currentStep,
				obj.achievement_steps,
				JSON.stringify(obj)
			]);
		};

		window.eventToFire.registerEvent("c2:achievement:unlock", funcCallC2);
		window.eventToFire.registerEvent("c2:achievement:increment", funcCallC2);
	};

	achievement.prototype.getCompressedStr = function(obj) {
		var toRet = {};
		for(var anAC in obj){
			if(!obj.hasOwnProperty(anAC)) continue;
			toRet[anAC] = {};
			if( obj[anAC]["currentStep"] > 0 && obj[anAC]["achievement_state"] !== this.state.UNLOCKED) toRet[anAC]["s"] = baseConverter.IntToBase(obj[anAC]["currentStep"], 36);
			if(!obj[anAC]["seen"]) toRet[anAC]["e"] = 0;
			if( obj[anAC]["achievement_type"] === this.type.INCREMENTAL) toRet[anAC]["m"] = baseConverter.IntToBase(obj[anAC]["achievement_steps"], 36);
			if( obj[anAC]["achievement_state"] !== this.state.REVEALED) toRet[anAC]["a"] = ((obj[anAC]["achievement_state"] === this.state.HIDDEN) ? 0 : 1);
		}
		return JSON.stringify(toRet);
	};

	achievement.prototype.getUnCompressedObj = function(objStr) {
		var toRet = {};
		if(typeof objStr === "object"){ obj = objStr; }else{ try{	var obj = JSON.parse(objStr);	}catch(e){	return toRet;	} }
		for(var anAC in obj){
			if(!obj.hasOwnProperty(anAC)) continue;
			if(typeof obj[anAC]["achievement_code"] !== "undefined"){ toRet[anAC] = Object.assign({}, obj[anAC]); continue;	}
			toRet[anAC] = {"achievement_code":anAC};
			toRet[anAC]["seen"] = (typeof obj[anAC]["e"] === "undefined");
			toRet[anAC]["achievement_type"] = (typeof obj[anAC]["m"] === "undefined") ? this.type.STANDARD : this.type.INCREMENTAL;
			toRet[anAC]["achievement_steps"] = (typeof obj[anAC]["m"] === "undefined") ? 1 : baseConverter.baseToInt(obj[anAC]["m"], 36);
			toRet[anAC]["achievement_state"] = (typeof obj[anAC]["a"] === "undefined") ? this.state.REVEALED : ((obj[anAC]["a"] > 0) ? this.state.UNLOCKED : this.state.HIDDEN);
			toRet[anAC]["currentStep"] = (typeof obj[anAC]["s"] !== "undefined") ? baseConverter.baseToInt(obj[anAC]["s"], 36) : ((toRet[anAC]["achievement_state"] === this.state.UNLOCKED) ? toRet[anAC]["achievement_steps"] : 0);
		}
		return toRet;
	};
	
	achievement.prototype.load = function() {
		this.arrayAchievement = this.getUnCompressedObj(c2_callFunction("readCustomData",[this.saveKey,"{}"]));
	};

	achievement.prototype.save = function() {
		var count = 0;
		for(var i in this.arrayAchievement){count++;break;}
		if(count == 0){return;}
		c2_callFunction("writeCustomData",[this.saveKey, this.getCompressedStr(this.arrayAchievement), ""]);
		window.eventToFire.fireEvent("c2:achievement:save");
	};

	achievement.prototype.show = function() {
		window.eventToFire.fireEvent("c2:achievement:show");
	};

	achievement.prototype.register = function(achievement_code,achievement_step,achievement_obj) {
		if(typeof this.arrayAchievement[achievement_code] !== "undefined"){return window.eventToFire.fireEvent("c2:achievement:register", this.arrayAchievement[achievement_code]);}
		var achievement_obj = (achievement_obj || {});
		if(typeof(achievement_obj) == "string"){ achievement_obj = JSON.parse(achievement_obj);}
		this.arrayAchievement[achievement_code] = new achievementObj().create(
			achievement_code, 
			achievement_step, 
			(achievement_obj["achievement_state"] || this.state.REVEALED), 
			(achievement_obj["achievement_type"] || ((achievement_step ==1)?this.type.STANDARD:this.type.INCREMENTAL))
		);
		this.save();
		window.eventToFire.fireEvent("c2:achievement:register", this.arrayAchievement[achievement_code]);
	};

	achievement.prototype.unlock = function(achievement_code) {
		if(!this.arrayAchievement[achievement_code]){return;}
		var acObj = this.arrayAchievement[achievement_code];
		if(acObj.achievement_type != this.type.STANDARD){return;}
		if(acObj.currentStep >= acObj.achievement_steps){return;}
		acObj.currentStep = acObj.achievement_steps;
		acObj.seen = false;
		acObj.achievement_state = this.state.UNLOCKED;
		this.save();
		window.eventToFire.fireEvent("c2:achievement:unlock", acObj,1);
	};

	achievement.prototype.increment = function(achievement_code,stepsToIncrement) {
		if(!this.arrayAchievement[achievement_code]){return;}
		var acObj = this.arrayAchievement[achievement_code];
		if(acObj.achievement_type != this.type.INCREMENTAL){return;}
		if(acObj.currentStep >= acObj.achievement_steps){return;}
		acObj.currentStep += stepsToIncrement;

		acObj.currentStep = Math.min(acObj.currentStep , acObj.achievement_steps);
		if(acObj.currentStep == acObj.achievement_steps){
			acObj.seen = false;
			acObj.achievement_state = this.state.UNLOCKED;
		}
		this.save();
		window.eventToFire.fireEvent("c2:achievement:increment", acObj,stepsToIncrement);
	};

	achievement.prototype.get = function(achievement_code,key) {
		if(typeof(achievement_code) != "undefined" && typeof(key) != "undefined"){
			if(typeof(this.arrayAchievement[achievement_code]) == "undefined"){return -1;}
			if(typeof(this.arrayAchievement[achievement_code][key]) == "undefined"){return -1;}
			return this.arrayAchievement[achievement_code][key];
		}else if(typeof(achievement_code) != "undefined"){
			if(typeof(this.arrayAchievement[achievement_code]) == "undefined"){return -1;}
			return JSON.stringify(this.arrayAchievement[achievement_code]);
		}else{
			return JSON.stringify(this.arrayAchievement);
		}
	};

	achievement.prototype.getUnSeen = function() {
		var ret = {};
		for(var i in this.arrayAchievement){
			if(!this.arrayAchievement[i].seen){
				ret[i] = this.arrayAchievement[i];
			}
		}
		return JSON.stringify(ret);
	};

	achievement.prototype.getUnSeenCount = function() {
		var count = 0;
		for(var i in this.arrayAchievement){
			if(!this.arrayAchievement[i].seen){
				count++;
			}
		}
		return count;
	};

	achievement.prototype.markAsSeenSpecific = function(achievement_code) {
		if(!this.arrayAchievement[achievement_code]){return;}
		this.arrayAchievement[achievement_code].seen = true;
		this.save();
		window.eventToFire.fireEvent("c2:achievement:markAsSeen", this.arrayAchievement[achievement_code]);
	};

	achievement.prototype.markAsSeen = function(achievement_code) {
		for(var i in this.arrayAchievement){
			this.markAsSeenSpecific(i);
		}
	};

	achievement.prototype.reveal = function(achievement_code) {
		if(!this.arrayAchievement[achievement_code]){return;}
		this.arrayAchievement[achievement_code].achievement_state = this.state.REVEALED;
		this.save();
		window.eventToFire.fireEvent("c2:achievement:reveal", this.arrayAchievement[achievement_code]);
	};

	/*********************************************
				achievementObj
	*********************************************/
		/*********************************************
				var
		*********************************************/
		var achievementObj = function(){};
		/*********************************************
					function
		*********************************************/
		achievementObj.prototype.create = function(code, step, state, type) {
			this.currentStep = 0;
			this.seen = true;
			this.achievement_code = code;
			this.achievement_type = type; //achievement.type
			this.achievement_steps = step; 
			this.achievement_state = state; //achievement.state
			return this;
		};

/*********************************************
				Playtouch object
*********************************************/
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.arrayWaitForFunction = new arrayWaitForFunction();
	playtouch.nfsm = new nfsm();
	playtouch.timeNotifier = new timeNotifier();
	playtouch.achievement = new achievement();
	playtouch.versionChecker = versionChecker;
	playtouch.baseConverter = baseConverter;
	playtouch.PLIBS_VERSION = PLIBS_VERSION;
})();