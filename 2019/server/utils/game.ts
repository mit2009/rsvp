import { Bullet } from "./bullet";
import { Player } from "./player";
import { Monster } from "./monster";
import { TeamColor, IGameRenderData } from "../api/gameRenderData"
import { LevelData, Coordinate, getLevelData } from "../api/levelData"

export class Game {

    teamColor: TeamColor = null;

    currentLevel: number;
    score: number;
    livesLeft: number;

    maxLives: number = 3;

    ableToLevel: boolean;

    lastUpdated: number;
    player: Player;
    bullets: Bullet[];
    levelData: LevelData;
    monsters: Monster[];

    constructor() {
        this.score = 0;
        this.currentLevel = 0;
        this.livesLeft = this.maxLives;

        this.ableToLevel = false;
    }

    changeTeam(team: TeamColor) {
        this.teamColor = team;
        this.ableToLevel = true;
        return true;
    }

    levelUp() {
        this.ableToLevel = false;
        this.currentLevel += 1;

        this.bullets = [];
        this.monsters = [];

        this.levelData = getLevelData(this.currentLevel);
        const playerData = this.levelData.playerLocation;

        this.player = new Player(playerData.x, playerData.y, 0);
        this.monsters = this.levelData.enemyLocation.map(m => new Monster(m.x, m.y, 1));

        this.lastUpdated = Date.now();
        
        return this.getBlob()
    }

    update(left: boolean, right: boolean, forward: boolean, fire: boolean) {
        const currentTime = Date.now();
        const timeDelta = (currentTime - this.lastUpdated) / 250

        this.player.update(timeDelta, left, right, forward);

        this.bullets = this.bullets.filter((b) => b.update(timeDelta));

        if (fire) {
            this.bullets.push(this.player.fireBullet());
        }

        this.lastUpdated = currentTime;
    }

    getBlob() {
        return {
            currentLevel: this.currentLevel,
            score: this.score,
            teamColor: this.teamColor,
            livesLeft: this.livesLeft,
            playSound: [],
            imagesToRender: {
                'player1': this.player.getBlob()
            },
            bullets: this.bullets.map(b => b.getBlob()),
            monsters: this.monsters.map(m => m.getBlob()),
            // tiles : {
            //
            // }
            //player: this.player.getBlob(),
            // bullets: this.bullets.map((b) => b.getBlob()),
        } as IGameRenderData
    }
}
