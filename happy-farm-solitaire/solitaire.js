;(function(){

var solitaireVersion = function(){
	this.versionScript="Script Version:4.1";
};

solitaireVersion.prototype.getSolitaireVersion=function(){
	return this.versionScript;
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

var Card = function(){};
Card.prototype.suits={HEART:0,SPADES:1,DIAMONDS:2,CLUBS:3};
Card.prototype.colors={RED:0, BLACK:1};

Card.prototype.init = function(config){
	this.suit = 0;
	this.weight = 0;
	this.isFaceUp = 0;
	if(typeof config === "string"){
		var newConfig = {}; //"0_0_-"
		var underscoreSep = config.split("_");

		if(underscoreSep.length == 1){
			newConfig.weight = parseInt(underscoreSep[0]);
			newConfig.suit = 1;
			newConfig.isFaceUp=0;
			}//newConfig.weight = parseInt(underscoreSep[0]);
		if(underscoreSep.length == 2){
			newConfig.weight = parseInt(underscoreSep[0]);
			if(underscoreSep[1]=="-"){
				newConfig.suit = 1;
				newConfig.isFaceUp=1;
			}else{
				newConfig.suit = parseInt(underscoreSep[1]);
				newConfig.isFaceUp=0;
			}

		}
		if(underscoreSep.length == 3){
			newConfig.weight = parseInt(underscoreSep[0]);
			newConfig.suit = parseInt(underscoreSep[1]);
			newConfig.isFaceUp=1;
		}
		
		//newConfig.suit = (underscoreSep.length > 1) ? underscoreSep[1].split("-")[0]: 1;
		//newConfig.isFaceUp = (underscoreSep.length > 1 && underscoreSep[1].split("-").length > 1) ? 1:0;
		config = newConfig;
	}
	if(typeof config === "object"){
		if(typeof config["suit"] !== "undefined") this.setSuit(config["suit"]);
		if(typeof config["weight"] !== "undefined") this.setWeight(config["weight"]);
		if(typeof config["isFaceUp"] !== "undefined") this.setFaceUp(config["isFaceUp"]);
		if(typeof config["notACard"] !== "undefined"){
			console.warn("using fake card");
			this.notACard = true;
			this.suit = -2;
			this.weight = -2;
			this.index = -2;
			this.isFaceUp = 0;
		} 
	}
	return this;
};
Card.prototype.createCardBySpecificValue=function(valueOfCard,colour){
	this.suit = colour;
	this.weight = valueOfCard;
	this.isFaceUp = 0;
	this.index=0;
	return this;
};

Card.prototype.getSuit = function(){ //0 => HEART, 1 => SPADES, 2 => DIAMONDS, 3 => CLUBS
	return this.suit;
};
Card.prototype.setSuit = function(suit){
	if(typeof suit === "number") this.suit = Math.min(Math.max(0, parseInt(suit)), 3);
	return this;
};
Card.prototype.getColor = function(){ //0 => red 1=> black
	return (this.getSuit()%2 === 0) ? 0 : 1;
};

Card.prototype.getWeight = function(){ //0 => AS, 1 => 2,... 9 => Jack, 10 => Queen, 11 => King
	return this.weight;
};
Card.prototype.setWeight = function(weight){
	if(typeof weight === "number" && typeof this.notACard === "undefined") this.weight = Math.min(Math.max(0, parseInt(weight)), 12);
	return this;
};
Card.prototype.isRevealed = function(){
	return this.isFaceUp;
};
Card.prototype.reveal = function(){
	this.isFaceUp = 1;
	return this;
};
Card.prototype.hide = function(){
	this.isFaceUp = 0;
	return this;
};
Card.prototype.setFaceUp = function(bool){
	if(typeof bool !== "number") bool = 1;
	if(bool) this.reveal();
	else this.hide();
	return this;
};
Card.prototype.placeAt = function(index){	//to store inside the card the index of the card in-deck
	if(typeof index !== "number") index = -1;
	this.indexInDeck = index;
	return this;
};
Card.prototype.getIndex = function(){
	return this.indexInDeck;
};
Card.prototype.setDeck = function(deck){	//to keep reference of the deck holding the card
	this.deck = deck;
	return this;
};
Card.prototype.getDeck = function(){
	if(typeof this.deck === "undefined"){ window.bugedCard = this; console.log(this, "has no deck");}
	return this.deck;
};
Card.prototype.getNextCard = function(){
	return this.getDeck().getCard(this.getIndex()+1);
};
Card.prototype.getPreviousCard = function(){
	return this.getDeck().getCard(this.getIndex()-1);
	
};
Card.prototype.isSameSuit = function(otherCard){
	return !(typeof otherCard !== "object" || typeof otherCard.notACard !== "undefined" || typeof otherCard.getSuit !== "function" || otherCard.getSuit() !== this.getSuit());
};
Card.prototype.isDifferentSuit=function(otherCard){
	return !(typeof otherCard !== "object" || typeof otherCard.notACard !== "undefined" || typeof otherCard.getSuit !== "function" ||  (otherCard.getSuit()<=1?(otherCard.getSuit()+2):(otherCard.getSuit()-2)) == this.getSuit() || otherCard.getSuit()==this.getSuit());
}; 
Card.prototype.isOneOver = function(otherCard){
	return !(typeof otherCard !== "object" || typeof otherCard.getWeight !== "function" || otherCard.getWeight() !== this.getWeight()+1);
};
Card.prototype.isOneBellow = function(otherCard){
	return !(typeof otherCard !== "object" || typeof otherCard.getWeight !== "function" || otherCard.getWeight() !== this.getWeight()-1);
};
Card.prototype.getSimplified = function(){
	var thisCard = {};
	thisCard.weight = 	this.getWeight();
	thisCard.suit =		this.getSuit();
	thisCard.isFaceUp = this.isRevealed();
	thisCard.index = 	this.getIndex();
	return thisCard;
};

Card.prototype.getSimplifiedCompressed = function(){
	var thisCard = "";
	thisCard += this.getWeight();
	if(this.getSuit() !== 1) thisCard += "_" + this.getSuit();
	if(this.isRevealed() == 1) thisCard += "_"+"-";
	return thisCard;
};


/*Card.prototype.canMove=function(){
	var lastCardOfDeck = this.getDeck().getCardOnTop();
	var listOfLinkablesCardsBellowMe = this.getDeck().getLinkableCardFromIndex(this.getIndex());
	for(var aCard in listOfLinkablesCardsBellowMe){
		if(!listOfLinkablesCardsBellowMe.hasOwnProperty(aCard)) continue;
		if(listOfLinkablesCardsBellowMe[aCard].getIndex() === lastCardOfDeck.getIndex()) return true;
	}
	return false;
}*/
Card.prototype.canMove=function(){
	if(this.isRevealed()==1){
		return true;
	}
	return false;
};


var Deck = function(){
	this.cards = [];
};
Deck.prototype.add = function(cardToAdd){
	if(typeof cardToAdd === "string"){
		var counting=cardToAdd.split(",");
		for(var i=0;i<counting.length;i++){
			var cardAsString = counting[i];
			var myNewCard = (new Card()).init(cardAsString);
			this.add(myNewCard);
		}
		return this;
	}
	if(typeof cardToAdd === "object"){
		if(typeof cardToAdd.push === "function"){
			for(var aCard in cardToAdd) if(cardToAdd.hasOwnProperty(aCard)) this.add(cardToAdd[aCard]);
			return this;
		}else if(typeof cardToAdd.suit !== "undefined"){
			cardToAdd.setDeck(this);//.placeAt(this.cards.length);
			this.cards.push(cardToAdd);
			return this.rebuildOrder();
		}else{
			//console.warn("wanna add something that s not a card!");
		}
	}else throw "This is not a card, nor an array of cards";
	return this;
};

Deck.prototype.deal = function(){
	return (this.cards.length>0) ? this.cards.splice(-1,1)[0] : false;
};
Deck.prototype.getNbCardsInDeck = function(){
	return this.cards.length;
};
Deck.prototype.rebuildOrder = function(){
	for(var aCard in this.cards) if(this.cards.hasOwnProperty(aCard)) this.cards[aCard].placeAt(parseInt(aCard));
	return this;
};
Deck.prototype.shuffle = function(){
	shuffle(this.cards);
	return this.rebuildOrder();
};
Deck.prototype.getCard = function(index){
	if(typeof index !== "number") index = 0;
	if(index < this.getNbCardsInDeck()) return this.cards[index];
	return new Card({notACard:true});
};
Deck.prototype.getAllCards = function(){
	return this.cards;
};
Deck.prototype.getCardOnTop = function(){
	return this.getCard(this.getNbCardsInDeck()-1);
};
Deck.prototype.getCardAtBottom = function(){
	return (this.getNbCardsInDeck() > 0) ? this.getCard(0) : false;
};
Deck.prototype.takeCard = function(index, nbTaken){
	if(typeof nbTaken !== "number") nbTaken = 1;
	if(typeof index !== "number") index = 0;
	if(index + nbTaken <= this.getNbCardsInDeck()) return this.cards.splice(index, nbTaken);
	return [new Card({notACard:true})];
};
Deck.prototype.takeCardOnTop = function(){
	return this.takeCard(Math.max(0, this.getNbCardsInDeck()-1), 1);
};
Deck.prototype.takeCardAtBottom = function(){
	return this.takeCard(0);
};

Deck.prototype.getNumOfUnrevealCard= function(){
	var counting=0;
	if(this.getNbCardsInDeck()>1){
		var card=this.getCardOnTop(),previousCard=card.getPreviousCard();
		for(var a=0;a<this.getNbCardsInDeck();a++){
			if(card.isRevealed()==0){  
				counting++;
			}
			card=previousCard;
			if(card.getIndex()!=0){
				previousCard=card.getPreviousCard();
			}
			
		}
		return counting;
		
	}
		return counting;
};
Deck.prototype.getNumOfGreyCard=function(){
	var counting=0;
	if(this.getNbCardsInDeck()>1){
		var card=this.getCardOnTop(),previousCard=card.getPreviousCard();
		for(var a=0;a<this.getNbCardsInDeck();a++){
			if(card.isRevealed()==1&&card.canMove()==false){   
				counting++;
			}
			card=previousCard;
			if(card.getIndex()!=0){
				previousCard=card.getPreviousCard();
			}
			
		}
		return counting;
		
	}
		return counting;
	
};
Deck.prototype.getNumOfWhiteCard=function(){
	var counting=0;
	if(this.getNbCardsInDeck()>1){
		var card=this.getCardOnTop(),previousCard=card.getPreviousCard();
		for(var a=0;a<this.getNbCardsInDeck();a++){
			if(card.isRevealed()==1&&card.canMove()==true){   
				counting++;
			}
			card=previousCard;
			if(card.getIndex()!=0){
				previousCard=card.getPreviousCard();
			}
			
		}
		return counting;
		
	}
		return counting;
};
Deck.prototype.addSuits = function(suitsToFillWith){
	if(typeof suitsToFillWith !== "number" && typeof suitsToFillWith !== "object") suitsToFillWith = [0,1,2,3];
	for(var aSuit in suitsToFillWith){
		if(! suitsToFillWith.hasOwnProperty(aSuit)) continue;
		for(var aWeight=0; aWeight<13; aWeight++) this.add((new Card()).init({weight:aWeight, suit:suitsToFillWith[aSuit]}));
	}
	return this;
};

Deck.prototype.getLinkableCardFromIndex = function(index){
	//var counting=0;
	var card = this.getCard(index), nextCard = card.getNextCard(), linkableCardArr = [card];
	//var gettingSuit=linkableCardArr[counting].getSuit();
	//var gettingWeight=linkableCardArr[counting].getWeight();
	//c2_callFunction("pickCard",[gettingSuit,gettingWeight]);
	while(card.isDifferentSuit(nextCard) && card.isOneBellow(nextCard)&& card.isRevealed()==1){
	   // counting=counting+1; 
		linkableCardArr.push(nextCard);// si asJSON => nextCard.getSimplified() sinon nextCard
		//gettingSuit=linkableCardArr[counting].getSuit();
	  	//gettingWeight=linkableCardArr[counting].getWeight();
	  	//c2_callFunction("pickCard",[gettingSuit,gettingWeight]); 
		card = nextCard;
		nextCard = card.getNextCard();
		

	}
	return linkableCardArr;
};
Deck.prototype.getLinkableCardFromIndexAsJSON = function(index){
	var counting=0, card = this.getCard(index), nextCard = card.getNextCard(), linkableCardArr = {0:card.getSimplified()};
	while(card.isDifferentSuit(nextCard) && card.isOneBellow(nextCard) && card.isRevealed()==1 ){
		counting++; 
		linkableCardArr[counting] = nextCard.getSimplified();
		card = nextCard;
		nextCard = card.getNextCard();
	}
	linkableCardArr.count = counting+1;
	return JSON.stringify(linkableCardArr);
};
/*Deck.prototype.checkValideCard=function(){
		
		if(this.getNbCardsInDeck()>12){
			var card=this.getCardOnTop(), previousCard=card.getPreviousCard();
 		for(var i=0;i<12;i++){
			if (card.isSameSuit(previousCard)==true && card.isOneOver(previousCard)==true && previousCard.isRevealed()==1 ){
				card=previousCard;
				previousCard=card.getPreviousCard();
			}else {
				//console.log("not good suit ");
				return false;
			}
		}
		//console.log("good suit ");
		return true;
	}
	//console.log("not enough card" );
	return false;
};*/
Deck.prototype.checkValidCard=function(cardValue){
 	if(this.getNbCardsInDeck()>0){
 		if(cardValue==this.getCardOnTop().getWeight()+1){
 			return true;
 		}
 		else{
 			return false;
 		}
 	}
 	else{
 		if(cardValue==0){
 			return true;
 		}
 	}
 	return false;
};
////////////////////§
Deck.prototype.asSimpleObject = function(){
	var toRet = {count:0};
	for(var aCard in this.cards){
		if(! this.cards.hasOwnProperty(aCard)) continue;
		toRet[toRet.count] = this.cards[aCard].getSimplified();
		toRet.count++;
	}
	return toRet;
};

Deck.prototype.asJSONString = function(){
	return JSON.stringify(this.asSimpleObject());
};

Deck.prototype.asSimpleArray = function(){
	var toRet = [];
	for(var aCard in this.cards){
		if(! this.cards.hasOwnProperty(aCard)) continue;
		toRet.push(this.cards[aCard].getSimplified());
	}
	return toRet;
};
//Deck.prototype.getSimplifiedDeck


Deck.prototype.asSimpleCompressed = function(){
	var toRet = ""
	for(var aCard in this.cards){
		if(! this.cards.hasOwnProperty(aCard)) continue;
		toRet += ((toRet === "") ? "": ",") + this.cards[aCard].getSimplifiedCompressed();
	}
	return toRet;
};
Deck.prototype.getDeckHeight = function(cardHeight, baseOffsetPx,   redOffset, greyOffset, whiteOffset){
	var toRet=[], nbRed = 0, nbGrey=0, nbWhite=0, firstCardOffset=0;
	if(typeof redOffset !== "number") redOffset = 1;
	if(typeof greyOffset !== "number") greyOffset = 1;
	if(typeof whiteOffset !== "number") whiteOffset = 1;
	for(var aCard = 0; aCard < this.cards.length; aCard++){
		if(this.cards[aCard].isRevealed()){
			if(this.cards[aCard].canMove()){
				if(aCard!=0){
					if (this.cards[aCard-1].isRevealed()==0){
						nbRed++;
					}else nbWhite++;
				}else nbWhite++;
			}else{
				if(aCard!=0){
					if (this.cards[aCard-1].isRevealed()==0){
						nbRed++;
					}else nbGrey++;
				}else nbGrey++;
			}
		}else nbRed++;
		if(nbRed+nbGrey+nbWhite === 1) firstCardOffset = (nbRed*redOffset + nbGrey*greyOffset + nbWhite*whiteOffset);
		toRet.push( (nbRed*redOffset + nbGrey*greyOffset + nbWhite*whiteOffset - firstCardOffset) );
	}
	return [toRet[toRet.length-1] * baseOffsetPx + cardHeight/2, toRet];
};
Deck.prototype.getCardsDisplacement = function(maxHeight, cardHeight, baseOffsetPx,   redOffset, greyOffset, whiteOffset, collapsTreshold, step){
	var currentDisplacement=0, globalOffset = 100, alreadyCollapsed=false, totHeight=999999999, offsetsRule, maxLoop = 200, toRet=[];
	if(typeof collapsTreshold !== "number") collapsTreshold = 80;
	if(typeof redOffset !== "number") redOffset = 1;
	if(typeof greyOffset !== "number") greyOffset = 1;
	if(typeof whiteOffset !== "number") whiteOffset = 1;
	if(typeof step !== "number") step = 1;

	while(maxLoop>0 && (offsetsRule = this.getDeckHeight(cardHeight, baseOffsetPx*(globalOffset/100),   redOffset, greyOffset, whiteOffset)) && offsetsRule[0] > maxHeight){
		maxLoop--;
		if(!alreadyCollapsed && globalOffset<collapsTreshold){
			globalOffset = 100;
			redOffset = 0;
			alreadyCollapsed = true;
		}else{
			globalOffset-= step;
		}
	}
	for(var aCard = 0; aCard < offsetsRule[1].length; aCard++) offsetsRule[1][aCard] = (Math.round((offsetsRule[1][aCard] * baseOffsetPx*(globalOffset/100))*100))/100;
	return JSON.stringify(offsetsRule[1]);
};
Deck.prototype.isCardPlaceable=function(cardIndex,dropSlot){

	var aDeck=window.playtouch.gameMain.board.slots[dropSlot];
	if(aDeck.getNbCardsInDeck()>0){
		var aCard=aDeck.getCardOnTop();
		if(aCard.isOneBellow(this.getCard(cardIndex))==true && this.getCard(cardIndex).isDifferentSuit(aCard)==true ){
			return true;
		}
	}else{
		if(this.getCard(cardIndex).getWeight()==12){
			return true;
		}
	}
	return false;
};
Deck.prototype.isScoreNeedToBeApply=function(cardIndex,dropSlot){

	var aDeck=window.playtouch.gameMain.board.slots[dropSlot];
	if(aDeck.getNbCardsInDeck()>0){
		if(cardIndex==0)return true;
		if(cardIndex!=0 && this.getCard(cardIndex-1).isRevealed()==0){
			return true;
		}
	}
	return false;
};
Deck.prototype.canMoveDeck=function(cardIndex){
	if(this.getCardOnTop().getIndex()==cardIndex){
		return true;
	}
	return false;
};
//////////////////$

var Board = function(){
	this.cardNum = 1;
	this.score=0;
	this.slots = [];
	this.standbyDeck=[];
	this.endingSlots=[];

	this.hintHistory={count:0};

	this.states = {count:0}; /////////////////////
};
Board.prototype.checkArray=function(waitForFunctionArray,functionCall){
	//var oups=testingArray.length;
	//console.log(testingArray);
	for (var i = 0; i < waitForFunctionArray.length; i++) {
		if(waitForFunctionArray[i].callback == functionCall){
			return true;
		}
	}
	return false;
};
Board.prototype.getIDFunction=function(waitForFunctionArray,functionCall){
	for (var i = 0; i < waitForFunctionArray.length; i++) {
		if(waitForFunctionArray[i].callback == functionCall){
			//console.log(testingArray);
			return (waitForFunctionArray[i].id);
		}
	}
	return false;
};

/*Board.prototype.getValidatedCard=function(slotNumber){

var lastPickIndex=this.slots[slotNumber].getCardOnTop().getIndex()-12;
var validateCard=this.slots[slotNumber].takeCard(lastPickIndex,13).reverse();
var toRet = {count:0};
for(var aCard in validateCard){
	toRet[toRet.count] = validateCard[aCard].getSimplified();
	toRet.count++;
}
this.endingSlots.add(validateCard);
return(JSON.stringify(toRet));

};*/
Board.prototype.giveCard=function(){
	var dealCardList={};
	for(var i=0;i<10;i++){
		this.hand.getCardOnTop().reveal();
		dealCardList[i]=this.hand.getCardOnTop().getSimplified();
		this.slots[i].add(this.hand.takeCard(this.hand.getCardOnTop().getIndex()));
	}
	//window.console.log(dealCardList);
	return JSON.stringify(dealCardList);
};
Board.prototype.getYCard=function(slotNum,slotY,spaceRed,spaceWhite,cardHeight){
	var backCardCoefficient=spaceRed;
	var spaceBTCards=spaceWhite;
	var toRet={};
	var currentY=0;
	for( var aCard in this.slots[slotNum].cards){
		if(! this.slots[slotNum].cards.hasOwnProperty(aCard)) continue;
		if( this.slots[slotNum].cards[aCard].getIndex()==0){
			currentY=slotY+(cardHeight/2);
			/*if(this.slots[slotNum].cards[aCard].getIndex()==cardIndex){
				return Math.round(currentY);
			}*/
			toRet[aCard]=currentY;
		}else{
			 if(this.slots[slotNum].cards[aCard].isRevealed()==0){
			 	currentY=(currentY)+(spaceBTCards*backCardCoefficient);
			 	/*if(this.slots[slotNum].cards[aCard].getIndex()==cardIndex){
			 		return  Math.round(currentY);
			 	}*/
			 	toRet[aCard]=currentY;
			 }
			 if(this.slots[slotNum].cards[aCard].canMove()==false && this.slots[slotNum].cards[aCard].isRevealed()==1){
			 	if(this.slots[slotNum].cards[aCard-1].isRevealed()==0){
			 		currentY=(currentY)+(spaceBTCards*backCardCoefficient);
			 	}else{
			 		currentY=(currentY)+(spaceBTCards);
			 	}
			 	/*if(this.slots[slotNum].cards[aCard].getIndex()==cardIndex){
			 		return  Math.round(currentY);
			 	}*/
			 	toRet[aCard]=currentY;
			 } 
			 if(this.slots[slotNum].cards[aCard].canMove()==true && this.slots[slotNum].cards[aCard].isRevealed()==1){
			 	if(this.slots[slotNum].cards[aCard-1].canMove()==false && this.slots[slotNum].cards[aCard-1].isRevealed()==1){
			 		currentY=(currentY)+(spaceBTCards);
			 	}
			 	if(this.slots[slotNum].cards[aCard-1].isRevealed()==0){
			 		currentY=(currentY)+(spaceBTCards*backCardCoefficient);
			 	}
			 	if(this.slots[slotNum].cards[aCard-1].canMove()==true && this.slots[slotNum].cards[aCard-1].isRevealed()==1){
			 		currentY=(currentY)+(spaceBTCards);
			 		
			 	}
			 	/*if(this.slots[slotNum].cards[aCard].getIndex()==cardIndex){
			 		return  Math.round(currentY);
			 		}*/
			 		toRet[aCard]=currentY;
			 	}
			}
	}
	return JSON.stringify(toRet);
};

Board.prototype.hasCardReachLimit=function(slotCards,slotY,cardHeight,spaceRed,spaceWhite,maxHeight){
	var numOfgreycard=this.slots[slotCards].getNumOfGreyCard();
	var numofUnrevealCard=this.slots[slotCards].getNumOfUnrevealCard();
	var numOfWhiteCard=this.slots[slotCards].getNumOfWhiteCard();
	var total=(numofUnrevealCard+numOfgreycard+numOfWhiteCard)*cardHeight;
	var totalSpace=0;	
	var returnValue;
	totalSpace=slotY+((numofUnrevealCard*(spaceWhite*spaceRed))+(numOfgreycard*(spaceWhite))+(numOfWhiteCard*spaceWhite))+(cardHeight/2);
	if(totalSpace<maxHeight){
		//console.log("maxHeight:"+maxHeight);
		return 0;
	}
	if(totalSpace>=maxHeight){
		return 1;
	}
};
Board.prototype.getYWithLimit=function(slotNum,slotY,cardHeight,cardCoefficient,spaceRed,spaceWhite){
	var backCardCoefficient=spaceRed;
	var spaceBTCards=spaceWhite;
	var toRet={};
	var currentY=0;
		for( var aCard in this.slots[slotNum].cards){
			if(! this.slots[slotNum].cards.hasOwnProperty(aCard)) continue;
			if( this.slots[slotNum].cards[aCard].getIndex()==0){
				currentY=slotY+(cardHeight/2);
				/*if(this.slots[slotNum].cards[aCard].getIndex()==cardIndex){
					return Math.round(currentY);
				}*/
				toRet[aCard]=currentY;
			}else{
				if(this.slots[slotNum].cards[aCard].isRevealed()==0){
					currentY=(currentY)+((spaceBTCards*backCardCoefficient)*cardCoefficient);
					/*if(this.slots[slotNum].cards[aCard].getIndex()==cardIndex){
						return  Math.round(currentY);
					}*/
					toRet[aCard]=currentY;
				}
				if(this.slots[slotNum].cards[aCard].canMove()==false && this.slots[slotNum].cards[aCard].isRevealed()==1){
					if(this.slots[slotNum].cards[aCard-1].isRevealed()==0){
						currentY=(currentY)+((spaceBTCards*backCardCoefficient)*cardCoefficient);
					}else{
						currentY=(currentY)+((spaceBTCards*1)*cardCoefficient);
					}
					/*if(this.slots[slotNum].cards[aCard].getIndex()==cardIndex){
						return  Math.round(currentY);
					}*/
					toRet[aCard]=currentY;
				} 
				if(this.slots[slotNum].cards[aCard].canMove()==true && this.slots[slotNum].cards[aCard].isRevealed()==1){
					if(this.slots[slotNum].cards[aCard-1].canMove()==false && this.slots[slotNum].cards[aCard-1].isRevealed()==1){
						currentY=(currentY)+((spaceBTCards*1)*cardCoefficient);
					}
					if(this.slots[slotNum].cards[aCard-1].isRevealed()==0){
						currentY=(currentY)+((spaceBTCards*backCardCoefficient)*cardCoefficient);
					}
					if(this.slots[slotNum].cards[aCard-1].canMove()==true && this.slots[slotNum].cards[aCard-1].isRevealed()==1){
						currentY=(currentY)+((spaceBTCards*1)*cardCoefficient);	
					}
					/*if(this.slots[slotNum].cards[aCard].getIndex()==cardIndex){
						return  Math.round(currentY);
					}*/
					toRet[aCard]=currentY;
				}
			}
		}
		return JSON.stringify(toRet);
};
/*Board.prototype.getLimitCardCoefficient=function(slotNum,slotY,cardHeight){
    var backCardCoefficient=c2_callFunction("getBackCardCoefficient");
	var greyCardCoefficient=c2_callFunction("getGreyCardCoefficient");
	var selectableCardCoefficient=c2_callFunction("getSelectableCardCoefficient");
	var bottomLimit=c2_callFunction("getBottomLimit");
	var spaceBTCards=c2_callFunction("getCardSpace");
	var getCardLimit=c2_callFunction("getCardBottom");
	var valueToReturn=0;
	var currentY=0;
	/*valueToReturn=((1/bottomLimit)*(bottomLimit-getCardLimit));
     if(valueToReturn>=0){
     	return 1
     }
     if(valueToReturn<0){

     }
	for( var aCard in this.slots[slotNum].cards){
		if(! this.slots[slotNum].cards.hasOwnProperty(aCard)) continue;
		if( this.slots[slotNum].cards[aCard].getIndex()==0){
			currentY=slotY+(cardHeight/2);
		}else{
			if(this.slots[slotNum].cards[aCard].isRevealed()==0){
			 	currentY=(currentY)+(spaceBTCards*backCardCoefficient);
			}
			if(this.slots[slotNum].cards[aCard].canMove()==false && this.slots[slotNum].cards[aCard].isRevealed()==1){
				if(this.slots[slotNum].cards[aCard-1].isRevealed()==0){
					currentY=(currentY)+(spaceBTCards*backCardCoefficient);
				}else{
					currentY=(currentY)+(spaceBTCards);
			 	}
			}
			if(this.slots[slotNum].cards[aCard].canMove()==true && this.slots[slotNum].cards[aCard].isRevealed()==1){
				if(this.slots[slotNum].cards[aCard-1].canMove()==false && this.slots[slotNum].cards[aCard-1].isRevealed()==1){
			 		currentY=(currentY)+(spaceBTCards);
			 	}
			 	if(this.slots[slotNum].cards[aCard-1].isRevealed()==0){
			 		currentY=(currentY)+(spaceBTCards*backCardCoefficient);
			 	}
			 	if(this.slots[slotNum].cards[aCard-1].canMove()==true){
			 		currentY=(currentY)+(spaceBTCards);	
			 	}
			}
		}
	}
	if(currentY>=bottomLimit){
		for(var localCount=1 ;localCount>0.5;localCount=localCount-0.1){
			//
			localCount=Math.round(localCount*10)/10;
			//console.log(localCount);
			currentY=0;
			for( var aCard in this.slots[slotNum].cards){
				if(! this.slots[slotNum].cards.hasOwnProperty(aCard)) continue;
				if( this.slots[slotNum].cards[aCard].getIndex()==0){
					currentY=slotY+(cardHeight/2);
				}else{
					if(this.slots[slotNum].cards[aCard].isRevealed()==0){
						currentY=(currentY)+(spaceBTCards*backCardCoefficient*localCount);
					}
					if(this.slots[slotNum].cards[aCard].canMove()==false && this.slots[slotNum].cards[aCard].isRevealed()==1){
						if(this.slots[slotNum].cards[aCard-1].isRevealed()==0){
							currentY=(currentY)+(spaceBTCards*backCardCoefficient*localCount);
						}else{
							currentY=(currentY)+(spaceBTCards*greyCardCoefficient*localCount);
						}
					}
					if(this.slots[slotNum].cards[aCard].canMove()==true && this.slots[slotNum].cards[aCard].isRevealed()==1){
						if(this.slots[slotNum].cards[aCard-1].canMove()==false && this.slots[slotNum].cards[aCard-1].isRevealed()==1){
							currentY=(currentY)+(spaceBTCards*greyCardCoefficient*localCount);
						}
						if(this.slots[slotNum].cards[aCard-1].isRevealed()==0){
							currentY=(currentY)+(spaceBTCards*backCardCoefficient*localCount);
						}
						if(this.slots[slotNum].cards[aCard-1].canMove()==true){
							currentY=(currentY)+(spaceBTCards);
						}
					}
				}	
			}
			if(currentY<bottomLimit){
				if(localCount!=1){
					return localCount;
				}
				if(localCount==1){
					return 0.99;
				}
				
			}
		}
		return 0.5;
		//return 0.9;
	}else{
		return 1;
	}
};*/
Board.prototype.checkIfCardStillMovable=function(){
	if(this.hand.getNbCardsInDeck()>0){
		return 1;
		
	}
	for(var i=0;i<10;i++){
		if(this.slots[i].getNbCardsInDeck()<=0){
			return 1;
		}
		if(this.slots[i].getNbCardsInDeck()>0){
			var card=this.slots[i].getCardOnTop(), previousCard = card.getPreviousCard();
			for (var a=0;a<this.slots[i].getNbCardsInDeck();a++){
				if (card.isSameSuit(previousCard)==true && card.isOneOver(previousCard)==true && previousCard.isRevealed()==1 ){
					for(var j=0;j<10;j!=i?j++:++j){
						if(this.slots[j].getNbCardsInDeck()>0){
							if(card.isOneOver(this.slots[j].getCardOnTop())){
								var takeNumCard= ((this.slots[i].getCardOnTop().getIndex())-card.getIndex())+1;
								this.slots[j].add(this.slots[i].takeCard(card.getIndex(),takeNumCard));
								if(this.slots[j].checkValideCard()==true){
									this.slots[i].add(this.slots[j].takeCard(this.slots[j].getCard((this.slots[j].getCardOnTop().getIndex())-(takeNumCard-1)).getIndex(),takeNumCard));
									return 1 ;
								}else{
									this.slots[i].add(this.slots[j].takeCard(this.slots[j].getCard((this.slots[j].getCardOnTop().getIndex())-(takeNumCard-1)).getIndex(),takeNumCard));
								}
							}
						}
					}
					card=previousCard;
					previousCard=card.getPreviousCard();
				}
			}
			//this condition take one set of card or one card then compare it with other column
			/*j!=i?j++:++j compare wherether the column is from the same column as the set of card. if they are same then increment
			j which mean take next column then do the condition else do the condition then increment. */
			for(var j=0;j<10;j!=i?j++:++j){
				if(this.slots[j].getNbCardsInDeck()>0){
					if(card.isOneOver(this.slots[j].getCardOnTop())){
						return 1 ;
						//console.log("flashCard");
					}
				}else{
					if(card.getIndex()!=0){
						return 1 ;
					}
				}
			}//console.log(JSON.stringify({hintArray});
		}
	}
	return 0;
};
	

Board.prototype.init = function(mode){
	if(typeof mode !== "number") mode = 1;
	this.slots = []; for(var i=0; i<7; i++) this.slots[i] = new Deck();
	this.score=0;
	this.cardNum=mode;
	this.hand = new Deck();
	this.standbyDeck=new Deck();
	this.endingSlots= []; for(var i=0; i<4; i++) this.endingSlots[i] = new Deck();
	this.hand.addSuits([0,1,2,3]).shuffle();
	/*switch(mode){
		case 0:

		break;
		case 1:
			this.hand.addSuits([1,1,1,1,1,1,1,1]).shuffle();//;
		break;
		case 2:
		  	this.hand.addSuits([1,1,1,1,0,0,0,0]).shuffle();
		break;
		case 3:
			//shuffle(this.hand.addSuits([1,1,1,0,0,0,2,2]));
			throw "This mode does not exist";
		break;
		case 4:
		    this.hand.addSuits([0,0,1,1,2,2,3,3]).shuffle();
		break;
		default:
			throw "This mode does not exist";
		break;
	}*/
	return this;
};
Board.prototype.dealSlots = function(){
	if(this.hand.getNbCardsInDeck() < this.slots.length) return false; //Unable to deal cards to slots as there is not enough cards";
	for(var aSlot in this.slots){
		if(! this.slots.hasOwnProperty(aSlot)) continue;
		this.slots[aSlot].add(this.hand.deal());
	}
	return this;
};
Board.prototype.addCardToStandby=function(numOfTim){
	var toRet={count:0};
	if(typeof numOfTim!== "number") numOfTim=1;
	for(var i=0;i<numOfTim;i++){
		if (this.hand.getNbCardsInDeck()>0){
			toRet[i]=this.hand.getCardOnTop().getSimplified();
			this.standbyDeck.add(this.hand.deal());
			this.standbyDeck.getCardOnTop().reveal();
			toRet.count++;
		}
	}
	return JSON.stringify(toRet);
};
Board.prototype.resetCardDeck=function(){
	this.standbyDeck.cards.reverse();
	this.hand.add(this.standbyDeck.takeCard(0,this.standbyDeck.getNbCardsInDeck()));
};
Board.prototype.getResetDeckJSON=function(){
	var toRet={};
	for(var aCard in this.hand.cards){
		if(! this.hand.cards.hasOwnProperty(aCard)) continue;
		this.hand.cards[aCard].hide();
		toRet[aCard]=this.hand.cards[aCard].getSimplified();
	}
	return JSON.stringify(toRet);
};
Board.prototype.initialDeal = function(toDeal){
	if(typeof toDeal !== "number") toDeal = 28;
	var currentSlot = 0;
	while(toDeal>0){
		if(currentSlot>this.slots.length-1) currentSlot = 0;
		for(var i=0;i<currentSlot+1;i++){
			this.slots[currentSlot].add(this.hand.deal());
			toDeal--;
		}
		
		currentSlot++;
	}
	//once dealt pick first card of each deck and reveal it
	for(var aSlot in this.slots) if(this.slots.hasOwnProperty(aSlot)) this.slots[aSlot].getCardOnTop().reveal();
	return this;
}

Board.prototype.getMode = function(){
	return this.mode;
};
///////////////$
Board.prototype.saveState = function(numOfcard, gameScore){
	var stateToSave = {cardNum:numOfcard,score:gameScore};
	stateToSave.endingSlots = {count:this.endingSlots.length};
	for(var aSlot in this.endingSlots) if(this.endingSlots.hasOwnProperty(aSlot)) stateToSave.endingSlots[aSlot]=this.endingSlots[aSlot].asSimpleArray();
	stateToSave.standbyDeck=this.standbyDeck.asSimpleArray();
	stateToSave.hand = this.hand.asSimpleArray();
	stateToSave.slots={count:this.slots.length};
	for(var aSlot in this.slots) if(this.slots.hasOwnProperty(aSlot)) stateToSave.slots[aSlot] = this.slots[aSlot].asSimpleArray();
	this.states[this.states.count] = stateToSave;
	this.states.count++;
	this.hintHistory={count:0};
};
Board.prototype.getStateCompressed = function(numOfcard,gameScore){
	var stateToSave = {cardNum:String(numOfcard),score:String(gameScore)};
	stateToSave.endingSlots={count:this.endingSlots.length};
	for(var aSlot in this.endingSlots) if(this.endingSlots.hasOwnProperty(aSlot)) stateToSave.endingSlots[aSlot] = this.endingSlots[aSlot].asSimpleCompressed();
	stateToSave.standbyDeck = this.standbyDeck.asSimpleCompressed();
	stateToSave.hand = this.hand.asSimpleCompressed();
	stateToSave.slots={count:this.slots.length};
	for(var aSlot in this.slots) if(this.slots.hasOwnProperty(aSlot)) stateToSave.slots[aSlot] = this.slots[aSlot].asSimpleCompressed();
	return JSON.stringify(stateToSave);
};
Board.prototype.loadStateCompressed = function(stateCompressed){
	//console.log(stateCompressed);
	try{
		//window.stateToLoad=JSON.parse(stateCompressed);
		var stateToLoad=stateCompressed;
		for(var j=0; j<4;j++){
			this.endingSlots[j]=(new Deck());
			if(stateToLoad.endingSlots[j] !== "") this.endingSlots[j].add(stateToLoad.endingSlots[j]);
		}
		this.standbyDeck=(new Deck());
		if(stateToLoad.standbyDeck!=="")this.standbyDeck.add(stateToLoad.standbyDeck);
		this.hand =(new Deck());
		if(stateToLoad.hand !== "") this.hand.add(stateToLoad.hand);
		for(var j=0; j<7;j++){
			this.slots[j]=(new Deck());
			if(stateToLoad.slots[j] !== "") this.slots[j].add(stateToLoad.slots[j]);
		}
		this.score=parseInt(stateToLoad.score);
		this.cardNum=parseInt(stateToLoad.cardNum);
	}catch(e){
		//console.log("serious");
		for(var j=0; j<4;j++)this.endingSlots[j]=new Deck();
		this.score=0;
		this.cardNum=0;
		this.standbyDeck=new Deck();
		this.hand = new Deck();
		for(var j=0; j<7;j++)this.slots[j]=new Deck();
	}
};

//Board.loadStateCompressed(Board.getStateCompressed());
Board.prototype.applyState = function(stateNumber){
	if(typeof stateNumber !== "number" || stateNumber >= this.states.count) return false;
	var stateToApply = this.states[stateNumber];
	for(var aDeck in stateToApply){
		if(aDeck=="cardNum")this.cardNum=stateToApply.cardNum;
		if(aDeck=="score")this.score=stateToApply.score;
		if(! stateToApply.hasOwnProperty(aDeck)) continue;
		if(typeof stateToApply[aDeck].push === "function" /* = this is an array*/){
			this[aDeck] = new Deck();
			for(var aCardSimplified in stateToApply[aDeck]){
				if(! stateToApply[aDeck].hasOwnProperty(aCardSimplified)) continue;
				this[aDeck].add((new Card()).init(stateToApply[aDeck][aCardSimplified]));
			}
		}else{
			for(var slotDeck in stateToApply[aDeck]){
				if(! stateToApply[aDeck].hasOwnProperty(slotDeck)) continue;
				if(slotDeck === "count") continue;
				this[aDeck][slotDeck] = new Deck();
				for(var aCardSimplified in stateToApply[aDeck][slotDeck]){
					if(! stateToApply[aDeck][slotDeck].hasOwnProperty(aCardSimplified)) continue;
					this[aDeck][slotDeck].add((new Card()).init(stateToApply[aDeck][slotDeck][aCardSimplified]));
				}
			}  
		}
	}
};
Board.prototype.creatingSuitOnDeal = function(){
	this.slots[0].takeCard(0,6);
	this.slots[0].addSuits([1]);
	this.slots[0].cards.reverse();
	for(var j=0; j<this.slots[0].cards.length; j++) {
		this.slots[0].rebuildOrder().cards[j].reveal();
	}
	this.slots[0].takeCard(this.slots[0].getCardOnTop().getIndex());
	this.hand=new Deck();
	for(var i=0; i<10;i++){
		this.hand.cards[i]=((new Card()).createCardBySpecificValue(0,1));
	}
	for(var j=0; j<this.hand.cards.length; j++) {
		this.hand.rebuildOrder().cards[j];
	}

	return this;
};
Board.prototype.takeLastState = function(){
	if(this.states.count === 0) return this;
	this.applyState(this.states.count-2);
	delete this.states[this.states.count-1];
	this.states.count--;
	return this;
};
/*Board.prototype.checkEachDeck = function(){
	for(var i=0;i<10;i++){
	if(this.slots[i].checkValideCard()==true){
      return true;
      //console.log("skip one more step");
	 }
	
	}
return false;
};*/
/*Board.prototype.cheat = function(){

	for(var i=0;i<10;i++){
		this.slots[i]=new Deck();
		if(i<=3){
			this.slots[i].addSuits([0]);
			this.slots[i].cards.reverse();
		}
		if(i>3 &&i<8){
			this.slots[i].addSuits([1]);
			this.slots[i].cards.reverse();
		}
	}
	
		this.slots[9].add(this.slots[7].takeCardOnTop());
		this.hand=new Deck();
	
	for(var i=0;i<10;i++){
		for(var j=0; j<this.slots[i].cards.length; j++) this.slots[i].rebuildOrder().cards[j].reveal();
	}
    for(var i=0;i<7;i++){
    	for(var j=12;j>=0;j--){
    		this.endingSlots.add(this.slots[i].takeCard(j,1));
    	}
    
    } 
	//this.endigSlots=new Deck();
};	*/
/*Board.prototype.checkEachDeckForHint = function(){
	var hintArray={count:0};
	var indexOfHintCard,counting=0;
	for(var i=0;i<7;i++){
		if(this.slots[i].getNbCardsInDeck()>0){
			var card=this.slots[i].getCardOnTop(), previousCard = card.getPreviousCard();
		for (var a=0;a<this.slots[i].getNbCardsInDeck();a++){
			
			if (card.isOneOver(previousCard)==true && previousCard.isRevealed()==1 ){
				for(var j=0;j<7;j!=i?j++:++j){
					if(this.slots[j].getNbCardsInDeck()>0){
						if(card.isOneOver(this.slots[j].getCardOnTop())){
							var takeNumCard= ((this.slots[i].getCardOnTop().getIndex())-card.getIndex())+1;
							this.slots[j].add(this.slots[i].takeCard(card.getIndex(),takeNumCard));
							if(this.slots[j].checkValideCard()==true){
								this.slots[i].add(this.slots[j].takeCard(this.slots[j].getCard((this.slots[j].getCardOnTop().getIndex())-(takeNumCard-1)).getIndex(),takeNumCard));
								hintArray[hintArray.count]=card.getSimplified();
								hintArray.count++;
								hintArray[hintArray.count]=this.slots[j].getCardOnTop().getSimplified();
								hintArray.count++;
								counting++;
							}else{
								this.slots[i].add(this.slots[j].takeCard(this.slots[j].getCard((this.slots[j].getCardOnTop().getIndex())-(takeNumCard-1)).getIndex(),takeNumCard));
							}
						}
					}
					if(counting>0){
						c2_callFunction("setSlot_name",[i,j]);
						return JSON.stringify(hintArray);
					}
				}
				card=previousCard;
				previousCard=card.getPreviousCard();
			}
		}
			//this condition take one set of card or one card then compare it with other column
			/*j!=i?j++:++j compare wherether the column is from the same column as the set of card. if they are same then increment
			 j which mean take next column then do the condition else do the condition then increment. */
			 /*for(var j=0;j<10;j!=i?j++:++j){
					if(this.slots[j].getNbCardsInDeck()>0){
						if(card.isOneOver(this.slots[j].getCardOnTop())){
							hintArray[hintArray.count]=card.getSimplified();
                            hintArray.count++;
                            hintArray[hintArray.count]=this.slots[j].getCardOnTop().getSimplified();
                            hintArray.count++;
                            counting++;
                           //console.log("flashCard");
						}
					}else{
						if(card.getIndex()!=0){
							hintArray[hintArray.count]=card.getSimplified();
                            hintArray.count++;
                            counting++;
                        }
						  
					}
					if(counting>0){
          			c2_callFunction("setSlot_name",[i,j]);
          			return JSON.stringify(hintArray);
          		}			
          			//console.log(JSON.stringify({hintArray}));
          		}
          	
          	
		}
	}
	if (counting==0){
		if(this.hand.getNbCardsInDeck()>0){
			for(var k=0;k<10;k++){
				card=this.hand.getCard(this.hand.getCardOnTop().getIndex()-k);
				hintArray[hintArray.count]=card.getSimplified();
				hintArray.count++;
			}
				c2_callFunction("setSlot_name",["hand"]);
			
			return JSON.stringify(hintArray);
			// console.log("flash hand");
		}
		else {
			//c2_callFunction("gameOver");
			c2_callFunction("setSlot_name",["no hints"]);
			//console.log("gameOver");
			return JSON.stringify({});
		}
	}
	
};*/
/*Board.prototype.getHint = function(){
	var hintArray={count:0};
	var indexOfHintCard,counting=0;
	for(var i=0;i<7;i++){
		if(this.slots[i].getNbCardsInDeck()>0){
			var card=this.slots[i].getCardOnTop();
			if(card.getIndex()!=0){
				var previousCard = card.getPreviousCard();
				for (var a=0;a<this.slots[i].getNbCardsInDeck();a++){
					if (previousCard.isRevealed()==1 ){
						card=previousCard;
						if(card.getIndex()!=0){
							previousCard=card.getPreviousCard();
						}	
					}
				}
			}
		  for(var j=0;j<7;j!=i?j++:++j){
		  	if(this.slots[j].getNbCardsInDeck()>0){
		  		if(card.isOneOver(this.slots[j].getCardOnTop())&& card.isDifferentSuit(this.slots[j].getCardOnTop())){
		  			hintArray[hintArray.count]=card.getSimplified();
		  			hintArray.count++;
		  			hintArray[hintArray.count]=this.slots[j].getCardOnTop().getSimplified();
		  			hintArray.count++;
		  			counting++;
		  			//console.log("flashCard"); 
		  		}
		  	}else{
		  		if(card.getIndex()!=0&& card.getWeight()==12){
		  			hintArray[hintArray.count]=card.getSimplified();
		  			hintArray.count++;
		  			counting++;
		  		}
		  	}
		  	if(counting>0){

		  		c2_callFunction("setSlot_name",[i,j]);
		  		return JSON.stringify(hintArray);
		  	}
		  	//console.log(JSON.stringify({hintArray}));
		  }
		  for(var k=0;k<4;k++){
		  	if(this.endingSlots[k].getNbCardsInDeck()>0){
		  		if(this.slots[i].getCardOnTop().isOneBellow(this.endingSlots[k].getCardOnTop())&& this.slots[i].getCardOnTop().isSameSuit(this.endingSlots[k].getCardOnTop())){
		  			hintArray[hintArray.count]=this.slots[i].getCardOnTop().getSimplified();
		  			hintArray.count++;
		  			hintArray[hintArray.count]=this.endingSlots[k].getCardOnTop().getSimplified();
		  			hintArray.count++;
		  			counting++;
		  		}
		  	}else{
		  		if(this.slots[i].getCardOnTop().getWeight()==0&& this.slots[i].getCardOnTop().getSuit()==k){
		  			hintArray[hintArray.count]=this.slots[i].getCardOnTop().getSimplified();
		  			hintArray.count++;
		  			counting++;
		  		}
		  	}
		  	if(counting>0){
		  		c2_callFunction("moveToEndingSlots",[i,k]);
		  		return JSON.stringify(hintArray);
		  	}
		  }
		  if(this.standbyDeck.getNbCardsInDeck()>0){
		  	for(var j=0; j<7;j++){
		  		if(this.slots[j].getNbCardsInDeck()>0){
		  			if(this.standbyDeck.getCardOnTop().isOneOver(this.slots[j].getCardOnTop()) && this.standbyDeck.getCardOnTop().isDifferentSuit(this.slots[j].getCardOnTop())){
		  				hintArray[hintArray.count]=this.standbyDeck.getCardOnTop().getSimplified();
		  				hintArray.count++;
		  				hintArray[hintArray.count]=this.slots[j].getCardOnTop().getSimplified();
		  				hintArray.count++;
		  				counting++;
		  			}
		  		}else{
		  			if(this.standbyDeck.getCardOnTop().getWeight()==12){
		  				hintArray[hintArray.count]=this.standbyDeck.getCardOnTop().getSimplified();
		  				hintArray.count++;
		  				counting++;
		  			}
		  		}
		  		if (counting>0){
		  			c2_callFunction("setSlot_name",["standbyDeck",j]);
		  			return JSON.stringify(hintArray);
		  		}
		  	}
		  	for(var k=0;k<4;k++){
		  		if(this.endingSlots[k].getNbCardsInDeck()>0){
		  			if(this.standbyDeck.getCardOnTop().isOneBellow(this.endingSlots[k].getCardOnTop()) && this.standbyDeck.getCardOnTop().isSameSuit(this.endingSlots[k].getCardOnTop())){
		  				hintArray[hintArray.count]=this.standbyDeck.getCardOnTop().getSimplified();
		  				hintArray.count++;
		  				hintArray[hintArray.count]=this.endingSlots[k].getCardOnTop().getSimplified();
		  				hintArray.count++;
		  				counting++;
		  			}
		  		}else{
		  			if(this.standbyDeck.getCardOnTop().getWeight()==0&& this.standbyDeck.getCardOnTop().getSuit()==k){
		  				hintArray[hintArray.count]=this.standbyDeck.getCardOnTop().getSimplified();
		  				hintArray.count++;
		  				counting++;
		  			}
		  		}
		  		if(counting>0){
		  			c2_callFunction("moveToEndingSlots",["standbyDeck",k]);
		  			return JSON.stringify(hintArray);
		  		}
		  	}
		  } 
		}
	}
	if (counting==0){
		if(this.hand.getNbCardsInDeck()>0 || this.standbyDeck.getNbCardsInDeck()>0){
			
				c2_callFunction("setSlot_name",["hand"]);
			
			return JSON.stringify(hintArray);
			// console.log("flash hand");
		}
		else {
			if(this.standbyDeck.getNbCardsInDeck()==0 && this.hand.getNbCardsInDeck()==0 ){
				c2_callFunction("setSlot_name",["no hints"]);
				return JSON.stringify({});
			}
			//c2_callFunction("gameOver");
			
			//console.log("gameOver");
			
		}
	}
	
};
*/
Board.prototype.isHintInHistory = function(hint){
	return (typeof this.hintHistory[JSON.stringify(hint)] !== 'undefined');
};

Board.prototype.resetHintHistory = function(){
	this.hintHistory = {count:0};
	return this;
};

Board.prototype.addHintToHistory = function(hint){
	this.hintHistory[JSON.stringify(hint)] = true;
	this.hintHistory.count++;
	return hint;
};
Board.prototype.getCardSpecificHint=function(cardSlot,cardIndex,typeSlot){
	var hintArray={count:0};
	var counting=0;
	if(typeSlot=="slot"){
		var aCard=this.slots[cardSlot].getCard(cardIndex);
		if(cardIndex!=this.slots[cardSlot].getCardOnTop().getIndex()){
			for(var j=0;j<7;j!=cardSlot?j++:++j){
				if(this.slots[j].getNbCardsInDeck()>0){
					if(aCard.isOneOver(this.slots[j].getCardOnTop())&& aCard.isDifferentSuit(this.slots[j].getCardOnTop())){
						var toRet = {"0":aCard.getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), count:2};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
					}
				}else{
					if(aCard.getIndex()!=0&& aCard.getWeight()==12){
						var toRet = {"0":aCard.getSimplified(), count:1};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
					}
				}
				if(counting>0){
					c2_callFunction("setSlot_name",[cardSlot,j]);
					return JSON.stringify(this.addHintToHistory(hintArray));
				}
				//console.log(JSON.stringify({hintArray}));	 
			}
		}
		if(cardIndex==this.slots[cardSlot].getCardOnTop().getIndex()){
			for(var k=0;k<4;k++){
				if(this.endingSlots[k].getNbCardsInDeck()>0){
					if(aCard.isOneBellow(this.endingSlots[k].getCardOnTop())&& aCard.isSameSuit(this.endingSlots[k].getCardOnTop())){
						var toRet = {"0":aCard.getSimplified(), "1":this.endingSlots[k].getCardOnTop().getSimplified(), count:2};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
					}
				}else{
					if(aCard.getWeight()==0&& aCard.getSuit()==k){
						var toRet = {"0":aCard.getSimplified(), count:1};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
					}
				}
				if(counting>0){
					c2_callFunction("moveToEndingSlots",[cardSlot,k]);
					return JSON.stringify(this.addHintToHistory(hintArray));
				}
			}
			for(var j=0;j<7;j!=cardSlot?j++:++j){
					if(this.slots[j].getNbCardsInDeck()>0){
						if(aCard.isOneOver(this.slots[j].getCardOnTop())&& aCard.isDifferentSuit(this.slots[j].getCardOnTop())){
							var toRet = {"0":aCard.getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), count:2};
							if(!this.isHintInHistory(toRet)){
								hintArray = toRet;
								counting++;
							}
						}
					}else{
						if(aCard.getIndex()!=0&& aCard.getWeight()==12){
							var toRet = {"0":aCard.getSimplified(), count:1};
							if(!this.isHintInHistory(toRet)){
								hintArray = toRet;
								counting++;
							}
						}
					}
					if(counting>0){
						c2_callFunction("setSlot_name",[cardSlot,j]);
						return JSON.stringify(this.addHintToHistory(hintArray));
				}
				//console.log(JSON.stringify({hintArray}));	 
			}
		}	
	}
	if(typeSlot=="end"){
		var aCard=this.endingSlots[cardSlot].getCard(cardIndex);
		for(var j=0;j<7;j++){
			if(this.slots[j].getNbCardsInDeck()>0){
				if(aCard.isOneOver(this.slots[j].getCardOnTop())&& aCard.isDifferentSuit(this.slots[j].getCardOnTop())){
					var toRet = {"0":aCard.getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), count:2};
					if(!this.isHintInHistory(toRet)){
						hintArray = toRet;
						counting++;
					}
				}
			}else{
				if(aCard.getIndex()!=0&& aCard.getWeight()==12){
					var toRet = {"0":aCard.getSimplified(), count:1};
					if(!this.isHintInHistory(toRet)){
						hintArray = toRet;
						counting++;
					}
				}
			}
			if(counting>0){
				c2_callFunction("setSlot_name",[cardSlot,j,1]);
				return JSON.stringify(this.addHintToHistory(hintArray));
			}
			//console.log(JSON.stringify({hintArray}));	 
		}
	}
	if(typeSlot=="standbyDeck"){

		var aCard=this.standbyDeck.getCard(cardIndex);
		if(cardIndex==this.standbyDeck.getCardOnTop().getIndex()){
			for(var j=0;j<7;j++){
				if(this.slots[j].getNbCardsInDeck()>0){
					if(aCard.isOneOver(this.slots[j].getCardOnTop())&& aCard.isDifferentSuit(this.slots[j].getCardOnTop())){
						var toRet = {"0":aCard.getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), count:2};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
					}
				}else{
					if(aCard.getWeight()==12){
						var toRet = {"0":aCard.getSimplified(), count:1};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
					}
				}
				if(counting>0){
					c2_callFunction("setSlot_name",["standbyDeck",j]);
					return JSON.stringify(this.addHintToHistory(hintArray));
				}
				//console.log(JSON.stringify({hintArray})):
			}
			for(var k=0;k<4;k++){
				if(this.endingSlots[k].getNbCardsInDeck()>0){
					if(aCard.isOneBellow(this.endingSlots[k].getCardOnTop())&& aCard.isSameSuit(this.endingSlots[k].getCardOnTop())){
						var toRet = {"0":aCard.getSimplified(), "1":this.endingSlots[k].getCardOnTop().getSimplified(), count:2};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
					}
				}else{
					if(aCard.getWeight()==0&& aCard.getSuit()==k){
						var toRet = {"0":aCard.getSimplified(), count:1};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
					}
				}
				if(counting>0){
					c2_callFunction("moveToEndingSlots",["standbyDeck",k]);
					return JSON.stringify(this.addHintToHistory(hintArray));
				}
			}
		}
	}
	this.resetHintHistory();
	return JSON.stringify({"0":"noHint"});
};
Board.prototype.getHint = function(){
	var hintArray={count:0};
	var indexOfHintCard,counting=0;
	for(var i=0;i<7;i++){
		if(this.slots[i].getNbCardsInDeck()>0){
			var card=this.slots[i].getCardOnTop();
			if(card.getIndex()!=0){
				var previousCard = card.getPreviousCard();
				for (var a=0;a<this.slots[i].getNbCardsInDeck();a++){
					if (previousCard.isRevealed()==1 ){
						card=previousCard;
						if(card.getIndex()!=0){
							previousCard=card.getPreviousCard();
						}	
					}
				}
			}
		//this condition take one set of card or one card then compare it with other column
		/*j!=i?j++:++j compare wherether the column is from the same column as the set of card. if they are same then increment
		 j which mean take next column then do the condition else do the condition then increment.*/
		  for(var j=0;j<7;j!=i?j++:++j){
		  	if(this.slots[j].getNbCardsInDeck()>0){
		  		if(card.isOneOver(this.slots[j].getCardOnTop())&& card.isDifferentSuit(this.slots[j].getCardOnTop())){
		  			var toRet = {"0":card.getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), count:2};
		  			if(!this.isHintInHistory(toRet)){
						hintArray = toRet;
				  		counting++;
				  	}
		  		}
		  	}else{
		  		if(card.getIndex()!=0&& card.getWeight()==12){
		  			var toRet = {"0":card.getSimplified(), count:1};
		  			if(!this.isHintInHistory(toRet)){
						hintArray = toRet;
				  		counting++;
				  	}
		  		}
		  	}
		  	if(counting>0){

		  		c2_callFunction("setSlot_name",[i,j]);
		  		return JSON.stringify(this.addHintToHistory(hintArray));
		  	}
		  	//console.log(JSON.stringify({hintArray}));
		  }
		  for(var k=0;k<4;k++){
		  	if(this.endingSlots[k].getNbCardsInDeck()>0){
		  		if(this.slots[i].getCardOnTop().isOneBellow(this.endingSlots[k].getCardOnTop())&& this.slots[i].getCardOnTop().isSameSuit(this.endingSlots[k].getCardOnTop())){
		  			var toRet = {"0":this.slots[i].getCardOnTop().getSimplified(), "1":this.endingSlots[k].getCardOnTop().getSimplified(), count:2};
		  			if(!this.isHintInHistory(toRet)){
						hintArray = toRet;
				  		counting++;
				  	}
		  			
		  		}
		  	}else{
		  		if(this.slots[i].getCardOnTop().getWeight()==0&& this.slots[i].getCardOnTop().getSuit()==k){
		  			var toRet = {"0":this.slots[i].getCardOnTop().getSimplified(), count:1};
		  			if(!this.isHintInHistory(toRet)){
						hintArray = toRet;
				  		counting++;
				  	}
		  		}
		  	}
		  	if(counting>0){
		  		c2_callFunction("moveToEndingSlots",[i,k]);
		  		return JSON.stringify(this.addHintToHistory(hintArray));
		  	}
		  }
		  if(this.standbyDeck.getNbCardsInDeck()>0){
		  	for(var j=0; j<7;j++){
		  		if(this.slots[j].getNbCardsInDeck()>0){
		  			if(this.standbyDeck.getCardOnTop().isOneOver(this.slots[j].getCardOnTop()) && this.standbyDeck.getCardOnTop().isDifferentSuit(this.slots[j].getCardOnTop())){
		  				var toRet = {"0":this.standbyDeck.getCardOnTop().getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), count:2};
		  				if(!this.isHintInHistory(toRet)){
		  					hintArray = toRet;
		  					counting++;
		  				}	
		  			}
		  		}else{
		  			if(this.standbyDeck.getCardOnTop().getWeight()==12){
		  				var toRet = {"0":this.standbyDeck.getCardOnTop().getSimplified(), count:1};
		  				if(!this.isHintInHistory(toRet)){
		  					hintArray = toRet;
		  					counting++;
		  				}
		  			}
		  		}
		  		if (counting>0){
		  			c2_callFunction("setSlot_name",["standbyDeck",j]);
		  			return JSON.stringify(this.addHintToHistory(hintArray));
		  		}
		  	}
		  	for(var k=0;k<4;k++){
		  		if(this.endingSlots[k].getNbCardsInDeck()>0){
		  			if(this.standbyDeck.getCardOnTop().isOneBellow(this.endingSlots[k].getCardOnTop()) && this.standbyDeck.getCardOnTop().isSameSuit(this.endingSlots[k].getCardOnTop())){
		  				var toRet = {"0":this.standbyDeck.getCardOnTop().getSimplified(), "1":this.endingSlots[k].getCardOnTop().getSimplified(), count:2};
		  				if(!this.isHintInHistory(toRet)){
		  					hintArray = toRet;
		  					counting++;
		  				}	
		  			}
		  		}else{
		  			if(this.standbyDeck.getCardOnTop().getWeight()==0&& this.standbyDeck.getCardOnTop().getSuit()==k){
		  				var toRet = {"0":this.standbyDeck.getCardOnTop().getSimplified(), count:1};
		  				if(!this.isHintInHistory(toRet)){
		  					hintArray = toRet;
		  					counting++;
		  				}	
		  			}
		  		}
		  		if(counting>0){
		  			c2_callFunction("moveToEndingSlots",["standbyDeck",k]);
		  			return JSON.stringify(this.addHintToHistory(hintArray));
		  		}
		  	}
		  } 
		}
	}
	if (counting==0){
		if(this.hintHistory.count !== 0) return this.resetHintHistory().getHint();
		if(this.hand.getNbCardsInDeck()>0 || this.standbyDeck.getNbCardsInDeck()>0){
			var toRet = {"0":"hand", count:1};
			if(!this.isHintInHistory(toRet)){
				hintArray = toRet;
				
			}	
			c2_callFunction("setSlot_name",["hand"]);
			return JSON.stringify(this.addHintToHistory(hintArray));
			// console.log("flash hand");
		}
		else {
			if(this.standbyDeck.getNbCardsInDeck()==0 && this.hand.getNbCardsInDeck()==0 ){
				var toRet = {"0":"no hints", count:1};
				if(!this.isHintInHistory(toRet)){
					hintArray = toRet;
				}	
				c2_callFunction("setSlot_name",["no hints"]);
				return JSON.stringify(this.addHintToHistory(hintArray));
			}
			//c2_callFunction("gameOver");
			
			//console.log("gameOver");
		}
	}
};


