;(function(){
	var PLIBS_VERSION = "2.4.0";
	var PLIBS_TAG = "PLib";

/*********************************************
			Event To Fire
*********************************************/
	var EVENT_TO_FIRE_VERSION = "4.0.0",
		replaceEventToFire = (typeof window.eventToFire === "undefined");

	if(!replaceEventToFire){
		var VChecker = false;
		if(typeof playtouch !== "undefined" && typeof playtouch.versionChecker !== "undefined") VChecker = playtouch.versionChecker;
		else if(typeof versionChecker !== "undefined") VChecker = versionChecker;

		if(VChecker !== false) replaceEventToFire = VChecker.isVersionMin(EVENT_TO_FIRE_VERSION, playtouch.eventToFire.version, false);
	}

	if(replaceEventToFire){
		var eventToFire = window.eventToFire || {};
		eventToFire.events = ((window.eventToFire && window.eventToFire.events)?window.eventToFire.events:{});
		eventToFire.version = EVENT_TO_FIRE_VERSION;
		eventToFire.registerEvent = function(eventName, callback, staticArgs){
			if(typeof eventName !== 'string') return false;
			if(typeof callback !== 'function' && typeof callback !== 'string') return false;
			if(typeof this.events[eventName] === 'undefined')	this.events[eventName] = [];
			this.events[eventName].push({"func":callback, "staticArgs":staticArgs});
			return true;
		};
		if(typeof ce7 !== "function"){
			var ce7_lut = [],ce7 = function(){
				if(typeof window.crypto==="object" && typeof window.crypto.getRandomValues==="function"){var rnd=window.crypto.getRandomValues(new Uint32Array(4)),d0=rnd[0],d1=rnd[1],d2=rnd[2],d3=rnd[3] }else{var d0 = Math.random()*0x100000000>>>0,d1 = Math.random()*0x100000000>>>0,d2 = Math.random()*0x100000000>>>0,d3 = Math.random()*0x100000000>>>0;}
				return ce7_lut[d0&0xff]+ce7_lut[d0>>8&0xff]+ce7_lut[d0>>16&0xff]+ce7_lut[d0>>24&0xff]+'-'+
				ce7_lut[d1&0xff]+ce7_lut[d1>>8&0xff]+'-'+ce7_lut[d1>>16&0x0f|0x40]+ce7_lut[d1>>24&0xff]+'-'+
				ce7_lut[d2&0x3f|0x80]+ce7_lut[d2>>8&0xff]+'-'+ce7_lut[d2>>16&0xff]+ce7_lut[d2>>24&0xff]+
				ce7_lut[d3&0xff]+ce7_lut[d3>>8&0xff]+ce7_lut[d3>>16&0xff]+ce7_lut[d3>>24&0xff];
			};for(var i=0; i<256; i++){ce7_lut[i] = (i<16?'0':'')+(i).toString(16);}
		}
		eventToFire.fireEvent = function(eventName){
			if(typeof eventName !== 'string') return false;
			var eventHandlersToCall = Object.keys(this.events).filter(function(v){var f=v.replace(/\./g, '\\\.'); if(f.indexOf('*')!==-1) f = f.split('*')[0]+".*"; return (new RegExp('^'+f+"$").test(eventName))}).sort(function(a,b){return (b===eventName)?1:(a===eventName)?-1:b.replace('*','').length-a.replace('*','').length;}),eventUID=ce7();
			if(eventHandlersToCall.length === 0) return false;
			for(var i=0; i<eventHandlersToCall.length;i++){
				for(var f=0; f<this.events[eventHandlersToCall[i]].length;f++){
					var func = this.events[eventHandlersToCall[i]][f]["func"];
					if(typeof func === "string") if(typeof window[func] === "function") func = window[func]; else continue;
					var args = [].slice.call(arguments, 1);
					args.push(this.events[eventHandlersToCall[i]][f]["staticArgs"]);
					func.apply({eventName:eventName,eventUID:eventUID,eventHandler:eventHandlersToCall[i],eventToFire:this},args);
				}
			}
			return true;
		};
		eventToFire.getAllEvent = function(){
			return this.events;
		};
		window.eventToFire = eventToFire;
		//compatibility playzool/shell
		window.registerEvent = function(eventName, callback, args){
			window.eventToFire.registerEvent(eventName, callback, args);
		}
		window.fireEvent = function(eventName,args){
			window.eventToFire.fireEvent(eventName,args);
		}
	}

	if(typeof window.eventToFire.c2Caller === "undefined"){
		window.eventToFire.c2Caller = function(eventName,func,staticArgs){
			this.registerEvent(
				eventName,
				function(func){
					c2_callFunction(func,[].slice.call(arguments, 1),PLIBS_TAG+":eventToFire");
				}.bind(this,func),
				staticArgs
			);
		};
	}


/*********************************************
			Module Manager
*********************************************/
	/*********************************************
				var
	*********************************************/
	var modulesManager = {};
		modulesManager.version = "1.0.0";
		modulesManager.tag = "MM";

	/*********************************************
				function
	*********************************************/
	modulesManager.getVersion = function(moduleName, defaultVal){
		if(typeof playtouch[moduleName] !== "undefined" && typeof playtouch[moduleName].version !== "undefined") return playtouch[moduleName].version;
		return (typeof defaultVal === "undefined") ? "0.0.0" : defaultVal;
	};

	modulesManager.register = function (moduleName, module){
		var pushModule = true;
		if(typeof moduleName !== "string" || typeof module === "undefined" || typeof module.version === "undefined") return false;
		if(this.getVersion(moduleName, false)) pushModule = (typeof playtouch.versionChecker !== "undefined") ? (playtouch.versionChecker.versionStrToNum(this.getVersion(moduleName)) < playtouch.versionChecker.versionStrToNum(module.version)) : true;
		if(pushModule) playtouch[moduleName] = module;
		return pushModule;
	};

	/*********************************************
				init
	*********************************************/
	if(typeof window.playtouch !== "object") window.playtouch = {PLIBS_VERSION:PLIBS_VERSION};
	if(typeof window.playtouch.modulesManager !== "undefined") window.playtouch.modulesManager.register("modulesManager", modulesManager);
	else window.playtouch.modulesManager = modulesManager;


/*********************************************
			Version check
*********************************************/
	/*********************************************
				var
	*********************************************/
	var versionChecker = {};
		versionChecker.version = "1.1.0";
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
		var versionToCheck = this.versionStrToNum(str_vers);
		switch(typeof min){ case "undefined": min = 1; break; case "string": min = this.versionStrToNum(min); break; case "number": break; default: return false; break; }
		return (versionToCheck > min || (inclusive && versionToCheck == min));
	};


/*********************************************
			Text Parser
*********************************************/
	/*********************************************
				var
	*********************************************/
	var textParser = {};
		textParser.version = "1.1.0";
		textParser.tag = "TP";
	/*********************************************
				function
	*********************************************/
	textParser.toLower = function(t){
		return (t + '').toLocaleLowerCase();
	};

	textParser.toUpper = function(t){
		return (t + '').toLocaleUpperCase();
	};

	textParser.UCFirst = function(t){
		return (t + '').charAt(0).toLocaleUpperCase() + (t + '').slice(1);
	};
	textParser.Capitalize = textParser.UCFirst;

	textParser.UCWords = function(t){
		return (t + '').replace(/^(.)|\s+(.)/g, function($1){	return ($1 + '').toLocaleUpperCase();	});
	};
	
	textParser.localeNumber = function(t){
		return new Intl.NumberFormat().format(parseInt(t));
	};

	var replacer = function(whole, textKey){
		var textsActions = textKey.split("|"),
			toParse = textsActions.pop();

		if(typeof this[toParse] === "string" || typeof this[toParse] === "number") toParse = this[toParse];
		else if(typeof this["__defaultValue"] === "string" || typeof this["__defaultValue"] === "number") toParse = this["__defaultValue"];
		else toParse = '';

		while(textsActions.length){
			var currAction = textsActions.pop();
			if(typeof textParser[currAction] === "function") toParse = textParser[currAction](toParse);
			else if(typeof window[currAction] === "function") toParse = window[currAction](toParse);
		}

		return toParse;
	};

	textParser.parse = function(stringToParse, parseObject, keywordRegexp){
		if(typeof stringToParse !== "string") stringToParse ="";
		if(typeof parseObject === "string") try{	parseObject=JSON.parse(parseObject)	}catch(e){}
		if(typeof parseObject !== "object") parseObject={};
		if(typeof keywordRegexp === "undefined") keywordRegexp = new RegExp(/{([a-zA-Z0-9\|]+)}/, "g");
		return stringToParse.replace(keywordRegexp, replacer.bind(parseObject));
	};


/*********************************************
			Base converter
*********************************************/
	/*********************************************
				var
	*********************************************/
	var baseConverter = {};
		baseConverter.version = "1.1.0";
	/*********************************************
				function
	*********************************************/
	baseConverter.IntToBase = function(value, base){
		value = parseInt(value);
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
		Predeterminist Random by seed
*********************************************/
	/*********************************************
				seed Object
	*********************************************/
		/*********************************************
				var
		*********************************************/
		var Seed = function(){
			this.availableEngine = {
				 anonymous:{
					 name:"anonymous"
					,customInit:function(){}
					,getAutoSeed:function(){
						return parseInt(Math.random()*233280);
					}
					,checkSeed:function(val){	//int only, lower than 233280
						if(typeof val === "string") val = val.split('').reduce(function(p, c, i){return p + c.charCodeAt(0)* 10**(3*i)},0)%233280;
						if(isNaN(val)) return this.getAutoSeed();
						val = Math.round(parseInt(val));
						if(val>233280) return val%233280;
						return val;
					}
					,getNextValue:function(){
						return (this.value * 9301 + 49297) % 233280;
					 }
					,grow:function(step){
						if(typeof step !== "number" || step%1 !== 0) step = 1;
						while(step) {	this.value = this.getNextValue(); step--; this.step++;	}
					 }
					,random:function(max, min){
						max = max || 1;
						min = min || 0;
						return min + (this.value / 233280) * (max - min);
					 }
				}
				,alea:{
					 name:"alea"
					,customInit:function(){
						this.m = new function() {
							var n = 4022871197;
							return function(r) {
								for(var f, t, s, u = 0, e = 0.02519603282416938; u < r.length; u++)
								s = r.charCodeAt(u), f = (e * (n += s) - (n*e|0)),
								n = 4294967296 * ((t = f * (e*n|0)) - (t|0)) + (t|0);
								return (n|0) * 2.3283064365386963e-10;
							};
						}();
						this.a = this.m(" "); this.b = this.m(" "); this.c = this.m(" "); this.y=0;
						this.a -= this.m(this.initialValue), this.b -= this.m(this.initialValue), this.c -= this.m(this.initialValue);
						this.a < 0 && this.a++, this.b < 0 && this.b++, this.c < 0 && this.c++;
					}
					,getAutoSeed:function(){
						return +new Date() + Math.random();
					}
					,checkSeed:function(val){	//tostring
						return val+"";
					}
					,getNextValue:function(){
						var y = this.value * 2.3283064365386963e-10 + this.a * 2091639, a = this.b, b = this.c;
						var value = y|0;
						var c = y - value;
						return c;
					 }
					,grow:function(step){
						if(typeof step !== "number" || step%1 !== 0) step = 1;
						while(step){	
							this.y = this.value * 2.3283064365386963e-10 + this.a * 2091639; 
							this.a = this.b, this.b = this.c;
							this.value = this.y|0;
							this.c = this.y - this.value;
							step--;
							this.step++;
						}
					 }
					,random:function(max, min){
						max = max || 1;
						min = min || 0;
						return min + this.c * (max - min);
					 }
				}
			}
		};
		/*********************************************
					function
		*********************************************/
		Seed.prototype.checkEngine = function(engine) {
			if(typeof engine !== "string" || typeof this.availableEngine[engine] !== "object") return (typeof seedsField !== "undefined" && typeof seedsField.DEFAULT_PRNG_ENGINE !== "undefined") ? seedsField.DEFAULT_PRNG_ENGINE : "anonymous";
			return engine;
		};
		
		Seed.prototype.init = function(seedInitialValue, label, engine) {
			this.engine = this.checkEngine(engine);
			this.initialValue = this.availableEngine[this.engine].checkSeed.apply(this, arguments);
			this.value = (typeof this.initialValue === "number") ? this.initialValue : 1;
			this.step = 0;
			this.label = (typeof label === "string") ? label : "";
			this.availableEngine[this.engine].customInit.apply(this, arguments);
			if(this.label !== "") window.eventToFire.fireEvent("c2:seed_" + this.label + ":init");
			window.eventToFire.fireEvent("c2:seed:init", this);
			return this;
		};
		
		Seed.prototype.getAutoSeed = function() {
			return this.availableEngine[this.engine].getAutoSeed.apply(this, arguments);
		};
		
		Seed.prototype.grow = function(step){
			if(typeof step !== "number" || step%1 !== 0) step = 1;
			//while(step) {	this.value = this.getNextValue(); step--;	}
			this.availableEngine[this.engine].grow.apply(this, arguments);
			if(this.label !== "") window.eventToFire.fireEvent("c2:seed_" + this.label + ":grow", step);
			window.eventToFire.fireEvent("c2:seed:grow", this, step);
			return this;
		};
		
		Seed.prototype.getNextValue = function(){
			return this.availableEngine[this.engine].getNextValue.apply(this, arguments);
			// return (this.value * 9301 + 49297) % 233280;
			// return this.value * 16807 % 2147483647;
		};
		
		Seed.prototype.random = function(max, min, grow){
			if(typeof grow !== "boolean") grow = true;
			if(grow) this.grow();
			var ret = this.availableEngine[this.engine].random.apply(this, arguments);
			// var ret = min + (this.value / 233280) * (max - min);
			// var rnd = this.value / 2147483647, ret = min + rnd * (max - min);
			if(this.label !== "") window.eventToFire.fireEvent("c2:seed_" + this.label + ":random", ret, max, min); 
			window.eventToFire.fireEvent("c2:seed:random", this, ret, max, min);
			return ret;
		};

	/*********************************************
				var
	*********************************************/
	var seedsField = {}
		seedsField.DEFAULT_SEED_NAME = "_defaultSeed";
		seedsField.DEFAULT_PRNG_ENGINE = "anonymous";
		seedsField.version = "1.2.0";
		seedsField.seeds = {};
	/*********************************************
				function
	*********************************************/	
	seedsField.plant = function(seedName, initialValue, engine){
		// if(typeof initialValue !== "number") initialValue = Math.random()*1000000000;
		// if(initialValue%1 !== 0) initialValue = Math.round(initialValue);
		var newSeed = (new Seed()).init(initialValue, seedName, engine);
		if(typeof seedName === "string"){
			this.seeds[seedName] = newSeed;
			window.eventToFire.fireEvent("c2:seedsField:plant", seedName);
			window.eventToFire.fireEvent("c2:seedsField:plant_" + seedName);
		}
		return newSeed;
	};
	
	seedsField.uproot = function(seedName){
		if(typeof seedName === "string" && seedName !== this.DEFAULT_SEED_NAME && typeof this.seeds[seedName] !== "undefined"){
			delete this.seeds[seedName];
			window.eventToFire.fireEvent("c2:seedsField:uproot", seedName);
			window.eventToFire.fireEvent("c2:seedsField:uproot_" + seedName);
			return 1;
		}
		return 0;
	};
	seedsField.unplant = seedsField.uproot;
	
	seedsField.getPlantedSeeds = function(as){
		var toRet = Object.keys(this.seeds);
		if(typeof as !== "string") as = "array";
		switch(as.toLowerCase()){
			case "string":	return toRet.join(',');	break;
			case "json":	return JSON.stringify(toRet);	break;
			default:	return toRet;	break;
		}
	};
	
	seedsField.getAvailableEngines = function(as){
		var toRet = Object.keys((new Seed()).availableEngine);
		if(typeof as !== "string") as = "array";
		switch(as.toLowerCase()){
			case "string":	return toRet.join(',');	break;
			case "json":	return JSON.stringify(toRet);	break;
			default:	return toRet;	break;
		}
	};
	
	seedsField.getSeedStep = function(seedName, defaultRet){
		if(typeof defaultRet === "undefined") defaultRet = false;
		if(typeof seedName !== "string") seedName = this.DEFAULT_SEED_NAME;
		if(typeof this.seeds[seedName] === "undefined") return defaultRet;
		return this.seeds[seedName].step;
	};
	
	seedsField.getSeedInitialValue = function(seedName, defaultRet){
		if(typeof defaultRet === "undefined") defaultRet = false;
		if(typeof seedName !== "string") seedName = this.DEFAULT_SEED_NAME;
		if(typeof this.seeds[seedName] === "undefined") return defaultRet;
		return this.seeds[seedName].initialValue;
	};
	
	seedsField.getSeedCurrentValue = function(seedName, defaultRet){
		if(typeof defaultRet === "undefined") defaultRet = false;
		if(typeof seedName !== "string") seedName = this.DEFAULT_SEED_NAME;
		if(typeof this.seeds[seedName] === "undefined") return defaultRet;
		return this.seeds[seedName].value;
	};
	
	seedsField.getSeedNextValue = function(seedName, defaultRet){
		if(typeof defaultRet === "undefined") defaultRet = false;
		if(typeof seedName !== "string" || seedName === "") seedName = this.DEFAULT_SEED_NAME;
		if(typeof this.seeds[seedName] === "undefined") return defaultRet;
		return this.seeds[seedName].getNextValue();
	};
	
	seedsField.getPrediction = function(seedName, max, min, defaultRet){
		return (typeof seedName === "undefined" || typeof this.seeds[seedName] === "undefined") ? ((typeof defaultRet !== 'undefined') ? defaultRet : false) : (new Seed()).init(this.seeds[seedName].initialValue, undefined, this.seeds[seedName].engine).grow(this.seeds[seedName].step).random(max, min, defaultRet);
	};
	
	seedsField.random = function(seedName, max, min, defaultRet, grow){
		if(typeof defaultRet === "undefined") defaultRet = false;
		if(typeof seedName !== "string" || seedName === "") seedName = this.DEFAULT_SEED_NAME;
		if(typeof this.seeds[seedName] === "undefined") return defaultRet;
		var ret = this.seeds[seedName].random(max, min, grow);
		return ret;
	};
	
	seedsField.getSeedRandomAt = function(seedInitialValue, engine, step, max, min, defaultRet){
		if(typeof defaultRet === "undefined") defaultRet = false;
		if(typeof step !== "number" || step%1 !== 0) step = 0;
		return (new Seed()).init(seedInitialValue, undefined, engine).grow(step).random(max, min);
	};
	
	seedsField.plant(seedsField.DEFAULT_SEED_NAME, undefined, seedsField.DEFAULT_PRNG_ENGINE);
	
/*********************************************
			Array wait For Function
*********************************************/
	/*********************************************
				var
	*********************************************/
	var arrayWaitForFunction = function(){};
	arrayWaitForFunction.prototype.version = "1.6.0";
	arrayWaitForFunction.prototype.tag = "W4F";
	arrayWaitForFunction.prototype.array = [];
	arrayWaitForFunction.prototype.arrayJs = [];
	arrayWaitForFunction.prototype.arrayEndTick = [];
	arrayWaitForFunction.prototype.id = 0;
	/*********************************************
				function
	*********************************************/
	arrayWaitForFunction.prototype.init = function(){
		this.C2_RUNTIME = cr_getC2Runtime();
		this.C2_RUNTIME.tickMe(this);
		this.C2_RUNTIME.tick2Me(this);
		return this;
	};
	
	arrayWaitForFunction.prototype.update = function(dt,arrayToUpdate){
		for (var i = 0; i < arrayToUpdate.length; i++) {
			if(!arrayToUpdate[i].active){continue;}
			arrayToUpdate[i].time -= dt;
		};
		this.checkArrayEndOfTime(arrayToUpdate);
	};
	
	arrayWaitForFunction.prototype.updateAll = function(dt){
		this.update(this.C2_RUNTIME.getDt(),this.array);
		this.update(this.C2_RUNTIME.getDt(),this.arrayJs);
		this.update(this.C2_RUNTIME.getDt(),this.arrayEndTick);
	};

	arrayWaitForFunction.prototype.tick = function() {
		this.update(this.C2_RUNTIME.getDt(),this.array);
		this.update(this.C2_RUNTIME.getDt(),this.arrayJs);
	};
	arrayWaitForFunction.prototype.tick2 = function() {
		this.update(this.C2_RUNTIME.getDt(),this.arrayEndTick);
	};
	
	arrayWaitForFunction.prototype.toString = function(){
		return "arrayWaitForFunction";
	};
	
	arrayWaitForFunction.prototype.waitForFunction = function(timeToWait,callback,param,persistentLevel){
		//NaN is the only things not equal to itself in javascript
		param = (Number(param) !== Number(param) || param === " ")?param:Number(param);
		return this.pushToArray(this.array, timeToWait, callback, param, persistentLevel);
	};
	
	arrayWaitForFunction.prototype.waitForFunctionEndTick = function(timeToWait,callback,param,persistentLevel){
		//NaN is the only things not equal to itself in javascript
		param = (Number(param) !== Number(param) || param === " ")?param:Number(param);
		return this.pushToArray(this.arrayEndTick, timeToWait, callback, param, persistentLevel);
	};

	arrayWaitForFunction.prototype.waitForFunctionJS = function(timeToWait,callback,param,persistentLevel){
		return this.pushToArray(this.arrayJs, timeToWait, callback, param, persistentLevel);
	}

	arrayWaitForFunction.prototype.pushToArray = function(array,timeToWait,callback,param,persistentLevel){
		array.push({
			active:true,
			time:timeToWait,
			callback:callback,
			param:param,
			id:this.id,
			persistentLevel:((typeof(persistentLevel) === "undefined")?0:persistentLevel)
		});
		return this.id++;
	}

	arrayWaitForFunction.prototype.checkArrayEndOfTime = function(arrayToCheck){
		var toDestroy;
		for (var i = 0; i < arrayToCheck.length; i++) {
			if(arrayToCheck[i].time <= 0){
				toDestroy = arrayToCheck.splice(i,1)[0];
				break;
			}
		};

		if(typeof(toDestroy) != 'undefined'){
			if(typeof toDestroy.callback === "function"){
				toDestroy.callback(toDestroy.param);
			}else{
				c2_callFunction(toDestroy.callback,[toDestroy.param], PLIBS_TAG+":"+this.__proto__.tag);
				window.eventToFire.fireEvent("c2:arrayWaitForFunction:trigger",toDestroy.id,toDestroy.callback,toDestroy.param);
			}
			this.checkArrayEndOfTime(arrayToCheck);
		}
	};

	arrayWaitForFunction.prototype.clearArrayWait = function(persistentLevel){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		listOfArray.forEach((a)=>this.clearArrayWaitByArray(a,persistentLevel));
	};
	arrayWaitForFunction.prototype.clearArrayWaitByArray = function(array,persistentLevel){
		var persistentLevel = ((typeof(persistentLevel) === "undefined")?0:persistentLevel);

		for (var i = array.length - 1; i >= 0; i--) {
			if(array[i].persistentLevel <= persistentLevel){
				array.splice(i,1)[0];
			}
		};
	};

	arrayWaitForFunction.prototype.stopWaitById = function(id){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		listOfArray.forEach((a)=>this.stopWaitByIdByArray(a,id));
	};
	arrayWaitForFunction.prototype.stopWaitByIdByArray = function(array,id){
		for (var i = 0; i < array.length; i++) {
			if(array[i].id == id){
				array.splice(i,1);
				break;
			}
		};
	};

	arrayWaitForFunction.prototype.getTimeUntilEndOf = function(id, defaultTime){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		for (var i = 0; i < listOfArray.length; i++) {
			let ret = this.getTimeUntilEndOfByArray(listOfArray[i],id,defaultTime);
			if(ret !== defaultTime){return ret;}
		}
		return defaultTime;
	};
	arrayWaitForFunction.prototype.getTimeUntilEndOfByArray = function(array, id, defaultTime){
		if(typeof defaultTime === "undefined") defaultTime = -1;
		for (var i = 0; i < array.length; i++) {
			if(array[i].id == id){
				return array[i].time;
			}
		};
		return defaultTime;
	};

	arrayWaitForFunction.prototype.addTimeById = function(id, timeToAdd){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		for (var i = 0; i < listOfArray.length; i++) {
			let ret = this.addTimeByIdByArray(listOfArray[i],id,timeToAdd);
			if(ret !== -1){return ret;}
		}
		return -1;
	};
	arrayWaitForFunction.prototype.addTimeByIdByArray = function(array, id, timeToAdd){
		for (var i = 0; i < array.length; i++) {
			if(array[i].id == id){
				array[i].time += timeToAdd;
				return array[i].time;
			}
		};
		return -1;
	};

	arrayWaitForFunction.prototype.setTimeById = function(id, timeToSet){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		for (var i = 0; i < listOfArray.length; i++) {
			let ret = this.setTimeByIdByArray(listOfArray[i],id,timeToSet);
			if(ret !== -1){return ret;}
		}
		return -1;
	};
	arrayWaitForFunction.prototype.setTimeByIdByArray = function(array, id, timeToSet){
		for (var i = 0; i < array.length; i++) {
			if(array[i].id == id){
				array[i].time = timeToSet;
				return array[i].time;
			}
		};
		return -1;
	};

	arrayWaitForFunction.prototype.startWaitNowById = function(id){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		listOfArray.forEach((a)=>this.startWaitNowByIdByArray(a,id));
	};
	arrayWaitForFunction.prototype.startWaitNowByIdByArray = function(array, id){
		var toDestroy;
		for (var i = 0; i < array.length; i++) {
			if(array[i].id == id){
				toDestroy = array.splice(i,1)[0];
				break;
			}
		};
		if(typeof(toDestroy) != 'undefined'){
			c2_callFunction(toDestroy.callback,[toDestroy.param], PLIBS_TAG+":"+this.__proto__.tag);
		}
	};

	arrayWaitForFunction.prototype.pauseById = function(id){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		for (var i = 0; i < listOfArray.length; i++) {
			let ret = this.pauseByIdByArray(listOfArray[i],id);
			if(ret !== false){return ret;}
		}
		return false;
	};
	arrayWaitForFunction.prototype.pauseByIdByArray = function(array, id){
		for (var i = 0; i < array.length; i++) {
			if(array[i].id == id){
				array[i].active = false;
				return true;
			}
		};
		return false;
	};

	arrayWaitForFunction.prototype.resumeById = function(id){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		for (var i = 0; i < listOfArray.length; i++) {
			let ret = this.resumeByIdByArray(listOfArray[i],id);
			if(ret !== false){return ret;}
		}
		return false;
	};
	arrayWaitForFunction.prototype.resumeByIdByArray = function(array, id){
		for (var i = 0; i < array.length; i++) {
			if(array[i].id == id){
				array[i].active = true;
				return true;
			}
		};
		return false;
	};

	arrayWaitForFunction.prototype.isPausedById = function(id){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		for (var i = 0; i < listOfArray.length; i++) {
			let ret = this.isPausedByIdByArray(listOfArray[i],id);
			if(ret !== -1){return ret;}
		}
		return false;
	};
	arrayWaitForFunction.prototype.isPausedByIdByArray = function(array, id){
		for (var i = 0; i < array.length; i++) {
			if(array[i].id == id){return !array[i].active;}
		};
		return -1;
	};

	arrayWaitForFunction.prototype.pauseAll = function(){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		listOfArray.forEach((a)=>this.pauseAllByArray(a));
		return false;
	};
	arrayWaitForFunction.prototype.pauseAllByArray = function(array){
		for (var i = 0; i < array.length; i++) {
				array[i].active = false;
		};
	};

	arrayWaitForFunction.prototype.resumeAll = function(){
		var listOfArray = [this.array,this.arrayEndTick,this.arrayJs];
		listOfArray.forEach((a)=>this.resumeAllByArray(a));
		return true;
	};
	arrayWaitForFunction.prototype.resumeAllByArray = function(array){
		for (var i = 0; i < array.length; i++) {
			array[i].active = true;
		}
	};

/*********************************************
			Non Finite State Machine
*********************************************/
	/*********************************************
				var
	*********************************************/
	var nfsm = function(){};
	nfsm.prototype.version = "1.2.0";
	nfsm.prototype.tag = "NFSM";
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
		var beforeExitActualState = c2_callFunction("beforeExit_"+this.currentState,[this.currentState,state,{current:this.currentState,nextState:state}], PLIBS_TAG+":"+this.__proto__.tag);
		var beforeEnterNextState = c2_callFunction("beforeEnter_"+state,[this.currentState,state,{current:this.currentState,nextState:state,beforeExitResult:beforeExitActualState}], PLIBS_TAG+":"+this.__proto__.tag);
		window.eventToFire.fireEvent("c2:nfsm:nextRequest",{current:this.currentState,beforeExit:beforeExitActualState,beforeEnter:beforeEnterNextState});
		if(beforeExitActualState == 0 && beforeEnterNextState == 0){
			c2_callFunction("onExit_"+this.currentState,[this.currentState,state,{current:this.currentState,next:this.nextState}], PLIBS_TAG+":"+this.__proto__.tag);
			var previousState = this.currentState;
			this.currentState = state;
			this.nextState = "";
			window.eventToFire.fireEvent("c2:nfsm:nextSucceed",{previous:this.previousState,current:this.currentState});
			c2_callFunction("onEnter_"+this.currentState,[this.currentState,previousState,{current:this.currentState,previous:previousState}], PLIBS_TAG+":"+this.__proto__.tag);
		}else{
			window.eventToFire.fireEvent("c2:nfsm:nextFailed",{current:this.currentState, rejected:state, next:this.nextState});
			c2_callFunction("onFailExit_"+this.currentState,[this.currentState,state,beforeExitActualState,beforeEnterNextState,{current:this.currentState,nextState:state,beforeExitActualState:beforeExitActualState,beforeEnterNextState:beforeEnterNextState}], PLIBS_TAG+":"+this.__proto__.tag);
			c2_callFunction("onFailEnter_"+state,[this.currentState,state,beforeExitActualState,beforeEnterNextState,{current:this.currentState,nextState:state,beforeExitActualState:beforeExitActualState,beforeEnterNextState:beforeEnterNextState}], PLIBS_TAG+":"+this.__proto__.tag);
		}
		window.eventToFire.fireEvent("c2:nfsm:next", state);
	};

	nfsm.prototype.getCurrentStep = function(){
		return this.currentState;
	}

	nfsm.prototype.getNextStep = function(){
		return this.nextState;
	}

/*********************************************
			Shell Time Notifier
*********************************************/
	/*********************************************
				var
	*********************************************/
	var timeNotifier = function(){};
	timeNotifier.prototype.saveKey = "timeNotifier";
	timeNotifier.prototype.version = "1.1.0";
	timeNotifier.prototype.tag = "TN";
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
		this.arrayNotif = this.getUnCompressedObj(c2_callFunction("readCustomData",[this.saveKey,"{}"], PLIBS_TAG+":"+this.__proto__.tag));
		window.eventToFire.fireEvent("c2:timeNotifier:load");
	};

	timeNotifier.prototype.save = function() {
		var count = 0;
		for(var i in this.arrayNotif){count++;break;}
		if(count == 0){return;}
		c2_callFunction("writeCustomData",[this.saveKey,this.getCompressedStr(this.arrayNotif),""], PLIBS_TAG+":"+this.__proto__.tag);
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
		c2_callFunction("timeNotifier_onNotification",[eventName,this.arrayNotif[eventName].eventMessage,JSON.stringify(this.arrayNotif[eventName])], PLIBS_TAG+":"+this.__proto__.tag);
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

	timeNotifier.prototype.getState = function(state) {
		return this.state[state];
	};
/*********************************************
			Leaderboards
*********************************************/
	/*********************************************
				var
	*********************************************/
	var leaderboard = function(){
		this.capableToDisplayLeaderboard = false;
	};
	leaderboard.prototype.version = "1.1.1";
	leaderboard.prototype.tag = "LB";
	/*********************************************
				function
	*********************************************/
	leaderboard.prototype.init = function() {
		window.eventToFire.registerEvent("leaderboard:onSubmitScoreSucceeded", function(result){	c2_callFunction("leaderboard_onSubmitScoreSucceeded", [], PLIBS_TAG+":"+this.__proto__.tag);	});
		window.eventToFire.registerEvent("leaderboard:onSubmitScoreFailed", function(result){	c2_callFunction("leaderboard_onSubmitScoreFailed", [], PLIBS_TAG+":"+this.__proto__.tag);	});
		var that = this;
		window.eventToFire.registerEvent("leaderboard:ICanDisplayLeaderboard", function(result){	if(typeof result !== "boolean") result=true; that.capableToDisplayLeaderboard = result;	});
		window.eventToFire.fireEvent("c2:leaderboard:init");
	};

	leaderboard.prototype.canDisplayLeaderboard = function() {
		return (this.capableToDisplayLeaderboard) ? 1 : 0;
	};
	
	leaderboard.prototype.submitScore = function(leaderboard, score) {
		//temp workaround
		score = parseInt(score);
		if(typeof leaderboard !== "string" || typeof score !== "number" || isNaN(score)) return 0;
		window.eventToFire.fireEvent("c2:leaderboard:submitScore", leaderboard, score);
		return 1;
	};

	leaderboard.prototype.showLeaderboard = function(leaderboard, canFallback) {
		if(typeof canFallback === "number") canFallback = (canFallback != 0);
		if(typeof canFallback !== "boolean") canFallback = true;
		//if(typeof leaderboard !== "string") return (canFallback) ? this.showLeaderboards({fallback:true, fallbackFrom:leaderboard}) : 0;
		window.eventToFire.fireEvent("c2:leaderboard:showLeaderboard", leaderboard, canFallback);
		return 1;
	};
	
	leaderboard.prototype.showLeaderboards = function() {
		window.eventToFire.fireEvent("c2:leaderboard:showLeaderboards"); 
		return 1;
	};
	
/*********************************************
			Achievements
*********************************************/
	/*********************************************
				var
	*********************************************/
	var achievement = function(){};
	achievement.prototype.saveKey = "achievement";
	achievement.prototype.version = "1.2.0";
	achievement.prototype.tag = "AC";
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
				JSON.stringify(obj),
				obj.previousStep
			], PLIBS_TAG+":"+this.__proto__.tag);
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
			if(JSON.stringify(toRet[anAC]) === "{}"){
				delete toRet[anAC];
			}
			else if(typeof toRet[anAC].s === "undefined" && typeof toRet[anAC].e === "undefined" && typeof toRet[anAC].a === "undefined" && typeof toRet[anAC].m != "undefined"){
				delete toRet[anAC];
			}
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
		this.arrayAchievement = this.getUnCompressedObj(c2_callFunction("readCustomData",[this.saveKey,"{}"], PLIBS_TAG+":"+this.__proto__.tag));
	};

	achievement.prototype.save = function() {
		var count = 0;
		for(var i in this.arrayAchievement){count++;break;}
		if(count == 0){return;}
		c2_callFunction("writeCustomData",[this.saveKey, this.getCompressedStr(this.arrayAchievement), ""], PLIBS_TAG+":"+this.__proto__.tag);
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
		acObj.previousStep = parseInt(acObj.currentStep);
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
		acObj.previousStep = parseInt(acObj.currentStep);
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
			getNEW
*********************************************/
	/*********************************************
				var
	*********************************************/
	var getNew = {};
		getNew.version = "1.0.0";
		getNew.tag = "GN";

	/*********************************************
				function
	*********************************************/
	getNew.date = function() {
		return new Date();
	};
	
	getNew.regexp = function(base, flags) {
		if(typeof flags === "undefined") flags = "";
		if(typeof base === "string") base = base.replace(new RegExp("(^\/)|(\/$)", "g"),"");
		return new RegExp(base, flags);
	};

/*********************************************
			RegExp
*********************************************/
	/*********************************************
				var
	*********************************************/
	var regExp = {};
		regExp.version = "1.0.0";
		regExp.tag = "RX";

	/*********************************************
				function
	*********************************************/

	regExp.test = function(searchRegexp, flags, subject) {
		if(typeof flags === "undefined") flags = "";
		if(typeof searchRegexp === "string") searchRegexp = searchRegexp.replace(new RegExp("(^\/)|(\/$)", "g"),"");
		return ((new RegExp(searchRegexp, flags)).test(subject)) ? 1: 0;
	};


/*********************************************
			Easings
*********************************************/
	var easings = {};
		easings.version = "1.0.0";
		easings.tag = "EZ";
		easings.X_FUNCTIONS = {
			none:function(x){return 1;},
			linear:function(x){return x;},
			easeInLinear:function(x){return x;},
			easeOutLinear:function(x){return x;},
			easeInOutLinear:function(x){return x;},
			easeInSine:function(x){return 1 - Math.cos((x * Math.PI) / 2);},
			easeOutSine:function(x){return Math.sin((x * Math.PI) / 2);},
			easeInOutSine:function(x){return -(Math.cos(Math.PI * x) - 1) / 2;},
			easeInQuad:function(x){return x * x;},
			easeOutQuad:function(x){return 1 - (1 - x) * (1 - x);},
			easeInOutQuad:function(x){return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;},
			easeInCubic:function(x){return x * x * x;},
			easeOutCubic:function(x){return 1 - Math.pow(1 - x, 3);},
			easeInOutCubic:function(x){return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;},
			easeInQuart:function(x){return x * x * x * x;},
			easeOutQuart:function(x){return 1 - Math.pow(1 - x, 4);},
			easeInOutQuart:function(x){return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;},
			easeInQuint:function(x){return x * x * x * x * x;},
			easeOutQuint:function(x){return 1 - Math.pow(1 - x, 5);},
			easeInOutQuint:function(x){return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;},
			easeInExpo:function(x){return x === 0 ? 0 : Math.pow(2, 10 * x - 10);},
			easeOutExpo:function(x){return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);},
			easeInOutExpo:function(x){return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;},
			easeInCirc:function(x){return 1 - Math.sqrt(1 - Math.pow(x, 2));},
			easeOutCirc:function(x){return sqrt(1 - Math.pow(x - 1, 2));},
			easeInOutCirc:function(x){return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;},
			easeInBack:function(x){const c1 = 1.70158; const c3 = c1 + 1;return c3 * x * x * x - c1 * x * x;},
			easeOutBack:function(x){const c1 = 1.70158; const c3 = c1 + 1;return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);},
			easeInOutBack:function(x){const c1 = 1.70158;const c2 = c1 * 1.525;return x < 0.5 ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;},
			easeInElastic:function(x){const c4 = (2 * Math.PI) / 3; return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);},
			easeOutElastic:function(x){const c4 = (2 * Math.PI) / 3; return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;},
			easeInOutElastic:function(x){const c5 = (2 * Math.PI) / 4.5; return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2 : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;},
			easeInBounce:function(x){ const easeOutBounce = function(x){const n1 = 7.5625; const d1 = 2.75; if (x < 1 / d1) { return n1 * x * x; } else if (x < 2 / d1) { return n1 * (x -= 1.5 / d1) * x + 0.75; } else if (x < 2.5 / d1) { return n1 * (x -= 2.25 / d1) * x + 0.9375; } else { return n1 * (x -= 2.625 / d1) * x + 0.984375;}}; return 1 - easeOutBounce(1 - x); },
			easeOutBounce:function(x){const n1 = 7.5625; const d1 = 2.75; if (x < 1 / d1) { return n1 * x * x; } else if (x < 2 / d1) { return n1 * (x -= 1.5 / d1) * x + 0.75; } else if (x < 2.5 / d1) { return n1 * (x -= 2.25 / d1) * x + 0.9375; } else { return n1 * (x -= 2.625 / d1) * x + 0.984375;} },
			easeInOutBounce:function(x){ const easeOutBounce = function(x){const n1 = 7.5625; const d1 = 2.75; if (x < 1 / d1) { return n1 * x * x; } else if (x < 2 / d1) { return n1 * (x -= 1.5 / d1) * x + 0.75; } else if (x < 2.5 / d1) { return n1 * (x -= 2.25 / d1) * x + 0.9375; } else { return n1 * (x -= 2.625 / d1) * x + 0.984375;}}; return x < 0.5 ? (1 - easeOutBounce(1 - 2 * x)) / 2 : (1 + easeOutBounce(2 * x - 1)) / 2; }
		};
		easings.TBCD_FUNCTIONS = {
			none:function(t, b, c, d) {
				return b + c;
			},
			linear:function(t, b, c, d) {
				return c*(t/=d) + b;
			},
			easeInQuad:function(t, b, c, d) {
				return c*(t/=d)*t + b;
			},
			easeOutQuad:function(t, b, c, d) {
				return -c *(t/=d)*(t-2) + b;
			},
			easeInOutQuad:function(t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t + b;
				return -c/2 * ((--t)*(t-2) - 1) + b;
			},
			easeInCubic:function(t, b, c, d) {
				return c*(t/=d)*t*t + b;
			},
			easeOutCubic:function(t, b, c, d) {
				return c*((t=t/d-1)*t*t + 1) + b;
			},
			easeInOutCubic:function(t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t*t + b;
				return c/2*((t-=2)*t*t + 2) + b;
			},
			easeInQuart:function(t, b, c, d) {
				return c*(t/=d)*t*t*t + b;
			},
			easeOutQuart:function(t, b, c, d) {
				return -c * ((t=t/d-1)*t*t*t - 1) + b;
			},
			easeInOutQuart:function(t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
				return -c/2 * ((t-=2)*t*t*t - 2) + b;
			},
			easeInQuint:function(t, b, c, d) {
				return c*(t/=d)*t*t*t*t + b;
			},
			easeOutQuint:function(t, b, c, d) {
				return c*((t=t/d-1)*t*t*t*t + 1) + b;
			},
			easeInOutQuint:function(t, b, c, d) {
				if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
				return c/2*((t-=2)*t*t*t*t + 2) + b;
			},
			easeInSine:function(t, b, c, d) {
				return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
			},
			easeOutSine:function(t, b, c, d) {
				return c * Math.sin(t/d * (Math.PI/2)) + b;
			},
			easeInOutSine:function(t, b, c, d) {
				return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
			},
			easeInExpo:function(t, b, c, d) {
				return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
			},
			easeOutExpo:function(t, b, c, d) {
				return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
			},
			easeInOutExpo:function(t, b, c, d) {
				if (t==0) return b;
				if (t==d) return b+c;
				if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
				return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
			},
			easeInCirc:function(t, b, c, d) {
				return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
			},
			easeOutCirc:function(t, b, c, d) {
				return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
			},
			easeInOutCirc:function(t, b, c, d) {
				if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
				return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
			},
			easeInElastic:function(t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			},
			easeOutElastic:function(t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
			},
			easeInOutElastic:function(t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
				return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
			},
			easeInBack:function(t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				return c*(t/=d)*t*((s+1)*t - s) + b;
			},
			easeOutBack:function(t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			},
			easeInOutBack:function(t, b, c, d, s) {
				if (s == undefined) s = 1.70158; 
				if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
				return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
			},
			easeInBounce:function(t, b, c, d) {
				return c - this.easeOutBounce (d-t, 0, c, d) + b;
			},
			easeOutBounce:function(t, b, c, d) {
				if ((t/=d) < (1/2.75)) {
					return c*(7.5625*t*t) + b;
				} else if (t < (2/2.75)) {
					return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
				} else if (t < (2.5/2.75)) {
					return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
				} else {
					return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
				}
			},
			easeInOutBounce:function(t, b, c, d) {
				if (t < d/2) return this.easeInBounce (t*2, 0, c, d) * .5 + b;
				return this.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
			}
		};
    /* 
        t = Time - Amount of time that has passed since the beginning of the animation. Usually starts at 0 and is slowly increased using a game loop or other update function.
        b = Beginning value - The starting point of the animation. Usually it's a static value, you can start at 0 for example.
        c = Change in value - The amount of change needed to go from starting point to end point. It's also usually a static value.
        d = Duration - Amount of time the animation will take. Usually a static value aswell.
    */


