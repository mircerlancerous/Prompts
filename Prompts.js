/*
Copyright 2023 OffTheBricks - https://github.com/mircerlancerous/Prompts
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var Prompts = new function(){
	this.alert = function(msg, btnText){
		return new Promise(function(resolve,reject){
			let newDiv = createBox(msg);
			let newBtn = document.createElement("div");
			newBtn.className = "promptButton";
			if(btnText){
				newBtn.innerText = btnText;
			}
			else{
				newBtn.innerText = "OK";
			}
			newBtn.addEventListener("click", function(){closePrompt();resolve();}, false);
			newDiv.appendChild(newBtn);
			deployPrompt(newDiv);
			//needs to come after prompt is deployed
			_currentPromiseReject = reject;
		});
	};
	
	this.confirm = function(msg){
		return new Promise(function(resolve,reject){
			let newDiv = createBox(msg);
			let newBtn = document.createElement("div");
			newBtn.className = "promptButton half";
			newBtn.innerText = "OK";
			newBtn.addEventListener("click", function(){closePrompt();resolve(true);}, false);
			newDiv.appendChild(newBtn);
			newBtn = document.createElement("div");
			newBtn.className = "promptButton half";
			newBtn.innerText = "CANCEL";
			newBtn.addEventListener("click", function(){closePrompt();resolve(false);}, false);
			newDiv.appendChild(newBtn);
			deployPrompt(newDiv);
			//needs to come after prompt is deployed
			_currentPromiseReject = reject;
		});
	};
	
	/*
	Displays an input field for the user to fill out
	 - for a custom input, pass the input element as 'defaultvalue'
	*/
	this.prompt = function(msg, defaultvalue, placeholder){
		return new Promise(function(resolve,reject){
			let newInput, newDiv = createBox(msg);
			//if the caller has provided the input
			if(defaultvalue instanceof Element){
				newInput = defaultvalue;
			}
			//build the input
			else{
				newInput = document.createElement("input");
				newInput.type = "text";
				if(defaultvalue){
					newInput.value = defaultvalue;
				}
				if(placeholder){
					newInput.placeholder = placeholder;
				}
				newInput.className = "promptInput";
			}
			newDiv.appendChild(newInput);
			let newBtn = document.createElement("div");
			newBtn.className = "promptButton half";
			newBtn.innerText = "OK";
			newBtn.addEventListener(
				"click",
				function(){
					closePrompt();
					let valueElm = newDiv.getElementsByClassName("promptInput");
					if(valueElm && valueElm.length){
						if(valueElm.length == 1){
							resolve(valueElm[0].value);
						}
						else{
							//build return object
							let i, obj = {};
							for(i=0; i<valueElm.length; i++){
								obj[valueElm[i].name] = valueElm[i].value;
							}
							resolve(obj);
						}
					}
					else{
						resolve(true);
					}
				},
				false
			);
			newDiv.appendChild(newBtn);
			newBtn = document.createElement("div");
			newBtn.className = "promptButton half";
			newBtn.innerText = "CANCEL";
			newBtn.addEventListener("click", function(){closePrompt();resolve(false);}, false);
			newDiv.appendChild(newBtn);
			deployPrompt(newDiv);
			newInput.focus();
			//needs to come after prompt is deployed
			_currentPromiseReject = reject;
		});
	};
	
	this.waiting = function(msg){
		//if no message, then close prompt
		if(!msg){
			closePrompt();
			return;
		}
		//have message, so show prompt with no buttons
		let newDiv = createBox(msg);
		let newWaiting = document.createElement("div");
		newWaiting.className = "promptWaiting";
		newWaiting.innerText = ".";
		newDiv.appendChild(newWaiting);
		deployPrompt(newDiv);
		//start timer for waiting animation
		promptTimer = setInterval(onPromptWaiting, 500);
	};
	
	this.timed = function(msg, ms){
		if(!ms){
			//default to 2.5 seconds if a value is not provided
			ms = 2500;
		}
		return new Promise((resolve, reject)=>{
			let newDiv = createBox(msg);
			deployPrompt(newDiv);
			promptTimeout = setTimeout(
				function(){
					closePrompt();
					resolve();
				},
				ms
			);
			//needs to come after prompt is deployed
			_currentPromiseReject = reject;
		});
	};

	this.isOpen = function(){
		if(promptElms.length > 0){
			return true;
		}
		return false;
	};
	
	//closes any open prompt prematurely, rejecting its promise
	this.close = function(){
		if(_currentPromiseReject){
			_currentPromiseReject(new Error("Close prompt called"));
		}
		closePrompt();
	};
	
	//if enabled, prompts are automatically closed when a new prompt is requested
	this.setAutoClose = function(enable){
		_autoClose = enable;
	};
	
	/*******************************/
	
	var _autoClose = false;
	var _currentPromiseReject = null;
	
	var _style = {
		promptShade: {
			"z-index": 1000,
			height: "100vh",
			width: "100%",
			position: "fixed",
			top: "0px",
			left: "0px",
			opacity: "50%",
			"background-color": "black",
			"pointer-events": "none"
		},
		promptHolder: {
			"z-index": 1001,
			height: "100vh",
			width: "100%",
			position: "fixed",
			top: "0px",
			left: "0px",
			overflow: "auto",
			"text-align": "center",
			promptBox: {
				display: "inline-block",
				width: "90%",
				"max-width": "350px",
				"background-color": "white",
				padding: "12px",
				"font-family": "arial",
				"font-size": "14px",
				color: "black",
				"box-shadow": "0px 0px 15px blue",
				"border-radius": "5px",
				"margin-top": "100px",
				"margin-bottom": "20px",
				promptButton: {
					margin: "10px",
					padding: "5px",
					border: "2px solid blue",
					"font-size": "18px",
					"border-radius": "4px",
					cursor: "pointer"
				},
				"promptButton:hover": {
					"box-shadow": "0px 0px 10px gray",
				},
				promptInput: {
					border: "1px solid #aaa",
					padding: "3px;",
					margin: "10px;",
					display: "inline-block",
					width: "80%",
					height: "25px",
					"margin-bottom": "15px"
				},
				promptWaiting: {
					"font-size": "20px"
				}
			}
		},
		half: {
			display: "inline-block",
			width: "100px"
		}
	};
	
	function objToStyle(obj, prefix){
		let i, style = "", substyle = "", list = Object.getOwnPropertyNames(obj);
		if(!prefix){
			prefix = "";
		}
		for(i=0; i<list.length; i++){
			if(typeof(obj[list[i]]) === 'object'){
				substyle += objToStyle(obj[list[i]], prefix + " ." + list[i]);
			}
			else{
				style += list[i] + ": " + obj[list[i]] + ";";
			}
		}
		if(style.length){
			style = prefix + "{" + style + "}";
		}
		return style + substyle;
	}
	
	function createBox(msg){
		let newDiv = document.createElement("div");
		newDiv.className = "promptBox";
		newDiv.innerHTML = msg + "<br/><br/>";
		return newDiv;
	}
	
	function deployPrompt(newDiv){
		if(promptElms.length > 0){
			if(!_autoClose){
				throw new Error("Prompt already open");
			}
			closePrompt();
		}
		let newShade = document.createElement("div");
		newShade.className = "promptShade";
		promptElms.push(newShade);
		document.body.appendChild(newShade);
		let newHolder = document.createElement("div");
		newHolder.className = "promptHolder";
		newHolder.appendChild(newDiv);
		promptElms.push(newHolder);
		document.body.appendChild(newHolder);
		let newStyle = document.createElement("style");
		newStyle.innerHTML = objToStyle(_style);
		promptElms.push(newStyle);
		document.body.appendChild(newStyle);
	}
	
	var promptElms = [], promptTimer = null, promptTimeout = null;
	function closePrompt(){
		for(let i=0; i<promptElms.length; i++){
			document.body.removeChild(promptElms[i]);
		}
		promptElms = [];
		_currentPromiseReject = null;
		if(promptTimer){
			clearInterval(promptTimer);
			promptTimer = null;
		}
		if(promptTimeout){
			clearTimeout(promptTimeout);
			promptTimeout = null;
		}
	}
	
	function onPromptWaiting(){
		let elm = document.getElementsByClassName("promptHolder")[0];
		elm = elm.getElementsByClassName("promptWaiting")[0];
		if(elm.innerText.length > 20){
			elm.innerText = ".";
		}
		else{
			elm.innerText = elm.innerText + " . .";
		}
	}
};
