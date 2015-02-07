/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var impulseResponseBuffer;


function Echo(irLoc) {
    this.convolver = context.createConvolver();
    
    //this.convolver.buffer = impulseResponseBuffer;

    this.connect = function(destination) {
        this.convolver.connect(destination);
    }
    
    this.connectFrom = function(source) {
        source.connect(this.convolver);
    }
    
    
}


