const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080, host: "0.0.0.0" });

var areaSize = 1500;

var players = [];

var map = {
    trees: [],
    rocks: []
};

wss.on("connection", (ws) => {
    console.log("Client connection attempt");

    ws.once("message", (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === "sendName") {
            const playerName = parsedMessage.data.name;

            if (playerName === "NULL - Player name not set") {
                const infoMessage = {
                    type: "info",
                    data: {
                        text: "connection_fail"
                    }
                };

                ws.send(JSON.stringify(infoMessage));

                console.log("Client connection aborted, invalid player, null_player");
                ws.disconnected = true;

                return;
            }

            for (let player of players) {
                if (playerName === player.name) {
                    const errorMessage = {
                        type: "error",
                        data: {
                            text: "bad_name"
                        }
                    };

                    ws.send(JSON.stringify(errorMessage));

                    const infoMessage = {
                        type: "info",
                        data: {
                            text: "connection_fail"
                        }
                    };

                    ws.send(JSON.stringify(infoMessage));

                    console.log("Client connection aborted, invalid player, bad_name");
                    ws.disconnected = true;

                    return;
                }
            }

            const playerNameRegex = /^[a-zA-Z0-9_-]{1,15}$/;

            if (!playerNameRegex.test(playerName)) {
                const errorMessage = {
                    type: "error",
                    data: {
                        text: "bad_name"
                    }
                };

                ws.send(JSON.stringify(errorMessage));

                const infoMessage = {
                    type: "info",
                    data: {
                        text: "connection_fail"
                    }
                };

                ws.send(JSON.stringify(infoMessage));

                const broadcastMessage = {
                    type: "broadcast",
                    data: {
                        text: "Please chose another name with no spaces, and no special characters other than \"-\" and \"_\" that is no more than 15 characters long."
                    }
                }

                ws.send(JSON.stringify(broadcastMessage));

                console.log("Client connection aborted, invalid player, bad_name");
                ws.disconnected = true;
                
                return;
            }

            console.log("Client connection successful");

            console.log(`Player name received: ${playerName}`);

            const infoMessage = {
                type: "info",
                data: {
                    text: "connection_sucess"
                },
            };

            ws.send(JSON.stringify(infoMessage));

            const newConnectionMessage = {
                type: "newPlayer",
                data: {
                    name: playerName,
                },
            };

            const existingPlayersMessage = {
                type: "existingPlayers",
                data: {
                    players: players,
                },
            };

            ws.send(JSON.stringify(existingPlayersMessage));
            console.log(`Sent ${players.length} players to client with names:`);
            for (let player of players) {
                console.log(player.name);
            }

            const mapMessage = {
                type: "map",
                data: {
                    trees: map.trees,
                    rocks: map.rocks,
                    size: areaSize
                }
            };
        
            ws.send(JSON.stringify(mapMessage));

            players.push({
                name: playerName,
                ws: ws,
            });

            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(newConnectionMessage));
                }
            });

            const playerConnectChatMessage = {
                type: "chat",
                data: {
                    text: `${playerName} joined the game`,
                    from: ""
                }
            };

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(playerConnectChatMessage));
                }
            });

            console.log(`${players.length} players connected`);
        } else {
            console.log(
                "Wrong packet recieved! Packet type was: ${parsedMessage.type}",
            );
        }
    });

    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === "chat") {
            console.log(
                "CHAT: " +
                    parsedMessage.data.from +
                    "> " +
                    parsedMessage.data.text,
            );
        }

        if (parsedMessage.type === "playerPosition" || parsedMessage.type === "chat") {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }

        if (parsedMessage.type === "playerDisconnect") {
            const player = players.find((player) => player.ws === ws);
            players = players.filter((player) => player.ws !== ws);

            const playerDisconnectMessage = {
                type: "playerDisconnect",
                data: {
                    name: player.name,
                },
            };

            console.log(
                `${player.name} disconnected, ${players.length} players left`,
            );

            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(playerDisconnectMessage));
                }
            });

            const playerDisconnectChatMessage = {
                type: "chat",
                data: {
                    text: `${player.name} left the game`,
                    from: ""
                }
            };

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(playerDisconnectChatMessage));
                }
            });

            ws.disconnected = true;

            ws.close(1000, "Player disconnecting");
        }

        if (parsedMessage.type === "brokenFeatures") {
            for (let feature of parsedMessage.data.features) {
                map.trees = map.trees.filter(tree => tree.x !== feature.x && tree.y !== feature.y);
                map.rocks = map.rocks.filter(rock => rock.x !== feature.x && rock.y !== feature.y);
            }
        }
    });

    ws.on("close", () => {
        if (ws.disconnected) {
            return;
        }

        const player = players.find((player) => player.ws === ws);
        players = players.filter((player) => player.ws !== ws);

        if (!player) {
            console.log("Invalid disconnect");

            const broadcastMessage = {
                type: "broadcast",
                data: {
                    text: "If you are rapidly connecting and disconnecting, please stop, my terrible code quite literally can't take it and you may crash the server. It's also possible I screwed something up even more than I expected. Thanks."
                }
            };

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(broadcastMessage));
                }
            });

            return;
        }

        const playerDisconnectMessage = {
            type: "playerDisconnect",
            data: {
                name: player.name,
            },
        };

        console.log(`${player.name} removed, ${players.length} players left`);

        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(playerDisconnectMessage));
            }
        });

        ws.close(1000, `Closing connection for ${player.name}`);
    });
});

console.log("WebSocket server is running on ws://localhost:8080");

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(function() {
    if (map.trees.length < 20) {
        map.trees.push({
            x: randomInt(3, areaSize - 3),
            y: randomInt(3, areaSize -3)
        })
    }
    if (map.rocks.length < 20) {
        map.rocks.push({
            x: randomInt(3, areaSize - 3),
            y: randomInt(3, areaSize -3)
        })
    }
}, 1000);

setInterval(function() {
    const mapMessage = {
        type: "map",
        data: {
            trees: map.trees,
            rocks: map.rocks,
            size: areaSize
        }
    };

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(mapMessage));
        }
    });
}, 500);