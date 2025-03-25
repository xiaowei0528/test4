;(function(){

/////////////////////////////////////
/// var
	var C2FUNC = {
	};
	
/////////////////////////////////////

/////////////////////////////////////
/// GAME MAIN
	
	var gameMain = function(){
		this.dealer = new Dealer();
	};

	gameMain.prototype.playerCar;
	gameMain.prototype.dealer;
	gameMain.prototype.stats;
	gameMain.prototype.timeGame;
	gameMain.prototype.bgGameOver;

	gameMain.prototype.initRace = function(playerCarJSON,iaCarJSON){
		this.stats = {};
		this.bgGameOver = {};
		this.timeGame = 0;;
		//player
		if(!playerCarJSON) playerCarJSON = this.getExempleCar();
		if(typeof(playerCarJSON) == "string") playerCarJSON = JSON.parse(playerCarJSON); 
		if(typeof(playerCarJSON.dealerCarId) == "undefined") playerCarJSON.dealerCarId = 0;
		if(typeof(playerCarJSON.updates) == "undefined") playerCarJSON.updates = {};
		var baseCarConfig = this.dealer.getTheCarConfig(playerCarJSON.dealerCarId);
		this.playerCar = new Car(baseCarConfig);
		this.playerCar.applyUpdates(playerCarJSON.updates);
		this.playerCar.isPlayer = true;
		//this.playerCar.isIa = true;

		//IA
		if(!iaCarJSON) iaCarJSON = this.getExempleCar();
		if(typeof(iaCarJSON) == "string") iaCarJSON = JSON.parse(iaCarJSON); 
		if(typeof(iaCarJSON.dealerCarId) == "undefined") iaCarJSON.dealerCarId = 0;
		if(typeof(iaCarJSON.updates) == "undefined") iaCarJSON.updates = {};
		var baseCarConfig = this.dealer.getTheCarConfig(iaCarJSON.dealerCarId);
		this.iaCar = new Car(baseCarConfig);
		this.iaCar.applyUpdates(iaCarJSON.updates);
		this.iaCar.isIa = true;
	};

	gameMain.prototype.startWarmed = function(startPowerBase){
		this.playerCar.startWarmed(startPowerBase);
		this.iaCar.startWarmed();
		this.setStat("perfectStart", (startPowerBase >= 47 && startPowerBase <= 53)?1:0);
		this.setStat("player_shifts", (startPowerBase >= 47 && startPowerBase <= 53)?"green":"blue");
		this.setStat("ia_shifts", "green");
		if(startPowerBase >= 47 && startPowerBase <= 53){
			c2_callFunction("showFeedback",["warmup"]);
		}

	};

	gameMain.prototype.update = function(dt){
		this.timeGame += dt;
		this.playerCar.updateIa(dt);
		this.playerCar.accelerate(dt);
		this.iaCar.updateIa(dt);
		this.iaCar.accelerate(dt);

		this.checkStatsSpeed();
	};

	gameMain.prototype.destroyRace = function(){
		delete this.playerCar;
		delete this.iaCar;
	}

	gameMain.prototype.start = function() {
	};

	gameMain.prototype.checkStatsSpeed = function() {
		if(this.playerCar.currentSpeed >= khtoms(100) && this.getStat("player_0-100") == -1){ this.setStat("player_0-100", this.timeGame);}
		if(this.iaCar.currentSpeed >= khtoms(100) && this.getStat("ia_0-100") == -1){ this.setStat("ia_0-100", this.timeGame);}

		if(this.playerCar.currentSpeed >= khtoms(160) && this.getStat("player_0-160") == -1){ this.setStat("player_0-160", this.timeGame);}
		if(this.iaCar.currentSpeed >= khtoms(160) && this.getStat("ia_0-160") == -1){ this.setStat("ia_0-160", this.timeGame);}

		if(this.playerCar.currentSpeed > this.getStat("player_lastSpeed")){this.setStat("player_lastSpeed", this.playerCar.currentSpeed);}
		if(this.iaCar.currentSpeed > this.getStat("ia_lastSpeed")){this.setStat("ia_lastSpeed", this.iaCar.currentSpeed);}

	};

	gameMain.prototype.getExempleCar = function() {
		return {
			"dealerCarId":0,					//représente l'ID de la voiture de base chez le Dealer
			"updates":{						//représente les +/- à appliquer à la voiture en fonction des amélioration débloqués
				"max_speed" : 0,
				"grip" : 0,
				"acceleration" : 0,
				"kitNOSDuration" : 0,
				"kitNOSPower":0,
				"weight_ratio" : 0
			}
		};
	};

	gameMain.prototype.setStat = function(name,stat) {
		this.stats[name] = stat;
	};

	gameMain.prototype.getStat = function(name) {
		if(this.stats[name] === undefined){return -1};
		return this.stats[name];
	};

	gameMain.prototype.saveBgGameOver = function(type,x,y,frame,layerNumber,animationName) {
		if(this.bgGameOver["list"] === undefined){this.bgGameOver["list"] = [];}
		if(this.bgGameOver[type] === undefined){this.bgGameOver[type] = [];this.bgGameOver.list.push({id:layerNumber,type:type});}
		this.bgGameOver[type].push({x:x,y:y,frame:frame,animationName:animationName});
	};

	gameMain.prototype.sendAllBg = function(callback) {
		var i;
		this.bgGameOver.list.sort(function(a,b){return a.id - b.id;});//sort by id LayerNumber
		for(var x = 0;x < this.bgGameOver.list.length;x++){
			i = this.bgGameOver.list[x].type;
			for(var y = 0;y < this.bgGameOver[i].length;y++){
				c2_callFunction(callback,[i,this.bgGameOver[i][y].x,this.bgGameOver[i][y].y,this.bgGameOver[i][y].frame,this.bgGameOver[i][y].animationName]);
			}
		}
	};

	gameMain.prototype.getRandomAmelio = function(amelioCount) {
		var listAmelio = ["engine","turbo","exhaust","nitro","weight","wheels"];
		var objAmelio = {"engine":0,"turbo":0,"exhaust":0,"nitro":0,"weight":0,"wheels":0};
		var rand;
		for (var i = 0; i < amelioCount; i++) {
			rand = Math.floor(Math.random()*(listAmelio.length));
			objAmelio[listAmelio[rand]] ++;
			if(objAmelio[listAmelio[rand]] >=5){
				listAmelio.splice(rand,1);
			}
		};
		return objAmelio["engine"]+","+objAmelio["turbo"]+","+objAmelio["exhaust"]+","+objAmelio["nitro"]+","+objAmelio["weight"]+","+objAmelio["wheels"];
	};
/////////////////////////////////////

/////////////////////////////////////
/// Car
		var Car = function(){
			if(arguments.length == 1) this.setConfig(arguments[0]);
		};

		Car.prototype.NOMINAL_ACCELERATION = 5;
		Car.prototype.NOMINAL_DRIFT_LENGTH = 1;
		Car.prototype.NOMINAL_MAX_WARMUP = 200;
		Car.prototype.isIa = false;
		Car.prototype.isPlayer = false;

		Car.prototype.setConfig = function(configObj){
			for (var attrname in configObj) { 
				this[attrname] = configObj[attrname]; 
			}
			return this;
		};

		Car.prototype.applyUpdates = function(configObj){
			for (var attrname in configObj) {
				if(typeof(this.updates[attrname]) == "undefined") this.updates[attrname] = 0;
				this.updates[attrname] += configObj[attrname];
				this[attrname] += configObj[attrname];
			}
			return this;
		};

		Car.prototype.nextShift = function(test){
			if(this.currentShift < this.shift_nb-1){
				this.currentShift++;
				if(this.currentShift != 0 && !test) this.warmUp = 0;
				if(!test){c2_callFunction("onNewShift",[this.currentShift,(this.isPlayer)?"player":"ia"]);}
			}
			return this.currentShift;
		};

		Car.prototype.decreaseShift = function(test){
			var test = (test == undefined)?false:test;
			if(this.currentShift > 0){
				this.currentShift--;
				if(this.currentShift != 0 && !test) this.warmUp = 0;
			}
			return this.currentShift;
		};

		Car.prototype.isLastShift = function(){
			if(this.currentShift < this.shift_nb-1){
				return 0;
			}
			return 1;
		}

		Car.prototype.getAddedForce = function(){
			//get ramping function
			var ramping, fromInMS, toInMS;
			for(var aRampFunc in this.shifts[this.currentShift].ramps){
				if(!this.shifts[this.currentShift].ramps.hasOwnProperty(aRampFunc)) continue;
				fromInMS = this.shifts[this.currentShift].ramps[aRampFunc]["from"]/100 * this.max_speed;
				toInMS = this.shifts[this.currentShift].ramps[aRampFunc]["to"]/100 * this.max_speed;
				if(fromInMS <= this.currentSpeed && this.currentSpeed < toInMS){
					ramping = this.shifts[this.currentShift].ramps[aRampFunc];
					//if(this.isPlayer) console.log(ramping,this.currentSpeed,aRampFunc);
					break;
				}
			}
			//t = current time, b = start value, c = change in value, d=duration
			if(!ramping){
				ramping = this.shifts[this.currentShift].ramps["early"];
			}
			var velocityToAdd = ramping.func(Math.max(0,(this.currentSpeed - (ramping["from"]/100 * this.max_speed)))  , 0, 1, ((ramping["to"]/100 * this.max_speed) - (ramping["from"]/100 * this.max_speed)));

			var toRet = velocityToAdd * this.shifts[this.currentShift].torque/100 * ( 2 - this.weight_ratio/100 );
				
			//if(this.isPlayer) console.log(ramping,velocityToAdd,toRet);
			return toRet;
		};

		Car.prototype.accelerate = function(dt,applyValue,getforceAdded){
			if(this.currentShift == -1) return;
			var applyValue = (applyValue == undefined)?true:applyValue;
			var getforceAdded = (getforceAdded == undefined)?false:getforceAdded;
			var purePower = this.getAddedForce();
			var overHead = 0;
			var kitNOSDuration = this.kitNOSDuration
			var warmUp = this.warmUp;
			var driftCave = this.driftCave;
			var driftCaveBase = this.driftCaveBase;
			var forceLost = 0;
			
			var forceAdded = ((purePower + overHead) * (this.acceleration/100) * dt * this.NOMINAL_ACCELERATION);
			//if(this.isPlayer) console.log(forceAdded,purePower);
			//NOS
			if(this.isNOSActivated() == "1"){
				kitNOSDuration -= dt*1000;
				//forceAdded += forceAdded * this.kitNOSPower/100;
				forceAdded += forceAdded * this.getKitNOSPower(kitNOSDuration)/100;
			}

			//startBoost
			if(this.warmUp > 0){
				warmUp -= dt/this.NOMINAL_DRIFT_LENGTH;
				forceAdded += forceAdded * warmUp/100;
			}

			//calcul force lost and apply it to forceAdded
			if(driftCave > 0){
				forceLost = this.driftCaveBase * (dt/this.NOMINAL_DRIFT_LENGTH);
				driftCave = this.driftCave - forceLost;
				if(driftCave <= 0 && applyValue){
					c2_callFunction("stopSkidSmoke",[(this.isPlayer)?"player":"ia"]);
				}else{
					c2_callFunction("startSkidSmoke",[(this.isPlayer)?"player":"ia"]);
				}
			}
			if(driftCave < 0){
				driftCave = 0
				driftCaveBase = 0
			}
			forceAdded -= forceAdded * forceLost;



			//Apply
			//if(this.isPlayer) console.log(this.currentSpeed,forceAdded,Math.min(this.max_speed,Math.max(0,this.currentSpeed + forceAdded)));
			var currentSpeed = Math.min(this.max_speed,Math.max(0,this.currentSpeed + forceAdded));
			//-------------TEST RED---------------
			var bestShiftPercent = this.getBestShiftPercent()+2;
			var actualShiftPercent = this.getCurrentRPM();
			if(actualShiftPercent > bestShiftPercent){
				forceAdded=0;
			}
			//------------------------------------
			//Set RPM
			var percentOfMaxRPM = this.getCurrentRPM();
			
			if(applyValue){
				this.warmUp = warmUp;
				this.forceLost = forceLost;
				this.forceAdded = forceAdded;
				this.kitNOSDuration = kitNOSDuration;
				this.currentSpeed = currentSpeed;
				this.percentOfMaxRPM = percentOfMaxRPM;
				this.driftCave = driftCave;
				this.driftCaveBase = driftCaveBase;
				if(this.kitNOSDuration < 0){this.stopNos();}
			}

			if(getforceAdded) return forceAdded;
			return currentSpeed;
		};
		
		Car.prototype.getCurrentRPM = function (roundedAt){
			if(this.currentShift == -1) return "0";
			if(typeof roundedAt !== "number") roundedAt = 10;
			var minSpeed = this.shifts[this.currentShift].ramps.early["from"]/100 * this.max_speed;
			var maxSpeed = Math.max(this.shifts[this.currentShift].ramps.late["from"], this.shifts[this.currentShift].ramps.rampDown["to"])/100 * this.max_speed;
			var range = maxSpeed - minSpeed;
			var inRangeSpeed = Math.max(0, this.currentSpeed - minSpeed);
			var ret = (Math.min((inRangeSpeed / range * 100), 100));
			Math.round(ret * Math.pow(10, roundedAt)) / Math.pow(10, roundedAt);
			return ret;
		};

		Car.prototype.getCarWeightInKg = function (){ //returns kg
			return this.weight * (1 + this.weight_ratio/100);
		};

		Car.prototype.isNOSAvailable = function (){
			if(!this.NOSActivated && this.kitNOSDuration > 0 && this.kitNOSPower > 0) return "1";
			return "0";
		};

		Car.prototype.isNOSActivated = function (){
			if(this.NOSActivated && this.kitNOSDuration > 0) return "1";
			//this.kitNOSDuration = 0;
			this.NOSActivated = false;
			return "0";
		};

		Car.prototype.activateNOS = function (){
			if(this.isNOSAvailable() == "1" && this.isNOSActivated() == "0"){
				this.kitNOSDurationBase = this.kitNOSDuration;
				this.NOSActivated = true;
				var drift = (this.kitNOSPower * (100-Math.min(100,this.grip))/100)/6;
				this.driftCaveBase += drift;
				this.driftCave += drift;
				c2_callFunction("setEffectNos",[(this.isPlayer)?"player":"ia"]);
			}	
		};

		Car.prototype.getKitNOSPower = function(durationLeft) {
			//send the 75% of the power in the first 30%
			var firstPart = 0.3; //30%
			var powerFirstPart = 0.75; //75%
			if(durationLeft/this.kitNOSDurationBase > 1-firstPart){
				return ((this.kitNOSPower*powerFirstPart)/(this.kitNOSPower*firstPart))*this.kitNOSPower;
			}else{
				return ((this.kitNOSPower*(1-powerFirstPart))/(this.kitNOSPower*(1-firstPart)))*this.kitNOSPower;
			}
		};

		Car.prototype.stopNos = function(){
			c2_callFunction("stopEffectNos",[(this.isPlayer)?"player":"ia"]);
		};

		Car.prototype.isDrifting = function(level){
			if(this.forceLost <= 0) return "0";
			var driftingLevel = Math.max(Math.round(this.forceLost / Math.max(this.forceAdded, 0.01)), 1) * level;
			return driftingLevel + "";
		};

		Car.prototype.startWarmed = function(startPowerBase){

			if(this.isIa && !this.isPlayer){
				startPowerBase = 50;
			}
			this.currentSpeed = 7;
			var startPower = Math.min(100,startPowerBase*2);
			var driftPower = ((startPowerBase>50)?1:0)*startPowerBase;
			this.warmUp = Math.pow(startPower/100, 3)*this.NOMINAL_MAX_WARMUP;
			var drift = (driftPower * (100-Math.min(100,this.grip))/100)/6;
			this.driftCaveBase = drift;
			this.driftCave = drift;
			this.nextShift();
		};

		Car.prototype.getBestShiftSpeed = function (){
			return this.shifts[Math.max(0, this.currentShift)].ramps.rampDown["from"];
		};

		Car.prototype.getBestShiftPercent = function (){
			var minSpeed = this.shifts[Math.max(0, this.currentShift)].ramps.early["from"];
			var maxSpeed = this.shifts[Math.max(0, this.currentShift)].ramps.late["from"];
			var range = maxSpeed - minSpeed;
			var inRangeSpeed = Math.max(0, this.getBestShiftSpeed() - minSpeed);
			return inRangeSpeed / range * 100;
		};

		Car.prototype.updateIa = function(dt){
			if(!this.isIa){return;}
			var bestShiftPercent = this.getBestShiftPercent();
			var actualShiftPercent = this.getCurrentRPM();
			var nextSpeed = this.accelerate(dt,false);
			var nextForceAdded = this.accelerate(dt, false, true);
			var nextForceAddedNextShift = 0;
			if(!this.isLastShift()){
				this.nextShift(true);
				nextForceAddedNextShift = this.accelerate(dt, false, true);
				this.decreaseShift(true);
			}

			if(nextForceAdded <= nextForceAddedNextShift &&
				actualShiftPercent > bestShiftPercent){
				this.nextShift();
				if(this.isPlayer) c2_callFunction("activateNos");
				this.activateNOS();
				if(this.isPlayer) c2_callFunction("init_engine_HUD");
			}
		}
/////////////////////////////////////

/////////////////////////////////////
/// Dealer
		var Dealer = function(){};
		Dealer.prototype.carsAvailable = {};
		Dealer.prototype.shiftTypes = {};
		Dealer.prototype.setCarsAvailable = function(json) {
			this.carsAvailable = json;
		};

		Dealer.prototype.setShiftTypes = function(json) {
			this.shiftTypes = json;
		};

		Dealer.prototype.getBaseCar = function(){
			var baseCar = {
				"shift_nb":5,			// FIXED MODEL number of shift
				"max_speed":27,			// FIXED MODEL max speed of the car in m/s (180=50)
				"max_RPM":9000,			// FIXED MODEL max RPM of the car (this stats doesn't cout in car performance calculation)
				"grip":20,				// FIXED score of grip (percentage) 0 <- soap ------ glue -> 100
				"baseweight":900, 		// FIXED the base weight of a car (in kg) just for stats, this is not affecting the performance of the car
				"weight_ratio":100, 	// FIXED ratio of weight (percentage) 0 <- you drive a cloud ------ normal car -> 100, best values seams to be between 80 and 100
				"weight":100, 			// FIXED Kg of nominal weight 
				"acceleration":0, 		// FIXED acceleration of the car in%
				"kitNOSDuration":0, 	// FIXED duration of the kitNOS in ms. (1.2s = 1200)	
				"kitNOSPower":0,		// FIXED percent of boost given by the kitNOS => to give 2X boost, set it to 100.
				"forceAdded":0,			// last quantity of motion added to the speed
				"forceLost":0,			// last quantity of motion lost in overhead and drift
				"driftCave":0,			// quantity of force to lose left (warmup/NOS) depend of grip
				"driftCaveBase":0,		// base quantity of force to lose
				"percentOfMaxRPM":0,	// current % of RPM (percentOfMaxRPM/100*max_RPM = RPM to display)
				"currentShift":-1,		// the current shift engaged
				"currentSpeed":0,		// the current speed of the car in m/s  
				"warmUp":0,				// concept of quantity of motion "saved" when warming up the car. (=> no reality only to do a big drift at the begining)
				"NOSActivated": false,
				"custom":{},
				"updates":{},
				"shifts":{}
			};

			return baseCar;
		}
			
		Dealer.prototype.getTheCarConfig = function(carId){
			if(typeof(this.carsAvailable[carId]) == "undefined") return false;
			var carConfig = this.getBaseCar(); 
			for(var att in this.carsAvailable[carId]) carConfig[att] = this.carsAvailable[carId][att];
			carConfig.shifts = this.shiftTypes[carConfig.shift_nb];
			return carConfig;
		};

		Dealer.prototype.getStatsById = function(carId,stats){
			var configCar = this.getTheCarConfig(carId);
			if(!configCar || typeof(configCar[stats]) == "undefined"){console.log("PROBLEM ID OR STATS, CHECK AGAIN",arguments);return 0;}
			return configCar[stats];
		}
/////////////////////////////////////

/////////////////////////////////////
/// UTILS
	window.mstokh = function (ms){
		return ms * 3.6;
	};

	window.mstomph = function (ms){
		return hmtomph(mstokh(ms));
	};
	
	window.khtoms = function (kh){
		return kh / 3.6;
	};
	
	window.hmtomph = function (kh){
		return kh * 0.6213712;
	};
	
	window.mphtokh = function (mph){
		return mph * 1.609344;
	};
	
	window.kgtolb = function (kg){
		return kg * 2.2046226;
	};
	
	window.lbtokg = function (lb){
		return lb / 2.2046226;
	};

	/////////////////////////////////////
	/// EASING
		Math.giveMeOne = function(){	return 1;	}
		//t = current time, b = start value, c = change in value, d=duration
		Math.easeInOutCirc = function (t, b, c, d) {t /= d/2;if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;t -= 2;return c/2 * (Math.sqrt(1 - t*t) + 1) + b;};

		Math.nearlyFlat = function (t, b, c, d) {return b+c - 2 * Math.abs(  Math.easeInOutCirc(t, 0, c/5, d)-((c/5)/2)  );}

		Math.linearTween = function (t, b, c, d) {return c*t/d + b;};

		Math.easeInQuad = function (t, b, c, d) {t /= d;return c*t*t + b;};

		Math.easeOutQuad = function (t, b, c, d) {t /= d;return -c * t*(t-2) + b;};

		Math.easeInOutQuad = function (t, b, c, d) {t /= d/2;if (t < 1) return c/2*t*t + b;t--;return -c/2 * (t*(t-2) - 1) + b;};

		Math.easeInCubic = function (t, b, c, d) {t /= d;return c*t*t*t + b;};

		Math.easeOutCubic = function (t, b, c, d) {t /= d;t--;return c*(t*t*t + 1) + b;};

		Math.easeInOutCubic = function (t, b, c, d) {t /= d/2;if (t < 1) return c/2*t*t*t + b;t -= 2;return c/2*(t*t*t + 2) + b;};

		Math.easeInQuart = function (t, b, c, d) {t /= d;return c*t*t*t*t + b;};

		Math.easeOutQuart = function (t, b, c, d) {t /= d;t--;return -c * (t*t*t*t - 1) + b;};

		Math.easeInOutQuart = function (t, b, c, d) {t /= d/2;if (t < 1) return c/2*t*t*t*t + b;t -= 2;return -c/2 * (t*t*t*t - 2) + b;};

		Math.easeInQuint = function (t, b, c, d) {t /= d;return c*t*t*t*t*t + b;};

		Math.easeOutQuint = function (t, b, c, d) {t /= d;t--;return c*(t*t*t*t*t + 1) + b;};

		Math.easeInOutQuint = function (t, b, c, d) {t /= d/2;if (t < 1) return c/2*t*t*t*t*t + b;t -= 2;return c/2*(t*t*t*t*t + 2) + b;};

		Math.easeInSine = function (t, b, c, d) {return -c * Math.cos(t/d * (Math.PI/2)) + c + b;};

		Math.easeOutSine = function (t, b, c, d) {return c * Math.sin(t/d * (Math.PI/2)) + b;};

		Math.easeInOutSine = function (t, b, c, d) {return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;};

		Math.easeInExpo = function (t, b, c, d) {return c * Math.pow( 2, 10 * (t/d - 1) ) + b;};

		Math.easeOutExpo = function (t, b, c, d) {return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;};

		Math.easeInOutExpo = function (t, b, c, d) {t /= d/2;if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;t--;return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;};

		Math.easeInCirc = function (t, b, c, d) {t /= d;return -c * (Math.sqrt(1 - t*t) - 1) + b;};

		Math.easeOutCirc = function (t, b, c, d) {t /= d;t--;return c * Math.sqrt(1 - t*t) + b;};

		Math.easeInOutCirc = function (t, b, c, d) {t /= d/2;if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;t -= 2;return c/2 * (Math.sqrt(1 - t*t) + 1) + b;};
	/////////////////////////////////////
/////////////////////////////////////

/////////////////////////////////////
/// object
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.gameMain = new gameMain();
/////////////////////////////////////

})();