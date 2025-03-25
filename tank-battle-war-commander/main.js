;(function(){
/////////////////////////////////////
// GAME MAIN
/////////////////////////////////////

	/////////////////////////////////////
	// var
		var gameMain = function(){};
		gameMain.prototype.maxChoice = 3;

		gameMain.prototype.bestChoice = [];
		gameMain.prototype.isStop = {};
		gameMain.prototype.countSpell = {};
		gameMain.prototype.timerStop = undefined;
		gameMain.prototype.timerStop2 = undefined;
		gameMain.prototype.something = {};
		gameMain.prototype.somethingToDo =[];
		gameMain.prototype.tabTruc =[];

		gameMain.prototype.hasTripleStun = false;
	/////////////////////////////////////
	
	/////////////////////////////////////
	// function IA
		gameMain.prototype.init = function(){
			this.countSpell = {};
			this.tabTruc = [];
			clearTimeout(this.timerStop);
			clearTimeout(this.timerStop2);
			this.something = {};
			this.somethingToDo =[];
		};

		gameMain.prototype.restartRoulette = function() {
			this.bestChoice = [];
			this.setNewChoice();
		};

		gameMain.prototype.changeBestChoice = function(_type,_value) {
			this.bestChoice[_type] = _value;
		};

		gameMain.prototype.setNewChoice = function() {
			this.bestChoice[0] = -1;
			this.bestChoice[1] = Math.floor(Math.random()*this.maxChoice);
			this.bestChoice[2] = Math.floor(Math.random()*this.maxChoice);

			this.bestChoice[3] = -1;
			this.bestChoice[4] = Math.floor(Math.random()*this.maxChoice);
			this.bestChoice[5] = +Math.floor(Math.random()*this.maxChoice);

			this.bestChoice[6] = -1;
			this.bestChoice[7] = Math.floor(Math.random()*this.maxChoice);
			this.bestChoice[8] = Math.floor(Math.random()*this.maxChoice);
		};

		gameMain.prototype.setBestChoice = function(_tab,_type,_value) { //tab,column,frame
			this.bestChoice[_tab*this.maxChoice+_type] = _value; 
		};

		gameMain.prototype.getBestChoice = function(_tab,_type) {
			return this.bestChoice[_tab*this.maxChoice+_type];
		};

		gameMain.prototype.endOfRoulette = function(_tab,_callback) {
			var type0 = 0;
			var type1 = 0;
			var type2 = 0;
			for(var i =0;i < this.maxChoice;++i){
				switch(this.getBestChoice(_tab,i)) {
				    case 0:
				    	type0++;
				        break;
				    case 1:
				    	type1++;
				        break;
				    case 2:
				    	type2++;
				        break;
				}
			}
			c2_callFunction(_callback,[_tab,type0,type1,type2]);
		};

		gameMain.prototype.selectTarget = function(_owner,_type) {
			var typeOfTarget = "lessHpOrWall2";
			var hittable = JSON.parse(c2_callFunction("getJsonAllHittable").replace(/'/gi,"\""));
			
			//todo ???
			if(typeOfTarget == "bestTarget"){
				if(_type == "0"){

				}
				else if(_type == "1"){

				}
				else if(_type == "2"){

				}
			}	
			if(typeOfTarget == "lessHpOrWall"){
				var wall = JSON.parse(c2_callFunction("getWallHpByOwner",[this.getEnemyOwner(_owner)]).replace(/([xy]|hp)/gi,"\"$1\""));
				var lessHp = JSON.parse(c2_callFunction("getAddsWithLessHpByOwner",[this.getEnemyOwner(_owner)]).replace(/([xy])/gi,"\"$1\""));
				if(wall.hp >0){
					return wall.x + "_" + wall.y;
				}
				else{
					return lessHp.x + "_" + lessHp.y;
				}
			}
			if(typeOfTarget == "lessHpOrWall2"){
				var actualHp = -1;
				var ret = "";
				for(var i in hittable){
					if(hittable[i].owner == _owner){continue;}
					if(!hittable[i].isAlive && hittable[i].type != "king"){continue;}
					if(hittable[i].type == "wall" && hittable[i].futurHp > 0){return i}
					if(hittable[i].type == "king"){if(ret == ""){ret = i} continue;}
					if(hittable[i].futurHp > 0 && (actualHp == -1 || hittable[i].futurHp <= actualHp)){
						actualHp = hittable[i].hp;
						ret = i
					}
				}
				return ret;
			}
		};

		gameMain.prototype.selectTargetHack = function(_owner) {
			var hittable = JSON.parse(c2_callFunction("getJsonAllHittable").replace(/'/gi,"\""));
			var tab = [];
			for(var i in hittable){
				if(!hittable[i].isAlive){continue;}
				if(hittable[i].owner == _owner){continue;}
				if(hittable[i].type != "0" && hittable[i].type != "1" && hittable[i].type != "2" && hittable[i].type != "3"){continue;}
				hittable[i].uid = i;
				tab.push(hittable[i]);
			}
			if(tab.length >0){
				return tab[Math.floor(Math.random()*tab.length)].uid;
			}
			return -1;
		};

		gameMain.prototype.getEnemyOwner = function(_owner) {
			if(_owner == "dwarf"){
				return "elves";
			}
			else if(_owner == "elves"){
				return "dwarf";
			}
		};

		gameMain.prototype.selectTargetPlayerShoot = function(_owner,_type,_lvl,_callback,_other) {
			var hittable = JSON.parse(c2_callFunction("getJsonAllHittable").replace(/'/gi,"\""));
			var tab = [];
			var king = undefined;
			var wall = undefined;
			var objRet = {};
			//get Target
			for(var i in hittable){
				if(!hittable[i].isAlive && hittable[i].type != "king"){continue;}
				if(hittable[i].owner == _owner){continue;}
				if(hittable[i].type == "king"){king = hittable[i];continue;}
				if(hittable[i].type == "wall"){wall = hittable[i];continue;}
				if(hittable[i].futurHp <= 0){continue;}
				hittable[i].uid = i;
				tab.push(hittable[i]);
			}

			/***********Type***********/
			if(_type == 1){//stun
				_other = _other || _lvl;
				for (var i = 0; i < _other; ++i) {
					if(wall != undefined && wall.futurHp > 0){
						objRet = wall;
						wall = undefined;
					}
					else if(tab.length > 0){
						objRet = tab.splice(Math.floor(Math.random()*tab.length),1)[0];
					}else{
						objRet = king;
					}
					c2_callFunction(_callback,[objRet.uid,_lvl,_owner])
				}
			}
			else if(_type == 2){//multi
				if(tab.length >0){
					objRet = tab[Math.floor(Math.random()*tab.length)];
				}else{
					objRet = king;
				}
				c2_callFunction(_callback,[objRet.uid,_lvl,_owner])
			}
			else if(_type == 3){//mono
				var retArray = [];
				var lengthTab = tab.length+1;

				retArray.push(_lvl);
				retArray.push(_owner);
				if(wall != undefined && wall.futurHp > 0){
					retArray.push(wall.uid);
				}
				for (var i = 0; i < lengthTab; ++i) {
					if(tab.length >0){
						objRet = tab.splice(Math.floor(Math.random()*tab.length),1)[0].uid;
					}else{
						objRet = king.uid;
					}
					retArray.push(objRet);
				}
				c2_callFunction(_callback,retArray);
			}
			return -1;
		};

		gameMain.prototype.addCount = function(_name) {
			this.tabTruc.push(_name);
			if(this.tabTruc.length >=3){
				if(this.tabTruc[0] == this.tabTruc[1] && this.tabTruc[0] == this.tabTruc[2]){
					this.addCountForReal(this.tabTruc[0],9);
				}
				else if(this.tabTruc[0] != this.tabTruc[1] && this.tabTruc[0] != this.tabTruc[2]&& this.tabTruc[1] != this.tabTruc[2]){
					this.addCountForReal(this.tabTruc[0],1);
					this.addCountForReal(this.tabTruc[1],1);
					this.addCountForReal(this.tabTruc[2],1);
				}else{
					if(this.tabTruc[0] == this.tabTruc[1]){
						this.addCountForReal(this.tabTruc[0],5);
						this.addCountForReal(this.tabTruc[2],1);
					}
					else if(this.tabTruc[0] == this.tabTruc[2]){
						this.addCountForReal(this.tabTruc[0],5);
						this.addCountForReal(this.tabTruc[1],1);
					}
					else if(this.tabTruc[1] == this.tabTruc[2]){
						this.addCountForReal(this.tabTruc[1],5);
						this.addCountForReal(this.tabTruc[0],1);
					}
				}
				this.tabTruc = [];
			}
		};

		gameMain.prototype.addCountForReal = function(_name,points) {
			if(!this.countSpell[_name]){
				this.countSpell[_name] = 0;
			}
			this.countSpell[_name] +=points;
		};

		gameMain.prototype.getCountByName = function(_name) {
			return this.countSpell[_name] | 0;
		};

		/**
		 * [stopRouletteIa description]
		 * @param  {[type]} _fail            [%chance for ia to fail and make a random choice]
		 * @param  {[type]} _owner           [owner name]
		 * @param  {[type]} _callbackShowTab [description]
		 * @param  {[type]} _callbackStart   [description]
		 * @param  {[type]} _callbackStop    [description]
		 */
		gameMain.prototype.stopRouletteIa = function(_fail,_owner,_callbackShowTab,_callbackStart,_callbackStop) {
			var debug = false;
			var random = false;
			removeArrayWaitforFunction("stopRoulette");
			removeArrayWaitforFunction("stopRouletteIa");
			if(Math.random()*100 > _fail){
				random = true;
			}
			if(debug){
				var randomTab = 2;
				var randomValue = 2;
				this.setBestChoice(randomTab,1,1);
				this.setBestChoice(randomTab,2,1);
				c2_callFunction(_callbackShowTab,[randomTab]);
				c2_callFunction(_callbackStart);
				this.timerStop = setTimeout(
					function(_callbackStop,_randomValue){
						c2_callFunction(_callbackStop,[_randomValue]);
					}.bind(this,_callbackStop,randomValue),
					((Math.random()*2000) + 1000)
				);
				return;
			}
			if(random){
				var tab = Math.floor(Math.random()*3);
				var value = Math.floor(Math.random()*this.maxChoice);
			}
			else{
				var iaChoice = this.getIaChoice(_owner);

				var tab = iaChoice.tab;
				var value = iaChoice.value;
			}

			//send info to construct
			c2_callFunction(_callbackShowTab,[tab]);
			this.timerStop = setTimeout(
				function(_callbackStart){
					c2_callFunction(_callbackStart);
				}.bind(this,_callbackStart),
				((Math.random()*250) + 250)
			);
			this.timerStop2 = setTimeout(
				function(_callbackStop,_randomValue){
					c2_callFunction(_callbackStop,[_randomValue]);
				}.bind(this,_callbackStop,value),
				((Math.random()*1000) + 1001)
			);
		};

		gameMain.prototype.getIaChoice = function(_owner) {
			var hittable = JSON.parse(c2_callFunction("getJsonAllHittable").replace(/'/gi,"\""));
			var ret = {tab:Math.floor(Math.random()*3),value:Math.floor(Math.random()*this.maxChoice)};

			//count alive
			var own_count = 0;
			var e_count = 0;
			var own_base_life_king = 0;
			var e_base_life_king = 0;
			var own_life_king = 0;
			var e_life_king = 0;
			var own_level_total_add = 0;
			var e_level_total_add = 0;
			var own_wall_alive = false;
			var e_wall_alive = false;
			//array of  own add stun
			var own_add_stun = [];
			var e_add_stun = [];

			for(var i in hittable){
				var add = hittable[i];
				if(add.isStun){
					if(add.owner == _owner){own_add_stun.push(add);}
					if(add.owner != _owner){e_add_stun.push(add);}	
				}
				if(add.isAlive){
					if(add.owner == _owner){
						if(add.type == "wall"){own_wall_alive = true;}
						own_count++;
						if(add.type != "wall" && add.type != "king"){own_level_total_add += add.lvl;}
					}
					if(add.owner != _owner){
						if(add.type == "wall"){e_wall_alive = true;}
						e_count++;
						if(add.type != "wall" && add.type != "king"){e_level_total_add += add.lvl;}
					}
				}
				if(add.type == "king"){
					if(add.owner == _owner){ own_life_king = add.hp; own_base_life_king = getBaseHpByUid(i);}
					if(add.owner != _owner){ e_life_king = add.hp; e_base_life_king = getBaseHpByUid(i);}
				}
			}

			//spell multi target
			if(e_life_king < 15){
				ret.tab = 2;
				ret.value = 1;
				//this.setBestChoice(ret.tab,1,1); //to much ? force the second multi spell
				return ret;
			}

			//stun e_add
			if(!this.hasTripleStun){
				if(e_add_stun.length < (e_count - 1 - ((e_wall_alive)?1:0)) && e_level_total_add >= 7 && own_life_king*100/own_base_life_king < 50){
					ret.tab = 2;
					ret.value = 0;
					this.setBestChoice(ret.tab,1,0);
					this.setBestChoice(ret.tab,2,0);
					this.hasTripleStun = true;
					return ret;
				}
			}else{
				this.hasTripleStun = false;
			}


			//if 1 own_add or more is stun
			if(own_add_stun.length > 0){
				ret.tab = 0;
				ret.value = parseInt(own_add_stun[Math.floor(Math.random()*own_add_stun.length)].type);
				return ret;
			}

			if(own_count <= 2){
				ret.tab = 0;
				ret.value = Math.floor(Math.random()*this.maxChoice);
				return ret;
			}

			//shield
			if(Math.random()*2 >1 && !own_wall_alive){
				ret.tab = 1;
				ret.value = 0;
			}else{
				//else random between tab 1/2
				if(Math.random()*2 >1){
					ret.tab = 1;
				}else{
					ret.tab = 2;
				}
				ret.value = Math.floor(Math.random()*this.maxChoice);
			}


			return ret;
		};
	/////////////////////////////////////
	
	/////////////////////////////////////
	// function didSomething
		//add something actuayly did something
		gameMain.prototype.addDidSomething = function(_name) {
			this.something[_name] = 1;
		};

		gameMain.prototype.removeDidSomething = function(_name) {
			delete this.something[_name];
			this.callSomethingToDo();
		};

		//add something to do when everythings is done
		gameMain.prototype.addSomethingToDo = function(_name,_param) {
			this.somethingToDo.push({name:_name,param:_param});
			this.callSomethingToDo();
		};

		//check if everything is done 
		gameMain.prototype.callSomethingToDo = function() {
			if(this.didSomething()){return;}

			if(this.somethingToDo.length > 0){
				var todo = this.somethingToDo.splice(0, 1)[0];
				c2_callFunction(todo.name,todo.param);
				this.callSomethingToDo();
			}
		};

		gameMain.prototype.didSomething = function() {
			for(var i in this.something){
				return true;
			}
			return false;
		};
	/////////////////////////////////////

/////////////////////////////////////
// UTILS
	function removeArrayWaitforFunction(name){
		try{
			var arrayWait = cr_getC2Runtime().types.ArrayWaitForAction.instances[0].arr;
			var idToRemove = [];
			for(var i=0;i < arrayWait.length;i++){
				if(arrayWait[i][2] == name){
					idToRemove.push(arrayWait[i][3]);
				}
			}
			for(var i =0;i < idToRemove.length;i++){
				c2_callFunction("StopWaitById",idToRemove[i]);
				//console.log("debug",name);
			}
		}catch(e){}
	}

	function getBaseHpByUid(uid){
		try{
			var object = cr_getC2Runtime().getObjectByUID(uid);
			for(var i =0;i < object.instance_var_names.length;i++){
				if(object.instance_var_names[i] == "hpBase"){
					return object.instance_vars[i];
				}
			}
			return 0;
		}catch(e){return 100;}
	}
/////////////////////////////////////

/////////////////////////////////////
// object
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.gameMain = new gameMain();

	//console.log("main.js is load");
/////////////////////////////////////

})();