/*********************************************
			Easings
*********************************************/
var tweeningVariables = {};
	tweeningVariables.version = "2.0.0";
	tweeningVariables.tag = "TV";
	tweeningVariables.trackedVariables = {};
	/*********************************************
				function
	*********************************************/
	tweeningVariables.init = function(){
		this.C2_RUNTIME = cr_getC2Runtime();
		this.C2_RUNTIME.tickMe(this);
        return this;
	};
	
	tweeningVariables.toString = function(){
		return "tweeningVariables";
	};

	tweeningVariables.registerTracker = function(trackedVariable, objectUID, easing, duration, initialValue, decimals, treshold, pattern){
        if(typeof duration !== "number") duration = 1;
        if(typeof decimals !== "number") decimals = 0;
        if(typeof treshold !== "number") treshold = 1;
		initialValue = parseFloat(initialValue);
        if(typeof pattern === "undefined") pattern = "{currentTrackerValue}";
        if(typeof trackedVariable !== "string" || typeof objectUID !== "number" || typeof this.C2_RUNTIME.objectsByUid[objectUID] === "undefined" || typeof this.C2_RUNTIME.objectsByUid[objectUID].type.plugin.acts.SetText !== "function") return false;
        var key = -1, availableEasings = ((typeof playtouch !== "undefined" && typeof playtouch.easings !== "undefined" && typeof playtouch.easings.X_FUNCTIONS !== "undefined") ? playtouch.easings.X_FUNCTIONS : {none:function(x){return 1;}});
		for(var aKey in this.C2_RUNTIME.all_global_vars) if(this.C2_RUNTIME.all_global_vars[aKey].name === trackedVariable) key = aKey;
		if(key === -1)  return false;
        if(typeof easing !== "string" || Object.keys(availableEasings).indexOf(easing) === -1) easing = "none";
		if(isNaN(initialValue)) initialValue = this.C2_RUNTIME.all_global_vars[key].data;
		for(var tv in this.trackedVariables){ if(Object.keys(this.trackedVariables[tv]).indexOf(objectUID)){ this.unregisterTracker(tv, objectUID); break; } }
		if(typeof this.trackedVariables[trackedVariable] === "undefined") this.trackedVariables[trackedVariable] = {k:key,l:this.C2_RUNTIME.all_global_vars[key].data};
		this.trackedVariables[trackedVariable][objectUID] = {trackedVariable:trackedVariable,objectUID:objectUID,easing:easing,initialValue:initialValue,duration:duration,currentTrackerValue:initialValue,elapsedTime:0,treshold:treshold,active:1,running:1,decimals:decimals,pattern:pattern,puid:this.C2_RUNTIME.objectsByUid[objectUID].puid};
        window.eventToFire.fireEvent("c2:tweeningVariables:tracker:registered:"+trackedVariable, objectUID, this.trackedVariables[trackedVariable][objectUID]);
		if(initialValue === this.C2_RUNTIME.all_global_vars[key].data) this.synchronizeTracker(trackedVariable, objectUID);
        return true;
	};
    
    tweeningVariables.unregisterTracker = function(trackedVariable, objectUID){
        if(typeof this.trackedVariables[trackedVariable] !== "undefined" && typeof this.trackedVariables[trackedVariable][objectUID] !== "undefined"){
            var old = this.trackedVariables[trackedVariable][objectUID];
			if(typeof this.C2_RUNTIME.objectsByUid[objectUID] === "undefined" || typeof this.C2_RUNTIME.objectsByUid[objectUID].puid !== this.trackedVariables[trackedVariable][objectUID].puid) old.lost = 1;
            delete this.trackedVariables[trackedVariable][objectUID];
            window.eventToFire.fireEvent("c2:tweeningVariables:tracker:unregistered:"+trackedVariable, objectUID, old);
            if(Object.keys(this.trackedVariables[trackedVariable]).length === 2) delete this.trackedVariables[trackedVariable];
            return true;
        }
        return false;
    };

    tweeningVariables.getEasingsList = function(stringify){
        var easingsList = Object.keys(((typeof playtouch !== "undefined" && typeof playtouch.easings !== "undefined" && typeof playtouch.easings.X_FUNCTIONS !== "undefined") ? playtouch.easings.X_FUNCTIONS : {none:function(x){return 1;}}));
		return stringify ? JSON.stringify(easingsList) : easingsList;
    };

    tweeningVariables.getTracker = function(trackedVariable, objectUID, stringify){
        var tracker = (typeof this.trackedVariables[trackedVariable] !== "undefined" && typeof this.trackedVariables[trackedVariable][objectUID] !== "undefined") ? this.trackedVariables[trackedVariable][objectUID] : {};
		return stringify ? JSON.stringify(tracker) : tracker;
    };

    tweeningVariables.pauseTracker = function(trackedVariable, objectUID){
    	if(typeof this.trackedVariables[trackedVariable] !== "undefined" && typeof this.trackedVariables[trackedVariable][objectUID] !== "undefined" 
			&&  !(this.trackedVariables[trackedVariable][objectUID].active = 0) ) return window.eventToFire.fireEvent("c2:tweeningVariables:tracker:paused:"+trackedVariable, objectUID, this.trackedVariables[trackedVariable][objectUID]) || true;
        return false;
    };

    tweeningVariables.resumeTracker = function(trackedVariable, objectUID){
        if(typeof this.trackedVariables[trackedVariable] !== "undefined" && typeof this.trackedVariables[trackedVariable][objectUID] !== "undefined"
			&& !!(this.trackedVariables[trackedVariable][objectUID].active = 1) ) return window.eventToFire.fireEvent("c2:tweeningVariables:tracker:resumed:"+trackedVariable, objectUID, this.trackedVariables[trackedVariable][objectUID]) || true;
        return false;
    };

    tweeningVariables.toggleTracker = function(trackedVariable, objectUID){
        if(typeof this.trackedVariables[trackedVariable] !== "undefined" && typeof this.trackedVariables[trackedVariable][objectUID] !== "undefined") return ((this.trackedVariables[trackedVariable][objectUID].active) ? this.pauseTracker(trackedVariable, objectUID) : this.resumeTracker(trackedVariable, objectUID));
        return false;
    };

    tweeningVariables.getTrackersOf = function(trackedVariable, stringify){
        var trackerList = (typeof this.trackedVariables[trackedVariable] !== "undefined") ? Object.keys(this.trackedVariables[trackedVariable]).filter(function(k){return (k!=="k"&&k!=="l");}) : [];
		return stringify ? JSON.stringify(trackerList) : trackerList;
    };

    tweeningVariables.synchronizeTracker = function(trackedVariable, objectUID){
        if(typeof this.trackedVariables[trackedVariable] !== "undefined" && typeof this.trackedVariables[trackedVariable][objectUID] !== "undefined" && typeof this.trackedVariables[trackedVariable][objectUID].puid !== "undefined" && this.trackedVariables[trackedVariable][objectUID].puid === this.C2_RUNTIME.objectsByUid[objectUID].puid){
            var parseData = {trackedVariable:trackedVariable, objectUID:objectUID}, 
                obj = this.trackedVariables[trackedVariable][objectUID], 
                currentVariableValue = this.C2_RUNTIME.all_global_vars[this.trackedVariables[trackedVariable].k].data;
			parseData.previousTime = obj.elapsedTime;
            parseData.elapsedTime = obj.elapsedTime+this.C2_RUNTIME.getDt(this.C2_RUNTIME.objectsByUid[objectUID]);
            parseData.change = (currentVariableValue-obj.initialValue);
            parseData.roundedChange = Math.round(parseData.change*Math.pow(10,obj.decimals))/Math.pow(10,obj.decimals);
            parseData.initialValue = obj.initialValue;
			parseData.previousTrackerValue = obj.currentTrackerValue;
			parseData.previousTrackerValueFixed = Number(parseData.previousTrackerValue).toFixed(obj.decimals);
			parseData.currentVariableValue = currentVariableValue;
            parseData.currentTrackerValue = currentVariableValue;
			parseData.currentTrackerValueFixed = Number(parseData.currentTrackerValue).toFixed(obj.decimals);
			parseData.diffValue = currentVariableValue - parseData.currentTrackerValue;
            parseData.synchronized = 2;
            if(playtouch.textParser.version === "1.0.0") for(var k in parseData) parseData[k] += ""; //need all values to be string with this version
			this.C2_RUNTIME.objectsByUid[objectUID].type.plugin.acts.SetText.call(this.C2_RUNTIME.objectsByUid[objectUID], ""+playtouch.textParser.parse(obj.pattern, parseData));
            window.eventToFire.fireEvent("c2:tweeningVariables:tracker:updated:"+trackedVariable, objectUID, parseData);
            window.eventToFire.fireEvent("c2:tweeningVariables:tracker:synchronized:"+trackedVariable, objectUID, this.trackedVariables[trackedVariable][objectUID]);
            obj.elapsedTime = 0;
			obj.running = 0;
            obj.currentTrackerValue = currentVariableValue;
            obj.initialValue = currentVariableValue;
            return true;
        }else return false;
    };

	tweeningVariables.tick = function(){
		for(var trackedVariable in this.trackedVariables){
            var currentVariableValue = this.C2_RUNTIME.all_global_vars[this.trackedVariables[trackedVariable].k].data, 
				isDifferentFromLastRecord = (currentVariableValue != this.trackedVariables[trackedVariable].l),
				availableEasings = ((typeof playtouch !== "undefined" && typeof playtouch.easings !== "undefined" && typeof playtouch.easings.X_FUNCTIONS !== "undefined") ? playtouch.easings.X_FUNCTIONS : {easeInLinear:function(x){return x;}});
            this.trackedVariables[trackedVariable].l = currentVariableValue;
			if(isDifferentFromLastRecord) window.eventToFire.fireEvent("c2:tweeningVariables:variable:changed:"+trackedVariable, this.trackedVariables[trackedVariable]);
            for(var objectUID in this.trackedVariables[trackedVariable]){
				if(["k","l"].indexOf(objectUID) !== -1) continue;
				if(typeof this.C2_RUNTIME.objectsByUid[objectUID] === "undefined" || this.C2_RUNTIME.objectsByUid[objectUID].puid !== this.trackedVariables[trackedVariable][objectUID].puid){
					window.eventToFire.fireEvent("c2:tweeningVariables:tracker:lost:"+trackedVariable, objectUID, this.trackedVariables[trackedVariable][objectUID]);
					return tweeningVariables.unregisterTracker(trackedVariable, objectUID);
				}
                var obj = this.trackedVariables[trackedVariable][objectUID], wasRunning = obj.running;
                // we need to run (obj.running) if we was already running or if isDifferentFromLastRecord (variable seems to have changed) or if we see a difference between the variable current value and the txtfield local value.
                obj.running = (obj.running || isDifferentFromLastRecord || currentVariableValue != obj.currentTrackerValue) ? 1 : 0;
				if(isDifferentFromLastRecord){
					obj.elapsedTime = 0;
					obj.initialValue = obj.currentTrackerValue;
				}
                if(obj.active && obj.running){
                    var previousTime = obj.elapsedTime;
                    obj.elapsedTime += this.C2_RUNTIME.getDt(this.C2_RUNTIME.objectsByUid[objectUID]);
                    var parseData = {trackedVariable:trackedVariable, objectUID:objectUID}, updatedVal;
                        parseData.previousTime = previousTime;
                        parseData.elapsedTime = obj.elapsedTime;
                        parseData.change = Math.min(availableEasings[obj.easing](parseData.elapsedTime/obj.duration), 1) * (currentVariableValue-obj.initialValue);
                        parseData.roundedChange = Math.round(parseData.change*Math.pow(10,obj.decimals))/Math.pow(10,obj.decimals);
                        updatedVal = obj.initialValue + parseData.roundedChange;
                        parseData.previousTrackerValue = obj.currentTrackerValue;
						parseData.previousTrackerValueFixed = Number(parseData.previousTrackerValue).toFixed(obj.decimals);
						parseData.currentVariableValue = currentVariableValue;
                        parseData.currentTrackerValue = updatedVal;
						parseData.currentTrackerValueFixed = Number(parseData.currentTrackerValue).toFixed(obj.decimals);
						parseData.initialValue = obj.initialValue;
						parseData.diffValue = currentVariableValue - updatedVal;
						parseData.synchronized = (currentVariableValue == obj.currentTrackerValue) ? 1 : 0;

                    if(Math.abs(parseData.diffValue) < obj.treshold){
                        parseData.diffValue = currentVariableValue - parseData.currentTrackerValue;
                        parseData.currentTrackerValue = currentVariableValue;
						parseData.currentTrackerValueFixed = Number(parseData.currentTrackerValue).toFixed(obj.decimals);
                    }
                    // number fix cuz JS is bullshit
                    var cvs = (parseData.currentTrackerValue+"").split('.'), dvs = (parseData.diffValue+"").split('.');
                    if(cvs.length > 1 && cvs[1].length>obj.decimals) parseData.currentTrackerValue = Number(parseData.currentTrackerValue).toFixed(obj.decimals);
                    if(dvs.length > 1 && dvs[1].length>obj.decimals) parseData.diffValue = Number(parseData.diffValue).toFixed(obj.decimals);

                    if(playtouch.textParser.version === "1.0.0") for(var k in parseData) parseData[k] += ""; //need all values to be string with this version
					if(!wasRunning) window.eventToFire.fireEvent("c2:tweeningVariables:tracker:synchronizing:"+trackedVariable, objectUID, this.trackedVariables[trackedVariable][objectUID]);
                    if(obj.currentTrackerValue !== updatedVal){
						this.C2_RUNTIME.objectsByUid[objectUID].type.plugin.acts.SetText.call(this.C2_RUNTIME.objectsByUid[objectUID], ""+playtouch.textParser.parse(obj.pattern, parseData));
                        window.eventToFire.fireEvent("c2:tweeningVariables:tracker:updated:"+trackedVariable, objectUID, parseData);
                        obj.currentTrackerValue = updatedVal;
                    }
                    
                    if(currentVariableValue == obj.currentTrackerValue){
                        obj.running = 0;
                        obj.initialValue = obj.currentTrackerValue;
                        window.eventToFire.fireEvent("c2:tweeningVariables:tracker:synchronized:"+trackedVariable, objectUID, this.trackedVariables[trackedVariable][objectUID]);
                    }
                }
            }
        }
	};

