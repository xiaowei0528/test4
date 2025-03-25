;(function(){

var endless = function(){
	
};


endless.prototype.generatedLineFunc = function(boxStep){
	var CURRENT_STEP = boxStep;
	var STEP_BEFORE_FULL_LINE = 20; //15
	var STEP_BEFORE_BONUS = 15;
	var PROC_BONUS = 11; // 12 //%
	var PROC_NON_BONUS = 4; //%
	var PROC_XTRA_BALL = 60; // 50 //25 + Math.floor(25*Math.min(CURRENT_STEP, 25)/25); //%

	var BLOCKS = [0,3,4,5,6];
	var BONUS = [7,8,9,10,8,19,20,24];
	var NON_BONUS = [25,26];
	var XTRA_BALL = 21;

	var generatedLine = ['','','','','','','','',''];


	var maxNumberOfBlocks = Math.ceil(CURRENT_STEP/STEP_BEFORE_FULL_LINE * 9);
	var nbBlockToCreate = Math.ceil(Math.random()*maxNumberOfBlocks);

	var fillOrReplace = function(valToPlace){
		for(var i=0;i<generatedLine.length;i++){
			if(generatedLine[i] === '') return generatedLine[i] = valToPlace;
		}
		generatedLine[Math.floor(Math.random*generatedLine.length)] = valToPlace;
	}

	for(var n=0; n<nbBlockToCreate; n++){
		var lifeOfBlock = Math.ceil(Math.random() * (CURRENT_STEP+3));
		var blockToCreate = BLOCKS[Math.floor(Math.random()*BLOCKS.length)];
		if(CURRENT_STEP>STEP_BEFORE_BONUS){
			if(Math.random()*100 < PROC_BONUS) blockToCreate = BONUS[Math.floor(Math.random()*BONUS.length)];
			if(Math.random()*100 < PROC_NON_BONUS) blockToCreate = NON_BONUS[Math.floor(Math.random()*NON_BONUS.length)];
		}
		fillOrReplace(blockToCreate + '|'+lifeOfBlock);
	}
	if(Math.random()*100 < PROC_XTRA_BALL) fillOrReplace(XTRA_BALL);

	return generatedLine.sort(function(){return Math.random() - 0.5}).join(',');
};
	





/*********************************************
				Playtouch object
*********************************************/
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.endless = new endless();
	
})();