/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



function TestSynth(audioContext) {
    this.context = audioContext;
    
    this.osc = this.context.createOscillator();
    this.gain = this.context.createGain();
    
    this.isPlaying = false;
    this.lastKey;

    this.osc.connect(this.gain);
    
    this.connect = function(obj) {
        this.gain.connect(obj);
    }
        
    this.trigger = function(key, velocity) {
        
        if (velocity <= 0 && this.isPlaying && key == this.lastKey) {
            this.isPlaying = false;
            //this.gain.gain.value = 0;
        } else if (velocity > 0) {
            this.osc.frequency.value = 27.5 * Math.pow(2, 0.2*key);
            //this.gain.gain.value = velocity;
            this.isPlaying = true;
            this.lastKey = key;
        }
        this.debugUpdate();
    }

    //register at debugger if present
    if (typeof jfk_debug == 'object') {
        this.debugUpdate = function() {
               jfk_debug.update('TestSynth-freq', (this.gain.gain.value > 0 || this.isPlaying ) ? this.osc.frequency.value : 'off');
        }
        jfk_debug.register(this, this.debugUpdate);
    }
    
    
    this.gain.gain.value = 0;
    this.osc.start();    
    return null; //no input
}