/*********************************************
			blocksSpreading
*********************************************/
	/*********************************************
				var
	*********************************************/
	var blocksSpreading = function(){};
	blocksSpreading.prototype.version = "1.1.0";
	blocksSpreading.prototype.SCALE_MIN=0.1;
	blocksSpreading.prototype.blocks = [];
	/*********************************************
				BLOCKS
	*********************************************/
	blocksSpreading.prototype.pushblock = function(name,width,height=0,layerName=0){
		this.blocks.push({
			_id:this.blocks.length,
			name:name,
			width:width,
			height:height,
			layerName:layerName,
			toString:function(){return this._id}
		});
		return this.blocks[this.blocks.length-1].id;
	};
	blocksSpreading.prototype.setBlockValue = function(id,key,value){
		if(id >= this.blocks.length){return id;}
		this.blocks[id][key] = value;
		return id;
	};
	blocksSpreading.prototype.setLastBlockValue = function(key, value){
		return this.setBlockValue(this.blocks.length-1,key,value);
	};
	blocksSpreading.prototype.getblocks = function(){return JSON.stringify(this.blocks);};
	blocksSpreading.prototype.flushBlocks = function(){this.blocks = [];};
	/*********************************************
				UTILS
	*********************************************/
	blocksSpreading.prototype.getWidthBlock = function(block,layoutScale=1){
		if(!cr_getC2Runtime){return block.width;}
		return block.width * this.getScale(block.layerName,layoutScale)
	};
	blocksSpreading.prototype.getWidthBlocks = function(layoutScale=1){
		return [0,...this.blocks].reduce((accu,block)=>accu+this.getWidthBlock(block,layoutScale));
	};
	blocksSpreading.prototype.getHeightBlock = function(block,layoutScale=1){
		if(!cr_getC2Runtime){return block.height;}
		return block.height * this.getScale(block.layerName,layoutScale)
	};
	blocksSpreading.prototype.getHeightBlocks = function(layoutScale=1){
		return [0,...this.blocks].reduce((accu,block)=>accu+this.getHeightBlock(block,layoutScale));
	};
	blocksSpreading.prototype.getTallerBlocksHeight = function(layoutScale=1){
		return Math.max(...this.blocks.map((block)=>this.getHeightBlock(block,layoutScale)));
	};
	blocksSpreading.prototype.getWiderBlocksWidth = function(layoutScale=1){
		return Math.max(...this.blocks.map((block)=>this.getWidthBlock(block,layoutScale)));
	};
	blocksSpreading.prototype.getScale = function(layerName,layoutScale=1){
		layoutScale = Math.max(this.SCALE_MIN,layoutScale);
		let layer =  cr_getC2Runtime().getLayer(layerName);
		if(!layer){return 1;}
		return ((layer.scale * layoutScale) - 1) * layer.zoomRate + 1;
	};
	blocksSpreading.prototype.getXOnLayer = function(layerName,pos,layoutScale){
		let layerDest =  cr_getC2Runtime().getLayer(layerName);
		let layer0 =  cr_getC2Runtime().getLayer(0);
		let currLayoutScale = cr_getC2Runtime().running_layout.scale;
		if(!layerDest || !layer0){return pos;}
		if(typeof layoutScale !== "undefined"){cr_getC2Runtime().running_layout.scale = layoutScale;}
		let ret = layerDest.canvasToLayer(layer0.layerToCanvas(pos,0,true),0,true);
		if(typeof layoutScale !== "undefined"){cr_getC2Runtime().running_layout.scale = currLayoutScale;}
		return ret;
	};
	blocksSpreading.prototype.getYOnLayer = function(layerName,pos,layoutScale){
		let layerDest =  cr_getC2Runtime().getLayer(layerName);
		let layer0 =  cr_getC2Runtime().getLayer(0);
		let currLayoutScale = cr_getC2Runtime().running_layout.scale;
		if(!layerDest || !layer0){return pos;}
		if(typeof layoutScale !== "undefined"){cr_getC2Runtime().running_layout.scale = layoutScale;}
		let ret = layerDest.canvasToLayer(0,layer0.layerToCanvas(0,pos,false),false);
		if(typeof layoutScale !== "undefined"){cr_getC2Runtime().running_layout.scale = currLayoutScale;}
		return ret;
	};
	blocksSpreading.prototype.get2DigitComma = function(nb){
		return Math.round((nb)*100)/100;
	};
	/*********************************************
				PRIVATE FUNCTION
	*********************************************/
	blocksSpreading.prototype._getGoodScale = function(scale_curr,containerWidth,containerHeight,scale_stepping,isHorizontal=true,scaleSize=true){
		let func_highter = (isHorizontal)?this.getTallerBlocksHeight:this.getWiderBlocksWidth;
		let value_size = (isHorizontal)?containerWidth:containerHeight;
		let value_highter = (isHorizontal)?containerHeight:containerWidth;
		while(scale_curr > this.SCALE_MIN && (this._getSizeForFunc(scale_curr,isHorizontal,scaleSize) > value_size || ((scaleSize)?func_highter.call(this)*scale_curr:func_highter.call(this,scale_curr)) > value_highter)){
			scale_curr = this.get2DigitComma(scale_curr-scale_stepping);
		}
		return scale_curr;
	};
	blocksSpreading.prototype._getSizeForFunc = function(scale_curr,width=true,scaleSize=true,block=undefined){
		let allBlocks = typeof block === 'undefined';
		if(width && allBlocks && scaleSize){return this.getWidthBlocks()*scale_curr;}
		if(width && allBlocks && !scaleSize){return this.getWidthBlocks(scale_curr);}
		if(width && !allBlocks && scaleSize){return this.getWidthBlock(block)*scale_curr;}
		if(width && !allBlocks && !scaleSize){return this.getWidthBlock(block,scale_curr);}
		if(!width && allBlocks && scaleSize){return this.getHeightBlocks()*scale_curr;}
		if(!width && allBlocks && !scaleSize){return this.getHeightBlocks(scale_curr);}
		if(!width && !allBlocks && scaleSize){return this.getHeightBlock(block)*scale_curr;}
		if(!width && !allBlocks && !scaleSize){return this.getHeightBlock(block,scale_curr);}
	};
	blocksSpreading.prototype._getPlacement = function(scale_curr,containerSize,containerStartPos,isHorizontal=true,scaleSize=true){
		let placement = [];
		let func_posLayer = (isHorizontal)?this.getXOnLayer:this.getYOnLayer;
		let blockCount = this.blocks.length;
	
		let block_totalSize = this._getSizeForFunc(scale_curr,isHorizontal,scaleSize);
		let offsetTotal = (block_totalSize > containerSize) ? 0: (containerSize - block_totalSize);
		let offset = offsetTotal/(blockCount+1);
		let curPos = (block_totalSize > containerSize)?(containerSize/2 - block_totalSize/2):0;
	
		for (let i = 0; i < this.blocks.length; i++) {
			let block = this.blocks[i];
			curPos += offset;
			let widthBlock = this._getSizeForFunc(scale_curr,true,scaleSize,block);
			let heightBlock = this._getSizeForFunc(scale_curr,false,scaleSize,block);
			let placementToPush = {
				name:block.name,
				pos:this.get2DigitComma(func_posLayer(block.layerName,containerStartPos+curPos+((isHorizontal)?widthBlock:heightBlock)/2,scale_curr))
			}
			if(scaleSize){
				placementToPush.width = this.get2DigitComma(widthBlock);
				placementToPush.height = this.get2DigitComma(heightBlock);
			}
			placement.push(placementToPush);
			curPos += (isHorizontal)?widthBlock:heightBlock;
		}
		return placement;
	};
	/*********************************************
				FUNCTION
	*********************************************/
	blocksSpreading.prototype.horizontal_getSizes = function(containerWidth=100,containerHeight=Infinity,containerStartPos=0,scale_max=1,scale_stepping=0.01,autoFlush=true){
		let blockScale_curr = Math.max(this.SCALE_MIN,scale_max);
		let placement = [];
	
		if(this.blocks.length > 0){
			blockScale_curr = this._getGoodScale(blockScale_curr,containerWidth,containerHeight,scale_stepping,true,true);
			placement = this._getPlacement(blockScale_curr,containerWidth,containerStartPos,true,true);
		};
	
		if(autoFlush){this.flushBlocks();}
		return JSON.stringify({
			blockScale:blockScale_curr,
			blocks:placement
		});
	};
	blocksSpreading.prototype.horizontal_getScales = function(containerWidth=100,containerHeight=Infinity,containerStartPos=0,scale_max=1,scale_stepping=0.01,autoFlush=true){
		let layoutScale_curr = Math.max(this.SCALE_MIN,scale_max);
		let placement = [];
	
		if(this.blocks.length > 0){
			let canScale = !!(this.blocks.find((block)=>this.getScale(block.layerName,layoutScale_curr)>1));
			if(canScale){layoutScale_curr = this._getGoodScale(layoutScale_curr,containerWidth,containerHeight,scale_stepping,true,false);}
			placement = this._getPlacement(layoutScale_curr,containerWidth,containerStartPos,true,false);
		};
	
		if(autoFlush){this.flushBlocks();}
		return JSON.stringify({
			layoutScale:layoutScale_curr,
			blocks:placement
		});
	};
	blocksSpreading.prototype.vertical_getSizes = function(containerWidth=Infinity,containerHeight=100,containerStartPos=0,scale_max=1,scale_stepping=0.01,autoFlush=true){
		let blockScale_curr = Math.max(this.SCALE_MIN,scale_max);
		let placement = [];
	
		if(this.blocks.length > 0){
			blockScale_curr = this._getGoodScale(blockScale_curr,containerWidth,containerHeight,scale_stepping,false,true);
			placement = this._getPlacement(blockScale_curr,containerHeight,containerStartPos,false,true);
		};
	
		if(autoFlush){this.flushBlocks();}
		return JSON.stringify({
			blockScale:blockScale_curr,
			blocks:placement
		});
	};
	blocksSpreading.prototype.vertical_getScales = function(containerWidth=Infinity,containerHeight=100,containerStartPos=0,scale_max=1,scale_stepping=0.01,autoFlush=true){
		let layoutScale_curr = Math.max(this.SCALE_MIN,scale_max);
		let placement = [];
	
		if(this.blocks.length > 0){
			let canScale = !!(this.blocks.find((block)=>this.getScale(block.layerName,layoutScale_curr)>1));
			if(canScale){layoutScale_curr = this._getGoodScale(layoutScale_curr,containerWidth,containerHeight,scale_stepping,false,false);}
			placement = this._getPlacement(layoutScale_curr,containerHeight,containerStartPos,false,false);
		};
	
		if(autoFlush){this.flushBlocks();}
		return JSON.stringify({
			layoutScale:layoutScale_curr,
			blocks:placement
		});
	};

/*********************************************
				Playtouch object
*********************************************/
	var toPush = {};
		toPush.arrayWaitForFunction = new arrayWaitForFunction().init();
		toPush.leaderboard = new leaderboard();
		toPush.nfsm = new nfsm();
		toPush.timeNotifier = new timeNotifier();
		toPush.achievement = new achievement();
		toPush.versionChecker = versionChecker;
		toPush.baseConverter = baseConverter;
		toPush.seedsField = seedsField;
		toPush.textParser = textParser;
		toPush.getNew = getNew;
		toPush.regExp = regExp;
		toPush.easings = easings;
		toPush.tweeningVariables = tweeningVariables.init();
		toPush.blocksSpreading = new blocksSpreading();
	for(var m in toPush) window.playtouch.modulesManager.register(m, toPush[m]);

})();