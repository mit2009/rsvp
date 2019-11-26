import * as React from "react";
import * as ReactDOM from "react-dom";


import axios from "axios";

import { IGameRenderData, TeamColor } from "../server/api/gameRenderData";
import { ILeaderboardScore } from "../server/utils/leaderboard";
import { GameApp } from "./components/game";

import * as socketio from "socket.io-client";

const SOCKET_URL = "http://localhost:8001";


enum GameState {
    ATTRACT,
    CHOOSE_CHARACTER,
    STAGING,
    PLAYING,
    INSTRUCTIONS,
    NAME_COLLECTION,
    RECAPITULATE,
    ERROR,
}

export interface IGamePageState {
    gameState: GameState;
    level: number;
    gameData?: IGameRenderData;
    leaderboard?: ILeaderboardScore[];
    guid?: string;
    nameValue: string;
    score: number;
    musicPlaying: boolean;
}

export class GamePage extends React.PureComponent<{}, IGamePageState> {
    private socket: SocketIOClient.Socket = socketio(SOCKET_URL);

    private keyStore: boolean[] = [false, false, false, false, false];
    private backgroundSoundRef: HTMLAudioElement;

    constructor(props: any) {
        super(props);

        //this.backgroundSoundRef = React.createRef();

        this.socket.on("levelUpdate", (data: any) => {
            this.setState({
                gameData: JSON.parse(data) as IGameRenderData,
            });
        });

        this.state = {
            gameState: GameState.ATTRACT,
            level: 1,
            nameValue: "",
            score: 0,
            musicPlaying: true,
        };
        axios
            .get("game/leaderboard")
            .then(res => {
                this.setState({
                    leaderboard: res.data,
                });
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });

        this.handleNameChange = this.handleNameChange.bind(this);
    }

    private gameControls = (event: any) => {
        if (event.keyCode === 38 || event.keyCode === 87) {
            // up
            this.keyStore[0] = true;
        } else if (event.keyCode === 37 || event.keyCode === 65) {
            // left
            this.keyStore[2] = true;
        } else if (event.keyCode === 40 || event.keyCode === 83) {
            // down
            this.keyStore[1] = true;
        } else if (event.keyCode === 39 || event.keyCode === 68) {
            // right
            this.keyStore[3] = true;
        } else if (event.key === " ") {
            this.keyStore[4] = true;
        }
    };

    private gameControlsRelease = (event: any) => {
        if (event.keyCode === 38 || event.keyCode === 87) {
            // up
            this.keyStore[0] = false;
        } else if (event.keyCode === 37 || event.keyCode === 65) {
            // left
            this.keyStore[2] = false;
        } else if (event.keyCode === 40 || event.keyCode === 83) {
            // down
            this.keyStore[1] = false;
        } else if (event.keyCode === 39 || event.keyCode === 68) {
            // right
            this.keyStore[3] = false;
        } else if (event.key === " ") {
            this.keyStore[4] = false;
        }
    };

