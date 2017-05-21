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

	this.downloadedItems = 10;

	this._itemsStack = 0;

	this.itemLoader = function(k){
		throw "Please, define AjaxSlider.prototype.itemLoader property for slider to work correctly";
	}


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
		if (this.getPositionLeftElem() >= this.rightItemNumber && this._itemsStack===0){
			for (var i=0; i<this.downloadedItems; i++){
				this._itemsStack++;
				this.rightItemNumber++;
				if (this.rightItemNumber < this.totalItems) {
					// this.itemLoader(this.getPositionLeftElem()+1);
					this.itemLoader(this.rightItemNumber);
				}
			}
		}
	}

	this.appendItemToLeft = function(html){
		this._itemsStack--;
		var div = document.createElement("div");
		div.classList.add("slider-item");
		div.innerHTML = html;
		div.style.transition = "none";
		var parent = this.container;
		var it = this.getSliderItem(this.getSliderItemCount()-1).nextSibling;
		if (it){
			parent.insertBefore(div,it);
		} else {
			parent.appendChild(div);
		}
		this._sliderItems.push(div);
		this.setPosition(this.getPosition());
		div.style.transition = "";

		if (this.rightItemNumber>this.totalItems-1){
			// var rightButton = this.sliderItem.getElementsByClassName("right-button")[0];
			var loaders = this.container.getElementsByClassName("loader-item");
			while (loaders.length>0){
				loaders[0].parentNode.removeChild(loaders[0]);
			}
			// this.sliderItem.insertBefore(sliderLoader,rightButton);
			// this.sliderItem.getElementsByClassName("left-button")[0].classList.add("inactive");
			this.setPosition(this.getPosition());
		}
	}


	this._pressed = false;

	const TIMER_INTERVAL = 30;

	this._speedConstant = 0.1;

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

	this._monitoring = {
		time: 0,
		position: 0,
		previousPosition: 0
	}

	this._speed = 0;

	this._timer1Function = function(){
		this._monitoring.time += TIMER_INTERVAL;
		this._monitoring.previousPosition = this._monitoring.position;
		this._monitoring.position = this.getPosition();
	}
	this._timer1 = null;

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
	this._timer2 = null;

	addEvent(this.container,"mousedown",function(){
		this._pressed = true;
		this._monitoring.time=0;
		this._monitoring.position = this._monitoring._previousPosition = this.getPosition();
		this._timer1 = setInterval(this._timer1Function.bind(this),TIMER_INTERVAL);
		this._timer1Function();
		if (this._timer2!==null){
			clearInterval(this._timer2);
			this._timer2=null;
		}
	}.bind(this));

	var mouseUpFunc = function(){
		if (this._pressed){
			this._speed = this._monitoring.position - this._monitoring.previousPosition;
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

	addEvent(this.container,"mousemove",function(evt){
		if (this._pressed){
			this.setPosition(this.getPosition()+evt.movementX);
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


	var bufferItem = this.sliderItem.getElementsByClassName("buffer")[0];
	var availableItems = bufferItem.children;
	var itemWidthComputed = false;
	while (availableItems.length!==0){
		this._sliderItems.push(availableItems[0]);
		this.rightItemNumber++;
		this.container.appendChild(availableItems[0]);
	}

	for (var i=0; i<this.downloadedItems; i++){
		var loader = this.loaderItem.cloneNode(true);
		this.container.appendChild(loader);
	}

	this.container.scrollLeft=65535;

	var theItem = this.container.getElementsByClassName("slider-item")[1];
	var css = getComputedStyle(theItem);
	var w = parseInt(css.width.match(/^\d+/));
	var m = parseInt(css.marginRight.match(/^\d+/));
	this.itemWidth = w+m;

	console.log("slider loaded");

}