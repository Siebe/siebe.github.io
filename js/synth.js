/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//turn part of the keyboard in 4x10 matrix
var key_trans_table = {
    49: 0,  50: 1,  51: 2,  52: 3,  53: 4,  54: 5,  55: 6,  56: 7,  57: 8,  48: 9,
    81: 10, 87: 11, 69: 12, 82: 13, 84: 14, 89: 15, 85: 16, 73: 17, 79: 18, 80: 19,
    65: 20, 83: 21, 68: 22, 70: 23, 71: 24, 72: 25, 74: 26, 75: 27, 76: 28, 186: 29,
    90: 30, 88: 31, 67: 32, 86: 33, 66: 34, 78: 35, 77: 36, 188: 37, 190: 38, 191: 39   
}

function Synth() {
    
    
    this.note = [];
    this.amConn = [];
    this.fmConn = [];
    this.keyPressed = [];
    
    this.starttime = new Date().getTime();
    this.keyHist = new SynthKeyHist();
    
    this.startNote = function(keyCode) {
        var key = key_trans_table[keyCode];
        //ignore invalid keys
        if (typeof key_trans_table[keyCode] == 'undefined') {
            return;
        }
            //ignore key repetition
        if (typeof this.keyPressed[key] != 'undefined' && this.keyPressed[key] == true) {
            return;
        }

        if (typeof this.note[key] == 'undefined' || !this.note[key]) {
            var freq = 27.5 * Math.pow(2, 0.2*key);
            var attT = Math.max(0.01, 0.5 - 0.5*(this.notesPerMinuteRow(3)/100));
            var relT = Math.max(1, 0.2 + (this.notesPerMinuteRow(0)/100)); 
            var pan = 0.;//Math.random()*2 - 1;
            this.note[key] = new SynthNote(
                freq, //freq - some pythagorean pentatone scale (i think)
                0.9, //vel - just keep on 0.8
                attT,// - decrease when row 3 is active
                1.0, //susVal
                0.1, //decT,
                relT, //relT - increase when row 0 is active
                pan,
                this.destination
            );
            this.note[key].start();
            // ok, create an AM effect from the last note adapt strength to row 1 activity
            // and a FM effect to the last note, strentght to row 2
            if (this.keyHist.countAll() > 0) {
                var last_key = this.keyHist.getLastOther(key);
                if (last_key !== null && last_key != key) {
                    var last_note = this.note[last_key];
                    
                    if (last_note && last_note.isPlaying()) {
                        var gainAM = (this.notesPerMinuteRow(1)/100); //can go over 1 no problem
                        var gainFM = 300 * (this.notesPerMinuteRow(2)/100);
                        if (!this.amConn[last_key]) {
                            this.amConn[last_key] = new SynthAMConn(last_note.gain, this.note[key].gain, gainAM);
                        } else {
                            this.amConn[last_key].setGain(gainAM, 0.2);
                        }
                        if (!this.fmConn[last_key]) {
                            this.fmConn[key] = new SynthFMConn(this.note[key].gain, last_note.osc, gainFM);
                        } else {
                            this.fmConn[last_key].setGain(gainFM, 0.2);
                        }
                    }
                }
            }

            
        } else {
            //"resume" note
            this.note[key].start();
        }
        this.keyPressed[key] = true;
        this.keyHist.push(key);              

        this.debugUpdate();
            
        
    }
    
    this.stopNote = function(keyCode) {
        key = key_trans_table[keyCode];
        if (typeof key_trans_table[keyCode] != 'undefined') {
            key = key_trans_table[keyCode];
            if (typeof this.note[key] != 'undefined' && this.note[key]) {
                this.note[key].stop();
            }
            this.keyPressed[key] = false;
        }
        this.debugUpdate();  
    }
    
    
    this.connect = function(destination) {
        this.destination = destination;  
    }
    
    this.notesPlaying = function() {
        var count = 0;
        for(var key in this.note) {
            if (this.note[key] && this.note[key].isPlaying()) {
                count++;
            }
        }
        return count;
    }
    
    this.notesAlive = function() {
        var count = 0;
        for(var key in this.note) {
            if (typeof this.note[key] != undefined && this.note[key]) {
                count++;
            }
        }
        return count;
    }
    
        
    this.fmConnectionsAlive = function() {
        var count = 0;
        for(var key in this.fmConn) {
            if (typeof this.fmConn[key] != undefined && this.fmConn[key]) {
                count++;
            }
        }
        return count;
    }
    
    this.amConnectionsAlive = function() {
        var count = 0;
        for(var key in this.amConn) {
            if (typeof this.amConn[key] != undefined && this.amConn[key]) {
                count++;
            }
        }
        return count;
    }
    
    this.notesPerMinuteAll = function() {
        return this.keyHist.keyPerMinuteAll();
    }
    
    this.notesPerMinuteRow = function(row) {
        return this.keyHist.keyPerMinuteRow(row);
    }
    
    this.keysPressed = function() {
        var count = 0;
        for(var key in this.keyPressed) {
            if (typeof this.keyPressed[key] != undefined && this.keyPressed[key]) {
                count++;
            }
        }
        return count;
    }
    
    this.deleteNote = function(d_note) {
        var i = this.note.indexOf(d_note);
        if (i > -1) {
            this.note[i] = null;
            this.amConn[i] = null;
            this.fmConn[i] = null;
        }
        this.debugUpdate();
    }
    
    this.debugUpdate = function() {
        if (debug) {
            debug.update("keysPressed", this.keysPressed());
            debug.update("notesPlaying", this.notesPlaying());
            debug.update("notesAlive", this.notesAlive());
            debug.update("notesPerMinute", this.notesPerMinuteAll());
            debug.update("notesPerMinuteRow0", this.notesPerMinuteRow(0));
            debug.update("notesPerMinuteRow1", this.notesPerMinuteRow(1));
            debug.update("notesPerMinuteRow2", this.notesPerMinuteRow(2));
            debug.update("notesPerMinuteRow3", this.notesPerMinuteRow(3));
            debug.update("fmConnectionsAlive", this.fmConnectionsAlive());
            debug.update("amConnectionsAlive", this.amConnectionsAlive());
        }
    }
    
}