Board.prototype.getExplicitCardHint = function(cardIndex, typeSlot) {

        var hintList = {
                	count: 0
            		},
            counting = 0,
            aCard = {};

        if (cardIndex >= 0 && (typeSlot === "standbyDeck" || typeSlot === "hand")) {

            if (typeSlot === "standbyDeck") {
                aCard = this.standbyDeck.getCard(cardIndex);
            }
            if (typeSlot === "hand") {
                aCard = this.hand.getCard(cardIndex);
            }
            if (aCard != {}) {

                for (var j = 0; j < 7; j++) {

                    if (this.slots[j].getNbCardsInDeck() > 0) {

                        if (aCard.isOneOver(this.slots[j].getCardOnTop()) && aCard.isDifferentSuit(this.slots[j].getCardOnTop())) {

                            var toRet = {
                                "0": aCard.getSimplified(),
                                "1": this.slots[j].getCardOnTop().getSimplified(),
                                count: 2
                            };
							if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                counting++;
                               	hintList[JSON.stringify(toRet)] = true;
								hintList.count++;
                            }
                        }
                    } else {

                        if (aCard.getWeight() == 12) {

                            var toRet = {
                                "0": aCard.getSimplified(),
                                count: 1
                            };
                            if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                counting++;
                               	hintList[JSON.stringify(toRet)] = true;
								hintList.count++;
                            }
                        }
                    }

                    if (counting > 0) {
                    }
                }
                for (var k = 0; k < 4; k++) {
                    if (this.endingSlots[k].getNbCardsInDeck() > 0) {
                        if (aCard.isOneBellow(this.endingSlots[k].getCardOnTop()) && aCard.isSameSuit(this.endingSlots[k].getCardOnTop())) {

                            var toRet = {
                                "0": aCard.getSimplified(),
                                "1": this.endingSlots[k].getCardOnTop().getSimplified(),
                                count: 2
                            };
                            if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                counting++;
                               	hintList[JSON.stringify(toRet)] = true;
								hintList.count++;
                            }
                        }
                    } else {

                        if (aCard.getWeight() == 0 && aCard.getSuit() == k) {

                            var toRet = {
                                "0": aCard.getSimplified(),
                                count: 1
                            };
                            if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                counting++;
                               	hintList[JSON.stringify(toRet)] = true;
								hintList.count++;
                            }
                        }
                    }

                    if (counting > 0) {
                    }
                }
            }
        }

		if (hintList.count === 0) {
        	var toRet = {
		       		"0": "no hints",
                    count: 1
                    };
        	hintList[JSON.stringify(toRet)] = true;
			hintList.count++;
        }

    	return hintList;
};

