import * as $ from 'jquery';

/*

This was the story from 2017:

** some discussion about getting the RSVP page up and running **

[pause]

Charlene: Reasonably, is it possible to still make a game before Tomorrow morning?
Victor: haha
hahaha
Charlene: lol. nvm.

[5 hours & some discussions later]

Charlene: For the high score, is it a good idea to have people put "name" on the high score board

----
This game was lovingly made and programmed in under 10 hours
Thank to everyone involved
Sorry, Steph
---

AND NOW here is the story for 2018:

David: Well, we had one last year, so we should probably have a game this year as well

*/

enum GameState {
  CANVAS_GAME_PLAYING,
  CHARACTER_SELECTION,
  GAME_MENU,
  HIGHSCORES,
}

let gameState: GameState = GameState.GAME_MENU;

// let selectedDangleColor = 'pink';
let gameTimer;
let longholdTimer;
let ctx: CanvasRenderingContext2D;

const imageUrl = "../images/sprites-template_";
let canvasSize = 600;

let characterSpeed = 0;
let spriteProperties: any = {
  floor: {
    position: {
      x: 0,
      y: 525
    },
    velocity: {
      x: -35,
      y: 0
    },
    width: 1200,
    looping: true
  },
  background_2: {
    position: {
      x: 0,
      y: 0
    },
    velocity: {
      x: -5,
      y: 0
    },
    width: 1200,
    looping: true
  },
  background_1: {
    position: {
      x: 0,
      y: 225
    },
    velocity: {
      x: -35,
      y: 0
    },
    width: 1200,
    looping: true
  },
  dangle_pink: {
    position: {
      x: 30,
      y: 385
    },
    velocity: {
      x: 0,
      y: 0
    },
    isCharacter: true,
    frameTransitionSpeed: 0.5,
    currentFrame: 0,
    totalFrames: 3,
    isBent: false,
    width: 140,
    height: 140,
  }
}

let dangerArrayProperties = {
  position: {
    x: canvasSize * 2,
    y: 0,
  },
  velocity: {
    x: -40,
    y: 0
  },
  image: new Image(),
  width: 150,
  height: 50,
  spacesSinceLastKnife: 0,
  minSpacesBeforeNextKnife: 5
}
let dangerArray: any = [
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0]
]

let dangleCharacter = spriteProperties.dangle_pink;

let keyUpIsDown = 0;

for (const key in spriteProperties) {
  let sprite = spriteProperties[key];

  if (!sprite.totalFrames) {
    // standard image
    sprite['image'] = new Image();
    sprite.image.src = `${imageUrl}${key}.png`;
    sprite.image.onload = function () {
      console.log(`${key} image loaded`);
    }
  } else {
    // animated image
    sprite['image'] = {}
    for (let frame = 0; frame < sprite.totalFrames; frame++) {
      sprite['image'][frame] = new Image();
      sprite.image[frame].src = `${imageUrl}${key}_${frame}.png`;
      sprite.image[frame].onload = function () {
        console.log(`${key}, frame ${frame} image loaded`);
      }
    }
    if (sprite.isCharacter) {
      sprite.image['bent'] = new Image();
      sprite.image.bent.src = `${imageUrl}${key}_bent_0.png`;
    }
  }
}

// generate knife objects
for (let i = 1; i < 2; i++) {
  dangerArrayProperties.image.src = `${imageUrl}knife_${i}.png`;
  dangerArrayProperties.image.onload = function () {
    console.log(`${i} image loaded`);
  }
}


function init() {
  for (let i = 0; i < 8; i++) {
    $('.dangles-list').append($(`<li class="dangle" data-dangleid="${i}">dangle</li>`))
  }
  ctx = (<HTMLCanvasElement>document.getElementById('ctx')).getContext('2d');

  // here for debugging 
  gameStart();
  // end debugging
}

function gameStart() {
  console.log('starting game!');


  gameTimer = setInterval(renderFrame, 42);
  //ideally use renderFrame();
}

