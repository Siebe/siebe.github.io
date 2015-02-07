/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var context = false;
var synth;
var echo;
var debug;
var analyser;
var analyserView1;
var analyserEnabled = true;
var impulseResponseBuffer;


//add init function to be triggered AFTER dom load
window.addEventListener('load', init, false);
//some more listeners
window.addEventListener('resize', resizeCanvas, false);

//do this BEFORE dom load:
o3djs.require('o3djs.shader');

function output(str) {
    alert("WebGL failed, no visuals for you :(");
    analyserEnabled = false
}

//I have no idea what i'm doing...
if ( !window.requestAnimationFrame && analyserEnabled) {

        window.requestAnimationFrame = ( function() {

                return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
                        console.log('setting animation frame')
                        window.setTimeout( callback, 1000 / 60 );

                };

        } )();

}


function init() {
    try {
      // Fix up for prefixing
      window.AudioContext = window.AudioContext||window.webkitAudioContext;
      context = new AudioContext();
    }
    catch(e) {
      context = false;
      alert('Web Audio API failed, no sounds D:');
    }
    //todo cookie settings check, actually todo make some settings...
    
    //resizeCanvas before analyserview is initialized.
    resizeCanvas();
    analyserView1 = new AnalyserView("view1");
    analyserView1.setAnalysisType(ANALYSISTYPE_3D_SONOGRAM);
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    
  

    //trigger the visualisation
    analyserView1.initByteBuffer();
    window.requestAnimationFrame(draw);
    
    //overlay debug
    debug = new Debug();
    debug.renderHTML();
    debug.autoUpdate();
    
    synth = new Synth();
    echo = new Echo();
    shaper = new FloatShaper(context, 2);
    downloadEchoBuffer('/ir/St Nicolaes Church.wav');
    mainGain = context.createGain();
    mainGain.gain.value = 0.3;
    
    synth.connect(analyser);
    shaper.connect(analyser);
    analyser.connect(echo.convolver);
    echo.convolver.connect(mainGain);
    mainGain.connect(context.destination);
    
    this.window.addEventListener('keydown', function(event) {
        synth.startNote(event.keyCode);
    });
    
    this.window.addEventListener('keyup', function(event) {
        synth.stopNote(event.keyCode);
    });
    
    
}

function downloadEchoBuffer(Location) {
    
    getSound = new XMLHttpRequest(); 
    getSound.open("GET", Location, true); 
    getSound.responseType = "arraybuffer"; 
    getSound.onload = 
        function() { context.decodeAudioData(getSound.response, function(buffer){ echo.convolver.buffer = buffer }); } 
    getSound.send();
}

function resizeCanvas() {
    if (analyserEnabled) {
        var canvas = document.getElementById('view1')
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;   
    }
}

//calback for the request frame thingie
function draw() {
    analyserView1.doFrequencyAnalysis();
    window.requestAnimationFrame(draw);
}




