;(function(){//
/*Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}*/
var dominoVersion= function(){
	this.versionScript="Script Version:0.0.19";
};
dominoVersion.prototype.getDominoVersion=function(){
	return this.versionScript;
};
function roundNearest5(scoreValue){
	
	return (scoreValue%5)>=2.5?(parseInt(scoreValue/5)*5)+5:parseInt(scoreValue/5)*5;
};
function shuffle(array){
  var i = array.length, j, temp;
  if ( i == 0 ) return array;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = array[i];
     array[i] = array[j];
     array[j] = temp;
  }
  return array;
};
var Tile =function(){
	this.logicX=0;
	this.logicY=0;
	this.tileAngle=0;
	this.tileFrame=0;
	this.tileValueLeft="0_";
	this.tileValueRight="0_";
	this.isSpinner=0;
//the value after the underscore in variable tileValueLeft & tileValueRight is to represent if the domino is connect to the right or connected to the left or both side. 1 is connected and 0 is not connected
};
Tile.prototype.init = function(config){
	this.logicX = 0;
	this.logicY = 0;
	this.tileAngle = 0;
	this.tileFrame=0;
	this.tileValueLeft="0_";
	this.tileValueRight="0_";
	this.isSpinner=0;
	if(typeof config === "object"){
		if(typeof config["logicX"] !== "undefined") this.setlogicX(config["logicX"]);
		if(typeof config["logicY"] !== "undefined") this.setlogicY(config["logicY"]);
		if(typeof config["tileAngle"] !== "undefined") this.setTileAngle(config["tileAngle"]);
		if(typeof config["tileFrame"] !== "undefined") this.setTileFrame(config["tileFrame"]);
		if(typeof config["tileValueLeft"] !== "undefined") this.setTileValueLeft(config["tileValueLeft"]);
		if(typeof config["tileValueRight"] !== "undefined") this.setTileValueRight(config["tileValueRight"]);
		if(typeof config["isSpinner"] !== "undefined") this.setIsSpinner(config["isSpinner"]);
	}
	return this;
};
Tile.prototype.getSimplified=function(){
	var thisTile={};
	thisTile.X=this.getlogicX();
	thisTile.Y=this.getlogicY();
	thisTile.tileAngle=this.getTileAngle();
	thisTile.tileFrame=this.getTileFrame();
	thisTile.leftValue=this.getTileValueLeft();
	thisTile.rightValue=this.getTileValueRight();
	thisTile.isSpinner=this.getIsSpinner();
	return thisTile;
}
Tile.prototype.setlogicX=function(valueX){
	this.logicX=valueX;
	return this;
};
Tile.prototype.setlogicY=function(valueY){
	this.logicY=valueY;
	return this;
};
Tile.prototype.setTileAngle=function(newTileAngle){
	this.tileAngle=newTileAngle;
	return this;
};
Tile.prototype.setTileFrame=function(newTileFrame){
	this.tileFrame=newTileFrame;
	return this;
};
Tile.prototype.setTileValueLeft=function(newTileValue){
	this.tileValueLeft=newTileValue;
	return this;
};
Tile.prototype.setTileValueRight=function(newTileValue){
	this.tileValueRight=newTileValue;
	return this;
};

Tile.prototype.setIsSpinner=function(newValue){
	this.isSpinner=newValue;
	return this;
};
Tile.prototype.getlogicX=function(){
	return this.logicX
};
Tile.prototype.getlogicY=function(){
	return this.logicY;
};
Tile.prototype.getTileAngle=function(){

	return this.tileAngle;
};
Tile.prototype.getTileFrame=function(){
	return this.tileFrame;
};
Tile.prototype.getTileValueRight=function(){
	return this.tileValueRight;
};
Tile.prototype.getTileValueLeft=function(){
	return this.tileValueLeft;
};
Tile.prototype.getIsSpinner=function(){	
	return this.isSpinner;
};
Tile.prototype.getTileSum=function(){
	var sum=0;
	sum+=parseInt(this.getTileValueLeft().split("_")[0]);
	sum+=parseInt(this.getTileValueRight().split("_")[0]);
	return sum;
};
Tile.prototype.isDouble=function(){
	if(this.getTileValueLeft().split("_")[0]==this.getTileValueRight().split("_")[0]){
		return true;

	}
	return false;
};
//////////////////$

var Board = function(){
	this.player1=[];
	this.player2=[];
	this.player3=[];
	this.player4=[];
	this.scoreArray=[0,0,0,0];
	this.boneyard=[];
	this.table=[];
};
Board.prototype.setScore=function(scoreValue,numPlayer){
	this.scoreArray[numPlayer-1]=scoreValue;
	return this;
};
Board.prototype.addScore=function(scoreValue,numPlayer){
	this.scoreArray[numPlayer-1]+=scoreValue;
	return this;
};
Board.prototype.getScore=function(numPlayer){
	return this.scoreArray[numPlayer-1];
};
Board.prototype.getDominoesList=function(playerNum){
	/*var toRet={};
	for(var aTile in playerArray){
		if(!playerArray.hasOwnProperty(aTile))continue;
		toRet.push(playerArray[aTile].getSimplified());
	}
	return toRet;*/
	var toRet={};
	for(var i=0;i<this.getLength(playerNum);i++){
		toRet[i]=(this["player"+playerNum][i].getSimplified());
		
	}
	return toRet;
};
Board.prototype.getBoneYardDominoes=function(){
	var toRet={};
	for(var i=0; i<this.boneyard.length;i++){
		toRet[i]=this.boneyard[i].getSimplified();
	}
	return toRet
};
Board.prototype.getTableDominoes=function(){
	var toRet={};
	
	for(var i=0; i<this.table.length;i++){
		toRet[i]=this.table[i].getSimplified();
	}
	return toRet;
};
Board.prototype.verifiedPlayableTiles=function(playerNum){
	var toRet;
	if(playerNum==1){
		toRet=this.hasPlayableTiles(this.player1);
	}
	if(playerNum==2){
		toRet=this.hasPlayableTiles(this.player2);
	}
	if(playerNum==3){
		toRet=this.hasPlayableTiles(this.player3);
	}
	if(playerNum==4){
		toRet=this.hasPlayableTiles(this.player4);
	}
 return toRet;
};
Board.prototype.hasPlayableTiles=function(tileArrays){
	var leftConnected;
	var rightConnected;
	var leftConnected2;
	var rightConnected2;
	//var toRet;
	if(this.table.length==0){
		return true;
	}else{
		for(var aTile in this.table){
			if(! this.table.hasOwnProperty(aTile))continue;
			if(this.table[aTile].getIsSpinner()==0){
				leftConnected=this.table[aTile].getTileValueLeft().split("_");
				rightConnected=this.table[aTile].getTileValueRight().split("_");
				if(leftConnected[1]==""||rightConnected[1]==""){
					for(var i=0 ; i<tileArrays.length;i++){
						if(leftConnected[1]==""){
							if(tileArrays[i].getTileValueLeft()==this.table[aTile].getTileValueLeft() || tileArrays[i].getTileValueRight()==this.table[aTile].getTileValueLeft()){
								return true;
							}
						}
						if(rightConnected[1]==""){
							if(tileArrays[i].getTileValueLeft()==this.table[aTile].getTileValueRight() || tileArrays[i].getTileValueRight()== this.table[aTile].getTileValueRight()){
								return true;
							}
						}	
					}
				}
			}else{
				leftConnected=this.table[aTile].getTileValueLeft().split("_");
				rightConnected=this.table[aTile].getTileValueRight().split("_");
				if(leftConnected.length<3||rightConnected.length<3){
					for(var i=0 ; i<tileArrays.length;i++){
						if(leftConnected.length<3){
							if(tileArrays[i].getTileValueLeft().split("_")[0]==this.table[aTile].getTileValueLeft().split("_")[0] || tileArrays[i].getTileValueRight().split("_")[0]==this.table[aTile].getTileValueLeft().split("_")[0]){
								return true;
							}
						}
						if(rightConnected.length<3){
							if(tileArrays[i].getTileValueLeft().split("_")[0]==this.table[aTile].getTileValueRight().split("_")[0] || tileArrays[i].getTileValueRight().split("_")[0]==this.table[aTile].getTileValueRight().split("_")[0]){
								return true;
							}
						}
					}	
				}
			}
		}
	}
	return false;
};

Board.prototype.getPlayableTile=function(numPlayer){
	var arrayToRet={};
	var localCount=0;
	var leftConnected;
	var rightConnected;
	var hasFound;
	if(this.table.length==0){
		for(var i=0 ; i<this.getLength(numPlayer);i++){
			arrayToRet[i]=this["player"+numPlayer][i].getTileFrame();
		}
	}else{
		for(var a=0;a<this.table.length ;a++){
			if(this.table[a].getIsSpinner()==0){
				leftConnected=this.table[a].getTileValueLeft().split("_");
				rightConnected=this.table[a].getTileValueRight().split("_");
				if(leftConnected[1]==""||rightConnected[1]==""){
					for(var i=0 ; i<this.getLength(numPlayer);i++){
						if(this["player"+numPlayer][i].getTileValueLeft()==this.table[a].getTileValueLeft() ||this["player"+numPlayer][i].getTileValueRight()==this.table[a].getTileValueLeft() || this["player"+numPlayer][i].getTileValueLeft()==this.table[a].getTileValueRight() || this["player"+numPlayer][i].getTileValueRight()== this.table[a].getTileValueRight()){
							arrayToRet[localCount]=this["player"+numPlayer][i].getTileFrame();
							localCount++;
							//arrayToRet.push(tileArrays[i].getTileFrame());
						}
					}
				}
			}else{
				leftConnected=this.table[a].getTileValueLeft().split("_");
				rightConnected=this.table[a].getTileValueRight().split("_");
				if(leftConnected.length<=2||rightConnected.length<=2){
					for(var i=0 ; i<this.getLength(numPlayer);i++){
						if(this["player"+numPlayer][i].getTileValueLeft().split("_")[0]==this.table[a].getTileValueLeft().split("_")[0] ||this["player"+numPlayer][i].getTileValueRight().split("_")[0]==this.table[a].getTileValueLeft().split("_")[0] || this["player"+numPlayer][i].getTileValueLeft().split("_")[0]==this.table[a].getTileValueRight().split("_")[0] || this["player"+numPlayer][i].getTileValueRight().split("_")[0]==this.table[a].getTileValueRight().split("_")[0]){
							arrayToRet[localCount]=this["player"+numPlayer][i].getTileFrame();
							localCount++;
						}
							
					}
				}	
			}
		}
	
	}
return arrayToRet;
};
Board.prototype.addTile=function(playerArray,frameNum){ 
	var removeFromBoneyard;
	for(var aTile in this.boneyard){
		if(! this.boneyard.hasOwnProperty(aTile))continue;
		if(this.boneyard[aTile].getTileFrame()==frameNum ){
			removeFromBoneyard=this.boneyard.splice(aTile,1);
			playerArray.push(removeFromBoneyard[0]);
			return this;
		}
	}
	return this;
};
Board.prototype.addingTileToTable=function(playerNum,frameNum,gameMode){
	var removeFromPlayer;
	var found=0;
	if(gameMode!="allFive"){
		for(var a=0; a<this.getLength(playerNum)&& found==0;a++){
			
			if(this["player"+playerNum][a].getTileFrame()==frameNum){
				removeFromPlayer=this["player"+playerNum].splice(a,1);
				this.table.push(removeFromPlayer[0]);
				found++;
			}
		}	
	}else{
		for(var a=0; a<this.getLength(playerNum)&& found==0;a++){

			if(this["player"+playerNum][a].getTileFrame()==frameNum){
				if(this["player"+playerNum][a].getTileValueLeft()!=this["player"+playerNum][a].getTileValueRight()){
					removeFromPlayer=this["player"+playerNum].splice(a,1);
					this.table.push(removeFromPlayer[0]);
					found++;
				}else{
					removeFromPlayer=this["player"+playerNum].splice(a,1);
					removeFromPlayer[0].setIsSpinner(1);
					this.table.push(removeFromPlayer[0]);
					found++;
				}
			}
		}
	}
	return this;
};
Board.prototype.isFirstDouble=function(){
	var leftValue,rightValue;
	var toRet=true;
	var found=0;
	for(var i=0;i<this.table.length && found==0;i++){
	
		if(this.table[i].isDouble()==true){
			toRet=false;
			found++;
		}
	}
	return toRet;
};
Board.prototype.addNew=function(newObject){
  this.table[this.table.length]=newObject;
  return this;
};
Board.prototype.LeftToLeft=function(tileIndex,splitArray,playerNum,playerIndex,gameMode){
	//var templeftConnected=parseInt(this.table[tileIndex].getTileValueLeft().split("_")[1])+1;
	if(	this.table[tileIndex].getTileValueLeft().split("_")[1]!=""){
		this.table[tileIndex].setTileValueLeft(this.table[tileIndex].getTileValueLeft().split("_")[0]+"_"+this.table[tileIndex].getTileValueLeft().split("_")[1]+"_"+this["player"+playerNum][playerIndex].getTileFrame());
	}else{
		//window.console.log(this.table[tileIndex].getTileValueLeft().split("_")[0]);
		this.table[tileIndex].setTileValueLeft(this.table[tileIndex].getTileValueLeft().split("_")[0]+"_"+this["player"+playerNum][playerIndex].getTileFrame());
	}
	
	
	if(gameMode=="allFive"&& this["player"+playerNum][playerIndex].isDouble()==true &&this.isFirstDouble()==true){
		
		this["player"+playerNum][playerIndex].setIsSpinner(1);
	}
	this["player"+playerNum][playerIndex].setTileValueLeft(this["player"+playerNum][playerIndex].getTileValueLeft().split("_")[0]+"_"+this.table[tileIndex].getTileFrame());
	
	var removeFromPlayer=this["player"+playerNum].splice(playerIndex,1);

	this.table.push(removeFromPlayer[0]);
	return this;
};
Board.prototype.LeftToRight=function(tileIndex,splitArray,playerNum,playerIndex,gameMode){
	
	//var templeftConnected=parseInt(this.table[tileIndex].getTileValueLeft().split("_")[1])+1;
	if(	this.table[tileIndex].getTileValueLeft().split("_")[1]!=""){
		this.table[tileIndex].setTileValueLeft(this.table[tileIndex].getTileValueLeft().split("_")[0]+"_"+this.table[tileIndex].getTileValueLeft().split("_")[1]+"_"+this["player"+playerNum][playerIndex].getTileFrame());
	}else{
		this.table[tileIndex].setTileValueLeft(this.table[tileIndex].getTileValueLeft().split("_")[0]+"_"+this["player"+playerNum][playerIndex].getTileFrame());
	}
	
	if(gameMode=="allFive"&& this["player"+playerNum][playerIndex].isDouble()==true &&this.isFirstDouble()==true){
		
		this["player"+playerNum][playerIndex].setIsSpinner(1);
	}
	this["player"+playerNum][playerIndex].setTileValueRight(this["player"+playerNum][playerIndex].getTileValueRight().split("_")[0]+"_"+this.table[tileIndex].getTileFrame());
	var removeFromPlayer=this["player"+playerNum].splice(playerIndex,1);

	this.table.push(removeFromPlayer[0]);
	return this;		
};
Board.prototype.RightToLeft=function(tileIndex,splitArray,playerNum,playerIndex,gameMode){
	
	//var temprightConnected=parseInt(this.table[tileIndex].getTileValueRight().split("_")[1])+1;
	if(this.table[tileIndex].getTileValueRight().split("_")[1]!=""){
		this.table[tileIndex].setTileValueRight(this.table[tileIndex].getTileValueRight().split("_")[0]+"_"+this.table[tileIndex].getTileValueRight().split("_")[1]+"_"+this["player"+playerNum][playerIndex].getTileFrame());
	}else{
		this.table[tileIndex].setTileValueRight(this.table[tileIndex].getTileValueRight().split("_")[0]+"_"+this["player"+playerNum][playerIndex].getTileFrame());
	}
	if(gameMode=="allFive"&& this["player"+playerNum][playerIndex].isDouble()==true &&this.isFirstDouble()==true){
		
		this["player"+playerNum][playerIndex].setIsSpinner(1);
	}
	this["player"+playerNum][playerIndex].setTileValueLeft(this["player"+playerNum][playerIndex].getTileValueLeft().split("_")[0]+"_"+this.table[tileIndex].getTileFrame());
	
	var removeFromPlayer=this["player"+playerNum].splice(playerIndex,1);

	this.table.push(removeFromPlayer[0]);
	return this;
};
Board.prototype.RightToRight=function(tileIndex,splitArray,playerNum,playerIndex,gameMode){

	//var temprightConnected=parseInt(this.table[tileIndex].getTileValueRight().split("_")[1])+1;

	if(this.table[tileIndex].getTileValueRight().split("_")[1]!=""){
		this.table[tileIndex].setTileValueRight(this.table[tileIndex].getTileValueRight().split("_")[0]+"_"+this.table[tileIndex].getTileValueRight().split("_")[1]+"_"+this["player"+playerNum][playerIndex].getTileFrame());
	}else{
		this.table[tileIndex].setTileValueRight(this.table[tileIndex].getTileValueRight().split("_")[0]+"_"+this["player"+playerNum][playerIndex].getTileFrame());
	}
	
	if(gameMode=="allFive"&& this["player"+playerNum][playerIndex].isDouble()==true &&this.isFirstDouble()==true){
	
		this["player"+playerNum][playerIndex].setIsSpinner(1);
	}
	this["player"+playerNum][playerIndex].setTileValueRight(this["player"+playerNum][playerIndex].getTileValueRight().split("_")[0]+"_"+this.table[tileIndex].getTileFrame());
	var removeFromPlayer=this["player"+playerNum].splice(playerIndex,1);

	this.table.push(removeFromPlayer[0]);
	return this;		
};
Board.prototype.connectDominoToRight=function(tileIndex,splitArray,numPlayer,foundTile,gameMode){
	if(this["player"+numPlayer][foundTile].getTileValueLeft().split("_")[0]==this.table[tileIndex].getTileValueRight().split("_")[0] && this["player"+numPlayer][foundTile].getTileValueRight().split("_")[0]!=this.table[tileIndex].getTileValueRight().split("_")[0]){
		this.RightToLeft(tileIndex,splitArray,numPlayer,foundTile,gameMode);
	}else if(this["player"+numPlayer][foundTile].getTileValueLeft().split("_")[0]!=this.table[tileIndex].getTileValueRight().split("_")[0] && this["player"+numPlayer][foundTile].getTileValueRight().split("_")[0]==this.table[tileIndex].getTileValueRight().split("_")[0]){
		this.RightToRight(tileIndex,splitArray,numPlayer,foundTile,gameMode);
	}else if(this["player"+numPlayer][foundTile].getTileValueLeft().split("_")[0]==this.table[tileIndex].getTileValueRight().split("_")[0] && this["player"+numPlayer][foundTile].getTileValueRight().split("_")[0]==this.table[tileIndex].getTileValueRight().split("_")[0]){
		this.RightToRight(tileIndex,splitArray,numPlayer,foundTile,gameMode);
	}
	return this;
};
Board.prototype.connectDominoToLeft=function(tileIndex,splitArray,numPlayer,foundTile,gameMode){
	if(this["player"+numPlayer][foundTile].getTileValueLeft().split("_")[0]==this.table[tileIndex].getTileValueLeft().split("_")[0] && this["player"+numPlayer][foundTile].getTileValueRight().split("_")[0]!=this.table[tileIndex].getTileValueLeft().split("_")[0]){
		this.LeftToLeft(tileIndex,splitArray,numPlayer,foundTile,gameMode);
	}else if(this["player"+numPlayer][foundTile].getTileValueLeft().split("_")[0]!=this.table[tileIndex].getTileValueLeft().split("_")[0] && this["player"+numPlayer][foundTile].getTileValueRight().split("_")[0]==this.table[tileIndex].getTileValueLeft().split("_")[0]){
		this.LeftToRight(tileIndex,splitArray,numPlayer,foundTile,gameMode);
	}else if(this["player"+numPlayer][foundTile].getTileValueLeft().split("_")[0]==this.table[tileIndex].getTileValueLeft().split("_")[0] && this["player"+numPlayer][foundTile].getTileValueRight().split("_")[0]==this.table[tileIndex].getTileValueLeft().split("_")[0]){
		this.LeftToLeft(tileIndex,splitArray,numPlayer,foundTile,gameMode);
	}
	return this;
};
Board.prototype.removeTileAndPlace=function(numPlayer,frameNum,tileFrameFromTable,side,gameMode){
	var removeFromPlayer;
	var leftConnected;
	var rightConnected;
	var templeftConnected;
	var temprightConnected;
	var foundTile=-1
	for(var a=0;a<this.getLength(numPlayer)&& foundTile==-1;a++){
		if(this["player"+numPlayer][a].getTileFrame()==frameNum){
			foundTile=a;
		}
	}
	if(foundTile!=-1){
		for(var b=0;b<this.table.length;b++ ){
			if(this.table[b].getTileFrame()==tileFrameFromTable){
				leftConnected=this.table[b].getTileValueLeft().split("_");
				rightConnected=this.table[b].getTileValueRight().split("_");
				if(this.table[b].getIsSpinner()!=1){
					if(leftConnected[1]!=rightConnected[1]){
						if(leftConnected[1]==""){
							this.connectDominoToLeft(b,leftConnected,numPlayer,foundTile,gameMode);
						}
						else if(rightConnected[1]==""){
							this.connectDominoToRight(b,leftConnected,numPlayer,foundTile,gameMode);
						}
						return this;
					}else{
						if(leftConnected[1]==""||rightConnected[1]==""){
						

							if(side=="left" ){
								if(this["player"+numPlayer][foundTile].getTileValueLeft()==this.table[b].getTileValueLeft() || this["player"+numPlayer][foundTile].getTileValueRight()==this.table[b].getTileValueLeft()){
								
									this.connectDominoToLeft(b,leftConnected,numPlayer,foundTile,gameMode);
								}else{
								
									this.connectDominoToRight(b,leftConnected,numPlayer,foundTile,gameMode);
								}
							}else{
								if(this["player"+numPlayer][foundTile].getTileValueLeft()==this.table[b].getTileValueRight() || this["player"+numPlayer][foundTile].getTileValueRight()==this.table[b].getTileValueRight()){
									this.connectDominoToRight(b,leftConnected,numPlayer,foundTile,gameMode);
								}else{
								
									this.connectDominoToLeft(b,leftConnected,numPlayer,foundTile,gameMode);
							
								}	
							}
						}
						return this;
					}
				}else{
					
					if(side=="left" ){

						if(leftConnected[1]==""){
					
							if(this["player"+numPlayer][foundTile].getTileValueLeft().split("_")[0]==this.table[b].getTileValueLeft().split("_")[0] || this["player"+numPlayer][foundTile].getTileValueRight().split("_")[0]==this.table[b].getTileValueLeft().split("_")[0]){
								
								this.connectDominoToLeft(b,leftConnected,numPlayer,foundTile,gameMode);
							
							}else {
							
								this.connectDominoToRight(b,leftConnected,numPlayer,foundTile,gameMode);
							}
						
						}else if(leftConnected[1]!="" && rightConnected[1]==""){
							this.connectDominoToRight(b,leftConnected,numPlayer,foundTile,gameMode);
						}else if(leftConnected[1]!="" &&  rightConnected[1]!=""){
							if(leftConnected.length<3){
								this.connectDominoToLeft(b,leftConnected,numPlayer,foundTile,gameMode);	
							}else{
								this.connectDominoToRight(b,leftConnected,numPlayer,foundTile,gameMode);
							}
						}
					}else{
						if(rightConnected[1]=="" ){
							
							if(this["player"+numPlayer][foundTile].getTileValueLeft().split("_")[0]==this.table[b].getTileValueRight().split("_")[0] || this["player"+numPlayer][foundTile].getTileValueRight().split("_")[0]==this.table[b].getTileValueRight().split("_")[0]){
								
								this.connectDominoToRight(b,leftConnected,numPlayer,foundTile,gameMode);
								
							}else{
								
								this.connectDominoToLeft(b,leftConnected,numPlayer,foundTile,gameMode);
							
							}

						}else if(leftConnected[1]=="" && rightConnected[1]!=""){
							this.connectDominoToLeft(b,leftConnected,numPlayer,foundTile,gameMode);	
						}else if(leftConnected[1]!="" &&  rightConnected[1]!=""){
							if(rightConnected.length<3){
								
								this.connectDominoToRight(b,leftConnected,numPlayer,foundTile,gameMode);	
							}else{
								this.connectDominoToLeft(b,leftConnected,numPlayer,foundTile,gameMode);
							}
						}	
					}
					return this;
				}	
			}
		}	
	}
	
}; 
Board.prototype.AITakeTileFromBoneYard=function(playerNum){
	var toRet={};
	var randomPick=Math.floor(Math.random()*this.boneyard.length);
	var removeFromBone= this.boneyard.splice(randomPick,1);
	this["player"+playerNum].push(removeFromBone[0]);
	
	toRet[0]=removeFromBone[0].getTileFrame();
	return toRet;
};
Board.prototype.playATile=function(gameMode,playerNum){
	var localCount=0;
	var toRet={};
	var getPlayableTileFrame=this.getPlayableTileForAI(playerNum);
	if(this.table.length==0){
		this.addingTileToTable(playerNum,getPlayableTileFrame,gameMode);
		toRet[0]=getPlayableTileFrame;
	}else{
		var getPlayableTileFromTable=this.getPlayableTileFrameFromTable(getPlayableTileFrame,playerNum);
		 this.removeTileFromPlayer(playerNum,getPlayableTileFrame,getPlayableTileFromTable,"left",gameMode);
		 toRet[0]=getPlayableTileFrame;
		 toRet[1]=getPlayableTileFromTable;
	}
	return toRet;

};
Board.prototype.getPlayableTileFrameFromTable=function(frameNum,playerNum){
	var foundTile=-1;
	var foundPlacablePlace=0
	var toRet;
	var leftConnected;
	var rightConnected;
	for(var i=0; i<this.getLength(playerNum)&&foundTile==-1;i++){
		if(this["player"+playerNum][i].getTileFrame()==frameNum){
			foundTile=i;
		}
	}

	for(var j=0;j<this.table.length && foundPlacablePlace==0;j++){
		if(this.table[j].getIsSpinner()==0){
			if(this["player"+playerNum][foundTile].getTileValueLeft()==this.table[j].getTileValueLeft()||this["player"+playerNum][foundTile].getTileValueLeft()==this.table[j].getTileValueRight() || this["player"+playerNum][foundTile].getTileValueRight()==this.table[j].getTileValueLeft()||this["player"+playerNum][foundTile].getTileValueRight()==this.table[j].getTileValueRight()){
				toRet=this.table[j].getTileFrame();
				foundPlacablePlace++;
			}
		}else{
			leftConnected=this.table[j].getTileValueLeft().split("_");
			rightConnected=this.table[j].getTileValueRight().split("_");
			if(leftConnected.length<3||rightConnected.length<3){
			
				var hasBeenAddToarrayToRet=0;
				if(this["player"+playerNum][foundTile].getTileValueLeft().split("_")[0]==this.table[j].getTileValueLeft().split("_")[0] || this["player"+playerNum][foundTile].getTileValueRight().split("_")[0]==this.table[j].getTileValueLeft().split("_")[0] || this["player"+playerNum][foundTile].getTileValueLeft().split("_")[0]==this.table[j].getTileValueRight().split("_")[0] || this["player"+playerNum][foundTile].getTileValueRight().split("_")[0]==this.table[j].getTileValueRight().split("_")[0]){
					toRet=this.table[j].getTileFrame();
					foundPlacablePlace++;
				}			
			}
		}
	}
	return toRet;
};
Board.prototype.getListOfUnblockTile=function(playerNum,frameNum){
	var foundTile=-1;
	for(var i=0; i<this.getLength(playerNum)&&foundTile==-1&& this.getLength(playerNum)>0;i++){
		if(this["player"+playerNum][i].getTileFrame()==frameNum){
			foundTile=i;
		}
	}
	var toRet={};
	var localCount=0;
	for(var i=0;i<this.table.length && this.getLength(playerNum)>0;i++){
		if(this.table[i].getIsSpinner()==1){
			if(this.table[i].getTileValueLeft().split("_").length<3 || this.table[i].getTileValueRight().split("_").length<3){
				if(this.table[i].getTileValueLeft().split("_")[0]==this["player"+playerNum][foundTile].getTileValueLeft().split("_")[0] || this.table[i].getTileValueLeft().split("_")[0]==this["player"+playerNum][foundTile].getTileValueRight().split("_")[0] || this.table[i].getTileValueRight().split("_")[0]==this["player"+playerNum][foundTile].getTileValueLeft().split("_")[0] || this.table[i].getTileValueRight().split("_")[0]==this["player"+playerNum][foundTile].getTileValueRight().split("_")[0]){
					//toRet.push(this.table[i].getTileFrame());
					toRet[localCount]=this.table[i].getTileFrame();
					localCount++;
				}
			}
		}else{
			if(this.table[i].getTileValueLeft()==this["player"+playerNum][foundTile].getTileValueLeft() ||this.table[i].getTileValueLeft()==this["player"+playerNum][foundTile].getTileValueRight() || this.table[i].getTileValueRight()==this["player"+playerNum][foundTile].getTileValueLeft() || this.table[i].getTileValueRight()==this["player"+playerNum][foundTile].getTileValueRight()){
				//toRet.push(this.table[i].getTileFrame());
				toRet[localCount]=this.table[i].getTileFrame();
				localCount++;
			}
		}
	}
	return toRet;
};
Board.prototype.getPlayableTileForAI=function(playerNum){
	var arrayPlayable=[];
	var toRet;
	var localCount=0;
	var removeFromPlayer;
	var leftConnected;
	var rightConnected;
	var randomPick
	if(this.table.length==0){
		randomPick=Math.floor(Math.random()*this.getLength(playerNum));
		toRet=this["player"+playerNum][randomPick].getTileFrame();

	}else{
		
		for(var i=0;i<this.table.length;i++){

			if(this.table[i].getIsSpinner()==0){
				leftConnected=this.table[i].getTileValueLeft().split("_");
				rightConnected=this.table[i].getTileValueRight().split("_");
				if(leftConnected[1]=="" ||rightConnected[1]=="" ){
					for(var j=0 ; j<this.getLength(playerNum);j++){
						var hasBeenAddToarrayToRet=0;
						if(this["player"+playerNum][j].getTileValueLeft()==this.table[i].getTileValueLeft() || this["player"+playerNum][j].getTileValueRight()==this.table[i].getTileValueLeft()||this["player"+playerNum][j].getTileValueLeft()==this.table[i].getTileValueRight() ||this["player"+playerNum][j].getTileValueRight()== this.table[i].getTileValueRight()){
							arrayPlayable[localCount]=this["player"+playerNum][j].getTileFrame();
							localCount++;
							hasBeenAddToarrayToRet++;	
						}		
					}
				}
			}else{
				leftConnected=this.table[i].getTileValueLeft().split("_");
				rightConnected=this.table[i].getTileValueRight().split("_");
				if(leftConnected.length<3||rightConnected.length<3){
					for(var j=0 ; j<this.getLength(playerNum);j++){
						if(this["player"+playerNum][j].getTileValueLeft().split("_")[0]==this.table[i].getTileValueLeft().split("_")[0] ||this["player"+playerNum][j].getTileValueRight().split("_")[0]==this.table[i].getTileValueLeft().split("_")[0] ||this["player"+playerNum][j].getTileValueLeft().split("_")[0]==this.table[i].getTileValueRight().split("_")[0] || this["player"+playerNum][j].getTileValueRight().split("_")[0]==this.table[i].getTileValueRight().split("_")[0]){
							arrayPlayable[localCount]=this["player"+playerNum][j].getTileFrame();
							localCount++;
							hasBeenAddToarrayToRet++;
						}

					}	
				}
			}
		}
		randomPick=Math.floor(Math.random()*arrayPlayable.length);
		toRet=arrayPlayable[randomPick];
	}
	return toRet;
};
Board.prototype.allFiveScoring=function(numPlayer){
	var toRet;
	var addingScore=0;
	for(var i=0;i<this.table.length;i++){
		if(this.table[i].getIsSpinner()==1){
			if(this.table[i].getTileValueLeft().split("_")[1]=="" || this.table[i].getTileValueRight().split("_")[1] == ""){
				addingScore+= parseInt(this.table[i].getTileValueLeft().split("_")[0])*2;
			}

		}else{
			
			if(this.table[i].isDouble()==false){
				if(this.table.length<2){
					if((parseInt(this.table[i].getTileValueLeft().split("_")[0]) + parseInt(this.table[i].getTileValueRight().split("_")[0])) % 5 == 0){
						
						addingScore+=(parseInt(this.table[i].getTileValueLeft().split("_")[0]) + parseInt(this.table[i].getTileValueRight().split("_")[0]));					
					}
				}
				else
				
				if(this.table.length>1){
					if(this.table[i].getTileValueLeft().split("_")[1]=="" ){
						addingScore+= parseInt(this.table[i].getTileValueLeft().split("_")[0]);
					}
					else
					if(this.table[i].getTileValueRight().split("_")[1]=="" ){
						addingScore+= parseInt(this.table[i].getTileValueRight().split("_")[0]);
					}
				}
			}else
				
				if(this.table[i].getTileValueLeft().split("_")[1]=="" || this.table[i].getTileValueRight().split("_")[1]==""  ){
					addingScore+= (parseInt(this.table[i].getTileValueLeft().split("_")[0]) + parseInt(this.table[i].getTileValueRight().split("_")[0]));
				}
			
			
		}
	}
	if(addingScore%5==0){
		this.addScore(addingScore,numPlayer);
		toRet= this.getScore(numPlayer);
	}else{

		toRet= this.getScore(numPlayer);
	}
return toRet;
};


Board.prototype.onDropGetScore=function(){
	var toRet;
	var addingScore=0;
	for(var i=0;i<this.table.length;i++){
		
		if(this.table[i].getIsSpinner()== 1){
			if(this.table[i].getTileValueLeft().split("_")[1] == "" && this.table[i].getTileValueRight().split("_")[1] == ""){ 
				addingScore+=parseInt(this.table[i].getTileValueLeft().split("_")[0])*2;
			}
			else
			if(this.table[i].getTileValueLeft().split("_")[1] == "" || this.table[i].getTileValueRight().split("_")[1] == ""){ 
				addingScore+=parseInt(this.table[i].getTileValueLeft().split("_")[0])*2;
			}
		}
		else
		{ // IS NOT Double
			if(this.table[i].isDouble()== false){
				if(this.table.length<2){
					if((parseInt(this.table[i].getTileValueLeft().split("_")[0]) + parseInt(this.table[i].getTileValueRight().split("_")[0])) %5 == 0){
						
						addingScore+=(parseInt(this.table[i].getTileValueLeft().split("_")[0]) + parseInt(this.table[i].getTileValueRight().split("_")[0]));				
					}
				}
				else
						
				if(this.table.length>1){
					if(this.table[i].getTileValueLeft().split("_")[1]== "" ){
						addingScore+=parseInt(this.table[i].getTileValueLeft().split("_")[0]);
					} 
					else				
					if(this.table[i].getTileValueRight().split("_")[1]== "" ){
						addingScore+=parseInt(this.table[i].getTileValueRight().split("_")[0]);
					}
				}
			}else
			// IS Double	
			if(this.table[i].getTileValueLeft().split("_")[1]== "" && this.table[i].getTileValueRight().split("_")[1]== ""  ){
					addingScore+= (parseInt(this.table[i].getTileValueLeft().split("_")[0]) + parseInt(this.table[i].getTileValueRight().split("_")[0]));
				}
			else
			if(this.table[i].getTileValueLeft().split("_")[1]== "" || this.table[i].getTileValueRight().split("_")[1]== ""  ){
					addingScore+= (parseInt(this.table[i].getTileValueLeft().split("_")[0]) + parseInt(this.table[i].getTileValueRight().split("_")[0]));
				}
			
			
		}
	}
	if(addingScore%5==0){
		toRet= addingScore; 
	}else{

		toRet= 0;
	}
return toRet;

};
Board.prototype.scoring=function(gameMode,numPlayer,noOfPlayer){
	var sumOfOpponentHand=0;
	var sumOfYourHand=0;
	var addingScore=0;
	var toRet;
	if(gameMode=="allFive"){

		for(var i=1; i<5 && i<=noOfPlayer;i++){
			if(noOfPlayer==2 && i!=numPlayer){
				
				for(var j=0; j<this.getLength(i);j++){
					addingScore+=this["player"+i][j].getTileSum();
				}
			}else if(noOfPlayer==4){
				if((numPlayer%2==0&&i%2!=0)||(numPlayer%2!=0&&i%2==0)){
					for(var j=0; j<this.getLength(i);j++){
						addingScore+=this["player"+i][j].getTileSum();
					}
				}		
			}
		}
		if(addingScore%5==0){
			this.addScore(addingScore/5,numPlayer);
			toRet= this.getScore(numPlayer);
		}else{
			this.addScore(roundNearest5(addingScore)/5,numPlayer);
			toRet= this.getScore(numPlayer);
		}
	}else{
		for(var i=1; i<5;i++){
			if(noOfPlayer==2){
				if(i!=numPlayer){
					for(var j=0; j<this.getLength(i);j++){
						sumOfOpponentHand+=this["player"+i][j].getTileSum();
					}
				}else{
					if(this.getLength(i)!=0){
						for(var j=0; j<this.getLength(i);j++){
							sumOfYourHand+=this["player"+i][j].getTileSum();
						}
					}
				}
			}else{
				if((numPlayer%2==0&&i%2!=0)||(numPlayer%2!=0&&i%2==0)){
					for(var j=0; j<this.getLength(i);j++){
						sumOfOpponentHand+=this["player"+i][j].getTileSum();
					}
				}else{
					if(this.getLength(i)!=0){
						for(var j=0; j<this.getLength(i);j++){
							sumOfYourHand+=this["player"+i][j].getTileSum();
						}
					}
					
				}			
			}
			
		}
		addingScore+=sumOfOpponentHand-sumOfYourHand;
		addingScore>0?addingScore=addingScore:addingScore=0;
		this.addScore(addingScore,numPlayer);
		toRet=this.getScore(numPlayer);

	}

	return toRet;
};
Board.prototype.currentscoring=function(gameMode,numPlayer,noOfPlayer){
	var sumOfOpponentHand=0;
	var sumOfYourHand=0;
	var addingScore=0;
	var toRet;
	if(gameMode=="allFive"){

		for(var i=1; i<5 && i<=noOfPlayer;i++){
			if(noOfPlayer==2 && i!=numPlayer){
				
				for(var j=0; j<this.getLength(i);j++){
					addingScore+=this["player"+i][j].getTileSum();
				}
			}else if(noOfPlayer==4){
				if((numPlayer%2==0&&i%2!=0)||(numPlayer%2!=0&&i%2==0)){
					for(var j=0; j<this.getLength(i);j++){
						addingScore+=this["player"+i][j].getTileSum();
					}
				}		
			}
		}
		if(addingScore%5==0){
			
			toRet= addingScore/5
		}else{
			
			toRet= roundNearest5(addingScore)/5
		}
	}else{
		for(var i=1; i<5;i++){
			if(noOfPlayer==2){
				if(i!=numPlayer){
					for(var j=0; j<this.getLength(i);j++){
						sumOfOpponentHand+=this["player"+i][j].getTileSum();
					}
				}else{
					if(this.getLength(i)!=0){
						for(var j=0; j<this.getLength(i);j++){
							sumOfYourHand+=this["player"+i][j].getTileSum();
						}
					}
				}
			}else{
				if((numPlayer%2==0&&i%2!=0)||(numPlayer%2!=0&&i%2==0)){
					for(var j=0; j<this.getLength(i);j++){
						sumOfOpponentHand+=this["player"+i][j].getTileSum();
					}
				}else{
					if(this.getLength(i)!=0){
						for(var j=0; j<this.getLength(i);j++){
							sumOfYourHand+=this["player"+i][j].getTileSum();
						}
					}
					
				}			
			}
			
		}
		addingScore+=sumOfOpponentHand-sumOfYourHand;
		addingScore>0?addingScore=addingScore:addingScore=0;
		
		toRet=addingScore

	}

	return toRet;
};
Board.prototype.getDominoesAtEnds=function(){
	var ends = []; 
	for(var i=0;i<this.table.length;i++){
		if(this.table[i].getIsSpinner()==1){ 
		//check if spinner has one side(left/right) opened
			if(this.table[i].getTileValueLeft().split("_")[1]==""  ||  this.table[i].getTileValueRight().split("_")[1]==""){
				ends.push(this.table[i].getTileFrame()); 
			}
		}else{ //Not double
			if(this.table[i].isDouble()==false){
				if(this.table.length<2){
					if((parseInt(this.table[i].getTileValueLeft().split("_")[0]) + parseInt(this.table[i].getTileValueRight().split("_")[0])) % 5 ==0){
						
						ends.push(this.table[i].getTileFrame()); 				
					}
				}
				else
				if(this.table.length>1){
					if(this.table[i].getTileValueLeft().split("_")[1]=="" ||this.table[i].getTileValueRight().split("_")[1]=="" ){
						ends.push(this.table[i].getTileFrame());
					}
				}
			}else{ //Is double
				if(this.table[i].getTileValueLeft().split("_")[1]=="" || this.table[i].getTileValueRight().split("_")[1]==""  ){
					ends.push(this.table[i].getTileFrame());
				}
			}
		}
	}
	return ends.join(',');
};
Board.prototype.showScoreToGet=function(playerNum,frameNum,tableFrame){ // (playernum, domino being drag , nearest domino on table)
	//tableframe is the tile which is already in the table which is selected either by nearest holding domino
	var totalScore=0; // the final score to return which will appear near the domino
	var foundTile=-1;
	var tableTile=-1;
	var found=0;
	//var arrayFrame;
	
	//taking all domino in my hand and comparing if the frame matches the dragging domino frame (parameter)
	for( var a=0;a<this.getLength(playerNum)&& foundTile==-1;a++){ 
		if(this["player"+playerNum][a].getTileFrame()==frameNum){
			foundTile=a;

		}
	}
	//taking all domino in opponent hands and comparing if the frame matches the dragging domino frame (parameter)
	for(var b=0;b<this.table.length&& tableTile==-1;b++){
		if(this.table[b].getTileFrame()==tableFrame){
			tableTile=b;
		}
	}
			/*		console.log("dominoTableValLeft " + dominoTableValLeft);
					console.log("dominoTableValRight " + dominoTableValRight);
					console.log("dominoDraggingValLeft " + dominoDraggingValLeft);
					console.log("dominoDraggingValRight " + dominoDraggingValRight);*/
					
					
	var dominoTableValLeft = this.table[tableTile].getTileValueLeft().split("_")[0];
	var dominoTableValRight = this.table[tableTile].getTileValueRight().split("_")[0];
	var dominoDraggingValLeft = this["player"+playerNum][foundTile].getTileValueLeft().split("_")[0];
	var dominoDraggingValRight = this["player"+playerNum][foundTile].getTileValueRight().split("_")[0];

	var dominoTableLeftConnectedFrame = this.table[tableTile].getTileValueLeft().split("_")[1];
	var dominoTableRightConnectedFrame = this.table[tableTile].getTileValueRight().split("_")[1];
	
	//console.log("this['player'+playerNum][foundTile].getTileValueLeft() " + this["player"+playerNum][foundTile].getTileValueLeft());	
	//console.log("this.table[tableTile].getTileValueLeft() " + this.table[tableTile].getTileValueLeft());	
	
	//check if my matching domino IS NOT a double /////////////////////////////////////////////////////////
	if(this["player"+playerNum][foundTile].isDouble()== false){
				
	if((dominoDraggingValLeft == dominoTableValLeft)|| (dominoDraggingValLeft == dominoTableValRight)){		
			totalScore+=parseInt(dominoDraggingValRight);			 	
		}else 
		if ((dominoDraggingValRight == dominoTableValLeft)|| (dominoDraggingValRight == dominoTableValRight)){		
			totalScore+=parseInt(dominoDraggingValLeft);				
		}
		//console.log("Dragging NOT DOUBLE");
	}else 
	//check if my matching domino IS a double /////////////////////////////////////////////////////////
	if(this["player"+playerNum][foundTile].isDouble()!= false)
		{ 
		//console.log("Dragging DOUBLE ");
			totalScore+=( parseInt(dominoDraggingValLeft)+parseInt(dominoDraggingValRight)); //console.log("total score draggable "+ totalScore);	
		}
		
		
	//check if table matching domino IS a SPINNER /////////////////////////////////////////////////////////
	if(this.table[tableTile].getIsSpinner() == 1){
		
		if(dominoTableLeftConnectedFrame == "" && dominoTableRightConnectedFrame == "" ){
			//console.log("Counted solo spinner value");
			totalScore+=(parseInt(dominoTableValLeft)+parseInt(dominoTableValRight));
			
		}
			
	}
	
	
	//check if table matching domino IS NOT a SPINNER /////////////////////////////////////////////////////////	
	else{	
	//check if table domino is DOUBLE
	if(this.table[tableTile].isDouble()==true){

		if(dominoTableLeftConnectedFrame == "" && dominoTableRightConnectedFrame == "" ){
			//console.log("Counted solo spinner value");
			totalScore+=(parseInt(dominoTableValLeft)+parseInt(dominoTableValRight));
			
		}
	}
	
	//check if table domino IS NOT DOUBLE NOR SPINNER
	else{
			if(dominoTableLeftConnectedFrame == "" && dominoTableRightConnectedFrame == "" ){
				if((dominoTableValLeft == dominoDraggingValRight)|| (dominoTableValLeft == dominoDraggingValLeft)){
					totalScore+= (parseInt(dominoTableValRight)) ;
					
				}
				else
					
				if((dominoTableValRight == dominoDraggingValRight)|| (dominoTableValRight == dominoDraggingValLeft)){	
					totalScore+= (parseInt(dominoTableValLeft)) ;
				}
				
			}
		}
	}
	
	
	
	
	
	for(var c=0;c<this.table.length;c++){
		if(c!=tableTile){
			if(this.table[c].getIsSpinner()== 1){ 
				if(this.table[c].getTileValueLeft().split("_")[1]==""){ 
					totalScore+=parseInt(this.table[c].getTileValueLeft().split("_")[0]) *2; 
				
				}
				if(this.table[c].getTileValueRight().split("_")[1]==""){  
					totalScore+=parseInt(this.table[c].getTileValueRight().split("_")[0] *2);
					

				}
			}else{ 
				if(this.table[c].isDouble()==true){
					if(this.table[c].getTileValueLeft().split("_")[1] == "" || this.table[c].getTileValueRight().split("_")[1] == ""){
						totalScore+=(parseInt(this.table[c].getTileValueLeft().split("_")[0])+ parseInt( this.table[c].getTileValueRight().split("_")[0]));
					
					}
				}else{
					if(this.table[c].getTileValueLeft().split("_")[1]==""){
						totalScore+=parseInt(this.table[c].getTileValueLeft().split("_")[0]);
				
					}
					if(this.table[c].getTileValueRight().split("_")[1]==""){
						totalScore+=parseInt(this.table[c].getTileValueRight().split("_")[0]);

					}
				}
			}
		}
	}
	
	return totalScore;

};
Board.prototype.choosePlayer=function(){
	var currentHigh=0;
	var currentPlayer=1;
	var arrayname="";
	for(var i=0;i<5 && currentHigh<6;i++){
		arrayname="player"+i;
		for(var j=0;j<this.getLength(i);j++){
			if(this["player"+i][j].getTileValueLeft()==this["player"+i][j].getTileValueRight()){
				if(this["player"+i][j].getTileValueLeft().split("_")[0]>currentHigh){
					currentHigh=this["player"+i][j].getTileValueLeft().split("_")[0];
					currentPlayer=i;
				}
			}
		}
	}
	return currentPlayer;
};

Board.prototype.getWinner=function(){
	var currentPlayer=1;
	var lastTotal=0;
	var currrentTotal=0;
	var localCount=0;
	var hasFound=0;
	var toRet=0;
	for(var i=0;i<5 &&localCount<3;i++){
		localCount=0;
		for(var j=0;j<5 && localCount<3;j++){
			if(j!=i){
				if(this.getSum(i)<this.getSum(j)){
					localCount++;		
				}else if(this.getSum(i)==this.getSum(j)){
					if(i==this.compareHand(i,j)){
						localCount++;
					}
				}
			}
		}
		if(localCount==3){
			toRet=i;
		}
	}
	return toRet;
};
Board.prototype.getSum=function(numPlayer){
	var totalPoint=0;
	for(var i=0;i<this.getLength(numPlayer);i++){
			totalPoint+=this["player"+numPlayer][i].getTileSum();
		}
};
Board.prototype.compareHand=function(lastPlayer,currentPlayer){	
	var array1 =this["player"+lastPlayer];
	var array2=this["player"+currentPlayer];
	var domino1Index=-1;
	var domino2Index=-1;
	var toRet;
	var sum1,sum2;
	var localCount;
	var hasFoundDomino1=0;
	var hasFoundDomino2=0;
	var hasFound=0;
	for(var i=0; i<array1.length&& domino1Index==-1;i++){
		localCount=0;
		for(var j=0;j<array1.length&&  domino1Index==-1;j++){
			if(j!=i){
				if(array1[i].getTileSum()<=array1[j].getTileSum()){
					localCount++
				}
			}
		}
		if(localCount==array1.length-2){
			domino1Index=i;
		}
	}
	for(var i=0; i<array2.length&& domino2Index==-1;i++){
		localCount=0;
		for(var j=0;j<array2.length&&  domino2Index==-1;j++){
			if(j!=i){
				if(array2[i].getTileSum()<=array2[j].getTileSum()){
					localCount++
				}
			}
		}
		if(localCount==array2.length-2){
			domino2Index=i;
		}
	}
	if(array1[domino1Index].getTileSum()<array2[domino2Index].getTileSum()){
		toRet=lastPlayer;
	}else if(array1[domino1Index].getTileSum()==array2[domino2Index].getTileSum()){
		if(array1[domino1Index].getTileValueLeft().split("_")[0]<array2[domino2Index].getTileValueLeft().split("_")[0] ||array1[domino1Index].getTileValueRight().split("_")[0]<array2[domino2Index].getTileValueRight().split("_")[0]  ){
			toRet=lastPlayer;
		}else{
			toRet=currentPlayer;
		}
	}else{
		toRet=currentPlayer;
	}
	return toRet;
};
Board.prototype.getIsDouble=function(typeOfStack,frameNum){
	var toRet;
	var hasFound=0;
	if(typeof typeOfStack === "number"){
		for(var i=0; i<this.getLength(typeOfStack)&&hasFound==0;i++){
			if(this["player"+typeOfStack][i].getTileFrame()==frameNum){
				hasFound++;
				if(this["player"+typeOfStack][i].isDouble()==true){
					toRet=true;
				}
			}
		}
	}else if(typeof typeOfStack==="string"){
		if(typeOfStack== "table"){
			for(var i=0;i<this.table.length&& hasFound==0;i++){
				if(this.table[i].getTileFrame()==frameNum){
					hasFound++;
					if(this.table[i].isDouble()==true){
						toRet=true;
					}
				}
			}

		}else{
			for(var i=0;i<this.boneyard.length&& hasFound==0;i++){
				if(this.boneyard[i].getTileFrame()==frameNum){
					hasFound++;
					if(this.boneyard[i].isDouble()==true){
						toRet=true;
					}
				}
			}
		}
	}
	if(hasFound==0){
		toRet=false;
	}
	return toRet;
};
Board.prototype.getNewAngle=function(){

};
Board.prototype.getLeftOrRight=function(frameNum){
	var toRet;
	var hasFound=0;
	for(var i=0; i<this.table.length && hasFound==0;i++){
		if(this.table[i].getTileFrame()==frameNum){
			hasFound++;
			if(this.table[i].getTileValueLeft().split("_")[1]!="" ){
				toRet="left";
			
			}else{
				toRet="right";
				

			}
		}

	}
	return toRet;
};
Board.prototype.isThatTileASpiner=function(frameNum){
	var toRet
	var hasFound=0;
	for(var i=0;i<this.table.length&& hasFound==0;i++){
		if(this.table[i].getTileFrame()==frameNum){
			hasFound++;
			if(this.table[i].getIsSpinner()==1){
				toRet=true;

			}else{
				toRet=false;
			}
		}
	}
	return toRet;
	//return this.table[this.foundIndex("table",frameNum)].getIsSpinner();
};

Board.prototype.getLeftOrRightOnDrop =function(typeOfStack,frameNum,frameNumFromTable){
	var tableTileIndex=-1;
	var tileIndex=-1;
	var hasFound=0;
	var toRet;
	var test;
	for(var i=0; i<this.table.length&& hasFound<2;i++){
		if(this.table[i].getTileFrame()==frameNum){
			tileIndex=i;
			hasFound++;
		}else if(this.table[i].getTileFrame()==frameNumFromTable){
			tableTileIndex=i;
			hasFound++;
		}
	}
	hasFound=0;
	test=this.table[tableTileIndex].getTileValueLeft().split("_");
	//window.console.log("length:"+test.length);
	//window.console.log("length:"+this.table[tableTileIndex].getTileValueLeft().split("_").length);
	if (this.table[tableTileIndex].getIsSpinner()==1){
		for(var a=1;a<this.table[tableTileIndex].getTileValueLeft().split("_").length&&hasFound==0;a++){
			if(this.table[tableTileIndex].getTileValueLeft().split("_")[a]==this.table[tileIndex].getTileFrame()){
				
				if(a==1){
				
					toRet="left";
				}else{
					toRet="top";
				}
				hasFound++;
			}
		}
		for(var a=1;a<this.table[tableTileIndex].getTileValueRight().split("_").length&&hasFound==0;a++){
			if(this.table[tableTileIndex].getTileValueRight().split("_")[a]==this.table[tileIndex].getTileFrame()){
				if(a==1){
					toRet="right";
				}else{
					toRet="bottom";
				}
				hasFound++;
			}
		}
	}else{
		if(this.table[tableTileIndex].getTileValueLeft().split("_")[1]==this.table[tileIndex].getTileFrame() && (this.table[tableTileIndex].getTileValueLeft().split("_")[0]==this.table[tileIndex].getTileValueLeft().split("_")[0]||this.table[tableTileIndex].getTileValueLeft().split("_")[0]==this.table[tileIndex].getTileValueRight().split("_")[0])){
			toRet="left";
		}else{
			toRet="right";
		}
	}
	return toRet;
};
Board.prototype.foundIndex=function(typeOfStack,frameNum){
	var toRet;
	var hasFound=0;
	if(typeof typeOfStack=="number"){
		for(var i=0;i<this.getLength(typeOfStack)&&hasFound==0;i++){
			if(this["player"+typeOfStack][i].getTileFrame()==frameNum){
				hasFound++
				toRet=i;

			}
		}
	}else{
		if(typeOfStack=="table"){
			for(var i=0;i<this.table.length&&hasFound==0;i++){
				if(this.table[i].getTileFrame()==frameNum){
					hasFound++
					toRet=i;
				}
			}
		}else{
			for(var i=0;i<this.boneyard.length&&hasFound==0;i++){
				if(this.boneyard[i].getTileFrame()==frameNum){
					hasFound++
					toRet=i;
				}
			}
		}

	}
	return toRet
};
Board.prototype.getIsAllowTopOrBottom=function(){
	var hasFound=0;
	var toRet;
	for(var i=0;i<this.table.length && hasFound==0;i++){
		if(this.table[i].getIsSpinner()==1){
			hasFound++;
			if(this.table[i].getTileValueLeft().split("_")[1]!=""&&this.table[i].getTileValueRight().split("_")[1]!=""){
				toRet=true;
			}else{
				toRet=false;
			}
		}
	}
	return toRet;
};
Board.prototype.getCanConnectSide=function(playerNum,frameNum,tableFrame){
	var foundTile=-1;
	var tableTile=-1;
	var toRet="";

	for(var a=0;a<this.getLength(playerNum)&& foundTile==-1;a++){
		if(this["player"+playerNum][a].getTileFrame()==frameNum){
			foundTile=a;
		}
	}
	for (var b=0;b<this.table.length && tableTile==-1;b++){
		if(this.table[b].getTileFrame()==tableFrame){
			tableTile=b;
		}
	}
	if(this.table[tableTile].getIsSpinner()==1){
		if(this.table[tableTile].getTileValueLeft().split("_")[1]=="" && this.table[tableTile].getTileValueRight().split("_")[1]==""){
			toRet="left,right,top,bottom";
		}else if(this.table[tableTile].getTileValueLeft().split("_").length<3 && this.table[tableTile].getTileValueRight().split("_").length<3){
			if(this.table[tableTile].getTileValueLeft().split("_")[1]=="" && this.table[tableTile].getTileValueRight().split("_")[1]!=""){
				toRet="left,none,top,bottom";
			}else if(this.table[tableTile].getTileValueLeft().split("_")[1]!="" && this.table[tableTile].getTileValueRight().split("_")[1]==""){
				toRet="none,right,top,bottom";
			}else{
				toRet="none,none,top,bottom";
			}
		}else if(this.table[tableTile].getTileValueLeft().split("_").length<3 && this.table[tableTile].getTileValueRight().split("_").length>=3){
			toRet="none,none,top,none";
		}else{
			toRet="none,none,none,bottom";
		}
	}else{
		if(this.table[tableTile].isDouble()==true){
			if(this.table[tableTile].getTileValueLeft().split("_")[1]=="" && this.table[tableTile].getTileValueRight().split("_")[1]=="" ){
				toRet="left,right";
			}else if(this.table[tableTile].getTileValueLeft().split("_")[1]=="" && this.table[tableTile].getTileValueRight().split("_")[1]!="" ){
				toRet="left,none";
			}else{
				toRet="none,right";
			}
		}else{
			if(this.table[tableTile].getTileValueLeft().split("_")[1]=="" &&(this.table[tableTile].getTileValueLeft().split("_")[0]==this["player"+playerNum][foundTile].getTileValueLeft().split("_")[0] ||this.table[tableTile].getTileValueLeft().split("_")[0]==this["player"+playerNum][foundTile].getTileValueRight().split("_")[0])){
				toRet="left";
			}else{
				toRet="right";
			}
		}
	}
	return toRet;
};
Board.prototype.getWinnerByLowestDomino=function(numOfPlayer){
	var currentPlayer=1;
	var lowestValueLeft=7;
	var lowestValueRight=7;
	if(numOfPlayer==2){
		for(var a=1;a<3;a++){
			for(var b=0;b<this.getLength(b);b++){
				if(parseInt(this["player"+a][b].getTileValueLeft().split("_")[0])<=lowestValueLeft && parseInt(this["player"+a][b].getTileValueRight().split("_")[0])<=lowestValueRight){
					lowestValueLeft=parseInt(this["player"+a][b].getTileValueLeft().split("_")[0]);
					lowestValueRight=parseInt(this["player"+a][b].getTileValueRight().split("_")[0]);
					currentPlayer=a;
				}
			}
		}
	}else if(numOfPlayer==4){
		for(var a=1;a<5;a++){
			for(var b=0;b<this.getLength(a);b++){
				if(parseInt(this["player"+a][b].getTileValueLeft().split("_")[0])<=lowestValueLeft && parseInt(this["player"+a][b].getTileValueRight().split("_")[0])<=lowestValueRight){
					lowestValueLeft=parseInt(this["player"+a][b].getTileValueLeft().split("_")[0]);
					lowestValueRight=parseInt(this["player"+a][b].getTileValueRight().split("_")[0]);
					currentPlayer=a;
				}
			}
		}
		if(currentPlayer%2==0){
			currentPlayer=1;
		}else if(currentPlayer%2!=0){
			currentPlayer=2;
		}
	}
	return currentPlayer;
};
Board.prototype.chooseWinner=function(numOfPlayer){
	var sumOfSelfTeam=0;
	var sumOfOpponent=0;
	var toRet;
	if(numOfPlayer==2){
		for(var a=1;a<3;a++){
			for(var b=0;b<this.getLength(a);b++){
				if(a==1){
					sumOfOpponent+=this["player"+a][b].getTileSum();
				}else{
					sumOfSelfTeam+=this["player"+a][b].getTileSum();
				}
			}			
		}
		if(sumOfOpponent>sumOfSelfTeam){
			toRet=2;
		}else if(sumOfOpponent<sumOfSelfTeam){
			toRet=1;
		}else{
			toRet=this.getWinnerByLowestDomino(numOfPlayer)
		}
	}else{
		for(var a=1;a<5;a++){
			for(var b=0;b<this.getLength(a);b++){
				if(a%2==0){
					sumOfOpponent+=this["player"+a][b].getTileSum();
				}else{
					sumOfSelfTeam+=this["player"+a][b].getTileSum();
				}
			}			
		}
		if(sumOfOpponent>sumOfSelfTeam){
			toRet=1;
		}else if(sumOfOpponent<sumOfSelfTeam){
			toRet=2;
		}else{
			toRet=this.getWinnerByLowestDomino(numOfPlayer)
		}
	}
	return toRet;
};
Board.prototype.getLength=function(numPlayer){
	switch(numPlayer){
		case 1:
			return this.player1.length;
			break;
		case 2:
			return this.player2.length;
			break;
		case 3:
			return this.player3.length;
			break;
		case 4:
			return this.player4.length;
			break;
	}

};
Board.prototype.getPlayableTileFromPlayer=function(numPlayer){
			return this.getPlayableTile(numPlayer);
		
};
Board.prototype.addTileToPlayer=function(numPlayer,frameNum){
	switch(numPlayer){
		case 1:
			return this.addTile(this.player1,frameNum);
			break;
		case 2:
			return this.addTile(this.player2,frameNum);
			break;
		case 3:
			return this.addTile(this.player3,frameNum);
			break;
		case 4:
			return this.addTile(this.player4,frameNum);
			break;
	}
};
Board.prototype.removeTileFromPlayer=function(numPlayer,frameNum,tileFrameFromTable,side,gameMode){
	return this.removeTileAndPlace(numPlayer,frameNum,tileFrameFromTable,side,gameMode);		
};
Board.prototype.addTileToTable=function(numPlayer,frameNum,gameMode){
	
			return this.addingTileToTable(numPlayer,frameNum,gameMode);
			
};
Board.prototype.getSpecificPlayerSet=function(numPlayer){
	
	return this.getDominoesList(numPlayer);

};
Board.prototype.getTotalDominoesInPlayerHand=function(numPlayer){
	return this.getLength(numPlayer);

};


//////////////////////$$$$$$$$$$$$$$$$

var Game = function(){
	this.board;
};
Game.prototype.getTableConnectSide=function(typeOfStack,frameNum,frameNumFromTable){
	var toRet=this.board.getLeftOrRightOnDrop(typeOfStack,frameNum,frameNumFromTable);
	return toRet;
};
Game.prototype.isItASpinner=function(frameNum){
	var toRet=this.board.isThatTileASpiner(frameNum);
	return toRet;
};
Game.prototype.getConnectSide=function(frameNum){
	var toRet=this.board.getLeftOrRight(frameNum);
	return toRet;
};
Game.prototype.isAllowToConnectTopAndBottom=function(){
	var toRet=this.board.getIsAllowTopOrBottom();
	return toRet;
};
Game.prototype.setLastScore=function(score,playerNum){
	this.board.setScore(score,playerNum);
	return this;
};
/*Game.prototype.getAngleToset=function(frameNum,tileFrameFromTable){
	var toRet=this.getNewAngle(frameNum,tileFrameFromTable);
	return toRet;
};*/
Game.prototype.getHighestDomino=function(){
	var toRet=this.board.choosePlayer();
	return toRet
};
Game.prototype.getPlayerSet=function(numPlayer){
	var toRet=this.board.getSpecificPlayerSet(numPlayer);
	return JSON.stringify(toRet);
};
Game.prototype.getBoneYardSet=function(){
	var toRet=this.board.getBoneYardDominoes();
	return JSON.stringify(toRet);
};
Game.prototype.onTie=function(){
	var toRet=this.board.getWinner();
	return toRet;
};
Game.prototype.verifiedTileDouble=function(typeOfStack,frameNum){
	var toRet=this.board.getIsDouble(typeOfStack,frameNum);
	return toRet;
};
Game.prototype.getTableSet=function(){
	var toRet=this.board.getTableDominoes();
	return JSON.stringify(toRet);
};
Game.prototype.verifyIfPlayerHandPlayable=function(numPlayer){
	var toRet=this.board.verifiedPlayableTiles(numPlayer);
	return toRet;
};
Game.prototype.doesAIHasPlayableHand=function(){
	var toRet=this.board.verifiedPlayableTiles(1);
 	return toRet;
};
Game.prototype.AItakeFromBoneYard=function(playerNum){
	var toRet=this.board.AITakeTileFromBoneYard(playerNum);
	return JSON.stringify(toRet);
};
Game.prototype.getNumOfDominoesOnTable=function(){
	return this.board.table.length;
};
Game.prototype.getNumOfDominoesInBoneyard=function(){
	return this.board.boneyard.length;
};
Game.prototype.AIPlayedTile=function(gameMode,playerNum){
	var toRet=this.board.playATile(gameMode,playerNum);
	return JSON.stringify(toRet);
};

Game.prototype.addScoring=function(numPlayer){
	//window.console.log("working");
	var toRet=this.board.allFiveScoring(numPlayer);
	return toRet;

};
Game.prototype.getScoreOnDrag=function(playerNum,frameNum,tableFrame){
  //tableframe is the tile which is already in the table which is selected either by nearest holding domino 
  var toRet=this.board.showScoreToGet(playerNum,frameNum,tableFrame);
  return toRet;
};
Game.prototype.winnerScore=function(gameMode,numPlayer,noOfPlayer){
	var toRet=this.board.scoring(gameMode,numPlayer,noOfPlayer);
	return toRet;
};
Game.prototype.getWinningScoreForCurrentMatch=function(gameMode,numPlayer,noOfPlayer){
	var toRet=this.board.currentscoring(gameMode,numPlayer,noOfPlayer);
	return toRet;
};
Game.prototype.getCurrentScore=function(){
	var toRet=this.board.onDropGetScore();
	return toRet;
};
Game.prototype.getPlayableTileFromHand=function(numPlayer){
	var toRet=this.board.getPlayableTileFromPlayer(numPlayer);
	return JSON.stringify(toRet);
};
Game.prototype.getAllPlayableTileOnTable=function(numPlayer,frameNum){
	var toRet=this.board.getListOfUnblockTile(numPlayer,frameNum);
	return JSON.stringify(toRet);
};
Game.prototype.resetBoard = function(){
	this.board = new Board();
	return this;
};
Game.prototype.takeTileFromBoneYard=function(numPlayer,frameNum){
	this.board.addTileToPlayer(numPlayer,frameNum);
	return this;
};
Game.prototype.firstPlayedTile=function(numPlayer,frameNum,gameMode){
	this.board.addTileToTable(numPlayer,frameNum,gameMode);
	return this;
};
Game.prototype.playedTile=function(numPlayer,frameNum,tileFrameFromTable,side,gameMode){
	this.board.removeTileFromPlayer(numPlayer,frameNum,tileFrameFromTable,side,gameMode);
	return this;
};
Game.prototype.getNumOfDominoesInHand=function(numPlayer){
	var toRet=this.board.getTotalDominoesInPlayerHand(numPlayer);
	return toRet;
};
Game.prototype.canConnectSide=function(numPlayer,frameNum,tableFrame){
	var toRet=this.board.getCanConnectSide(numPlayer,frameNum,tableFrame)
	return toRet;
};
Game.prototype.getWinnerPlayer=function(numOfPlayer){
	var toRet= this.board.chooseWinner(numOfPlayer);
	return toRet;
};
Game.prototype.newGame=function(numPlayer,gameMode){
	this.resetBoard();
	var totalTile=[];
	var count=0;
	for(var i=0;i<7;i++){
		for(var j=0+i;j<7;j++){
			totalTile.push(new Tile());
			totalTile[count].setTileFrame(count);
			totalTile[count].setTileValueLeft(j+"_");
			totalTile[count].setTileValueRight(i+"_");
			count++;
		}
	}
	totalTile=shuffle(totalTile);

	if(numPlayer==2){
		if(gameMode=="draw" || gameMode=="allFive"){
			for(var i=0;i<totalTile.length;i++){
				if(i<7){
					this.board.player1.push(totalTile[i]);
				}
				else if(i>=7&& i<14){
					this.board.player2.push(totalTile[i]);
				}
				else{
					this.board.boneyard.push(totalTile[i]);
				}
			}
		}else{
			for(var i=0;i<totalTile.length;i++){
				if(i<7){
					this.board.player1.push(totalTile[i]);
				}else if(i>=7&& i<14){
					this.board.player2.push(totalTile[i]);
				}
				
			}
		}
	}
	if(numPlayer==3){
		if(gameMode=="draw" || gameMode=="allFive"){
			for(var i=0;i<totalTile.length;i++){
				if(i<5){
					this.board.player1.push(totalTile[i]);
				}else if(i>=5&& i<10){
					this.board.player2.push(totalTile[i]);
				}else if(i>=10&& i<15){
					this.board.player3.push(totalTile[i]);
				}else{
					this.board.boneyard.push(totalTile[i]);
				}
			}
		}else{
			for(var i=0;i<totalTile.length;i++){
				if(i<5){
					this.board.player1.push(totalTile[i]);
				}else if(i>=5&& i<10){
					this.board.player2.push(totalTile[i]);
				}else if(i>=10&& i<15){
					this.board.player3.push(totalTile[i]);
				}
			}
		}
	}
	if(numPlayer==4){
		if(gameMode=="draw" || gameMode=="allFive"){
			for(var i=0;i<totalTile.length;i++){
				if(i<5){
					this.board.player1.push(totalTile[i]);
				}else if(i>=5&& i<10){
					this.board.player2.push(totalTile[i]);
				}else if(i>=10&& i<15){
					this.board.player3.push(totalTile[i]);
				}else if(i>=15&& i<20){
					this.board.player4.push(totalTile[i]);
				}else{
					this.board.boneyard.push(totalTile[i]);
				}
			}
		}else{
			for(var i=0;i<totalTile.length;i++){
				if(i<5){
					this.board.player1.push(totalTile[i]);
				}else if(i>=5&& i<10){
					this.board.player2.push(totalTile[i]);
				}else if(i>=10&& i<15){
					this.board.player3.push(totalTile[i]);
				}else if(i>=15&& i<20){
					this.board.player4.push(totalTile[i]);
				}
			}
		}
	}
	return this;
};



///////////$
window.dominoVersion = new dominoVersion();
window.Tile = Tile;
window.Board = Board;
 window.Game = Game;
})();
//getNumOfDominoesInBoneyard
//getNumOfDominoesOnTable