function SynthNote(freq, velVal, attT, decT, susVal, relT, pan, output) {
    this.osc = context.createOscillator();
    this.gain = context.createGain();
    this.panner = context.createPanner();
    this.panner.panningModel = 'equalpower'; //or 'HRTF', headphones
    this.panner.distanceModel = 'inverse'; //is default, other are 'linear', exponential.
    this.panner.setPosition(pan,0,0);
    
    this.osc.frequency.value = freq;
    this.gain.gain.value = 0;
    
    this.osc.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(output);
    
    this.osc.isPlaying = false;
    this.osc.note = this;
    this.osc.onended = function() {
        this.isPlaying = false;
        synth.deleteNote(this.note);
    }
    
    this.start = function () {
        now = context.currentTime;
        att = now + attT;
        cur_gain = this.gain.gain.value;
        
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(cur_gain, now);
     
        if (!this.isPlaying() && cur_gain < susVal*velVal) {
            dec = att + decT;
            this.gain.gain.linearRampToValueAtTime(velVal, att);
            this.gain.gain.linearRampToValueAtTime(susVal*velVal, dec);
            this.osc.isPlaying = true;
            this.osc.start();
        } else {
            this.gain.gain.linearRampToValueAtTime(susVal*velVal, dec);
        }
    };

    this.stop = function () {
        now = context.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now); //really? wtf..
        this.gain.gain.linearRampToValueAtTime(0, now + relT);
        this.osc.stop(now + relT);  
    };
    
    this.isPlaying = function () {
        return this.osc.isPlaying;
    };
    
}

function SynthAMConn (nodeOut, gainIn, initGain) {
    this.gain = context.createGain();
    this.gain.gain.value = initGain;
    
    nodeOut.connect(this.gain);
    this.gain.connect(gainIn.gain);
   
    this.setGain = function(gainVal, time) {
        var now = context.currentTime 
        //this.gain.gain.value = gainVal;        
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(gainVal, now+time);
    }

}

function SynthFMConn (nodeOut, oscIn, initGain) {
    this.gain = context.createGain();
    this.gain.gain.value = initGain;
    
    //sounds ok like this, guess i don't have to calulate an ofset for the destination freq
    //this.basefreq = oscIn.frequency;
    
    nodeOut.connect(this.gain);
    this.gain.connect(oscIn.frequency);
   
   this.setGain = function(gainVal, time) {
        var now = context.currentTime ;
        //this.gain.gain.value = gainVal;        
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(gainVal, now+time);
    }
    
}

function SynthKeyHist() {
   this.deltaMap = {};
   this.startTime = context.currentTime;
   this.lastClean = -1;
   this.lastDelta = 0;
   
   
   this.getTimeIndex = function(time) {
       return Math.round(time *1000);
   }
   
   this.push = function(key) {
       var delta = this.getTimeIndex(context.currentTime - this.startTime);
       this.deltaMap[delta] = key;
       this.lastDelta = delta;
   }
   
   this.getLast = function() {
       return this.deltaMap[this.lastDelta];
   }
   
   this.getLastOther = function(key) {
       if (this.getLast() != key) {
           return this.getLast();
       }
       var highest_delta = 0;
       for (var delta in this.deltaMap) {
           if (this.deltaMap[delta] != key && delta > highest_delta) {
               highest_delta = delta;
           }
       }
       if (highest_delta > 0) {
           return highest_delta;
       }
       return null;
   }
   
   this.clean = function(key) {
       var clean = this.getTimeIndex( context.currentTime  - 60);
       if (clean < 0 || clean - this.lastClean < 1) {
           return;
       }
       for(var delta in this.deltaMap) {
           if (delta < clean && this.deltaMap[delta]) {
               this.deltaMap[delta] = null;
           }
       }
       this.lastClean = clean;
   }
   
   this.countAll = function() {
       this.clean();
       var count = 0;
       for(var delta in this.deltaMap) {
           if (this.deltaMap[delta]){
               count++;
           }
       }
       return count;
   }
   
   this.countRow = function(row) {
       this.clean();
       var count = 0;
       var min = row*10;
       var max = (row+1)*10;
       for(var delta in this.deltaMap) {
           if (this.deltaMap[delta] && 
               this.deltaMap[delta] >= min && this.deltaMap[delta] < max
           ) {
               count++;
           }
       }
       return count;
   } 
   
   this.keyPerMinuteAll = function() {
       var count = this.countAll() 
       var delta = Math.min(60,context.currentTime  - this.startTime)/60;
       if (delta > 0) {
            return count/delta;
       }
       return 0;
   }
   
    this.keyPerMinuteRow = function(row) {
       var count = this.countRow(row) 
       var deltaMin = Math.min(60, context.currentTime  - this.startTime)/60;
       if (deltaMin > 0) {
            return count/(deltaMin);
       }
       return 0;
   }
   
}