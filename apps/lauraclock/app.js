var locale = require("locale");
var widgetsHeight = 24;

var clocks = require("Storage").readJSON("lauraclock.clocks.json");
var img, bgOptions, currentClock;

function getImage() {
  let date = new Date();
  let newClock;
  for (let i = 0; i < clocks.length; i++) {
    let clock = clocks[i];
    if(clock.start.hour < date.getHours() || (clock.start.hour == date.getHours() && clock.start.minute <= date.getMinutes())) {
      if(newClock) {
        let diffHours = newClock.start.hour - clock.start.hour;
        if(diffHours < 0) {
          newClock = clock;
        } else if(diffHours == 0) {
          let diffMinutes = newClock.start.minute - clock.start.minute;
          if(diffMinutes < 0) {
            newClock = clock;
          }
        }
      } else {
        newClock = clock;
      }
    }
  }
  if(currentClock != newClock) {
    currentClock = newClock;
    img = require("Storage").read("lauraclock." + currentClock.name + ".img");
    let bgWidth = img.charCodeAt(0);
    if (bgWidth < g.getWidth())
      bgOptions = { scale : g.getWidth() / bgWidth };
  }
}

function draw() {
  getImage();
  let date = new Date();
  g.clearRect(0, widgetsHeight, g.getWidth(), g.getHeight());
  g.drawImage(img, 0, widgetsHeight, bgOptions);

  g.setFontAlign(0, 0);

  g.setColor(currentClock.time.color);
  g.setFont("Vector", currentClock.time.size);
  g.drawString(date.getHours() + ":" +("0"+date.getMinutes()).substr(-2), currentClock.time.x, currentClock.time.y + widgetsHeight);

  if(currentClock.seconds) {
    g.setColor(currentClock.seconds.color);
    g.setFont("Vector", currentClock.seconds.size);
    g.drawString(("0"+date.getSeconds()).substr(-2), currentClock.seconds.x, currentClock.seconds.y + widgetsHeight);
  }

  g.setColor(currentClock.date.color);
  g.setFont("Vector", currentClock.date.size);
  g.drawString(locale.date(date), currentClock.date.x, currentClock.date.y + widgetsHeight);
}

g.clear(true);

draw();
var secondInterval = setInterval(draw, 1000);
// Show launcher when button pressed
Bangle.setUI("clock");
// load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
// Stop when LCD goes off
Bangle.on('lcdPower', on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 1000);
    draw();
  }
});