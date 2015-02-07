/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function FloatShaper(context, channelCount) {
    this.bufferSize = 4096;
    
    this.context = context;
    this.node = context.createScriptProcessor(this.bufferSize, channelCount, channelCount);
    
    this.node.shaper = this;
    
    this.node.onaudioprocess = function(e) {
        for(channel = 0; channel < this.channelCount; channel++) {
            this.shaper.process(e, channel);
        }
    }
    
    this.squareTable = [0];
    this.linearTable = [0];
    this.sineTable = [0];
   
    //this.currentTable = [];
    
    //AudioContext driven Parameters
    this.node.dryWet = new FloatShaperParam(this);
    
    //own parameters
    this.node.drive = 0.7;
    this.node.wrapSelector = 0.; //fade between: 0 clip, 0.5 bounce, 1 wrap
    this.node.shapeSelector = 0.1;//fade betwee: 0 linear, 0.5 sine, 1 square
        
    //build some waves to shape with, and pre-calculate the productfactor, and only save the positive amount.
    //yeah.. something like that.
    
    for(i=1; i< this.bufferSize; i++) {
        var xVal = i/this.bufferSize;    
        this.linearTable[i] = 1; //so yeah x*1 = x i know, that's why it's linear, it's for reference
        this.sineTable[i] = 1/Math.sin(xVal*Math.PI*2);
        this.squareTable[i] = 1/xVal;
    }
   
    
    this.process = function(event, channel) {
        var shape = this.node.shapeSelector;
        var input = event.inputBuffer.getChannelData(channel);
        var output = event.outputBuffer.getChannelData(channel);
        var factor = 0;
        var clip = false;
        var max = 0.;
        for(var i=0; i< this.bufferSize; i++) {
            var yVal = Math.abs(input[i]*this.bufferSize);
            var index = Math.floor(yVal);
            var weight = yVal - index;
            var next = (index+1) & (this.bufferSize-1);
            var factor = 0;
            if (shape < 0.5) {
                factor = (
                            (
                                (0.5 - shape) * this.linearTable[index] + shape * this.sineTable[index]
                            ) *( 1. - weight) +
                            (
                                (0.5-shape) * this.linearTable[next] + shape * this.sineTable[next]
                            ) * weight
                        )*2.;
            } else {
                factor = ((shape)*this.sineTable[index] + (shape-0.5)*this.squareTable[index])*2 +
                ((0.5-shape)*this.linearTable[index] + (shape)*this.sineTable[index])*2
            }
            output[i] = Math.max(Math.min(input[i] * (isNaN(factor) ? 0. : factor), 1.), -1.);
            max = Math.max(max, Math.abs(output[i]))
            if (max == 1) {
                clip = true;
            }
        }
        //c('last process max: '+max+', clip: '+clip );
    }
    
    return this.node;
    
}

function FloatShaperParam(shaper) {
    this.shaper = shaper;
    //this.implementsInterFaces(['AudioParam']);
    
}