Board.prototype.customGetHint = function() {

    var hintList = {
                	count: 0
            		},
        counting = 0;

        for (var i = 0; i < 7; i++) {

            if (this.slots[i].getNbCardsInDeck() > 0) {

                var card = this.slots[i].getCardOnTop();

                if (card.getIndex() != 0) {

                    var previousCard = card.getPreviousCard();

                    for (var a = 0; a < this.slots[i].getNbCardsInDeck(); a++) {

                        if (previousCard.isRevealed() == 1) {
                            card = previousCard;
                            if (card.getIndex() != 0) {
                                previousCard = card.getPreviousCard();
                            }
                        }
                    }
                }

                //this condition take one set of card or one card then compare it with other column
                //j!=i?j++:++j compare wherether the column is from the same column as the set of card. if they are same then increment
                //j which mean take next column then do the condition else do the condition then increment.

                for (var j = 0; j < 7; j != i ? j++ : ++j) {

                    if (this.slots[j].getNbCardsInDeck() > 0) {

                        if (card.isOneOver(this.slots[j].getCardOnTop()) && card.isDifferentSuit(this.slots[j].getCardOnTop())) {

                            var toRet = {
                                "0": card.getSimplified(),
                                "1": this.slots[j].getCardOnTop().getSimplified(),
                                count: 2
                            };

                            if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                counting++;
                                hintList[JSON.stringify(toRet)] = true;
								hintList.count++;
                            }
                        }
                    } else {
                        if (card.getIndex() != 0 && card.getWeight() == 12) {

                            var toRet = {
                                "0": card.getSimplified(),
                                count: 1
                            };

                            if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                counting++;
                                hintList[JSON.stringify(toRet)] = true;
								hintList.count++;
                            }
                        }
                    }
                    if (counting > 0) {
                        //addToHintList
                    }
                }

                for (var k = 0; k < 4; k++) {
                    if (this.endingSlots[k].getNbCardsInDeck() > 0) {
                        if (this.slots[i].getCardOnTop().isOneBellow(this.endingSlots[k].getCardOnTop()) && this.slots[i].getCardOnTop().isSameSuit(this.endingSlots[k].getCardOnTop())) {
                            var toRet = {
                                "0": this.slots[i].getCardOnTop().getSimplified(),
                                "1": this.endingSlots[k].getCardOnTop().getSimplified(),
                                count: 2
                            };

                            if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                counting++;
                                hintList[JSON.stringify(toRet)] = true;
								hintList.count++;
                            }

                        }
                    } else {
                        if (this.slots[i].getCardOnTop().getWeight() == 0 && this.slots[i].getCardOnTop().getSuit() == k) {
                            var toRet = {
                                "0": this.slots[i].getCardOnTop().getSimplified(),
                                count: 1
                            };
                            if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                counting++;
                                hintList[JSON.stringify(toRet)] = true;
								hintList.count++;
                            }
                        }
                    }
                    if (counting > 0) {
                        //addToHintList
                    }
                }

                if (this.standbyDeck.getNbCardsInDeck() > 0) {
                    for (var j = 0; j < 7; j++) {
                        if (this.slots[j].getNbCardsInDeck() > 0) {
                            if (this.standbyDeck.getCardOnTop().isOneOver(this.slots[j].getCardOnTop()) && this.standbyDeck.getCardOnTop().isDifferentSuit(this.slots[j].getCardOnTop())) {
                                var toRet = {
                                    "0": this.standbyDeck.getCardOnTop().getSimplified(),
                                    "1": this.slots[j].getCardOnTop().getSimplified(),
                                    count: 2
                                };
                                if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                    counting++;
                                	hintList[JSON.stringify(toRet)] = true;
									hintList.count++;
                                }
                            }
                        } else {
                            if (this.standbyDeck.getCardOnTop().getWeight() == 12) {
                                var toRet = {
                                    "0": this.standbyDeck.getCardOnTop().getSimplified(),
                                    count: 1
                                };
                                if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                    counting++;
                                	hintList[JSON.stringify(toRet)] = true;
									hintList.count++;
                                }
                            }
                        }
                        if (counting > 0) {
                            //addToHintList
                        }
                    }
                    for (var k = 0; k < 4; k++) {
                        if (this.endingSlots[k].getNbCardsInDeck() > 0) {
                            if (this.standbyDeck.getCardOnTop().isOneBellow(this.endingSlots[k].getCardOnTop()) && this.standbyDeck.getCardOnTop().isSameSuit(this.endingSlots[k].getCardOnTop())) {
                                var toRet = {
                                    "0": this.standbyDeck.getCardOnTop().getSimplified(),
                                    "1": this.endingSlots[k].getCardOnTop().getSimplified(),
                                    count: 2
                                };
                                if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                    counting++;
                                	hintList[JSON.stringify(toRet)] = true;
									hintList.count++;
                                }
                            }
                        } else {
                            if (this.standbyDeck.getCardOnTop().getWeight() == 0 && this.standbyDeck.getCardOnTop().getSuit() == k) {
                                var toRet = {
                                    "0": this.standbyDeck.getCardOnTop().getSimplified(),
                                    count: 1
                                };
                                if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                                    counting++;
                                	hintList[JSON.stringify(toRet)] = true;
									hintList.count++;
                                }
                            }
                        }
                        if (counting > 0) {
                           	//addToHintList
                        }
                    }
                }
            }
        }

        if (counting == 0) {
            
            if (hintList.count !== 0) return hintList;
            
            if (this.hand.getNbCardsInDeck() > 0 || this.standbyDeck.getNbCardsInDeck() > 0) {
                var toRet = {
                    "0": "hand",
                    count: 1
                };
                if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                    hintList[JSON.stringify(toRet)] = true;
					hintList.count++;
                }
  
            }else{
                	if (this.standbyDeck.getNbCardsInDeck() == 0 && this.hand.getNbCardsInDeck() == 0) {
                   		var toRet = {
                       			"0": "no hints",
                       			count: 1
                    			};
                    	if (!(typeof hintList[JSON.stringify(toRet)] !== 'undefined')) {
                        	hintList[JSON.stringify(toRet)] = true;
							hintList.count++;
                    	}
                	}
            	}
        	}
    return hintList;
};

