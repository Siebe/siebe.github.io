/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function Debug() {
    
    this.div_debug_style = {
      'position' : 'absolute',
      'height' : '768px', 'width' :  '256px',
      'top' : '5px', 'right' : '5px',
      'padding' : '5px',
      'color' : 'rgba(0,0,0,0.7)',
      'font' : '12px monospace',
      'border' : 'solid 1px rgba(0,0,0,0.5)'
    };

    jfk_debug = this;
    
    this.callbackList = []
    this.debugLine = {};
    this.debugVal= {};

    this.renderOnUpdate = true;

    this.renderHTML = function () {

        this.div_debug = document.getElementById('debug');

        if (typeof this.div_debug == 'undefined' || !this.div_debug) {
        
            this.div_debug = document.createElement("div");   
            document.body.appendChild(this.div_debug);
            this.div_debug.id = 'debug';
            for (var style in this.div_debug_style) {
                this.div_debug.style.setProperty(style, this.div_debug_style[style]);
            }
            var p_debug_title = document.createElement("p");
            this.div_debug.appendChild(p_debug_title);
            p_debug_title.id = 'debug-title';
            p_debug_title.innerHTML = "- Debug parameters -";
        }
        
        for (param in this.debugLine) {
            
            if (typeof this.debugLine[param].id == 'undefined') {
                this.debugLine[param] = document.createElement("p");  
                this.div_debug.appendChild(this.debugLine[param]);
                this.debugLine[param].className = "debug-line";
                this.debugLine[param].id = param;
            }
            this.debugLine[param].innerHTML = param+": "+this.debugVal[param];
        }

    }   


    this.update = function(param, text) {
        if (typeof this.debugLine[param] == 'undefined') {
            var line = {};
            this.debugLine[param] = line;
        }
        this.debugVal[param] = text;
        
        if(document.readyState == "complete" && this.renderOnUpdate) {
            this.renderHTML();
        }
    }
    
    this.register = function(object, callback) {
        if (typeof object == 'object' && typeof callback == 'function') {
            this.callbackList.push([object, callback]);
        }
    }
    
    this.autoUpdate = function() {
        auto = setInterval(function () {
            var render = jfk_debug.renderOnUpdate;
            jfk_debug.renderOnUpdate = false;
            for(var i = 0; i < jfk_debug.callbackList.length; i++) {
                jfk_debug.callbackList[i][1].apply(jfk_debug.callbackList[i][0]);
                
            }
            
            jfk_debug.renderOnUpdate = render;
            jfk_debug.renderHTML();
            
        }, 1000);
    }

}