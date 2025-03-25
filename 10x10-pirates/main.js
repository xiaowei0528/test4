;(function(){
	function getDist(obj,item1,item2){
		if(!obj.dist){obj.dist = {};}
		if(obj.dist[item1.uid+"_"+item2.uid]){return obj.dist[item1.uid+"_"+item2.uid];}
		if(obj.dist[item2.uid+"_"+item1.uid]){return obj.dist[item2.uid+"_"+item1.uid];}
		return obj.dist[item1.uid+"_"+item2.uid] = Pos.distPos(item1.pos,item2.pos);
	}

	function prepareList(obj){
		obj.filter = {};
		obj.filter.idGroupIsNotBase = {};
		obj.filter.isBaseIsNotOccupied = {};
		for(var i in obj.shape){
			let item = obj.shape[i];
			item.x = Math.round(item.x);
			item.y = Math.round(item.y);
			item.pos = new Pos(item.x,item.y,item.uid);
			if(item.isBase){
				if(!item.isOccupied){obj.filter.isBaseIsNotOccupied[i] = item;}
			}
			if(item.idGroup == obj.config.idGroup){
				if(!item.isBase){obj.filter.idGroupIsNotBase[i] = item;}

			}
		}
	}

	function getOrderedListDist(obj,itemStart,list,maxDist,distOffset){
		maxDist = (typeof maxDist == "undefined")?obj.config.maxDistance:maxDist;
		let listOrdered = [];
		for(var i in list){
			let dist = 0;
			if(typeof distOffset == "undefined"){dist = Math.abs(getDist(obj,itemStart,list[i]));}
			else{
				dist = Math.abs(Pos.distPos(Pos.sumPos(itemStart.pos,distOffset),list[i].pos));
			}
			if(dist > maxDist){continue;}
			list[i].dist = dist;
			listOrdered.push(list[i]);
		}
		return listOrdered.sort(function(a,b){return a.dist - b.dist});
	}

	window.compareShape = function(json){
		let obj = (typeof json == "string") ? JSON.parse(json) : json;
		prepareList(obj);

		//check if every shape as shapeFamilly in range
		for(let i in obj.filter.idGroupIsNotBase){
			let item1 = obj.filter.idGroupIsNotBase[i];
			let found = false;
			for(let y in obj.filter.isBaseIsNotOccupied){
				let item2 = obj.filter.isBaseIsNotOccupied[y];
				if(item1.uid == item2.uid){continue;}
				if(Math.abs(getDist(obj,item1,item2)) <= obj.config.maxDistance){
					found = true;
					break;
				}
			}
			if(!found){return false;}
		}

		//check if we can place the shape
		for(let i in obj.filter.idGroupIsNotBase){
			let item1 = obj.filter.idGroupIsNotBase[i];
			let listOrdered = getOrderedListDist(obj,item1,obj.filter.isBaseIsNotOccupied);
			for(let y in listOrdered){
				let item2 = listOrdered[y];
				if(item1.uid == item2.uid){continue;}
				if(compareShape_contain(obj,new Pos(item2.x - item1.x,item2.y - item1.y))){
					return true;
				}
			}
		}
		return false;
	}

	function compareShape_contain(obj,distOffset){
		var shapeToSend = [];
		for(let i in obj.filter.idGroupIsNotBase){
			let item1 = obj.filter.idGroupIsNotBase[i];
			let listOrdered = getOrderedListDist(obj,item1,obj.filter.isBaseIsNotOccupied,obj.config.distOneShape,distOffset);
			if(listOrdered.length > 0){
				let item2 = listOrdered[0];
				shapeToSend.push([item1.uid,item2.uid]);
			}
			else{return false;}
		}
		c2_callFunction("compareShape_setShapeBaseId_array",[JSON.stringify(shapeToSend)]);
		return true;
	}
	
	class Pos {
		constructor(x,y,uid) {
			this.x = x;
			this.y = y;
			this.uid = (typeof uid == "undefined")?-1:uid;
		}
	
		static equal(pos1,pos2){
			return (pos1.x == pos2.x && pos1.y == pos2.y);
		}
		static sort(a,b){
			if(a.x > b.x || a.y > b.y){return 1;}
			return -1;
		}
	
		static sumPos(pos1,pos2){
			return new Pos(pos1.x+pos2.x,pos1.y+pos2.y);
		}
		
		static distPos(pos1,pos2){
			return cr.distanceTo(pos1.x,pos1.y,pos2.x,pos2.y)
		}
	
		//-----
		isEqual(pos){
			return this.constructor.equal(this,pos);
		}
	
		getCopy(){
			return new Pos(this.x,this.y,this.uid);
		}

		setUid(uid){
			this.uid = uid;
			return this;
		}
	}
})();

