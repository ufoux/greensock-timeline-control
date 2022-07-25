/*
    - author: Jiří Šilha
    - put this line as the last element in the body in index.html (before </body>) and copy gsTlControl.js to the banner folder, or use it as Chrome extension (whole folder gsTlControl)

    <script src="gsTlControl.js"></script>
    
*/

// ------------------------------ CONTROL SCRIPT ------------------------------ //
(function(){
    'use strict'
    // --- control style
    var controlStyle = document.createElement("style");
    controlStyle.setAttribute("type", "text/css");
    controlStyle.setAttribute("id", "controlStyle");
    document.getElementsByTagName("head")[0].appendChild(controlStyle);
    
    controlStyle.innerHTML = `
    #gtc_wrapperControl *{position:unset;font:14px Arial,Helvetica,sans-serif;box-sizing:border-box;letter-spacing:.03em;transition:.3s}#gtc_wrapperControl p{margin:0;padding:0;position:unset;color:#000}#gtc_wrapperControl input[type=text]:hover{transform:scale(1.4);background-color:#faebd7}#gtc_wrapperControl input[type=text]{background-color:#f5f5f5;width:40px;height:25px;padding-left:2px;border:1px solid #a9a9a9}#gtc_wrapperControl{position:fixed;width:282px;max-width:286px;bottom:0;border:thin solid #000;background-color:rgba(238,238,238,.5);padding:10px 2px 2px 4px}#gtc_pauseBtn,#gtc_restartBtn{background-color:#90ddaa;width:60px;height:25px;border:none}#gtc_restartBtn{background-color:#87ceeb}#gtc_progressBar{position:relative;margin:7px 0;width:calc(100% - 4px);height:10px;border:solid 1px #90ddaa;border-radius:8px;cursor:grab;outline:0;-webkit-appearance:none}.gtc_inline{display:inline-block}.gtc_txt_01{margin-left:18px!important}#gtc_tlConstructorName{position:absolute;width:13px!important}#gtc_tlConstructorName:hover{transform:translate3d(0,0,0) scale(1)!important;width:97%!important}
    /* --- plug-ins css --- */
    #gtc_plugins_visible * { font-size: 13px; }
    @keyframes showAlert {
        50% {background-color: #f66}
        100% {background-color: transparent}
    }
    .gtc_alert { animation: showAlert 1s 0s 5 backwards;}
    #gtc_infoPanel {
        overflow: hidden; height: auto; margin: 0 2px 2px 0; padding-top: 10px; background-color: #dbf4e4;
    }
    #gtc_infoPanel:hover { background-color: antiquewhite;}
    #gtc_plugins_visible{ margin-bottom: 2px; }
    /* --- plug-ins css - End ---*/
    `
    
    // --- control elements
    var controlElm = document.createElement("div");
    controlElm.setAttribute("id", "gtc_wrapperControl");
    document.getElementsByTagName("body")[0].appendChild(controlElm);
        
    controlElm.innerHTML = `
    <section id="gtc_infoPanel">
    <div id="gtc_plugins"><!-- plugins --></div>
    </section>
    <div id="gtc_plugins_visible"><!-- plugins still visible --></div>
    
    <button id="gtc_pauseBtn">&#9208;/&#9205;</button>
    <button id="gtc_restartBtn">restart</button>
    <input type="text" id="gtc_playFromTime" value="2.2">
    <input type="text" id="gtc_progressTime" value="0">&zwj;s
    <input type="text" id="gtc_progressPerc" value="0">&zwj;%
    <div style="height: 2px"></div>
    <input type="text" id="gtc_tlConstructorName" placeholder="+write a name of the timeline (mTL)">
    <p class="gtc_txt_01 gtc_inline">Time scale:</p>&nbsp;
    <input type="text" id="gtc_timeScale" class="gtc_inline" value="0.2">
    <input type="text" id="gtc_timeScale2" class="gtc_inline" value="1">
    <p class="gtc_inline">actual:</p>
    <div id="gtc_checkTimeScale" class="gtc_inline">1</div>
    <br>
    <input id="gtc_progressBar" type="range" min="0" max="100" value="0" step="1">
    `
    
    // --- control script
    var mTL, byId = "getElementById", cssPrefix = "gtc_", gsapVersion;
    var pauseBtn = document[byId](cssPrefix+"pauseBtn");
    var restartBtn = document[byId](cssPrefix+"restartBtn");
    var playFromTime = document[byId](cssPrefix+"playFromTime");
    var progressTime = document[byId](cssPrefix+"progressTime");
    var progressPerc = document[byId](cssPrefix+"progressPerc");
    var timeScale = document[byId](cssPrefix+"timeScale");
    var timeScale2 = document[byId](cssPrefix+"timeScale2");
    var progressBar = document[byId](cssPrefix+"progressBar");
    var checkTimeScale = document[byId](cssPrefix+"checkTimeScale");
    var wrapperControl = document[byId](cssPrefix+"wrapperControl");
    var tlConstructorName = document[byId](cssPrefix+"tlConstructorName");
        
    window.addEventListener("wheel", changeTime); // inside whole window, mousewheel work only in Chrome
    window.addEventListener("mousedown", mouseClick);
        
    pauseBtn.addEventListener("click", tlPause); // onclick
    playFromTime.addEventListener("click", tlPlayFrom);
    playFromTime.addEventListener("keypress", tlPlayFrom);
    timeScale.addEventListener("click", tlScale);
    timeScale2.addEventListener("click", tlScale2);
    restartBtn.addEventListener("click", tlRestart); 
    progressTime.addEventListener("wheel", changeTime); // mousewheel, work only in Chrome
    progressPerc.addEventListener("wheel", changePerc);
    progressTime.addEventListener("keypress", keyPressTime); // keypress
    progressPerc.addEventListener("keypress", keyPressPerc);
    progressBar.addEventListener("input", setPerc); // drag and move
    tlConstructorName.addEventListener("keypress", setTimelineName, false);
    //progressTime.addEventListener("onkeydown", keyPressTime); // arrow press
    //progressPerc.addEventListener("onkeydown", keyPressPerc);
        
    function getProgress(){
        var time = Math.round(mTL.time()*10)/10;
        var percent = Math.round(mTL.progress()*100);
        progressTime.value = time;
        progressPerc.value = percent;
        progressBar.value = percent;
        progressBar.style.background = 'linear-gradient(to right, #90ddaa 0%, #90ddaa '+progressBar.value +'%, #fff ' + progressBar.value + '%, white 100%)'
    };
    
    // Time
    function setTime() {
        var t = progressTime.value;
        mTL.time(t);
        getProgress() // update timer
    }
    function changeTime(e) {
        var pTime = parseFloat(progressTime.value);
            var pPerc = parseFloat(progressPerc.value); // for check if end anim
            if (pTime <= 0 && e.wheelDelta < 0) pTime = 100; // if scroll down under 0, go to end
            if (pPerc === 100 && e.wheelDelta > 0) pTime = -0.9; // if scroll up over end, go to start
        pTime += (e.wheelDelta > 0) ? +0.1 : -0.1; // +0.1 or -0.1 to time
        progressTime.value = pTime;
        
        setTime();
    }
    
    // Percent
    function setPerc(e) {
        var p = e ? progressBar.value/100 : progressPerc.value/100;
        mTL.progress(p);
        getProgress() // update timer
    }
    function changePerc(e) {
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
    }
    
    // Buttons
    function tlPause() {
        mTL.paused(!mTL.paused())
        if (mTL.paused()) {
            pauseBtn.innerHTML = '&#9205;'; // play image
            removeTicker();
        } else {
            pauseBtn.innerHTML = '&#9208;'; // pause image
            addTicker();
        }
    }
        
    function tlPlayFrom(e) {
        var k = event.keyCode, eb = e.button;
        if (k !== 13 && eb || k !== 13 && eb === undefined) { return };
        
        // If left mouse button or enter key pressed.
        var pFrom = parseFloat(playFromTime.value);
        mTL.play(pFrom);
        pauseBtn.innerHTML = '&#9208;'; // pause
        addTicker();
    }
    
    function tlScale() {
        var tScale = parseFloat(timeScale.value);
        mTL.timeScale(tScale);
        checkTimeScale.innerHTML = mTL.timeScale();
    }
    
    function tlScale2() {
        var tScale = parseFloat(timeScale2.value);
        mTL.timeScale(tScale);
        checkTimeScale.innerHTML = mTL.timeScale();
    }
    
    function tlRestart() {
        mTL.restart();
        pauseBtn.innerHTML = 'pause';
        addTicker();
    };
    
    // init
    function start(tl) {
        function getDefaultTL() { return window['mTL'] || window['mainTL'] || window['tl'] || tl}
        if (typeof TweenMax !== 'undefined' && getDefaultTL()) {
            gsapVersion = parseInt(TweenLite.version);
            initDragAndDrop();
    
            mTL = tl ? tl : getDefaultTL();
            console.log("ready-gsTlControl");
            tlPause();
            addTicker();
        } else {
            setTimeout(()=> start(), 500);
        }
    }
    
    function setTimelineName() {
        if (event.keyCode === 13) {
            if (window[this.value] instanceof TimelineLite) {
                start(window[this.value]);
                console.log(this.value, "-> Set up and working correctly.");
                this.value += " successful";
                return;
            }
            if (!this.value) { pluginsAction(); return; } // show plugins
            console.error(this.value, "-> not a timeline");
            this.value += " not a timeline";
        }
    }
    
    function addTicker() {
        if (gsapVersion >= 3) gsap.ticker.add(getProgress); // run each time the engine updates
        else TweenMax.ticker.addEventListener("tick", getProgress);
    }
    function removeTicker() {
        if (gsapVersion >= 3) gsap.ticker.remove(getProgress);
        else TweenMax.ticker.removeEventListener("tick", getProgress);
    }
    
    start();
    console.warn("run: gsTlControlStart(tl)\n where tl is timeline constructor name to control");
    
    // global control
    window['gsTlControlStart'] = start;
    
    // additional functionality
    function initDragAndDrop() {
        const extDraggable = document.createElement('script');
        extDraggable.onload = function(){
            Draggable.create(wrapperControl, {type:"x,y", edgeResistance:0.5, bounds:window, dragClickables: false}); // for drag and move (floating)
            wrapperControl.onwheel = function(){ return false; } // Prevent page scrolling inside control pannel
        }
        if (gsapVersion >= 3) extDraggable.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/Draggable.min.js';
        else extDraggable.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.11.5/utils/Draggable.min.js';
        document.head.appendChild(extDraggable);
    }
    
    
    
    
    
    // -------------------- plug-ins -------------------- //
    
    // ----- init plugins ----- //
    let infoPanel = document[byId](cssPrefix+"infoPanel");
    let plugins = document[byId](cssPrefix+"plugins");
    let pluginsVisible = document[byId](cssPrefix+"plugins_visible");
    let infoPanel_height;
    
    const roundToOne = num => +(Math.round(num + "e+1") + "e-1");
    
    setTimeout(() => { initPlugins()}, 1000);
    setTimeout(() => { hideInfo()}, 8000);
    
    function initPlugins() {
        infoPanel.addEventListener("mouseenter", showInfo);
        infoPanel.addEventListener("mouseleave", hideInfo);
        runAllPlugins(); updateInfoHeight();
        infoPanel.style.paddingTop = "0px";
    }
    
    function pluginsAction() { showInfo(false); }
    
    function showInfo(e) {
        infoPanel.style.height = infoPanel_height; // max-content 'number' for transition
        infoPanel.style.paddingTop = "0";
        if (!e) infoPanel.removeEventListener("mouseleave", hideInfo);
    }
    function hideInfo() {
        infoPanel.style.height = 10 + "px";
        infoPanel.style.paddingTop = "10px";
    }
    
    function updateInfoHeight() {
        infoPanel.style.height = "auto";
        infoPanel.style.height = infoPanel_height = infoPanel.clientHeight + "px"; // save for transition reason
    }
    
    function runAlert(el, good) {
        if (!el) el = infoPanel; //el.clientHeight;
        el.classList.add(cssPrefix+"alert");
        if (good !== true) infoPanel.style.backgroundColor = good ? "fff0d5" : "#fdd"; // use 1 as arg for validate
        return el;
    };
    
    function addElement(id, parent=plugins) {
      const el = document.createElement("div");
      if (id) el.id = id;
      parent.appendChild(el);
      return el;
    }
    
    function addBtn(fce, name, id, parent=gtc_infoPanel) {
      const el = document.createElement("button");
      if (id) el.id = id;
      el.onclick = fce;
      el.innerHTML = name;
      parent.appendChild(el);
      return el;
    }
    
    function runAllPlugins() { checkLoops(); checkDealer(); checkDuplicateId(), checkAdSize();
        addBtn(videoChecker,"_preview.mp4").title = "Load video named _preview.mp4 from banner root folder.";
    }
    
    // ----- init plugins - end ----- //
    
    
    
    function checkLoops() {
        if(typeof loopNumber == 'undefined') return;
        addElement().innerHTML = 'loops: ' + loopNumber + '/' + loopDuration + '/' + pauseLastLoopAfter;
    }
    
    function checkDealer() {
        if(typeof mkDealer == 'undefined') return;
        addElement().innerHTML = 'Dealer: ' + mkDealer.stats()._moduleVersion;
    }
    
    function checkDuplicateId() {
        var allElements = document.getElementsByTagName("*"), allIds = {}, dupIDs = [];
        for (var i = 0, n = allElements.length; i < n; ++i) {
        var el = allElements[i];
        if (el.id) {
            if (allIds[el.id] !== undefined) dupIDs.push(el.id);
            allIds[el.id] = el.name || el.id;
            }
        }
        if (dupIDs.length) {
            runAlert(addElement()).innerHTML = 'duplicate id: '+dupIDs; console.error("Duplicate ID's:", dupIDs);}
    }
    
    function checkAdSize() {
        if (!bannerWidth) return;
        var adSizeArr = document.querySelector('meta[name="ad.size"]').content.match(/\d+/g); // output array: ["300", "250"]
        if (adSizeArr[0] != bannerWidth || adSizeArr[1] != bannerHeight) {
            runAlert(addElement()).innerHTML = "adSize is not Match the banner size";
        }
    }
    
    function videoChecker() {
        this.style.display = "none";
        var vid = document.createElement("video");
            vid.setAttribute("controls","controls");
            vid.id = "videoPreview";
        var sourceMP4 = document.createElement("source");
            sourceMP4.type = "video/mp4";
            sourceMP4.src = "_preview.mp4";
        if (bannerWidth && bannerHeight) {
            vid.style.position = "absolute";
            if (bannerWidth > bannerHeight && bannerWidth/bannerHeight > 1.5) {
                vid.style.top = bannerHeight + "px";
                vid.style.width = bannerWidth + "px";
            } else {
                vid.style.left = bannerWidth + "px";
                vid.style.height = bannerHeight + "px";
            }
        }
        vid.appendChild(sourceMP4);
        document.body.appendChild(vid);
        Draggable.create(vid, {type:"x,y", edgeResistance:0.5, bounds:window, dragClickables: false}); // for drag and move (floating)
    
        function update(){
            mTL.progress( vid.currentTime/vid.duration )
        };
    
        function vidOnplay() {
            if (gsapVersion >= 3) gsap.ticker.add(update);
            else TweenMax.ticker.addEventListener("tick", update);
            if (mTL.paused()) tlPause(); // core
        };
        function vidOnpause() {
            if (gsapVersion >= 3) gsap.ticker.remove(update);
            else TweenMax.ticker.removeEventListener("tick", update);
            if (!mTL.paused()) tlPause(); // core
        };
    
        vid.onplay = vidOnplay;
        vid.onpause = vidOnpause;
    
        let elmTime = addElement(false, pluginsVisible);
    
        vid.onloadeddata  = function() {
            elmTime.innerHTML = 'vid/ban duration <span>'+roundToOne(vid.duration)+'/'+mTL.duration()+'</span> ';
            if (mTL.duration() > vid.duration+0.3 || mTL.duration() < vid.duration-0.3) { runAlert(elmTime.children[0], true); };
    
            let restartBtn = addBtn(function()  {
                vid.currentTime = 0; vid.play(); tlRestart(); // core fcn
            },"restart", false, elmTime);
            restartBtn.title = "Play video and banner from beginning.";
            restartBtn.style.color = "#45b3e0";
    
            function syncFilter(on) { // core elm
                gtc_progressBar.style.filter = on ? "grayscale(1)" : "none";
                gtc_pauseBtn.style.filter = on ? "grayscale(1)" : "none";
                gtc_restartBtn.style.filter = on ? "grayscale(1)" : "none";
                this.style.color = on ? "#42c56e" : "#f66";
            }
    
            const syncBtn = addBtn(function() {
                if (this.syncOff = this.syncOff ? false : true) { // sync off
                    vidOnpause(); vid.onplay = null; vid.onpause = null;
                    syncFilter.call(this);
                    this.innerHTML = "sync off";
                    this.title = "Enable banner timeline sync with video timeline.";
                } else { // sync on
                    vidOnplay(); vid.onplay = vidOnplay; vid.onpause = vidOnpause;
                    syncFilter.call(this,true);
                    this.innerHTML = "sync on";
                    this.title = "Disable banner timeline sync with video timeline.";
                }
            },"sync on", false, elmTime);
            syncBtn.title = "Disable banner timeline sync with video timeline.";
    
            syncFilter.call(syncBtn,true);
            updateInfoHeight();
            setTimeout(()=>restartBtn.click(), 1000);
        }
    }
    
    // -------------------- plug-ins - end -------------------- //
    
    })()
    // ------------------------------ CONTROL SCRIPT - end ------------------------------ //