Board.prototype.doesThisCardHaveMoves = function(cardIndex, typeSlot) {

        var aCard = {};

        if (cardIndex >= 0 && (typeSlot === "standbyDeck" || typeSlot === "hand")) {

            if (typeSlot === "standbyDeck") {
                aCard = this.standbyDeck.getCard(cardIndex);
            }
            if (typeSlot === "hand") {
                aCard = this.hand.getCard(cardIndex);
            }
            if (aCard != {}) {

                for (var j = 0; j < 7; j++) {

                    if (this.slots[j].getNbCardsInDeck() > 0) {

                        if (aCard.isOneOver(this.slots[j].getCardOnTop()) && aCard.isDifferentSuit(this.slots[j].getCardOnTop())) {

                            return true;
                        }
                    } else {

                        if (aCard.getWeight() == 12) {

                            return true;
                        }
                    }
                }

                for (var k = 0; k < 4; k++) {
                    
                    if (this.endingSlots[k].getNbCardsInDeck() > 0) {
                        
                        if (aCard.isOneBellow(this.endingSlots[k].getCardOnTop()) && aCard.isSameSuit(this.endingSlots[k].getCardOnTop())) {

                            return true;
                        }
                    } else {

                        if (aCard.getWeight() == 0 && aCard.getSuit() == k) {

                            return true;
                        }
                    }
                }
            }
        }

    	return false;
};

