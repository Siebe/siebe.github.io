/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */




function SynthEnvelope (audioContext) {
    this.context = audioContext;
    
    this.attack = 1.;
    this.decay = 0.5;
    this.sustain = 0.1;
    this.release = 3;
    
    this.param = []
    this.isTriggered = false;
    
    this.connect = function(audioParam) {
        if (typeof audioParam == 'object' && audioParam instanceof AudioParam) {
            this.param.push(audioParam);
        }
    }
    
    this.trigger = function(key, velocity) {
        now = context.currentTime;
        if (typeof velocity == 'undefined' || velocity  < 0) {
            return;
        }
        
        for(i=0; i< this.param.length; i++) {
            
            cur_val = this.param[i].value;    
            
            
            if (this.isTriggered && velocity <= 0 ) {
                this.param[i].cancelScheduledValues(now);
                this.param[i].setValueAtTime(cur_val, now);
                this.param[i].linearRampToValueAtTime(0, now+this.release);           
                this.isTriggered = false;
            } else if (!this.isTriggered){
                this.param[i].cancelScheduledValues(now);
                this.param[i].setValueAtTime(cur_val, now);
                this.param[i].linearRampToValueAtTime(velocity, now+this.attack);
                this.param[i].linearRampToValueAtTime(velocity*this.sustain, now+this.attack+this.decay);
                this.isTriggered = true;
            }
        }
        this.debugUpdate();
    }
   
    this.debugUpdate = function() {
        if (typeof jfk_debug == 'object') {
            jfk_debug.update('Envelope-triggered', this.isTriggered ? 'on' : 'off');
        }
    }
    if (typeof jfk_debug == 'object') {
        jfk_debug.register(this, this.debugUpdate);
    }
    
}