/*
    - put this line as the last element in the body in index.html (before </body>)

    <script src="gsTlControl.js"></script>
    
*/

// ------------------------------ CONTROL SCRIPT ------------------------------ //
(function(){
'use strict'
const extJs = document.createElement('script'); // import external library Draggable
extJs.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.11.5/utils/Draggable.min.js';
document.head.appendChild(extJs);
extJs.onload = function(){ // run everything else when extJs ready

// --- control style
var controlStyle = document.createElement("style");
controlStyle.setAttribute("type", "text/css");
controlStyle.setAttribute("id", "controlStyle");
document.getElementsByTagName("head")[0].appendChild(controlStyle);

controlStyle.innerHTML = 
    '#wrapperControl {position:absolute; height: 29px;bottom: 0px; border: thin solid gray; padding: 2px;}#pauseBtn {background-color: azure; width: 3.7em;border: #000 thin solid;}#restartBtn {background-color: skyblue;border: #000 thin solid;}#progressTime, #progressPerc {background-color:burlywood; max-width: 2em;border: #000 thin solid;}#progressBar {background-color: green; height: 8px;}'
;

// --- control elements
var controlElm = document.createElement("div");
controlElm.setAttribute("id", "wrapperControl");
document.getElementsByTagName("body")[0].appendChild(controlElm);
    
controlElm.innerHTML =
    '<button id="pauseBtn">pause</button><button id="restartBtn">restart</button><input type="text"id="progressTime"value="0">s<input type="text" id="progressPerc" value="0">%<div id="progressBar"></div>'
;

// --- control script
var mTL;
var pauseBtn = document.getElementById("pauseBtn");
var restartBtn = document.getElementById("restartBtn");
var progressTime = document.getElementById("progressTime");
var progressPerc = document.getElementById("progressPerc");
var progressBar = document.getElementById("progressBar");
    
globalThis.addEventListener("wheel", ChangeTime); // inside whole window, mousewheel work only in Chrome
globalThis.addEventListener("mousedown", mouseClick);
    
pauseBtn.addEventListener("click", tlPause); // onclick
restartBtn.addEventListener("click", tlRestart); 
progressTime.addEventListener("click", setTime); // onclick
progressPerc.addEventListener("click", setPerc);
progressTime.addEventListener("wheel", ChangeTime); // mousewheel, work only in Chrome
progressPerc.addEventListener("wheel", ChangePerc);
progressTime.addEventListener("keypress", keyPressTime); // keypress
progressPerc.addEventListener("keypress", keyPressPerc);
//progressTime.addEventListener("onkeydown", keyPressTime); // arrow press
//progressPerc.addEventListener("onkeydown", keyPressPerc);
    
function getProgress(){    
    var time = Math.round(mTL.time()*10)/10;
    var percent = Math.round(mTL.progress()*100);
    progressTime.value = time;
    progressPerc.value = percent;
    progressBar.style.width = percent + '%';
}

// Time
function setTime() {
    var t = progressTime.value;
    mTL.time(t);
}
function ChangeTime(e) {
    var pTime = parseFloat(progressTime.value);
        var pPerc = parseFloat(progressPerc.value); // for check if end anim
        if (pTime <= 0 && e.wheelDelta < 0) pTime = 100; // if scroll down under 0, go to end
        if (pPerc === 100 && e.wheelDelta > 0) pTime = -0.9; // if scroll up over end, go to start
    pTime += (e.wheelDelta > 0) ? +0.1 : -0.1; // +0.1 or -0.1 to time
    progressTime.value = pTime;
    
    setTime();
}

//Percent
function setPerc() {
    var p = progressPerc.value/100;
    mTL.progress(p);
}
function ChangePerc(e) {
    var pPerc = parseFloat(progressPerc.value);
        if (pPerc >= 100 && e.wheelDelta > 0) pPerc = -1; // if scroll up over end, go to start
    pPerc += (e.wheelDelta > 0) ? +1 : -1; // +1 or -1 to percent
    progressPerc.value = pPerc;
    
    setPerc();
}

// Key pressed
function keyPressTime() {
    var k = event.keyCode;
    if (k === 13) setTime();
}
function keyPressPerc() {
    var k = event.keyCode;
    if (k === 13) setPerc();
}
    
function mouseClick(e){
    if (e.button === 1) tlPause();
    else if (e.button === 2) tlRestart();
}

//Buttons
function tlPause() {
    var status = mTL.paused(!mTL.paused())._paused;
    if (status) {
        pauseBtn.innerHTML = 'play';
        TweenMax.ticker.removeEventListener("tick", getProgress)

    } else {
        pauseBtn.innerHTML = 'pause';
        TweenMax.ticker.addEventListener("tick", getProgress)
    }
};

function tlRestart() {
    mTL.restart();
    pauseBtn.innerHTML = 'pause';
    TweenMax.ticker.addEventListener("tick", getProgress)
};

// init
function start() {
    if (typeof TweenMax !== 'undefined' && (globalThis['mTL'] || globalThis['tl'])) {
        console.log("ready-gsTlControl")
        mTL = globalThis['mTL'] || globalThis['tl'];
        TweenMax.ticker.addEventListener("tick", getProgress); // run each time the engine updates
    } else {
        setTimeout(function(){ start() }, 100);
    }
} start();

// additional functionality
Draggable.create(wrapperControl, {type:"x,y", edgeResistance:0.5, bounds:window}); // for drag and move (floating)
wrapperControl.onwheel = function(){ return false; } // Prevent page scrolling inside control pannel
} // end bracket of whole onload function
})()
// ------------------------------ CONTROL SCRIPT - end ------------------------------ //