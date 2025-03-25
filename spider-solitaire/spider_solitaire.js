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
var spiderVersion= function(){
	this.versionScript="Script Version:5.2";
};
spiderVersion.prototype.getSpiderVersion=function(){
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


Card.prototype.canMove=function(){
	var lastCardOfDeck = this.getDeck().getCardOnTop();
	var listOfLinkablesCardsBellowMe = this.getDeck().getLinkableCardFromIndex(this.getIndex());
	for(var aCard in listOfLinkablesCardsBellowMe){
		if(!listOfLinkablesCardsBellowMe.hasOwnProperty(aCard)) continue;
		if(listOfLinkablesCardsBellowMe[aCard].getIndex() === lastCardOfDeck.getIndex()) return true;
	}
	return false;
}


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
	while(card.isSameSuit(nextCard) && card.isOneBellow(nextCard)&& card.isRevealed()==1){
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
	while(card.isSameSuit(nextCard) && card.isOneBellow(nextCard) && card.isRevealed()==1 ){
		counting++; 
		linkableCardArr[counting] = nextCard.getSimplified();
		card = nextCard;
		nextCard = card.getNextCard();
	}
	linkableCardArr.count = counting+1;
	return JSON.stringify(linkableCardArr);
};
Deck.prototype.checkValideCard=function(){
		
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

//////////////////$

var Board = function(){
	this.mode = 1;
	this.score=500;
	this.slots = [];
	this.endingSlots=new Deck();

	this.hintHistory={count:0};

	this.states = {count:0}; /////////////////////
};
Board.prototype.getValidatedCard=function(slotNumber){

var lastPickIndex=this.slots[slotNumber].getCardOnTop().getIndex()-12;
var validateCard=this.slots[slotNumber].takeCard(lastPickIndex,13).reverse();
var toRet = {count:0};
for(var aCard in validateCard){
	toRet[toRet.count] = validateCard[aCard].getSimplified();
	toRet.count++;
}
this.endingSlots.add(validateCard);
return(JSON.stringify(toRet));

};
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
	this.slots = []; for(var i=0; i<10; i++) this.slots[i] = new Deck();
	this.hand = new Deck();
	switch(mode){
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
	}
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
Board.prototype.initialDeal = function(toDeal){
	if(typeof toDeal !== "number") toDeal = 54;
	var currentSlot = 0;
	while(toDeal>0){
		if(currentSlot>this.slots.length-1) currentSlot = 0;
		this.slots[currentSlot].add(this.hand.deal());
		toDeal--;
		currentSlot++;
	}
	//once dealt pick first card of each deck and reveal it
	for(var aSlot in this.slots) if(this.slots.hasOwnProperty(aSlot)) this.slots[aSlot].getCardOnTop().reveal();
	return this;
}

Board.prototype.getIndexOfLastCardInDeck = function(deckName){

	if (isNaN(deckName) || deckName == null || deckName < 0 || deckName > 9) return -1;

	var returnValue = this.slots[deckName].getCardOnTop().getIndex();

	if (isNaN(returnValue) || returnValue == null || returnValue < 0) return -1;

	return returnValue;
};

Board.prototype.getMode = function(){
	return this.mode;
};
///////////////$
Board.prototype.saveState = function(gameScore){
	var stateToSave = {score:gameScore};
	stateToSave.endingSlots = this.endingSlots.asSimpleArray();
	stateToSave.hand = this.hand.asSimpleArray();
	stateToSave.slots={count:this.slots.length};
	for(var aSlot in this.slots) if(this.slots.hasOwnProperty(aSlot)) stateToSave.slots[aSlot] = this.slots[aSlot].asSimpleArray();
	this.states[this.states.count] = stateToSave;
	this.states.count++;
	this.hintHistory={count:0};
};


Board.prototype.getStateCompressed = function(gameScore){
	var stateToSave = {score:gameScore};
	stateToSave.endingSlots = this.endingSlots.asSimpleCompressed();
	stateToSave.hand = this.hand.asSimpleCompressed();
	stateToSave.slots={count:this.slots.length};
	for(var aSlot in this.slots) if(this.slots.hasOwnProperty(aSlot)) stateToSave.slots[aSlot] = this.slots[aSlot].asSimpleCompressed();
	return JSON.stringify(stateToSave);
};

Board.prototype.loadStateCompressed = function(stateCompressed){
	try{
		window.stateToLoad=JSON.parse(stateCompressed);
		this.endingSlots = new Deck();
		if(stateToLoad.endingSlots !== "") this.endingSlots.add(stateToLoad.endingSlots);
		this.hand = new Deck();
		if(stateToLoad.hand !== "") this.hand.add(stateToLoad.hand);
		for(var j=0; j<10;j++){
			this.slots[j]=new Deck();
			if(stateToLoad.slots[j] !== "") this.slots[j].add(stateToLoad.slots[j]);
		}
		this.score=parseInt(stateToLoad.score);
	}catch(e){
		this.score=0;
		this.endingSlots = (new Deck());
		this.hand = new Deck();
		for(var j=0; j<10;j++)this.slots[j]=new Deck();
	}
};

//Board.loadStateCompressed(Board.getStateCompressed());

Board.prototype.applyState = function(stateNumber){
	if(typeof stateNumber !== "number" || stateNumber >= this.states.count) return false;
	var stateToApply = this.states[stateNumber];
	for(var aDeck in stateToApply){
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

Board.prototype.resetStates = function(){
	
	this.states = {count:0};
	this.hintHistory={count:0};
};

Board.prototype.checkEachDeck = function(){
	for(var i=0;i<10;i++){
	if(this.slots[i].checkValideCard()==true){
      return true;
      //console.log("skip one more step");
	 }
	
	}
return false;
};
Board.prototype.cheat = function(){

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
};	
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
Board.prototype.getCardSpecificHint=function(cardSlot,cardIndex){
	var hintArray={count:0};
	var counting=0;
	var aCard=this.slots[cardSlot].getCard(cardIndex);
	for(var j=0;j<10;j!=cardSlot?j++:++j){
		if(this.slots[j].getNbCardsInDeck()>0){
			if(aCard.isOneOver(this.slots[j].getCardOnTop())){
				var toRet = {"0":aCard.getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), "3":cardSlot+"_"+j, count:2};
				if(!this.isHintInHistory(toRet)){
					hintArray = toRet;
					counting++;
				}
			}
		}else{
			if(aCard.getIndex()!=0){
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
	if(counting==0){
	if(this.hintHistory.count !== 0) return this.resetHintHistory().getCardSpecificHint(cardSlot,cardIndex);
	var toRet = {"0":"no hints", count:1};
	hintArray = toRet;
	c2_callFunction("setSlot_name",["no hints"]);
	return JSON.stringify(this.addHintToHistory(hintArray));
	}

};
Board.prototype.checkEachDeckForHint = function(){
	var hintArray={count:0};
	var indexOfHintCard,counting=0;
	for(var i=0;i<10;i++){
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
									var toRet = {"0":card.getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), "3":i+"_"+j, count:2};
									if(!this.isHintInHistory(toRet)){
										hintArray = toRet;
										counting++;
									}
								}else{
									this.slots[i].add(this.slots[j].takeCard(this.slots[j].getCard((this.slots[j].getCardOnTop().getIndex())-(takeNumCard-1)).getIndex(),takeNumCard));
								}
							}
						}
						if(counting>0){
							c2_callFunction("setSlot_name",[i,j]);
							return JSON.stringify(this.addHintToHistory(hintArray));
						}
					}
					if(previousCard.isRevealed()==1){
						card=previousCard;
						if(card.getIndex()!=0){
							previousCard=card.getPreviousCard();
						}
					}	
				}
			}
			//this condition take one set of card or one card then compare it with other column
			/*j!=i?j++:++j compare wherether the column is from the same column as the set of card. if they are same then increment
			j which mean take next column then do the condition else do the condition then increment. */
			for(var j=0;j<10;j==i?++j:j++){
				//console.log(j);
				if(this.slots[j].getNbCardsInDeck()>0){
					if(card.isOneOver(this.slots[j].getCardOnTop())){
						var toRet = {"0":card.getSimplified(), "1":this.slots[j].getCardOnTop().getSimplified(), "3":i+"_"+j, count:2};
						if(!this.isHintInHistory(toRet)){
							hintArray = toRet;
							counting++;
						}
						//console.log("flashCard");
					}
				}else{
					if(card.getIndex()!=0){
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
		}
	}
	if (counting==0){
		if(this.hintHistory.count !== 0) return this.resetHintHistory().checkEachDeckForHint();
		if(this.hand.getNbCardsInDeck()>0){
			for(var k=0;k<10;k++){
				card=this.hand.getCard(this.hand.getCardOnTop().getIndex()-k);
				hintArray[hintArray.count]=card.getSimplified();
				hintArray.count++;
			}
			c2_callFunction("setSlot_name",["hand"]);
			return JSON.stringify(hintArray);
			// console.log("flash hand");
		}else{
			c2_callFunction("setSlot_name",["no hints"]);
			//console.log("gameOver");
			return JSON.stringify({});
		}
	}	
};
///////////$
window.Card = Card;
window.spiderVersion = new spiderVersion();
window.Deck = Deck;
window.Board = Board;
})();