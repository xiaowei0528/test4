(function(){
    /*************************************/
    var baseConverter = {};
    baseConverter.version = "1.0.1";
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
    window.compressLevel = function (levelObj, saveImg){
        if(typeof saveImg !== "boolean") saveImg = true;
        if(typeof levelObj === "string"){
            try{levelObj = JSON.parse(levelObj);}catch(e){ return "";}
        }else if(typeof levelObj !== "object") return "";
        //if(typeof levelObj[0] === "undefined") return "";
        //saveImg = saveImg && (typeof levelObj[0].image === "undefined");
        var currStair=0, toRet="", stairsArray = [], stairStr="";
        for(var aTile in levelObj){
            if(! levelObj.hasOwnProperty(aTile)) continue;
            if(levelObj[aTile].z > currStair){
                stairsArray.push(stairStr);
                currStair++;
                stairStr="";
            }
            if(saveImg){
                stairStr+=baseConverter.IntToBase(levelObj[aTile].tuileX*2, 36)+""+baseConverter.IntToBase(levelObj[aTile].tuileY*2, 36) + "" + baseConverter.IntToBase(levelObj[aTile].image + ((levelObj[aTile].image > 34) ? 1225 : 0), 36);
            }else{
                stairStr+=baseConverter.IntToBase(levelObj[aTile].x*2, 36)+""+baseConverter.IntToBase(levelObj[aTile].y*2, 36);
            }
        }
        stairsArray.push(stairStr);
        return ((saveImg) ? "_" : "") + stairsArray.join(";");
    };

    window.unCompressLevel = function (levelStr, asJSON, loadImg){
        if(typeof loadImg !== "boolean") loadImg = false;
        if(typeof asJSON !== "boolean") asJSON = false;
        if(typeof levelStr !== "string") return {};
        var lvlStrContainsImg = (levelStr.charAt(0) === "_"); if(lvlStrContainsImg) levelStr = levelStr.substr(1);
        loadImg = loadImg && lvlStrContainsImg;
        var toRet={}, stairs = levelStr.split(";"), tilesNb=0;
        for(var currStair=0; currStair < stairs.length; currStair++){
            var currStairTiles = (lvlStrContainsImg) ? stairs[currStair].match(/(.{2}z{1}[0-9]{1})|(.{3})/g) : stairs[currStair].match(/(.{2})/g); //.match(/.{2}/g);
            for(var tileInStair=0; tileInStair<currStairTiles.length; tileInStair++){
                if(loadImg){
                    toRet[tilesNb] = {x:baseConverter.baseToInt(String(currStairTiles[tileInStair]).slice(0, 1) ,36)/2, y:baseConverter.baseToInt(String(currStairTiles[tileInStair]).slice(1, 2) ,36)/2, image:baseConverter.baseToInt(String(currStairTiles[tileInStair]).slice(2, String(currStairTiles[tileInStair]).length) ,36), stair:currStair+1};
                    if(toRet[tilesNb].image > 1224) toRet[tilesNb].image -= 1225;
                }else{
                    toRet[tilesNb] = {x:baseConverter.baseToInt(String(currStairTiles[tileInStair]).slice(0, 1) ,36)/2, y:baseConverter.baseToInt(String(currStairTiles[tileInStair]).slice(1, 2) ,36)/2, stair:currStair+1};
                }
                tilesNb++;
            }
        }
        return (asJSON) ? JSON.stringify(toRet) : toRet;
    };
    Boolean.prototype.asInt = function(){
        return (this.valueOf()) ? 1 : 0;
    };
    function applyOffsetToCoords(currentValue, index, arr){
        var offset = this; //the offset is sent by "this"
        if(offset.length>index) return currentValue + offset[index];
        return currentValue;
    }

    var Tile = function(){
        this.logicZ = -1;
        this.logicX = -1;
        this.logicY = -1;
        this.image = -1;
        this.placed = false;

        //circular
        this.board;
    };
    Tile.prototype.MAX_IMAGE = 42;

    var Board = function(){
        this.lowestLogicZ = 5;
        this.highestLogicZ = 0;
        this.lowestLogicX = 9;
        this.highestLogicX = 0;
        this.lowestLogicY = 9;
        this.highestLogicY = 0;
        this.currentImageNumber = 0;

        // this.tiles = [];
        this.logicMap = {};

        this.imageDisplacement = Math.floor(Math.random()*34);
    };
    Board.prototype.MAX_LOGIC_X = 17;
    Board.prototype.MAX_LOGIC_Y = 17;
    Board.prototype.MAX_LOGIC_Z = 17;
    Board.prototype.MAXIMUM_FULLSTACK_RETRIES = 15;
    Board.prototype.COMPRESSOR_LAYER_SEPARATOR=";";
    Board.prototype.COMPRESSOR_TILE_SEPARATOR=",";
    Board.prototype.COMPRESSOR_BASE=36;

    Tile.prototype.setBoard = function(board){
        this.board = board;
        return this;
    };
    Tile.prototype.getBoard = function(){
        return this.board;
    };
    Tile.prototype.setLogicX = function(logicX){
        if(typeof logicX === "number" && 0 <= logicX && logicX <= Board.prototype.MAX_LOGIC_X) this.logicX = logicX;
        return this;
    };
    Tile.prototype.getLogicX = function(){
        return this.logicX;
    };
    Tile.prototype.setLogicY = function(logicY){
        if(typeof logicY === "number" && 0 <= logicY && logicY <= Board.prototype.MAX_LOGIC_Y) this.logicY = logicY;
        return this;
    };
    Tile.prototype.getLogicY = function(){
        return this.logicY;
    };
    Tile.prototype.setLogicZ = function(logicZ){
        if(typeof logicZ === "number" && 0 <= logicZ && logicZ <= Board.prototype.MAX_LOGIC_Z) this.logicZ = logicZ;
        return this;
    };
    Tile.prototype.getLogicZ = function(){
        return this.logicZ;
    };
    Tile.prototype.getCoords = function(){
        return [this.getLogicZ(),this.getLogicX(),this.getLogicY()];
    };
    Tile.prototype.setImage = function(image){
        if(typeof image === "number" && 0 <= image && image <= Tile.prototype.MAX_IMAGE) this.image = image;
        return this;
    };
    Tile.prototype.getImage = function(){
        return this.image;
    };
    Tile.prototype.isPlaced = function(isPlaced){
        if(typeof isPlaced === "undefined") return this.placed;
        if(typeof isPlaced !== "boolean") isPlaced = true;
        this.placed = isPlaced;
        return this;
    };
    Tile.prototype.canBePlayed = function(){
        return this.getBoard().tileCanBePlayed(this);
    };
    Tile.prototype.canBePlaced = function(){
        return this.getBoard().tileCanBePlaced(this);
    };
    Tile.prototype.hasTileAbove = function(){
        return this.getBoard().tileHasTileAbove(this);
    };
    Tile.prototype.hasTileOnBothSides = function(){
        return this.getBoard().tileHasTileOnBothSides(this);
    };
    Tile.prototype.hasTileOnLeftSide = function(){
        return this.getBoard().tileHasTileOnLeftSide(this);
    };
    Tile.prototype.hasTileOnRightSide = function(){
        return this.getBoard().tileHasTileOnRightSide(this);
    };

    Tile.prototype.hasNotPlacedTileAbove = function(){
        return this.getBoard().tileHasNotPlacedTileAbove(this);
    };
    Tile.prototype.hasNotPlacedTileOnBothSides = function(){
        return this.getBoard().tileHasNotPlacedTileOnBothSides(this);
    };
    Tile.prototype.hasNotPlacedTileOnLeftSide = function(){
        return this.getBoard().tileHasNotPlacedTileOnLeftSide(this);
    };
    Tile.prototype.hasNotPlacedTileOnRightSide = function(){
        return this.getBoard().tileHasNotPlacedTileOnRightSide(this);
    };
    Tile.prototype.simplify = function(){
        return {
             x:this.getLogicX()
            ,y:this.getLogicY()
            ,z:this.getLogicZ()
            ,i:this.getImage()
        };
    };


    Board.prototype.setLowestX = function(lowestLogicX){
        if(typeof lowestLogicX === "number" && lowestLogicX < this.lowestLogicX) this.lowestLogicX = lowestLogicX;
        return this;
    };
    Board.prototype.getLowestX = function(){
        return this.lowestLogicX;
    };
    Board.prototype.setLowestY = function(lowestLogicY){
        if(typeof lowestLogicY === "number" && lowestLogicY < this.lowestLogicY) this.lowestLogicY = lowestLogicY;
        return this;
    };
    Board.prototype.getLowestY = function(){
        return this.lowestLogicY;
    };
    Board.prototype.setLowestZ = function(lowestLogicZ){
        if(typeof lowestLogicZ === "number" && lowestLogicZ < this.lowestLogicZ) this.lowestLogicZ = lowestLogicZ;
        return this;
    };
    Board.prototype.getLowestZ = function(){
        return this.lowestLogicZ;
    };
    Board.prototype.setHighestX = function(highestLogicX){
        if(typeof highestLogicX === "number" && highestLogicX < this.highestLogicX) this.highestLogicX = highestLogicX;
        return this;
    };
    Board.prototype.getHighestX = function(){
        return this.highestLogicX;
    };
    Board.prototype.setHighestY = function(highestLogicY){
        if(typeof highestLogicY === "number" && highestLogicY < this.highestLogicY) this.highestLogicY = highestLogicY;
        return this;
    };
    Board.prototype.getHighestY = function(){
        return this.highestLogicY;
    };
    Board.prototype.setHighestZ = function(highestLogicZ){
        if(typeof highestLogicZ === "number" && highestLogicZ < this.highestLogicZ) this.highestLogicZ = highestLogicZ;
        return this;
    };
    Board.prototype.getHighestZ = function(){
        return this.highestLogicZ;
    };

    Board.prototype.getNextImage = function(){
        return (this.currentImageNumber++ + this.imageDisplacement)%42;
    };
    Board.prototype.getPlayableTilesArr = function(){
        var playableTiles = [];
        for(var aTile in this.logicMap) if(this.logicMap.hasOwnProperty(aTile) && this.logicMap[aTile].canBePlayed()) playableTiles.push(this.logicMap[aTile]);
        return playableTiles;
    };
    Board.prototype.getUnplayableTilesArr = function(){
        var unplayableTiles = [];
        for(var aTile in this.logicMap) if(this.logicMap.hasOwnProperty(aTile) && this.logicMap[aTile].canBePlayed()==false) unplayableTiles.push(this.logicMap[aTile]);
        return unplayableTiles;
    };
    Board.prototype.getMatchableAndPlayableTilesArr = function(){
        var playableTiles = this.getPlayableTilesArr();
        for(var i = playableTiles.length-1; i >= 0; i--){
            for(var j=0; j<playableTiles.length; j++){
                if(this.areTilesMatching(playableTiles[i], playableTiles[j])){
                    return [playableTiles[i], playableTiles[j]];
                }
            } 
        } 
        return [];
    };
    Board.prototype.getNotPlacedTilesArr = function(){
        var placableTiles = [];
        for(var aTile in this.logicMap) if(this.logicMap.hasOwnProperty(aTile) && ! this.logicMap[aTile].isPlaced()) placableTiles.push(this.logicMap[aTile]);
        return placableTiles;
    };
    Board.prototype.getTileAt = function(z, x, y, defaultRet){
        // considering x,y and z are OK
        if(typeof this.logicMap[z+"_"+x+"_"+y] !== "undefined") return this.logicMap[z+"_"+x+"_"+y];
        return defaultRet;
    };
    Board.prototype.createTileAt = function(z, x, y, image){
        // considering x,y and z are OK
        if(typeof image !== "number") image = -1;
        this.logicMap[z+"_"+x+"_"+y] = (new Tile()).setBoard(this).setLogicZ(z).setLogicX(x).setLogicY(y);
        if(image !== -1) this.logicMap[z+"_"+x+"_"+y].setImage(image).isPlaced(true);
        return this;
    };
    Board.prototype.buildStack = function(stateToCreate, loadImages){
        if(typeof loadImages !== "boolean") loadImages = true;
        if(typeof stateToCreate === "string"){
            if(stateToCreate.indexOf("{") !== -1){ //json
                stateToCreate = JSON.parse(stateToCreate);
            } else { //compressed
                var uncompressed = [],
                    stairsArray = stateToCreate.split(Board.prototype.COMPRESSOR_LAYER_SEPARATOR),
                    tileInCurrentStairArray;

                for(var z = 0; z<stairsArray.length; z++){
                    tileInCurrentStairArray = stairsArray[z].split(Board.prototype.COMPRESSOR_TILE_SEPARATOR);
                    for(var aTile=0; aTile<tileInCurrentStairArray.length; aTile++){
                        var currentTile={
                            z:z,
                            x:baseConverter.baseToInt(tileInCurrentStairArray[aTile].charAt(0),Board.prototype.COMPRESSOR_BASE)/2,
                            y:baseConverter.baseToInt(tileInCurrentStairArray[aTile].charAt(1),Board.prototype.COMPRESSOR_BASE)/2
                        }
                        if(loadImages && (""+tileInCurrentStairArray[aTile]).length>2) currentTile.i=baseConverter.baseToInt(tileInCurrentStairArray[aTile].substring(2, tileInCurrentStairArray[aTile].length), Board.prototype.COMPRESSOR_BASE)
                        else loadImages = false;
                        uncompressed.push(currentTile);
                    }
                }//console.log("uncompressed:",uncompressed);
                stateToCreate = uncompressed;
            }
        } // else it is already an object
        for(var aTile in stateToCreate){
            if(! stateToCreate.hasOwnProperty(aTile)) continue;
            if(loadImages && typeof stateToCreate[aTile].i === "number") this.createTileAt(stateToCreate[aTile].z, stateToCreate[aTile].x, stateToCreate[aTile].y, stateToCreate[aTile].i);
            else this.createTileAt(stateToCreate[aTile].z, stateToCreate[aTile].x, stateToCreate[aTile].y);
        }
        return this;
    };
     Board.prototype.buildStackForLevelSelect = function(stateToCreate, loadImages){
        if(typeof loadImages !== "boolean") loadImages = true;
        if(typeof stateToCreate === "string"){
            if(stateToCreate.indexOf("{") !== -1){ //json
                stateToCreate = JSON.parse(stateToCreate);
            } else { //compressed
                var uncompressed = [],
                    stairsArray = stateToCreate.split(Board.prototype.COMPRESSOR_LAYER_SEPARATOR),
                    tileInCurrentStairArray;

                for(var z = 0; z<stairsArray.length; z++){
                    tileInCurrentStairArray = stairsArray[z].split(Board.prototype.COMPRESSOR_TILE_SEPARATOR);
                    for(var aTile=0; aTile<tileInCurrentStairArray.length; aTile++){
                        var currentTile={
                            z:z,
                            x:baseConverter.baseToInt(tileInCurrentStairArray[aTile].charAt(0),Board.prototype.COMPRESSOR_BASE)/2,
                            y:baseConverter.baseToInt(tileInCurrentStairArray[aTile].charAt(1),Board.prototype.COMPRESSOR_BASE)/2
                        }
                        if(loadImages && (""+tileInCurrentStairArray[aTile]).length>2) currentTile.i=baseConverter.baseToInt(tileInCurrentStairArray[aTile].substring(2, tileInCurrentStairArray[aTile].length), Board.prototype.COMPRESSOR_BASE)
                        else loadImages = false;
                        uncompressed.push(currentTile);
                    }
                }//console.log("uncompressed:",uncompressed);
            }
        } // else it is already an object
        
        return uncompressed;
    };
    Board.prototype.paintAndPlaceNotPlacedTiles = function(){
        var maximumFullstackTries = Board.prototype.MAXIMUM_FULLSTACK_RETRIES, notPaintedTilesArr = this.getNotPlacedTilesArr();
        while(maximumFullstackTries--){
            //console.log("Starting fullstack try", (Board.prototype.MAXIMUM_FULLSTACK_RETRIES-maximumFullstackTries)," /", Board.prototype.MAXIMUM_FULLSTACK_RETRIES); 

            var notPaintedTilesArrForThisTry = notPaintedTilesArr.slice(0),
                pairsToPaint = notPaintedTilesArrForThisTry.length/2,
                maxTriesPerBranch = notPaintedTilesArrForThisTry.length;
           
            while(pairsToPaint>0 && maxTriesPerBranch--){
                var TilesToPaint = notPaintedTilesArrForThisTry.slice(0), aFirstTileToPaint, aSecondTileToPaint;
                //console.log("TilesToPaint : ", TilesToPaint.length);
                while((aFirstTileToPaint = TilesToPaint.splice(Math.floor(Math.random()*TilesToPaint.length), 1)[0]) && ! aFirstTileToPaint.canBePlaced()){
                    //looking for aFirstTileToPaint that can be played
                }
                if(typeof aFirstTileToPaint === "undefined"){
                    console.error("ENABLE TO CREATE A PAIR."); break;
                } 

                while((aSecondTileToPaint = TilesToPaint.splice(Math.floor(Math.random()*TilesToPaint.length), 1)[0]) && ! aSecondTileToPaint.canBePlaced()){
                    //looking for aSecondTileToPaint that can be played
                }
                if(typeof aSecondTileToPaint === "undefined") {
                    continue; //try with another aFirstTileToPaint
                }
                var pairImage = this.getNextImage(), isSecond = false;
                //console.log("PAIR FOUND color", pairImage);
                aFirstTileToPaint.setImage(pairImage).isPlaced(true);
                aSecondTileToPaint.setImage(pairImage).isPlaced(true);
                pairsToPaint--;
                for(var aTile = notPaintedTilesArrForThisTry.length-1; aTile>=0; aTile--){
                    if((notPaintedTilesArrForThisTry[aTile].getCoords().toString() === aFirstTileToPaint.getCoords().toString() || notPaintedTilesArrForThisTry[aTile].getCoords().toString() === aSecondTileToPaint.getCoords().toString())){
                        notPaintedTilesArrForThisTry.splice(aTile, 1);
                        //console.log("removing a tile");
                        if(!isSecond) isSecond = true; else break;
                    }
                }
            }
            if(pairsToPaint === 0){
               // console.log("DONE in ", Board.prototype.MAXIMUM_FULLSTACK_RETRIES-maximumFullstackTries, "tries");
                return true;
            }
            //reset tiles for the next try
           // console.warn("can't match more pair, let's start over");
            notPaintedTilesArr.map(function(aTile){aTile.isPlaced(false);});
        }
        console.error('UNABLE TO PAINT STACK IN THE ALLOWED TRIES');
        return false;
    };
    Board.prototype.tileCanBePlayed = function(tileToCheck){
        return (! tileToCheck.hasTileAbove() && ! tileToCheck.hasTileOnBothSides())
    };
    Board.prototype.tileCanBePlaced = function(tileToCheck){
        return (! tileToCheck.hasNotPlacedTileAbove() && ! tileToCheck.hasNotPlacedTileOnBothSides(true))
    };
    Board.prototype.tileHasAtLeastOnePlacedTileAtOffsets = function(tileToCheck, offsets){
        for(var anOffset=0; anOffset<offsets.length; anOffset++){
            var testedCoords = tileToCheck.getCoords().map(applyOffsetToCoords, offsets[anOffset]),
                testedTile = this.getTileAt.apply(this, testedCoords);
            if(typeof testedTile !== "undefined" && testedTile.isPlaced() === true) return true;
        }
        return false;
    };
    Board.prototype.tileHasTileAbove = function(tileToCheck){
        var offsets = [ [1,-0.5,-0.5],  [1, 0,-0.5],    [1,0.5,-0.5],
                        [1,-0.5, 0  ],  [1,/**/0,0],    [1, 0.5, 0  ],
                        [1,-0.5, 0.5],  [1, 0, 0.5],    [1, 0.5, 0.5]
                    ]; //[z,x,y]
        return this.tileHasAtLeastOnePlacedTileAtOffsets(tileToCheck,offsets);
    };
    Board.prototype.tileHasTileOnLeftSide = function(tileToCheck){
        var offsets = [ [0, -1,-0.5],
                        [0, -1, 0  ],       /**/
                        [0, -1, 0.5]
                    ]; //[z,x,y]
        return this.tileHasAtLeastOnePlacedTileAtOffsets(tileToCheck,offsets);
    };
    Board.prototype.tileHasTileOnRightSide = function(tileToCheck){
        var offsets = [                                 [0, 1,-0.5],
                                           /**/         [0, 1, 0  ],
                                                        [0, 1, 0.5]
                    ]; //[z,x,y]
        return this.tileHasAtLeastOnePlacedTileAtOffsets(tileToCheck,offsets);
    };
    Board.prototype.tileHasAtLeastOneNotPlacedTileAtOffsets = function(tileToCheck, offsets){
        for(var anOffset=0; anOffset<offsets.length; anOffset++){
            var testedCoords = tileToCheck.getCoords().map(applyOffsetToCoords, offsets[anOffset]),
                testedTile = this.getTileAt.apply(this, testedCoords);
            if(typeof testedTile !== "undefined" && testedTile.isPlaced() === false) return true;
        }
        return false;
    };
    Board.prototype.tileHasNotPlacedTileAbove = function(tileToCheck){
        var offsets = [ [1,-0.5,-0.5],  [1, 0,-0.5],    [1,0.5,-0.5],
                        [1,-0.5, 0  ],  [1,/**/0,0],    [1, 0.5, 0  ],
                        [1,-0.5, 0.5],  [1, 0, 0.5],    [1, 0.5, 0.5]
                    ]; //[z,x,y]
        return this.tileHasAtLeastOneNotPlacedTileAtOffsets(tileToCheck,offsets);
    };
    Board.prototype.tileHasNotPlacedTileOnLeftSide = function(tileToCheck){
        var offsets = [ [0, -1,-0.5],
                        [0, -1, 0  ],       /**/
                        [0, -1, 0.5]
                    ]; //[z,x,y]
        return this.tileHasAtLeastOneNotPlacedTileAtOffsets(tileToCheck,offsets);
    };
    Board.prototype.tileHasNotPlacedTileOnRightSide = function(tileToCheck){
        var offsets = [                                 [0, 1,-0.5],
                                           /**/         [0, 1, 0  ],
                                                        [0, 1, 0.5]
                    ]; //[z,x,y]
        return this.tileHasAtLeastOneNotPlacedTileAtOffsets(tileToCheck,offsets);
    };

    Board.prototype.tileHasTileOnBothSides = function(tileToCheck){
        return (tileToCheck.hasTileOnRightSide() && tileToCheck.hasTileOnLeftSide());
    };

    Board.prototype.tileHasNotPlacedTileOnBothSides = function(tileToCheck){
        return (tileToCheck.hasNotPlacedTileOnRightSide() && tileToCheck.hasNotPlacedTileOnLeftSide());
    };
    // public 
    Board.prototype.getTilesRemainingCount = function(){
        return Object.keys(this.logicMap).length;
    };

    Board.prototype.areTilesMatching = function(tileA, tileB){
        if(tileA.getCoords().toString() === tileB.getCoords().toString()) return false;
        if(tileA.getImage() >= 34 && tileB.getImage() >= 34){ // FYI flowers are 34,35,36,37 and seasons are 38;39;40;41.
            return (Math.floor((tileA.getImage()-34)/4) === Math.floor((tileB.getImage()-34)/4));
        }
        return (tileA.getImage() === tileB.getImage());
    };

    Board.prototype.getAllTiles = function(){
        var allTiles = [];
        for(var aTile in this.logicMap) if(this.logicMap.hasOwnProperty(aTile)) allTiles.push(this.logicMap[aTile]);
        return allTiles;
    };

    Board.prototype.getCompressed = function(withImages){
        if(typeof withImages !== "boolean") withImages = true;

        var logicMapKeys = Object.keys(this.logicMap),
            currentLayer=0,
            currentTile,
            isNewLayer=false;
        var toRet="";
        for(var aKey=0; aKey<logicMapKeys.length; aKey++){
            isNewLayer=false;
            if(currentLayer !== parseInt(logicMapKeys[aKey].charAt(0))){
                currentLayer = parseInt(logicMapKeys[aKey].charAt(0));
                toRet+=Board.prototype.COMPRESSOR_LAYER_SEPARATOR;
                isNewLayer=true;
            }
            currentTile = this.logicMap[logicMapKeys[aKey]];
            toRet+=((isNewLayer)?"":Board.prototype.COMPRESSOR_TILE_SEPARATOR)
            if(withImages && currentTile.getImage() !== -1)  toRet+=baseConverter.IntToBase(currentTile.getLogicX()*2, Board.prototype.COMPRESSOR_BASE) + "" + baseConverter.IntToBase(currentTile.getLogicY()*2, Board.prototype.COMPRESSOR_BASE) + "" + baseConverter.IntToBase(currentTile.getImage(), Board.prototype.COMPRESSOR_BASE);
            else toRet+=baseConverter.IntToBase(currentTile.getLogicX()*2, Board.prototype.COMPRESSOR_BASE) + "" + baseConverter.IntToBase(currentTile.getLogicY()*2, Board.prototype.COMPRESSOR_BASE);
        }
        return toRet.substring(1);
    };

    ////////
    
    var Game = function(){
        this.board;
    };
    Game.prototype.resetBoard = function(){
        this.board = new Board();
        return this;
    };
    Game.prototype.newGame = function(config, withImages){
        this.resetBoard();
        this.board.buildStack(config, withImages);
        return this.board.paintAndPlaceNotPlacedTiles();
    };
    Game.prototype.getLevelSelectTiles= function(config,withImages){
         if(typeof withImages !== "boolean") withImages = false;
          this.resetBoard();
         var newArray=this.board.buildStackForLevelSelect(config, withImages);
         var jsonList={};
         for(var i=0;i<newArray.length;i++){
            jsonList[i]=newArray[i];
         } 
        return JSON.stringify(jsonList);
    };
    Game.prototype.shuffle = function(){
        this.board.getAllTiles().map(function(tile){tile.isPlaced(false)});
        return this.board.paintAndPlaceNotPlacedTiles();
    };
    Game.prototype.play = function(tileA, tileB){
        if(typeof tileA === "string") tileA = tileA.split(',');
        if(typeof tileB === "string") tileB = tileB.split(',');
        if(typeof tileA.push === "function") tileA = this.board.getTileAt.apply(this.board, tileA);
        if(typeof tileB.push === "function") tileB = this.board.getTileAt.apply(this.board, tileB);
        window.tileA = tileA;
        if(!tileA.canBePlayed() || !tileB.canBePlayed()) return false;
    
        if(!this.board.areTilesMatching(tileA, tileB)) return false;
    
        delete this.board.logicMap[tileA.getCoords().join("_")];
        delete this.board.logicMap[tileB.getCoords().join("_")];
    
        return true;
    };
    Game.prototype.getPlayable=function(){
        return JSON.stringify(this.board.getPlayableTilesArr().map(function(tile){return tile.simplify();}));
    };
    Game.prototype.getUnplayable=function(){
        return JSON.stringify(this.board.getUnplayableTilesArr().map(function(tile){return tile.simplify();}));
    };
    Game.prototype.getHint=function(){
        var newArray=this.board.getMatchableAndPlayableTilesArr().map(function(tile){return tile.simplify();});
        var jsonList={};
         for(var i=0;i<newArray.length;i++){
            jsonList[i]=newArray[i];
         }
         
       return JSON.stringify(jsonList);
    };
    Game.prototype.getBoard=function(compressed, withImages){
        if(compressed) return this.board.getCompressed(withImages);
        return JSON.stringify(this.board.getAllTiles().map(function(tile){return tile.simplify();}));
    };
    Game.prototype.getNbTilesOnBoard = function(){
        return Object.keys(this.board.logicMap).length;
    };
    Game.prototype.getNbofPair=function(){
         return (Object.keys(this.board.logicMap).length)/2;
    };
    Game.prototype.getMinTimeToGetStar=function(timePerMatchingPair,nbOfPair){
        return (timePerMatchingPair*nbOfPair);
    };
    Game.prototype.checkArray=function(waitingArray,functionCall){
    //var oups=testingArray.length;
    //console.log(testingArray);
    for (var i = 0; i < waitingArray.length; i++) {
        if(waitingArray[i].callback == functionCall){
            return true;
        }
    }
    return false;
};
Game.prototype.getIDFunction=function(waitingArray,functionCall){
    for (var i = 0; i < waitingArray.length; i++) {
        if(waitingArray[i].callback == functionCall){
            //console.log(testingArray);
            return (waitingArray[i].id);
        }
    }
    return false;


};

    window.Game = Game;
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