Board.prototype.checkStandbyDeckForFutureMoves = function (){

	if (this.standbyDeck.getNbCardsInDeck() > 0) {

		var totalCards = this.standbyDeck.getNbCardsInDeck(),
			mode = this.cardNum,
			cardIndex = mode - 1,
			maxJumps = Math.floor(totalCards/mode),
			count = 0;

		while (count <= maxJumps) {

			if (this.doesThisCardHaveMoves(cardIndex, "standbyDeck")) return true;
			cardIndex += mode;
			count++;
		}
	}

	return false;
};

Board.prototype.checkHandDeckForFutureMoves = function (){
	
	if (this.hand.getNbCardsInDeck() > 0) {

		var totalCards = this.hand.getNbCardsInDeck(),
			mode = this.cardNum,
			cardIndex = totalCards - mode,
			maxJumps = Math.floor(totalCards/mode),
			count = 0;

		if (totalCards%mode > 0 && this.doesThisCardHaveMoves(this.hand.getCardAtBottom(), "hand")) return true;

		while (count <= maxJumps) {

			if (this.doesThisCardHaveMoves(cardIndex, "hand")) return true;
			cardIndex -= mode;
			count++;
		}
	}

	return false;
};

Board.prototype.isAnyMovesPossibleOnTheBoard = function() {

        for (var i = 0; i < 7; i++) {

            if (this.slots[i].getNbCardsInDeck() > 0) {

                var card = this.slots[i].getCardOnTop();

                if (card.getIndex() != 0) {

                    var previousCard = card.getPreviousCard();

                    for (var a = 0; a < this.slots[i].getNbCardsInDeck(); a++) {

                        if (previousCard.isRevealed() == 1) {
                            card = previousCard;
                            if (card.getIndex() != 0) {
                                previousCard = card.getPreviousCard();
                            }
                        }
                    }
                }

                //this condition take one set of card or one card then compare it with other column
                //j!=i?j++:++j compare wherether the column is from the same column as the set of card. if they are same then increment
                //j which mean take next column then do the condition else do the condition then increment.

                for (var j = 0; j < 7; j != i ? j++ : ++j) {

                    if (this.slots[j].getNbCardsInDeck() > 0) {

                        if (card.isOneOver(this.slots[j].getCardOnTop()) && card.isDifferentSuit(this.slots[j].getCardOnTop())) {

                        	return true;
                        }
                    } else {
                        if (card.getIndex() != 0 && card.getWeight() == 12) {

                            return true;
                        }
                    }
                }

                for (var k = 0; k < 4; k++) {
                    if (this.endingSlots[k].getNbCardsInDeck() > 0) {
                        if (this.slots[i].getCardOnTop().isOneBellow(this.endingSlots[k].getCardOnTop()) && this.slots[i].getCardOnTop().isSameSuit(this.endingSlots[k].getCardOnTop())) {
                            
                            return true;
                        }
                    } else {
                        if (this.slots[i].getCardOnTop().getWeight() == 0 && this.slots[i].getCardOnTop().getSuit() == k) {
                            
                            return true;
                        }
                    }
                }

                if (this.standbyDeck.getNbCardsInDeck() > 0) {
                    
                    for (var j = 0; j < 7; j++) {
                        if (this.slots[j].getNbCardsInDeck() > 0) {
                            if (this.standbyDeck.getCardOnTop().isOneOver(this.slots[j].getCardOnTop()) && this.standbyDeck.getCardOnTop().isDifferentSuit(this.slots[j].getCardOnTop())) {
                                
                                return true;
                            }
                        } else {
                            if (this.standbyDeck.getCardOnTop().getWeight() == 12) {
                                
                                return true;
                            }
                        }
                    }

                    for (var k = 0; k < 4; k++) {
                        if (this.endingSlots[k].getNbCardsInDeck() > 0) {
                            if (this.standbyDeck.getCardOnTop().isOneBellow(this.endingSlots[k].getCardOnTop()) && this.standbyDeck.getCardOnTop().isSameSuit(this.endingSlots[k].getCardOnTop())) {
                                
                                return true;
                            }
                        } else {
                            if (this.standbyDeck.getCardOnTop().getWeight() == 0 && this.standbyDeck.getCardOnTop().getSuit() == k) {
                                
                                return true;
                            }
                        }
                    }
                }
            }
        }
    	return false;
};

