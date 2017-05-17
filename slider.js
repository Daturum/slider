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



function AjaxSlider(sliderItem,loaderFunction){

	this.sliderItem = document.getElementById(sliderItem);
	this.loaderFunction = loaderFunction;
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
		if (this.getPositionLeftElem() >= this.rightItemNumber){
			this.rightItemNumber++;
			if (this.rightItemNumber < this.totalItems) {
				this.itemLoader(this.getPositionLeftElem()+1);
			}
		}
	}

	this.appendItemToLeft = function(html){
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

		if (this.rightItemNumber===this.totalItems-1){
			var rightButton = this.sliderItem.getElementsByClassName("right-button")[0];
			var sliderLoader = this.sliderItem.getElementsByClassName("loader-item")[0];
			this.sliderItem.insertBefore(sliderLoader,rightButton);
			this.sliderItem.getElementsByClassName("left-button")[0].classList.add("inactive");
		}
	}


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
	this.container.appendChild(this.loaderItem);

	this.container.scrollLeft=65535;

	var theItem = this.container.getElementsByClassName("slider-item")[1];
	var css = getComputedStyle(theItem);
	var w = parseInt(css.width.match(/^\d+/));
	var m = parseInt(css.marginRight.match(/^\d+/));
	this.itemWidth = w+m;

	console.log("slider loaded");

}