    public componentDidMount() {
        document.addEventListener("keydown", this.gameControls);
        document.addEventListener("keyup", this.gameControlsRelease);
    }
    public componentWillUnmount() {
        document.removeEventListener("keydown", this.gameControls);
        document.removeEventListener("keyup", this.gameControlsRelease);
    }
    public render() {
        let backgroundImage = "";
        let html = <div>Loading...</div>;
        switch (this.state.gameState) {
            case GameState.ATTRACT:
                const leaderboard = this.state.leaderboard ? this.state.leaderboard : [];
                backgroundImage = "attract";
                html = (
                    <div className="game-sized-container start-page">
                        {/* <div>{JSON.stringify(this.state.leaderboard)}</div> */}
                        <div className="highscores-container">
                            <h1>Highscores</h1>
                            {leaderboard.map((value, key) => {
                                return (
                                    <div key={key} className="highscore-row">
                                        <div className="score">{value.score}</div>
                                        <div className={`color color-${TeamColor[value.team].toLowerCase()}`} />
                                        <div className="name">{value.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="button-container">
                            <button onClick={this.handleEnterGame} className="big-pushy play-btn">
                                Start Game
                            </button>
                            <button
                                onClick={() => {
                                    console.log("page click!");
                                    this.setState({
                                        gameState: GameState.INSTRUCTIONS,
                                    });
                                }}
                                className="big-pushy instructions-btn"
                            >
                                Instructions
                            </button>
                        </div>
                    </div>
                );
                break;
            case GameState.CHOOSE_CHARACTER:
                backgroundImage = "choose-character";
                html = (
                    <div className="game-sized-container">
                        <h1>choose your marshmallow</h1>
                        <div className="character-container">
                            <div onClick={this.handleCharacterSelect(TeamColor.ORANGE)} className="mallow mallow-orange" />
                            <div onClick={this.handleCharacterSelect(TeamColor.PURPLE)} className="mallow mallow-purple" />
                            <div onClick={this.handleCharacterSelect(TeamColor.SILVER)} className="mallow mallow-silver" />
                            <div onClick={this.handleCharacterSelect(TeamColor.BLUE)} className="mallow mallow-blue" />
                            <div onClick={this.handleCharacterSelect(TeamColor.YELLOW)} className="mallow mallow-yellow" />
                            <div onClick={this.handleCharacterSelect(TeamColor.PINK)} className="mallow mallow-pink" />
                            <div onClick={this.handleCharacterSelect(TeamColor.GREEN)} className="mallow mallow-green" />
                            <div onClick={this.handleCharacterSelect(TeamColor.RED)} className="mallow mallow-red" />
                        </div>
                    </div>
                );
                break;
            case GameState.STAGING:
                html = (
                    <div>
                        <h1>ready for level {this.state.level}</h1>
                        <button onClick={this.handleStart}>Start Level (or hit enter)</button>
                    </div>
                );
                break;
            case GameState.NAME_COLLECTION:
                html = (
                    <div>
                        <h1>you died</h1>
                        <h2>your final score</h2>
                        <input
                            placeholder="Nickname"
                            type="text"
                            value={this.state.nameValue}
                            onChange={this.handleNameChange}
                        />
                        <button onClick={this.handleNameSubmit}>Submit</button>
                    </div>
                );
                break;
            case GameState.RECAPITULATE:
                html = (
                    <div>
                        <h1>you died</h1>
                        <h2>your final score</h2>
                        <p>{JSON.stringify(this.state.leaderboard)}</p>
                        <p>{this.state.score}</p>
                        <button onClick={this.handleRestart}>Restart</button>
                    </div>
                );
                break;
            case GameState.INSTRUCTIONS:
                html = (
                    <div>
                        <h1>Instructions!</h1>
                        <button
                            onClick={() => {
                                console.log("page click!");
                                this.setState({
                                    gameState: GameState.ATTRACT,
                                });
                            }}
                            className="play-btn"
                        >
                            Back!
                        </button>
                    </div>
                );
                break;
            case GameState.PLAYING:
                html = (
                    <div>
                        <GameApp gameData={this.state.gameData} />
                    </div>
                );
                break;
            default:
                html = <div>Error! Please refresh the page.</div>;
        }

        return (<div className={`background-container ${backgroundImage}`}>
            <audio ref={(input) => { this.backgroundSoundRef = input }} src={"/sounds/background-sound.mp3"} autoPlay />
            {html}
        </div>);
    }

    private handleRestart = () => {
        this.setState({
            gameState: GameState.STAGING,
        });
    };

    private handleNameChange(event: any) {
        const nameValue = event.target.value.replace(/[^A-Za-z0-9]/g, "").str.substring(0, 20);;

        this.setState({
            nameValue,
        });
    }

    private handleEnterGame = () => {
        // post to server, store token in state
        console.log("Starting Game. Exciting!");
        this.backgroundSoundRef.pause();

        axios
            .post("/game/start")
            .then((res: any) => {
                console.log(res);
                this.setState({
                    guid: res.data.guid,
                    gameState: GameState.CHOOSE_CHARACTER,
                });
            })
            .catch((err: any) => console.log(err));
    };

    private handleStart = () => {
        // starts the game
        this.socket.emit("levelUp", this.state.guid);

        setInterval(() => {
            this.socket.emit("getUpdate", this.state.guid, ...this.keyStore);
        }, 80);

        this.setState({
            gameState: GameState.PLAYING,
        });
    };

    private handleNameSubmit = () => {
        // starts the game
        console.log("hello");
        axios
            .post("/game/playername", { playerName: this.state.nameValue })
            .then((res: any) => {
                console.log(res);

                this.setState({
                    leaderboard: res.data.leaderboard,
                    score: res.data.score,
                    gameState: GameState.RECAPITULATE,
                });
            })
            .catch((err: any) => console.log(err));
    };

    private handleCharacterSelect(color: TeamColor) {
        return () => {
            console.log("submitting team color ", color);

            axios
                .post("/game/team", {
                    teamColor: color,
                    guid: this.state.guid,
                })
                .then((res: any) => {
                    console.log(res);

                    this.setState({
                        gameState: GameState.STAGING,
                    });
                })
                .catch((err: any) => console.log(err));
        };
    }
}

ReactDOM.render(<GamePage />, document.getElementById("game-content"));
