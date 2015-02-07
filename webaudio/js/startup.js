/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

try {
  // Fix up for prefixing
  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  context = new AudioContext();
}
catch(e) {
  context = false;
  alert('Web Audio API failed, no sounds D:');
}

c = function(log) {console.log(log)};

debug = new Debug(context);

keyboard = new SynthKeyboard();
envelope = new SynthEnvelope();
synth = new TestSynth(context);
analyser = new BackGroundAnalyser(context);
shaper = new FloatShaper(context, 2);
main_gain = context.createGain();

main_gain.gain.value = 0.1

synth.connect(shaper);
shaper.connect(analyser);
analyser.connect(main_gain);
main_gain.connect(context.destination);

envelope.connect(synth.gain.gain);

keyboard.connect(envelope);
keyboard.connect(synth);

window.addEventListener('DOMContentLoaded', function() {
    analyser.start();
    keyboard.init();
    debug.autoUpdate();
    
    
    shaper_canvas = document.createElement('canvas');
    shaper_canvas.id = 'shaper'
    shaper_style = {
      'position' : 'absolute',
      'height' : '64px', 'width' :  '256px',
      'top' : '5px', 'left' : '5px',
      'padding' : '5px',
      'z-index': '3'
        
    };
    
    
    for (var style in shaper_style) {
        shaper_canvas.style.setProperty(style, shaper_style[style]);
    }
    
    document.body.appendChild(shaper_canvas);
    
    shaper_ui = new K2.UI ({type: 'CANVAS2D', target: shaper_canvas});
    
    var ElementArgs = {
            ID: "testBar",
            left: 0,
            top : 0,
            thickness: 8,
            height: 64,
            width: 256,
            onValueSet: function (slot, value) {
                shaper_ui.refresh();
            },
            barColor: 'red',
            transparency: 0.5,
            isListening: true
        };
    /* Set the element-specific arguments here (...) */

    // Add element to the UI
    shaper_ui.addElement(new K2.Bar(ElementArgs, {zIndex: 5}));
    shaper_ui.setValue ( {elementID: 'testBar',
                            slot: 'barPos',
                            value: [128, 0]});
    shaper_ui.refresh();
    
    
    
    c('post-DOM ready');
}, false);

 c('pre-DOM ready');