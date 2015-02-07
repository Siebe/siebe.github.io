/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */




function SynthKeyboard() {
    
    jfk_synth_keyboard = this;
    
    this.defaultVelocity = 1.;
    this.keyMode = 'matrix';
    this.pianoOctave = 2;
    
    //keyboard keys for a 4x10 button matrix
    this.key_matrix_table = {
        49: 0,  50: 1,  51: 2,  52: 3,  53: 4,  54: 5,  55: 6,  56: 7,  57: 8,  48: 9,
        81: 10, 87: 11, 69: 12, 82: 13, 84: 14, 89: 15, 85: 16, 73: 17, 79: 18, 80: 19,
        65: 20, 83: 21, 68: 22, 70: 23, 71: 24, 72: 25, 74: 26, 75: 27, 76: 28, 186: 29,
        90: 30, 88: 31, 67: 32, 86: 33, 66: 34, 78: 35, 77: 36, 188: 37, 190: 38, 191: 39   
    };

    //keyboard keys for a two octave piano (plus some)
    this.key_piano_table = {
        81: 0, 50: 1, 87: 2, 51: 3, 69: 4, 82: 5, 53: 6, 84: 7, 54: 8, 89: 9, 55: 10, 85: 11, //C1 to B1, upper row
        73: 12, 48: 13, 80: 14, 189: 15, 219: 16, 221: 17, //C2 to F2, upper row
        90: 12, 83: 13, 88: 14, 68: 15, 67: 16, 86: 17, 71: 18, 66: 19, 72: 20, 28: 21, 74: 22, 77: 23, //C2 to B2, lower row
        188: 24, 76: 25, 190: 26, 186: 27, 191: 28 //C3 to E3 lower row
    };
    
    //list with callback functions (note on and off triggers
    this.callbackList = [];
  
    //the listener:
    this.keyListener = function(keyCode, trigger) {
        var key = this.convertKey(keyCode);
        if (key < 0) {
            return;
        }
        
        //iterate all callbacks
        for(var i = 0; i < this.callbackList.length; i++) {
           this.callbackList[i][1].apply(this.callbackList[i][0], [key, trigger*this.defaultVelocity]);
        }
    }
    
    //init pc keyboard listeners
    this.init = function() {
        window.addEventListener('keydown', function(event) { jfk_synth_keyboard.keyListener(event.keyCode, 1)});
        window.addEventListener('keyup', function(event) { jfk_synth_keyboard.keyListener(event.keyCode, 0)});
    }

    
    this.convertKey = function(keyCode) {
        var table = (this.keyMode == 'piano') ? this.key_piano_table : this.key_matrix_table;
        if (table[keyCode] == 'undefined' || table[keyCode] === null) {
            return -1;
        }
        return table[keyCode] + (this.keyMode == 'piano') * this.pianoOctave * 12;
    }
    
    //register a callback, callback function has to be function(key, velocity)
    this.connect = function(object, callback) {
        if (typeof object == 'object') {
            if(typeof callback == 'undefined') {
                callback = object.trigger;
            }
            if (typeof callback == 'function') {
                this.callbackList.push([object, callback]);
            }
        }
    }
    
   
    
}