"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
function getRouter() {
    // routes
    router.get("/", function (_req, res) {
        res.render("index", {
            layout: "layout",
            isHome: true,
        });
    });
    router.get("/webcast", function (_req, res) {
        res.render("webcast", {
            layout: "layout",
            isWebcast: true,
        });
    });
    router.get("/game", function (_req, res) {
        res.render("game", {
            layout: "layout",
            isGame: true,
        });
    });
    router.post("/game/start", function (_req, res) {
    });
    router.post("/game/team", function (_req, res) {
    });
    router.post("/game/playername", function (_req, res) {
    });
    router.get("/game/leaderoard", function (_req, res) {
        return {
            leaderoard: []
        };
    });
    return router;
}
exports.getRouter = getRouter;
//# sourceMappingURL=index.js.map