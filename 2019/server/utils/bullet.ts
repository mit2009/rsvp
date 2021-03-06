import { IRenderableImage, IShape } from "../api/gameRenderData";
import { bulletWidth, bulletHeight, widthOffset, heightOffset, tileWidth, tileHeight, walls } from "../api/levelData";

export class Bullet {
    public xcor: number;
    public ycor: number;

    private deltaX: number;
    private deltaY: number;

    private playerFired: boolean;

    private bounces: number;

    private maxBounces: number;
    private velocity: number = 30;

    constructor(xcor: number, ycor: number, heading: number, playerFired: boolean, maxBounces: number = 1) {
        this.xcor = xcor;
        this.ycor = ycor;

        this.deltaX = this.velocity * Math.sin(heading);
        this.deltaY = -this.velocity * Math.cos(heading);

        this.playerFired = playerFired;

        this.bounces = 0;
        this.maxBounces = maxBounces;
    }

    getFiredByPlayer() {
        return this.playerFired;
    }

    update(timeDelta: number, levelMap: number[][]) {
        this.xcor += this.deltaX * timeDelta;
        const xmapY = Math.floor(this.ycor / tileHeight);
        const xmapX = Math.floor((this.xcor + (bulletWidth / 2) * Math.sign(this.deltaX)) / tileWidth);
        if ((xmapY < 0) || (xmapX < 0) || (xmapY >= levelMap.length) || (xmapX >= levelMap[xmapY].length)) {
            return false;
        }
        if (~walls.indexOf(levelMap[xmapY][xmapX])) {
            this.deltaX = -this.deltaX;
            this.xcor = Math.floor(this.xcor * 4) / 4 + Math.sign(this.deltaX);
            this.bounces += 1;
        }
        this.ycor += this.deltaY * timeDelta;

        const ymapY = Math.floor((this.ycor + (bulletHeight / 2) * Math.sign(this.deltaY)) / tileHeight);
        const ymapX = Math.floor(this.xcor / tileWidth);
        if ((ymapY < 0) || (ymapX < 0) || (ymapY >= levelMap.length) || (ymapX >= levelMap[ymapY].length)) {
            return false;
        }
        if (~walls.indexOf(levelMap[ymapY][ymapX])) {
            this.deltaY = -this.deltaY;
            this.ycor = Math.floor(this.ycor * 4) / 4 + Math.sign(this.deltaX);
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
