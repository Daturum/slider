// helper for enabling IE 8 event bindings
function addEvent(el, type, handler) {
    if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
}

// live binding helper
function live(selector, event, callback, context) {
    addEvent(context || document, event, function(e) {
        var found, el = e.target || e.srcElement;
        while (el && !(found = el.id == selector)) el = el.parentElement;
        if (found) callback.call(el, e);
    });
}







function AjaxSlider(sliderItem){

	/*************  Variables **************************************/

	this._touchPos = 0;

	this.sliderItem = document.getElementById(sliderItem);
	this.container = this.sliderItem.getElementsByClassName("container")[0];
	this.loaderItem = this.sliderItem.getElementsByClassName("loader-item")[0];
	this.sensitivity = 30;
	this._sliderPosition = 0;
	this.leftButton = this.sliderItem.getElementsByClassName("left-button")[0];
	this.rightButton = this.sliderItem.getElementsByClassName("right-button")[0];
	this.itemWidth = 0;
	this._sliderItems = [];

	this.totalItems = 65535;
	this.rightItemNumber = 0;
	this.leftItemNumber = 0;
	this.downloadedItems = 10;
	this.itemCapacity = 100;
	this._itemsStack = 0;

	this._pressed = false;
	const TIMER_INTERVAL = 30;
	this._speedConstant = 0.1;
	this._monitoring = {
		time: 0,
		position: 0,
		previousPosition: 0
	}
	this._speed = 0;
	this._timer1 = null;
	this._timer2 = null;

	this.itemLoader = function(k,appendToRight){
		throw "Please, define AjaxSlider.prototype.itemLoader property for slider to work correctly. See https://github.com/serik1987/slider/wiki/%D0%A4%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8,-%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5-%D0%BA%D0%BE%D1%82%D0%BE%D1%80%D1%8B%D1%85-%D0%BD%D0%B5%D0%BE%D0%B1%D1%85%D0%BE%D0%B4%D0%B8%D0%BC%D0%BE-%D0%B4%D0%BB%D1%8F-%D0%BA%D0%BE%D1%80%D1%80%D0%B5%D0%BA%D1%82%D0%BD%D0%BE%D0%B9-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%8B-%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D0%B5%D1%80%D0%B0 for details";
	}







	/**************************  Functions **********************************************/


	this.getSliderItem = function(k){
		return this._sliderItems[k];
	}

	this.getSliderItemCount = function(){
		return this._sliderItems.length;
	}

	this.getAllItemCount = function(){
		return this.container.children.length;
	}


	this.getPosition = function() {
		return this._sliderPosition;
	}

	this.getPositionElem = function() {
		return Math.floor(this._sliderPosition/this.itemWidth);
	}

	this.getPositionLeft = function() {
		var css = getComputedStyle(this.container);
		var w = parseInt(css.width.match(/^\d+/));
		return this._sliderPosition + w;
	}

	this.getPositionLeftElem = function(){
		return Math.floor(this.getPositionLeft()/this.itemWidth);
	}

	this.leftLoadingCondition = function(){
		return this.getSliderItem(this.getSliderItemCount()-1).getBoundingClientRect().left>this.container.getBoundingClientRect().left;
	}

	this.rightLoadingCondition = function(){
		var padd = parseInt(getComputedStyle(this.container).paddingRight.match(/\d+/));
		return this.getSliderItem(0).getBoundingClientRect().right<slider.container.getBoundingClientRect().right;
	}

	/* Setting position in pixels */
	this.setPosition = function(n){

		/* Correcting slider position */
		this.leftButton.classList.remove("inactive");
		this.rightButton.classList.remove("inactive");
		if (n<=0){
			n=0;
			this.rightButton.classList.add("inactive");
		}

		var totalLength = this.getAllItemCount()*slider.itemWidth;
		totalLength -= parseInt(getComputedStyle(this.container).width.match(/^\d+/));
		totalLength -= parseInt(getComputedStyle(this._sliderItems[1]).marginRight.match(/^\d+/));
		if (n>=totalLength){
			n=totalLength;
			this.leftButton.classList.add("inactive");
		}



		/* Setting slider position */
		var allItems = this.container.getElementsByClassName("slider-item");
		for (var i=0; i<allItems.length; i++){
			allItems[i].style["-o-transform"] = "translateX("+n+"px)";
			allItems[i].style["-moz-transform"] = "translateX("+n+"px)";
			allItems[i].style["-webkit-transform"] = "translateX("+n+"px)";
			allItems[i].style.transform = "translateX("+n+"px)";
		}
		this._sliderPosition = n;


		/* Launching autoloaders */
		if (this.leftLoadingCondition() && this._itemsStack===0 && this.rightItemNumber < this.totalItems){
			for (var i=0; i<this.downloadedItems; i++){
				if (this.rightItemNumber < this.totalItems) {
					this._itemsStack++;
					this.rightItemNumber++;
					this.itemLoader(this.rightItemNumber,false);
				}
			}
		}

		if (this.rightLoadingCondition() && this._itemsStack===0 && this.leftItemNumber>1){
			console.log("Loading items to right")
			for (var i=0; i<this.downloadedItems; i++){
				if (this.leftItemNumber > 1){
					this._itemsStack++;
					this.leftItemNumber--;
					this.itemLoader(this.leftItemNumber,true);
				}
			}
		}
	}

	this.appendItem = function(html,appendToRight){
		this._itemsStack--;
		var div = document.createElement("div");
		div.classList.add("slider-item");
		div.innerHTML = html;
		div.style.transition = "none";
		var parent = this.container;
		var positionCorrector = 0;

		if (appendToRight){
			// append to right
			var it = this.getSliderItem(0);
			parent.insertBefore(div,it);
			this._sliderItems.unshift(div);
			positionCorrector += this.itemWidth;
			while (this.getSliderItemCount()>this.itemCapacity){
				this.removeItemFromLeft();
			}
		} else {
			// append to left
			var it = this.getLoadersInLeft();
			if (it.length>0){
				parent.insertBefore(div,it[0]);
			} else {
				parent.appendChild(div);
			}
			this._sliderItems.push(div);
			while (this.getSliderItemCount()>this.itemCapacity){
				positionCorrector += this.removeItemFromRight();
			}
		}

		this.updateLoaderInLeft();
		positionCorrector += this.updateLoaderInRight();

		this.setPosition(this.getPosition()+positionCorrector);

		div.style.transition = "";
	}

	this.removeItemFromLeft = function(){
		var itemToRemove = this._sliderItems.pop();
		this.rightItemNumber--;
		itemToRemove.remove();
	}

	this.removeItemFromRight = function(){
		var itemToRemove = this._sliderItems.shift();
		this.leftItemNumber++;
		itemToRemove.remove();
		return -this.itemWidth;
	}

	this.addLoaderToLeft = function(){
		var loader = this.loaderItem.cloneNode(true);
		loader.classList.add("trailing-loader-item");
		this.container.appendChild(loader);
	}

	this.getLoadersInLeft = function(){
		return this.container.getElementsByClassName("trailing-loader-item");
	}

	this.removeLoaderFromLeft = function(){
		var items = this.getLoadersInLeft();
		while (items.length>0){
			items[0].remove();
		}
	}

	this.updateLoaderInLeft = function(){
		this.removeLoaderFromLeft();
		var itemsToAdd = this.totalItems-this.rightItemNumber;
		var loadersToAppend = this.downloadedItems;
		if (loadersToAppend > itemsToAdd) loadersToAppend = itemsToAdd;
		for (var i=0; i<loadersToAppend; i++){
			this.addLoaderToLeft();
		}
	}

	this.addLoaderToRight = function(){
		var loader = this.loaderItem.cloneNode(true);
		loader.classList.add("leading-loader-item");
		this.container.insertBefore(loader, this.container.children[0]);
	}

	this.getLoadersInRight = function(){
		return this.container.getElementsByClassName("leading-loader-item");
	}

	this.removeLoaderFromRight = function(){
		var items = this.getLoadersInRight();
		while (items.length>0){
			items[0].remove();
		}
	}

	this.updateLoaderInRight = function(){
		var loadersNumber1 = this.getLoadersInRight().length;
		var loaders2add = this.leftItemNumber-1;
		if (loaders2add > this.downloadedItems) loaders2add = this.downloadedItems;
		this.removeLoaderFromRight();
		for (var i=0; i<loaders2add; i++){
			this.addLoaderToRight();
		}
		var loadersNumber2 = this.getLoadersInRight().length;
		return (loadersNumber2-loadersNumber1)*this.itemWidth;
	}

	this.getSpeedConstant = function(){
		return this._speedConstant;
	}

	this.setSpeedConstant = function(val){

		if (val<0){
			throw "Slider.prototype.setSpeedConstant: negative speed constant is impossible";
		}

		if (val>0.03){
			throw "Slider.prototype.setSpeedConstant: the speed constant is too large. See https://github.com/serik1987/slider/wiki/%D0%98%D0%BD%D0%B5%D1%80%D1%86%D0%B8%D0%BE%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D1%8C-%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D0%B5%D1%80%D0%B0 for details";
		}

		this._speedConstant = val*TIMER_INTERVAL;
	}

	this._timer1Function = function(){
		this._monitoring.time += TIMER_INTERVAL;
		this._monitoring.previousPosition = this._monitoring.position;
		this._monitoring.position = this.getPosition();
	}

	this._timer2Function = function(){
		/* console.log(this._speed); */

		this.setPosition(this.getPosition()+this._speed);

		if (Math.abs(this._speed)<=1){
			clearInterval(this._timer2);
			this._timer2 = null;
		} else {
			this._speed = (1-this._speedConstant)*this._speed;
		}
	}







	/********************************* Events **********************************************/

	var mouseDownFunc = function(evt){
		evt.preventDefault();
		this._pressed = true;
		this._monitoring.time=0;
		this._monitoring.position = this._monitoring._previousPosition = this.getPosition();
		this._timer1 = setInterval(this._timer1Function.bind(this),TIMER_INTERVAL);
		this._timer1Function();
		if (this._timer2!==null){
			clearInterval(this._timer2);
			this._timer2=null;
		}
	}

	addEvent(this.container,"mousedown",mouseDownFunc.bind(this));
	addEvent(this.container,"touchstart",function(evt){
		mouseDownFunc.call(this,evt);
		this._touchPos = evt.changedTouches.item(0).clientX;
		// document.getElementById("output").innerHTML = this._touchPos;
	}.bind(this));

	var mouseUpFunc = function(){
		if (this._pressed){
			this._speed = this._monitoring.position - this._monitoring.previousPosition;
			console.log("Slider speed: "+this._speed);
			this._pressed = false;
			this._timer2 = setInterval(this._timer2Function.bind(this),TIMER_INTERVAL);
			this._timer2Function();
			if (this._timer1!==null){
				clearInterval(this._timer1);
				this._timer1=null;
			}
		}
	}

	addEvent(window,"mouseup",mouseUpFunc.bind(this));
	addEvent(window,"touchend",mouseUpFunc.bind(this));
	addEvent(window,"touchcancel",mouseUpFunc.bind(this));

	addEvent(this.container,"mousemove",function(evt){
		if (this._pressed){
			this.setPosition(this.getPosition()+evt.movementX);
		}
	}.bind(this));

	addEvent(this.container,"touchmove",function(evt){
		if (this._pressed && evt.changedTouches.length===1){
			var x = evt.changedTouches.item(0).clientX;
			// document.getElementById("output").innerHTML = x - this._touchPos;
			this.setPosition(this.getPosition()+(x-this._touchPos));
			this._touchPos = x;
		}
	}.bind(this));


	addEvent(this.leftButton,"click",function(){
		this.setPosition(this._sliderPosition+this.sensitivity);
	}.bind(this));

	addEvent(this.rightButton,"click",function(){
		this.setPosition(this._sliderPosition-this.sensitivity);
	}.bind(this));
	this.rightButton.classList.add("inactive");

	addEvent(window,"resize",function(){
		this.setPosition(this.getPosition());
	}.bind(this));










	/********************************** Constructor **************************************/


	var bufferItem = this.sliderItem.getElementsByClassName("buffer")[0];
	var availableItems = bufferItem.children;
	var itemWidthComputed = false;

	// Moving items from buffer to container
	while (availableItems.length!==0){
		this._sliderItems.push(availableItems[0]);
		this.rightItemNumber++;
		this.leftItemNumber=1;
		this.container.appendChild(availableItems[0]);
	}

	// Moving downloading items
	for (var i=0; i<this.downloadedItems; i++){
		this.addLoaderToLeft();
	}

	this.container.scrollLeft=65535;

	var theItem = this.container.getElementsByClassName("slider-item")[1];
	var css = getComputedStyle(theItem);
	var w = parseInt(css.width.match(/^\d+/));
	var m = parseInt(css.marginRight.match(/^\d+/));
	this.itemWidth = w+m;

	console.log("slider loaded");

}