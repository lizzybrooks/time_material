

let myFont;
let specialFont;
let fontRegular;

let fader = 254;
let fading = true;
let nextMeeting = "Sunday, November 24th, 2-5pm \n 1364 Rose St. Berkeley, CA 94702 \n (thank you Neil for hosting!)"
let prompt = "Externalize your worry so you can talk back to it, or \n Picture your anxiety as a character and give it a name."
let mission = "Artists | Parents \n exploring slowness \n celebrating process \n making work in community. "
let contact = "time.material.collective@gmail.com | @time.material"

let sands = [];

var scribble;

function preload() {
  myFont = loadFont('fonts/Jonah-Regular.ttf');
  specialFont = loadFont('fonts/GarlicSaltExtras-Regular.otf');
  fontRegular = loadFont('fonts/ModernSans-Light.otf');
}

function setup() {
  createCanvas(windowWidth,windowHeight);
  angleMode(DEGREES);
  rectMode(CENTER);
  let first = new SandGrain(width/2-60, 180,random(0,360),width/2-20,height-5)
  sands.push(first);
  scribble = new Scribble();              // global mode
  scribble.bowing = 2;          // changes the bowing of lines
  scribble.roughness = 2;       // changes the roughness of lines

  background(240);
  stroke(130, 80, 57)
  strokeWeight(6)
  noFill();
  scribble.scribbleLine(0,0,width/2-30,height/2)
  scribble.scribbleLine(width,0,width/2+20,height/2)
  scribble.scribbleLine(width/2-30,height/2,0,height)
  scribble.scribbleLine(width/2+20,height/2,width,height)


  textAlign(CENTER);
  noStroke();
  fill(207, 4, 63,fader);
  fill(130, 80, 57)
  textFont(myFont);
  textSize(70);
  text('Time  Material', width/2, height/4);






  textSize(50);
  text('next meeting',width/5,height/2);
  text('prompt',width-width/5,height/2)

  textFont(fontRegular, 22)
  text(nextMeeting,width/5,height/2+40)
  text(prompt,width-width/5,height/2+40)

  //textAlign(RIGHT)


  textAlign(CENTER);
  textFont(specialFont)
  textSize(20);
  text('P', width/2-60, height/4-20);


}

function draw(){
    noStroke();
    textFont(specialFont)
    textSize(20);
    text('P', width/2-60, height/4-20);


    fill(240)
    rect(width/2, height-height/4+40,270,120)
    rect(width/2,height/4+33,500,30)
    fill(130, 80, 57)
    textFont(fontRegular, 22)
    text(mission, width/2, height-height/4)
    text(contact,width/2,height/4+40)

    if(frameCount % 700 == 0){
        let s = new SandGrain(width/2-60, 180,random(0,360),width/2+random(-50,50),height-random(10,50))
        sands.push(s);
    }

    for (let i=0;i<sands.length;i++){
        sands[i].drawSand();
        sands[i].sandFall();
        sands[i].collectSand();
    }




    // if (fader>0 && fading == true){
    //     fader--;
    // }
    //
    // else if (fader == 0){
    //     fading = false;
    // }
    //
    // if (fader < 255 && fading == false){
    //     fader++;
    // }
    //
    // else if (fader == 255){
    //     fading = true;
    // }

}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }


class SandGrain {

    constructor(x,y,rotation,restingX,restingY){
        this.x = x;
        this.y = y;
        this.rota = rotation;
        this.restingX=restingX;
        this.restingY=restingY;
    }

    drawSand(){
        fill(240)
        textFont(specialFont)
        textSize(25);
        text('P', this.x-4, this.y-2);
        text('P', this.x, this.y-2);


        fill(130, 80, 57)
        textFont(specialFont)
        textSize(20);
        text('P', this.x, this.y);


    }

    sandFall(){
        if(this.y<=height-10){
            if(this.y>=height/2-35 && this.y<=height/2){
                this.x+=1.5;
                    }
            this.y ++;

        }

    }

    collectSand(){
        // if(this.y>height){
        //
        // }
    }

}
