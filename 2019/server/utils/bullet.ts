import { IRenderableImage, IShape } from "../api/gameRenderData";
import { bulletWidth, bulletHeight, widthOffset, heightOffset } from "../api/levelData";

export class Bullet {
    xcor: number;
    ycor: number;

    deltaX: number;
    deltaY: number;

    playerFired: boolean;

    bounces: number;

    maxBounces: number = 2;
    velocity: number = 20;

    constructor(xcor: number, ycor: number, heading: number, playerFired: boolean) {
        this.xcor = xcor;
        this.ycor = ycor;

        this.deltaX = this.velocity * Math.sin(heading);
        this.deltaY = -this.velocity * Math.cos(heading);

        this.playerFired = playerFired;

        this.bounces = 0;
    }

    update(timeDelta: number) {
        this.xcor += this.deltaX * timeDelta;

        if (this.xcor < 0 || this.xcor > 700) {
            this.deltaX = -this.deltaX;
            this.bounces += 1;
        }

        this.ycor += this.deltaY * timeDelta;

        if (this.ycor < 0 || this.ycor > 700) {
            this.deltaY = -this.deltaY;
            this.bounces += 1;
        }

        if (this.bounces > this.maxBounces) {
            return false;
        }
        return true;
    }

    getBlob() {
        return {
            pos: {
                x: this.xcor - bulletWidth / 2 + widthOffset,
                y: this.ycor - bulletHeight / 2 + heightOffset,
                w: bulletWidth,
                h: bulletHeight
            } as IShape,
            resourceId: 'bullet'
        } as IRenderableImage;
    }
}
