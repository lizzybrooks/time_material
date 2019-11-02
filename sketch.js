

let myFont;
let specialFont;
let fader = 254;
let fading = true;

let sands = [];

var scribble;

function preload() {
  myFont = loadFont('fonts/Jonah-Regular.ttf');
  specialFont = loadFont('fonts/GarlicSaltExtras-Regular.otf');
}

function setup() {
  createCanvas(windowWidth,windowHeight);
  angleMode(DEGREES);
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

}

function draw(){






    textAlign(CENTER);
    noStroke();
    fill(207, 4, 63,fader);
    fill(130, 80, 57)
    textFont(myFont);
    textSize(70);
    text('Time  Material', width/2, 200);

    textSize(50);
    text('next meeting',width/5,height/2);
    text('prompt',width-width/5,height/2)


    textFont(specialFont)
    textSize(20);
    text('P', width/2-60, 180);



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
