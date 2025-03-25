(function(){
    /*************************************/
  
    

  
	var randPick = function(values, seedName){
		var rnd=playtouch.seedsField.random(seedName), t=0, wc=false, order=Object.keys(values).sort();
		for(var i=0; i<order.length;i++){
			if(values[order[i]] === '*'){	wc = order[i]; continue;	}
			t += values[order[i]];
			if(t > rnd) return order[i];
		}
		return wc;
	};

	

	function randomGenerator (seedName,maxRange,minRange){
		if(typeof minRange==="undefined") minRange=0;
		if(typeof playtouch.seedsField !=="undefined" ){ 
		
			return Math.floor(playtouch.seedsField.random(seedName,maxRange,minRange))
		}
		else return Math.floor(Math.random()*maxRange);
	};
    Boolean.prototype.asInt = function(){
        return (this.valueOf()) ? 1 : 0;
    };
   
	var customFunction=function(){};
		customFunction.prototype.version="1.6.0";
		customFunction.prototype.tags="_CF";
		
	customFunction.prototype.setStarOnLvl=function(level,saveData,starNum){
	
		var value,tempStorage,prefixValue,newSave;
		prefixValue=saveData.slice(0,3);
		saveData=saveData.slice(3);
		
		tempStorage=saveData.split("a");
	
		value=tempStorage[level].split("s");
		value[1]=starNum;
		tempStorage[level]=value.join("s");
		
		newSave=prefixValue+tempStorage.join("a");
		return newSave;
	};
	customFunction.prototype.getStarFromData=function(level,saveData){
		
		var value,tempStorage,prefixValue,newSave;
		saveData=saveData.slice(3);
		tempStorage=saveData.split("a");
		value=tempStorage[level].split("s");
		return value[1];
	};
	customFunction.prototype.toMMSS=function(seconds){
		var sec_num = parseInt(seconds, 10);
		var minutes = Math.floor(sec_num / 60);
		var seconds = sec_num % 60;

		if (minutes < 10) { minutes = "0" + minutes; }
		
		if (seconds < 10) { seconds = "0" + seconds; }

		return minutes + ':' + seconds;
		
	};
	customFunction.prototype.getCurrentDate=function(){
		var currentDate=new Date();
		var year=currentDate.getFullYear();
		var month=currentDate.getMonth()+1;
		var date=currentDate.getDate();
		var newDate= new Date(year,month-1,date);
		newDate= newDate.getTime();
		return newDate.toString().replace(/0+$/, '');
	};
	customFunction.prototype.getScore=function(levelData,level){
		levelData=levelData.split("_")[1];
		levelData=levelData.substring(5,levelData.length);
		levelData=levelData.replace(/s3/g, '');
		levelData=levelData.replace(/s0/g, '');
		levelData=levelData.replace(/s1/g, '');
		levelData=levelData.replace(/s2/g, '');
		levelData=levelData.split("a");
	    if(typeof levelData[level] !=="undefined")return levelData[level];
		else return 0;
	};
	customFunction.prototype.getStar=function(levelData,level){
		levelData=levelData.split("_")[1];
		levelData=levelData.substring(5,levelData.length);
		levelData=levelData.replace(/a[0-999999999999]|a-1/g, '');
		levelData=levelData.split("s");
		if(typeof levelData[level] !=="undefined")return parseInt(levelData[level]);
		else return 0;
		//levelData=levelData.replace(/s3/g, '');
	};
	customFunction.prototype.filterAvailableIapList=function(iapList,whiteList,blackList,startingID){
		var iapItemArray=iapList.split(",");
		//var newItemArray=[];
		var iapJsonList={};
		
		for(var iapItem of iapItemArray){
			
			if(playtouch.regExp.test(whiteList,"g",iapItem)&&!playtouch.regExp.test(blackList,"g",iapItem)) iapJsonList[iapItem]=startingID;
			startingID++;
		}
		
		return JSON.stringify(iapJsonList);
	};
	customFunction.prototype.getTimeLeft=function(){
		
		var now=new Date();
		
		var midnight=new Date(now.getFullYear(), now.getMonth(), now.getDate());
		
		var seconds=Math.floor((now - midnight) / 1000);
		//console.log(seconds);
		var timeLeft=Math.min(86400-seconds,86400)
		if(timeLeft>0)return Math.min(86400-seconds,86400);
		else return 86400;
		
	};
	customFunction.prototype.getSpineCenterSkin=function(skinList){
		var skinArray=skinList.split(",");
		var skinNum=Math.floor(Math.random()*skinArray.length);
		skinNum=skinArray[skinNum];
		return skinNum;
	};
	customFunction.prototype.getSpineSideSkin=function(skinList,usedSkin){
		
		var skinArray=skinList.split(","),skinNum;
		if(typeof usedSkin!=="undefined"){
			for(var skinIndex in skinArray){
				if(parseInt(skinArray[skinIndex])==parseInt(usedSkin)){
					skinArray.splice(skinIndex,1);
					break;
				}
			}
		}
		
		skinNum=Math.floor(Math.random()*skinArray.length);
		skinList=skinArray[skinNum];
		skinArray.splice(skinNum,1);
		skinNum=Math.floor(Math.random()*skinArray.length);
		skinList+=","+skinArray[skinNum];
		return skinList;
	};
	//can go up to base64
	customFunction.prototype.IntToBase=function(value,base){
		value = parseInt(value);
		var neg = (value < 0); 
		value = Math.abs(value);
    
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var result = '';
    
		do {
			result = chars[value % base] + result;
			value = Math.floor(value / base);
		} while (value > 0);
    
		return neg ? "-" + result : result;
		
	};
	//can go up to base64
	customFunction.prototype.baseToInt = function(value, base){
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var neg = (value[0] === '-');
    
		if (neg) {
			value = value.substring(1);
		}
    
		var result = 0;
		var multiplier = 1;
    
		for (var i = value.length - 1; i >= 0; i--) {
			result += chars.indexOf(value[i]) * multiplier;
			multiplier *= base;
		}
    
		return neg ? -result : result;
	};
	//can go up to base64
	customFunction.prototype.floatToBase = function(value, base, precision = 6) {
		// Separate the integer and fractional parts
		var integerPart = Math.floor(value);
		var fractionalPart = value - integerPart;
    
		// Convert integer part to base
		var integerBase = this.IntToBase(integerPart, base);

		// Define characters for base conversion
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

		// Convert fractional part to base
		var fractionalBase = ".";
		for (var i = 0; i < precision; i++) {
			fractionalPart *= base;
			var digit = Math.floor(fractionalPart);
			fractionalBase += chars[digit];
			fractionalPart -= digit;
		}

		return integerBase + fractionalBase;
	};
	//can go up to base64
	customFunction.prototype.baseToFloat = function(value, base) {
		 // Define characters for base conversion
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

		var parts = value.split('.');
		var integerPart = this.baseToInt(parts[0], base);
		var fractionalPart = 0;

		if (parts.length === 2) {
			var fractionalDigits = parts[1];
			var baseMultiplier = 1 / base;
			for (var i = 0; i < fractionalDigits.length; i++) {
				var digit = chars.indexOf(fractionalDigits[i]);
				fractionalPart += digit * baseMultiplier;
				baseMultiplier /= base;
			}
		}

		return integerPart + fractionalPart;
	};
	customFunction.prototype.getRandomLevel=function(minLevel,maxLevel){
		playtouch.seedsField.plant("challenge",17153819,"anonymous")
		return Math.round(playtouch.seedsField.random("challenge",maxLevel,minLevel));
		
	};
	var decimalConvertor = function(){};
		decimalConvertor.prototype.version="1.1.0";
		decimalConvertor.prototype.tags="_DC";
		
	decimalConvertor.prototype.fixedDecimal=function(value,decimalNum){
		
		return value.toFixed(decimalNum);
		
	};
	

	
	 /***************************************************************************************
                           
						   System Custom
  
  ******************************************************************************************/
   var systemCustom = {};
	systemCustom.version = "1.11.0";
	systemCustom.tag = "SC";
	
	systemCustom.init = function(){
		this.nameArray={};
		this.scrollObject={};
		this.activeDetec=false;
		this.C2_RUNTIME = cr_getC2Runtime();
		this.C2_RUNTIME.tickMe(this);
        return this;
	};
	systemCustom.getNormalScale=function(layerN){
		var layerObject;
		if(isNaN(layerN))layerObject=this.C2_RUNTIME.getLayerByName(layerN);
		else layerObject=this.C2_RUNTIME.getLayerByNumber(layerN);
	
		if(typeof layerObject!=="undefined" && layerObject!==null)return layerObject.getNormalScale();
		return 1;

		
	};
	systemCustom.getRenderSizeByLayer=function(layerN,size){
		var layerObject;
		if(isNaN(layerN))layerObject=this.C2_RUNTIME.getLayerByName(layerN);
		else layerObject=this.C2_RUNTIME.getLayerByNumber(layerN);
	
		
	if(typeof layerObject!=="undefined" && layerObject!==null) return size*layerObject.getNormalScale()();
		
		return 0;
		
	};
	
	systemCustom.getRenderWidthByObjectUID=function(objectUID,width){
		var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
	
		
	if(typeof tempObject!=="undefined" && tempObject!==null) return width*tempObject.layer.getNormalScale();
		
		return 0;
		
	};
	systemCustom.getRenderHeightByObjectUID=function(objectUID,height){
		var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
	
	
		if(typeof tempObject!=="undefined" && tempObject!==null)return height*tempObject.layer.getNormalScale();
		
		return 0;
		
	};
	
	systemCustom.copyCollisionFromObject=function(oriObjectUID,copyObjectUID,animationName,frameNumber){
		//console.log(animationFrame);
		var polyPts=this.C2_RUNTIME.getObjectByUID(oriObjectUID).curFrame.poly_pts;
		var copyObject=this.C2_RUNTIME.getObjectByUID(copyObjectUID);
		
		if(typeof polyPts ==="undefined" || typeof copyObject ==="undefined" || polyPts===null || copyObject===null ) return "";
		
		var anim =copyObject.type.animations.find((a)=>a.name==animationName);
		
		if(!anim) return "";
		
		if(frameNumber >= anim.frames.length)return "";
		
			anim.frames[frameNumber].poly_pts=polyPts;
		
	};
	/*systemCustom.fade_setFadeDestroy=function(objectUID,behaviourIndex,isDestroyOnFadeOut){
		this.C2_RUNTIME.objectsByUid[objectUID].behavior_insts[behaviourIndex].destroy=isDestroyOnFadeOut;
		//console.log(this.C2_RUNTIME.objectsByUid[objectUID]);
	};*/

	systemCustom.tick = function(){
		if(Object.keys(this.nameArray).length>0){
		
			for(var objectName in this.nameArray){
					
				if(typeof this.nameArray[objectName]!="undefined" && this.nameArray[objectName]==1){
					
					if(!this.objectExist(objectName,false)){
						
						window.eventToFire.fireEvent("c2:systemCustom:objectLost",objectName);
						
					}else{
						  
						window.eventToFire.fireEvent("c2:systemCustom:objectExist",objectName);
						
					}
				}
				
			}
		}
		if( Object.keys(this.scrollObject).length>0 ){
			//console.log(this.scrollObject);
			for (var scrollUID in this.scrollObject){
				
				if(typeof this.scrollObject[scrollUID]!=="undefined" && this.scrollObject[scrollUID].isActive){
						
					for(var objectUID in this.scrollObject[scrollUID]){
				         var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
						
						if(!isNaN(parseInt(objectUID))&& typeof this.scrollObject[scrollUID][objectUID]!=="undefined" && typeof tempObject!=="undefined" && tempObject !==null){
							
							

							var tempObjectTop=tempObject.y-(this.scrollObject[scrollUID][objectUID].height/2);
							var tempObjectBot=tempObject.y+(this.scrollObject[scrollUID][objectUID].height/2);
						
							
							
							if(this.scrollObject[scrollUID][objectUID].position=="mid"){
								
								if(typeof this.scrollObject[scrollUID].topLimit!=="undefined" && tempObjectBot<this.scrollObject[scrollUID].topLimit){
									
									this.scrollObject[scrollUID][objectUID].position="top";
									window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtTop",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
									
								}
								else if(typeof this.scrollObject[scrollUID].botLimit!=="undefined" && tempObjectTop>this.scrollObject[scrollUID].botLimit){
								
									this.scrollObject[scrollUID][objectUID].position="bot";
									window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtBot",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
									
								}
						
							}else if(this.scrollObject[scrollUID][objectUID].position=="top"){
								
								if(typeof this.scrollObject[scrollUID].topLimit!=="undefined" && tempObjectBot>=this.scrollObject[scrollUID].topLimit){
									
									this.scrollObject[scrollUID][objectUID].position="mid";
									window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtMid",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
									
								}
							}else{
								
								if(typeof this.scrollObject[scrollUID].botLimit!=="undefined" && tempObjectTop<=this.scrollObject[scrollUID].botLimit){
									
									this.scrollObject[scrollUID][objectUID].position="mid";
									window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtMid",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
									
								}
							}
						}
					}
				}
				
			}
			
		}
	};
	/*systemCustom.setTextToBoxSize=function(objectUID,step,maxSize,ignoreNewline){
		ignoreNewline=Boolean(ignoreNewline);
		if( typeof this.C2_RUNTIME.objectsByUid[objectUID]!=="undefined"){
			var tempObject=this.C2_RUNTIME.objectsByUid[objectUID];
			if(ignoreNewline==true){
			
				var objectWidth=tempObject.width;
			
				var text=tempObject.text;
				//seperate all line text in array
				var txt="",txtArray=text.split("\n");
				var currentLength=0;
			
				//set txt to the largest line text
				for(var lineTxt of txtArray){
					if(currentLength<lineTxt.length){
						currentLength=lineTxt.length;
						txt=lineTxt;
					}
				}
			
				tempObject.type.plugin.acts.SetFontSize.call(tempObject,tempObject.getTextPtByWidth(txt, objectWidth,step,maxSize));
			
			
			}
			else{
				//console.log("here");
				//call plugin textEnhance function SetTextToBoxSize
				tempObject.type.plugin.acts.SetTextToBoxSize.call(tempObject,step,maxSize);
			}
		}
		
		
	};*/
	
	systemCustom.toString = function(){
		
		return "systemCustom";
		
	};
	
	systemCustom.getSortedPack=function(stashData){
		var isFound;
		//var tempList={};
	    var tempList = {
			"unlock": {},
			"lock": {}
		};
		"stash.items"
		for(var pack in stashData["stash"]["items"]){
			//console.log(stashData["shop"][pack]);
			isFound=pack.includes("package");
			
			if(typeof  stashData["stash"]["items"][pack] !=="undefined" && isFound){
				if( stashData["stash"]["items"][pack].quantity==1)tempList["unlock"][pack]= stashData["stash"]["items"][pack];
				if( stashData["stash"]["items"][pack].quantity==0)tempList["lock"][pack]= stashData["stash"]["items"][pack];
			}
		}
		window.eventToFire.fireEvent("c2:systemCustom:stash:getSortedPack",tempList);
		return JSON.stringify(tempList);
		
	};
	systemCustom.addScrollObject=function(scrollUID,objectUID,topL,botL,objectH,objectY){
		
		if(typeof this.scrollObject[scrollUID]=="undefined"){
			
			
			this.scrollObject[scrollUID]={};
			this.scrollObject[scrollUID].topLimit=topL;
			this.scrollObject[scrollUID].botLimit=botL;
			this.scrollObject[scrollUID].isActive=false;
			
		}
		var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
		
		if(typeof this.scrollObject[scrollUID][objectUID]=="undefined"&& typeof tempObject!=="undefined" && tempObject!==null){
		    //var isActive=false;
			
			this.scrollObject[scrollUID][objectUID]={};
			
			//var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
			objectH=parseFloat(objectH);
			objectY=parseFloat(objectY);
			if(isNaN(objectH))objectH=tempObject.height;
			if(isNaN(objectY))objectY=tempObject.y;
		
			this.scrollObject[scrollUID][objectUID].height=objectH;
			
			var tempObjectTop=objectY-(objectH/2);
			var tempObjectBot=objectY+(objectH/2);
			if(tempObjectBot<topL){
				
				this.scrollObject[scrollUID][objectUID].position="top";
				window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtTop",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
			}else if(tempObjectTop>botL){
					
				this.scrollObject[scrollUID][objectUID].position="bot";
				window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtBot",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
			}else{
					
				this.scrollObject[scrollUID][objectUID].position="mid";
				window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtMid",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
			}
		
			
			window.eventToFire.fireEvent("c2:systemCustom:scrollList:objectAdded",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
		}
	};
	systemCustom.updateList=function(scrollUID,topL,botL,objectH){
		if(typeof this.scrollObject[scrollUID]!=="undefined"){
			this.scrollObject[scrollUID].topLimit=topL;
			this.scrollObject[scrollUID].botLimit=botL;
			
			for(var objectUID in this.scrollObject[scrollUID]){	
			  if(isNaN(objectUID))continue;
				var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
				if(typeof tempObject==="undefined" || tempObject===null ) continue;
				//console.log(tempObject);
				objectH=parseFloat(objectH);
				if(isNaN(objectH))objectH=tempObject.height;
				var objectY= tempObject.y;
				var tempObjectTop=objectY-(objectH/2);
				var tempObjectBot=objectY+(objectH/2);
				if(tempObjectBot<topL){
				
					this.scrollObject[scrollUID][objectUID].position="top";
				
				}else if(tempObjectTop>botL){
					
					this.scrollObject[scrollUID][objectUID].position="bot";
				
				}else{
					
					this.scrollObject[scrollUID][objectUID].position="mid";
				
				}
				if(typeof this.scrollObject[scrollUID][objectUID]=="undefined"||typeof this.scrollObject[scrollUID][objectUID].position=="undefined") continue;
				//console.log(this.scrollObject[scrollUID][objectUID].position);
				if(this.scrollObject[scrollUID][objectUID].position==="top") window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtTop",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
				else if(this.scrollObject[scrollUID][objectUID].position==="bot") window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtBot",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
				else  window.eventToFire.fireEvent("c2:systemCustom:scrollList:scrollAtMid",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
				
			}
			 window.eventToFire.fireEvent("c2:systemCustom:scrollList:updated",scrollUID,objectUID,JSON.stringify(this.scrollObject[scrollUID]));
		}
		
	};
	systemCustom.updateScrollBottomLimit=function(scrollUID,newBotLimit){
		
		if(typeof this.scrollObject[scrollUID]!=="undefined" && this.scrollObject[scrollUID].botLimit!==newBotLimit)this.scrollObject[scrollUID].botLimit=newBotLimit;
		
	};
	systemCustom.updateScrollTopLimit=function(scrollUID,newTopLimit){
		
		if(typeof this.scrollObject[scrollUID]!=="undefined" && this.scrollObject[scrollUID].topLimit!==newTopLimit)this.scrollObject[scrollUID].topLimit=newTopLimit;	
		
	};
	systemCustom.destroyScroll=function(scrollUID){
		
		if(typeof this.scrollObject[scrollUID] !=="undefined"){
			
			delete this.scrollObject[scrollUID];
			window.eventToFire.fireEvent("c2:systemCustom:scrollList:resetScroll",scrollUID,JSON.stringify(this.scrollObject));
		}
		
	};
	systemCustom.removeObject=function(scrollUID,objectUID){
		if(typeof this.scrollObject[scrollUID] !=="undefined" && typeof this.scrollObject[scrollUID][objectUID] !="undefined"){
			delete this.scrollObject[scrollUID][objectUID];
			window.eventToFire.fireEvent("c2:systemCustom:scrollList:removeObject",scrollUID,objectUID,JSON.stringify(this.scrollObject));
		}
	};
	
	systemCustom.startScrollDetect=function(scrollUID){
		
		if(typeof this.scrollObject[scrollUID] !=="undefined" && !this.scrollObject[scrollUID].isActive){
			this.scrollObject[scrollUID].isActive=true;
			
			window.eventToFire.fireEvent("c2:systemCustom:scrollList:start",scrollUID,JSON.stringify(this.scrollObject));
		}
		
		
	};
	systemCustom.stopScrollDetect=function(scrollUID){
		
		if(typeof this.scrollObject[scrollUID] !=="undefined" && this.scrollObject[scrollUID].isActive){
			
			this.scrollObject[scrollUID].isActive=false;
			window.eventToFire.fireEvent("c2:systemCustom:scrollList:stop",scrollUID,JSON.stringify(this.scrollObject));
		}
	
	};
	systemCustom.stopAllScroll=function(){
		for(var scrollUID in this.scrollObject){
			this.stopScrollDetect(scrollUID);
		}
	
	};
	systemCustom.destroyAllScroll=function(){
		this.scrollObject={};
	};
	systemCustom.objectClickableVer=function(objectUID,topLimit,botLimit,ratioVisible,objectHeight,objectY){
		var retValue=false;
		if(typeof ratioVisible=="undefined") ratioVisible=0.7;
		var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
		if(typeof tempObject!=="undefined" && tempObject!==null){
			objectHeight=parseFloat(objectHeight);
			
			objectY=parseFloat(objectY);
			
			
		     if(!isNaN(objectHeight)){
				 if(isNaN(objectY)) objectY=tempObject.y;
					var objectTopLimit= objectY-(objectHeight/2);
					var objectBottomLimit= objectY+(objectHeight/2);
					if(topLimit>objectTopLimit){
						window.eventToFire.fireEvent("c2:systemCustom:objectAtTop",objectUID);
					
						if((objectHeight*(1-ratioVisible))>=(topLimit-objectTopLimit)){
					
							return true;
						}
					}
					else if(objectBottomLimit>botLimit)
					{
						window.eventToFire.fireEvent("c2:systemCustom:objectAtBot",objectUID);
						if((objectHeight*(1-ratioVisible))>=(objectBottomLimit-botLimit)){
							return true;
						}
					}else{
						window.eventToFire.fireEvent("c2:systemCustom:objectAtMid",objectUID);
						return true;
					}
				 
				 
			 }else{
				 tempObject.update_bbox();
				 
				 if(topLimit>tempObject.bbox["top"]){
					window.eventToFire.fireEvent("c2:systemCustom:objectAtTop",objectUID);
						
					if((tempObject.height*(1-ratioVisible))>=(topLimit-tempObject.bbox["top"])){
					
						return true;
					}
				}
				else if(tempObject.bbox["bottom"]>botLimit)
				{
					window.eventToFire.fireEvent("c2:systemCustom:objectAtBot",objectUID);
					if((tempObject.height*(1-ratioVisible))>=(tempObject.bbox["bottom"]-botLimit)){
						return true;
					}
				}else{
					window.eventToFire.fireEvent("c2:systemCustom:objectAtMid",objectUID);
					return true;
				}
				 
			 }
			
		}
		
	
		return retValue;
	};
	systemCustom.objectClickableHor=function(objectUID,leftLimit,rightLimit,ratioVisible,objectWidth,objectX){
		var retValue=false;
		if(typeof ratioVisible=="undefined") ratioVisible=0.7;
		var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
		if(typeof tempObject!=="undefined" && tempObject!==null){
			
			
			objectWidth=parseFloat(objectWidth);
			
			objectX=parseFloat(objectX);
		     if(!isNaN(objectWidth)){
				if(isNaN(objectX)) objectX=tempObject.x;
				var objectLeftLimit= objectX-(objectWidth/2);
				var objectRightLimit= objectX+(objectWidth/2);
				if(leftLimit>objectLeftLimit){
					window.eventToFire.fireEvent("c2:systemCustom:objectAtLeft",objectUID);
					if((objectWidth*(1-ratioVisible))>=(leftLimit-objectLeftLimit)){
						return true;
					}
				}
				else if(objectRightLimit>rightLimit)
				{
					window.eventToFire.fireEvent("c2:systemCustom:objectAtRight",objectUID);
					if((objectWidth*(1-ratioVisible))>=(objectRightLimit-rightLimit)){
						return true;
					}
				}else{
					window.eventToFire.fireEvent("c2:systemCustom:objectAtMid",objectUID);
					return true;
				}
				 
			 }else{
				 tempObject.update_bbox();
				 if(leftLimit>tempObject.bbox["left"]){
				  window.eventToFire.fireEvent("c2:systemCustom:objectAtLeft",objectUID);
					if((tempObject.width*(1-ratioVisible))>=(leftLimit-tempObject.bbox["left"])){
						return true;
					}
				}
				else if(tempObject.bbox["right"]>rightLimit)
				{
					window.eventToFire.fireEvent("c2:systemCustom:objectAtRight",objectUID);
					if((tempObject.width*(1-ratioVisible))>=(tempObject.bbox["right"]-rightLimit)){
						return true;
					}
				}else{
					window.eventToFire.fireEvent("c2:systemCustom:objectAtMid",objectUID);
					return true;
				}
			 }
			
		}
		
		
		return retValue;
	};
	
	systemCustom.objectExist=function(objectName,toFireEvent){
		if(typeof objectName!="undefined" && objectName!="-1" &&objectName!=""){
			for(var objectUID in this.C2_RUNTIME.objectsByUid){
				var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
				if(typeof tempObject!=="undefined" && tempObject!==null && typeof tempObject.type.name!=="undefined" && tempObject.type.name===objectName){
					if(typeof toFireEvent=="boolean"){
						if(toFireEvent)window.eventToFire.fireEvent("c2:systemCustom:getObjectExistByName",objectUID,objectName);
						
					}else{
						window.eventToFire.fireEvent("c2:systemCustom:getObjectExistByName",objectUID,objectName);
					}
					
					return true;
				}
			}
		}
		
		return false;
	};
	systemCustom.getObjectNameByID=function(objectUID,toFireEvent){
		
		var objectName="";
		var tempObject=this.C2_RUNTIME.getObjectByUID(objectUID);
		if(typeof tempObject!=="undefined" && tempObject!==null && typeof tempObject.type.name!=="undefined"){
			objectName=tempObject.type.name;
			
			if(typeof toFireEvent=="boolean"){
				if(toFireEvent)window.eventToFire.fireEvent("c2:systemCustom:getObjectNameByID",objectUID,objectName);
				
			}else{
				window.eventToFire.fireEvent("c2:systemCustom:getObjectNameByID",objectUID,objectName);
			}
			return objectName;
		}
		return objectName;
	
	};
	systemCustom.registerTrackerObject=function(objectName){
		if(typeof this.nameArray[objectName]=="undefined"){
			window.eventToFire.fireEvent("c2:systemCustom:onRegisterTrackerObject",objectName);
			this.nameArray[objectName]=1;
		   
		}
		
	};
	systemCustom.unregisterTrackerObject=function(objectName){
		if(typeof this.nameArray[objectName]!="undefined"){
			window.eventToFire.fireEvent("c2:systemCustom:onUnregisterTrackerObject",objectName);
			delete this.nameArray[objectName];
		}
	};
	systemCustom.pauseTrackerObject=function(objectName){
		if(typeof this.nameArray[objectName]!="undefined" && this.nameArray[objectName]==1){
			window.eventToFire.fireEvent("c2:systemCustom:onPauseTrackerObject",objectName);
			this.nameArray[objectName]=0;
		}
	};
	systemCustom.resumeTrackerObject=function(objectName){
		if(typeof this.nameArray[objectName]!="undefined" && this.nameArray[objectName]==0){
				window.eventToFire.fireEvent("c2:systemCustom:onResumeTrackerObject",objectName);
			this.nameArray[objectName]=1;
		}
	};
	systemCustom.pauseAllTrackerObject=function(){
		for(var objectName in this.nameArray){
			
			window.eventToFire.fireEvent("c2:systemCustom:onPauseAllTrackerObject");
			this.pauseTrackerObject(objectName);
		}
	};
	systemCustom.resumeAllTrackerObject=function(){
		for(var objectName in this.nameArray){
			window.eventToFire.fireEvent("c2:systemCustom:resumeAllTrackerObject");
			this.resumeTrackerObject(objectName);
		}
	};
	systemCustom.resetRegisterTrackObjest=function(){
		window.eventToFire.fireEvent("c2:systemCustom:removeAllTrackerObject");
		this.nameArray={};
	};



    



	



    



	


	

   window.playtouch.modulesManager.register("_systemCustom",systemCustom.init());
   window.playtouch.modulesManager.register("_customFunction", new customFunction());
   window.playtouch.modulesManager.register("_decimalConvertor", new decimalConvertor());

	 

})();

/* Dans C2 une première fois
    playtouch = playtouch ||{};
    playtouch.gameMain = new Game();


    // puis 

    playtouch.gameMain.newGame(MaConfigDeNiveau);

    playtouch.gameMain.getPlayable()  (hash.KeyCount)
*/



/// pour tester dans la console
//window.config = {"0":{"x":0,"y":0,"z":0},"1":{"x":0,"y":1,"z":0},"2":{"x":0,"y":2,"z":0},"3":{"x":0,"y":3,"z":0},"4":{"x":0,"y":4,"z":0},"5":{"x":0,"y":5,"z":0},"6":{"x":1,"y":0.5,"z":0},"7":{"x":1,"y":1.5,"z":0},"8":{"x":1,"y":2.5,"z":0},"9":{"x":1,"y":3.5,"z":0},"10":{"x":1,"y":4.5,"z":0},"11":{"x":2,"y":1,"z":0},"12":{"x":2,"y":2,"z":0},"13":{"x":2,"y":3,"z":0},"14":{"x":2,"y":4,"z":0},"15":{"x":3,"y":1.5,"z":0},"16":{"x":3,"y":2.5,"z":0},"17":{"x":3,"y":3.5,"z":0},"18":{"x":4,"y":2,"z":0},"19":{"x":4,"y":3,"z":0},"20":{"x":5,"y":2.5,"z":0},"21":{"x":0,"y":0,"z":1},"22":{"x":0,"y":1,"z":1},"23":{"x":0,"y":2,"z":1},"24":{"x":0,"y":3,"z":1},"25":{"x":0,"y":4,"z":1},"26":{"x":0,"y":5,"z":1},"27":{"x":1,"y":0.5,"z":1},"28":{"x":1,"y":1.5,"z":1},"29":{"x":1,"y":2.5,"z":1},"30":{"x":1,"y":3.5,"z":1},"31":{"x":1,"y":4.5,"z":1},"32":{"x":2,"y":1,"z":1},"33":{"x":2,"y":2,"z":1},"34":{"x":2,"y":3,"z":1},"35":{"x":2,"y":4,"z":1},"36":{"x":3,"y":1.5,"z":1},"37":{"x":3,"y":2.5,"z":1},"38":{"x":3,"y":3.5,"z":1},"39":{"x":4,"y":2,"z":1},"40":{"x":4,"y":3,"z":1},"41":{"x":5,"y":2.5,"z":1},"42":{"x":0,"y":0.5,"z":2},"43":{"x":0,"y":1.5,"z":2},"44":{"x":0,"y":2.5,"z":2},"45":{"x":0,"y":3.5,"z":2},"46":{"x":0,"y":4.5,"z":2},"47":{"x":1,"y":1,"z":2},"48":{"x":1,"y":2,"z":2},"49":{"x":1,"y":3,"z":2},"50":{"x":1,"y":4,"z":2},"51":{"x":2,"y":1.5,"z":2},"52":{"x":2,"y":2.5,"z":2},"53":{"x":2,"y":3.5,"z":2},"54":{"x":3,"y":2,"z":2},"55":{"x":3,"y":3,"z":2},"56":{"x":4,"y":2.5,"z":2},"57":{"x":0,"y":0.5,"z":3},"58":{"x":0,"y":1.5,"z":3},"59":{"x":0,"y":2.5,"z":3},"60":{"x":0,"y":3.5,"z":3},"61":{"x":0,"y":4.5,"z":3},"62":{"x":1,"y":1,"z":3},"63":{"x":1,"y":2,"z":3},"64":{"x":1,"y":3,"z":3},"65":{"x":1,"y":4,"z":3},"66":{"x":2,"y":1.5,"z":3},"67":{"x":2,"y":2.5,"z":3},"68":{"x":2,"y":3.5,"z":3},"69":{"x":3,"y":2,"z":3},"70":{"x":3,"y":3,"z":3},"71":{"x":4,"y":2.5,"z":3}};

/*if(typeof upgradeOldLevel){
    window.upgradeOldLevel = function(oldStylelevel){
        var toRet = [];
        if(typeof oldStylelevel === "string") oldStylelevel = JSON.parse(oldStylelevel);
        for(var aTile in oldStylelevel) if(oldStylelevel.hasOwnProperty(aTile)){
            oldStylelevel[aTile].z = --oldStylelevel[aTile].stair;
            delete  oldStylelevel[aTile].stair;
            toRet.push(oldStylelevel[aTile]);
        }
        return toRet;
    };
}*/

// var game = new Game();
    // game.newGame(config); //return true if success


//game.getPlayable();   //list of playable tiles to highlight (as array)

//game.shuffle(); //return true if success
/*function tries(list,triesNum){
var localCount=0;
   for(var pack in list){
		for (var lvl in list[pack]){
		  if(list[pack][lvl]>=triesNum)localCount++
		
		}
   
   
   }
   console.log(localCount);

}(*/