Board.prototype.isThereAnyFutureMoves = function() {

	if (this.isAnyMovesPossibleOnTheBoard() || this.checkHandDeckForFutureMoves() || this.checkStandbyDeckForFutureMoves()) return 1;
	return 0;
};

Board.prototype.isGameFinished=function(){
	var localCount=0;
	for(var k=0;k<4;k++){
		if(this.endingSlots[k].getNbCardsInDeck()==13)localCount++;
	}
	if(localCount==4){
		return true;
	}
	return false;
};
Board.prototype.isGameEndable=function(){
	for(var i=0;i<7;i++){
		if(this.slots[i].getNbCardsInDeck()>0 && this.slots[i].getNumOfUnrevealCard()>0){
			return false;
		}
	}
	if(this.hand.getNbCardsInDeck()!=0 || this.standbyDeck.getNbCardsInDeck()!=0){
		return false;
	}
	return true;

};
Board.prototype.getCardToEndingSlot=function(){
	var toRet={count:0};
	//var count=0;
	var aCard;
	var currentEndingSlot=0;
	for(var a=0;a<4;a++){
		for(var b=0;b<13;b++){
			for(var c=0;c<7;c++){
				if(this.slots[c].getNbCardsInDeck()>0 && b==this.slots[c].getCardOnTop().getWeight()){
					aCard=this.slots[c].getCardOnTop().getSimplified();
					currentEndingSlot=this.slots[c].getCardOnTop().getSuit();
					this.endingSlots[currentEndingSlot].add(this.slots[c].deal());
					toRet[toRet.count]={"lastDeck":c,"currentDeck":currentEndingSlot,aCard};
					toRet.count++;
				}
			}
		}
		//count+=this.endingSlots[b].getNbCardsInDeck();
	}
	/*for(var b=0;b<4;b++){
		if(this.endingSlots[b].getNbCardsInDeck()>0){
			this.endingSlots[b]=new Deck();
		}
		this.endingSlots[b].addSuits([b]);
	}*/
	return JSON.stringify(toRet);
};
Board.prototype.arrangeCardForAuto=function(){
	this.hand=new Deck();
	this.standbyDeck=new Deck();
	for(var a=0; a<3;a++){
		this.endingSlots[a]=new Deck();
		this.endingSlots[a].addSuits([a]);
	}
	for(var b=0; b<7;b++){
		this.slots[b]=new Deck();
	}
	this.slots[0].addSuits([3]);
	this.slots[0].cards.reverse();
	for(var j=0; j<this.slots[0].cards.length; j++) this.slots[0].rebuildOrder().cards[j].reveal();
};


///////////$
window.Card = Card;
window.solitaireVersion = new solitaireVersion();
window.Deck = Deck;
window.Board = Board;
})();