function renderFrame() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);


  // Render all sprites
  for (const key in spriteProperties) {
    let sprite = spriteProperties[key];
    let spriteImageName;

    if (sprite.totalFrames) {
      spriteImageName = sprite.image[Math.floor(sprite.currentFrame)];
      sprite.currentFrame = (sprite.currentFrame + sprite.frameTransitionSpeed) % sprite.totalFrames;
    } else {
      spriteImageName = sprite.image
    }

    // everything obeys physics
    sprite.position.x += sprite.velocity.x
    sprite.position.y += sprite.velocity.y

    // character logic is more complicated, handling it here and assuming no other characters in the future
    if (sprite.isCharacter) {
      sprite.velocity.y += 8;

      if (sprite.position.y >= 385) {
        sprite.velocity.y = 0;
        sprite.position.y = 385
      }
      if (sprite.isBent) {
        spriteImageName = sprite.image['bent'];
        ctx.drawImage(spriteImageName, sprite.position.x, sprite.position.y + 70);
      } else {
        ctx.drawImage(spriteImageName, sprite.position.x, sprite.position.y);
      }
    } else {
      // normal sprite movement and generation

      if (sprite.position.x < -sprite.width - sprite.velocity.y && sprite.looping) {
        sprite.position.x = 0
      }

      if (sprite.position.x < (600 - sprite.width) && sprite.looping) {
        ctx.drawImage(spriteImageName, sprite.position.x + sprite.width, sprite.position.y);
      }

      ctx.drawImage(spriteImageName, sprite.position.x, sprite.position.y);
    }
  }

  // Render the danger objects
  let firstDangerElement = Math.max(0, Math.floor(-dangerArrayProperties.position.x / dangerArrayProperties.width) - 1)
  let lastDangerElement = firstDangerElement + canvasSize / dangerArrayProperties.width + 2;
  for (let dangerIndex = firstDangerElement; dangerIndex < lastDangerElement; dangerIndex++) {
    console.log(dangerIndex);
    for (let knifeLevel = 0; knifeLevel < 5; knifeLevel++) {

      if (dangerArray[dangerIndex][knifeLevel] == 1) {

        let knifeX = dangerArrayProperties.position.x + dangerIndex * dangerArrayProperties.width
        let knifeY = spriteProperties.floor.position.y - knifeLevel * (dangerArrayProperties.height + 25) - dangerArrayProperties.height - 20;

        ctx.drawImage(dangerArrayProperties.image, knifeX, knifeY);

        //check collision
        let knifeW = dangerArrayProperties.width;
        let knifeH = dangerArrayProperties.height;
        let dangleX = dangleCharacter.position.x;
        let dangleY = dangleCharacter.position.y;
        let dangleW = dangleCharacter.width;
        let dangleH = dangleCharacter.height - 10;
        if (dangleCharacter.isBent) {
          dangleH /= 2;
          dangleY += dangleH
        }
        let dangleTheta = Math.atan(dangleH / (dangleW / 2))
        // check Y

        /*
        ctx.beginPath();
        ctx.moveTo(0, knifeY);
        ctx.lineTo(300, knifeY);
        ctx.strokeStyle = "black";
        ctx.strokeWidth = 2
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, dangleY + dangleH);
        ctx.lineTo(300, dangleY + dangleH);
        ctx.strokeStyle = "red";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, knifeY + knifeH);
        ctx.lineTo(300, knifeY + knifeH);
        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, dangleY + Math.tan(dangleTheta) * (knifeX - dangleX - dangleW / 2));
        ctx.lineTo(300, dangleY + Math.tan(dangleTheta) * (knifeX - dangleX - dangleW / 2));
        ctx.strokeStyle = "green";
        ctx.stroke();
        */


        let dangleA = (knifeY + knifeH - dangleY) / Math.tan(dangleTheta);
        let adjustedH = Math.max(dangleY + Math.tan(dangleTheta) * (knifeX - dangleX - dangleW / 2), dangleY)
        if (knifeY < dangleY + dangleH &&
          knifeY + knifeH > adjustedH) {

          console.log('vertical IN PATH!')
          // check X
          if (knifeX < dangleA + dangleW / 2 + dangleX && knifeX + knifeW > dangleX + dangleW / 2 - dangleA) {
            console.log('HITTTTTTTTTT!')
            window.clearInterval(gameTimer);
          }
        }
        console.log('dangleA is... ', dangleA)

        ctx.beginPath();
        ctx.moveTo(knifeX, 0);
        ctx.lineTo(knifeX, 300);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(dangleA + dangleW + dangleX / 2, 0);
        ctx.lineTo(dangleA + dangleW + dangleX / 2, 300);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();


      }
    }
  }
  dangerArrayProperties.position.x += dangerArrayProperties.velocity.x

  // Add danger array items
  // only add more array elements when running close to the end
  if (lastDangerElement > dangerArray.length - 1) {
    if (dangerArrayProperties.spacesSinceLastKnife >= dangerArrayProperties.minSpacesBeforeNextKnife) {
      let knifeArray = [0, 0, 0, 0, 0]
      knifeArray[Math.floor(Math.random() * 5)] = 1;
      dangerArray.push(knifeArray);
      dangerArrayProperties.spacesSinceLastKnife = 0;
    } else {
      dangerArray.push([0, 0, 0, 0, 0]);
      dangerArrayProperties.spacesSinceLastKnife++;
    }
  }

}

$(() => {

  $('.play-game-btn').on('click', () => {
    if (gameState === GameState.GAME_MENU) {
      gameState = GameState.CHARACTER_SELECTION;
      $('.game-menu').slideUp();
      $('.character-selection').slideDown();
    }
  })

  $(document).keydown((e) => {
    if (e.keyCode == 38) {
      keyUpIsDown = 1;
      // up you go
      if (dangleCharacter.position.y == 385) {
        dangleCharacter.velocity.y = -50;
        longholdTimer = setTimeout(() => {
          if (keyUpIsDown > 0) {
            if (dangleCharacter.velocity.y < 0 && dangleCharacter.position.y < 380 && dangleCharacter.position.y > 200) {
              dangleCharacter.velocity.y = -55;
            }
          }
        }, 120);
      }
    }
    if (e.keyCode == 40) {
      dangleCharacter.isBent = true;
    }
    return false;
  });

  $(document).keyup((e) => {
    if (e.keyCode == 40) {
      dangleCharacter.isBent = false;
    }
    if (e.keyCode == 38) {
      keyUpIsDown = 0;
      clearTimeout(longholdTimer);
    }
    return false;
  });

  $(document).on('click', '.dangle', function () {
    console.log($(this).data('dangleid'));
    gameState = GameState.CANVAS_GAME_PLAYING;
    $('.character-selection').slideUp();
    gameStart();
  })

  init();
})