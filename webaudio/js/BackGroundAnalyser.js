/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


//Some initial webGL stuff

analyserEnabled = true

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

};

analyser_draw = function() {
    if (analyserEnabled) {
        window.analyser.analyserView.doFrequencyAnalysis();
        window.requestAnimationFrame(analyser_draw);
    }
}
    

function BackGroundAnalyser(audioContext, canvasElement) {
    this.context = audioContext;
    
    if(!analyserEnabled) {
        return null
    }
    

    //resizeCanvas before analyserview is initialized.
    

    this.node = context.createAnalyser();
    this.node.fftSize = 2048;
    
    window.analyser = this;
    

    
    this.start = function() {
        //trigger the visualisation
        if (analyserEnabled) {

            if (typeof canvasElement == "undefined") {
                //create new cavas element
                this.canvas = document.createElement("canvas");
                document.body.appendChild(this.canvas);
                this.canvas.id = "analyser";
                document.body.style.margin = 0;
                document.body.style.overflow = "hidden";
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;   
            } else {
                this.canvas = canvasElement;
                if (!this.canvas.id || this.canvas.id == '') {
                    this.canvas.id = "analyser";
                }
            }
            this.analyserView =  new AnalyserView(this.canvas.id);
            this.analyserView.setAnalysisType(ANALYSISTYPE_3D_SONOGRAM);

            this.analyserView.initByteBuffer();
            window.requestAnimationFrame(analyser_draw);
        }
    }
    
    this.node.start = this.start;

    
    return this.node;
    
}