// TODO: make gameScale server controlled so i can literally set the games scale for everyone in real time
// TODO: DO IT
// TODO: ISTG








var mobile = false;

if (/Mobi|Android/i.test(navigator.userAgent)) {
    console.log("Mobile device detected");
    mobile = true;
} else {
    console.log("Desktop device detected");
    mobile = false;
}

let socket;

var gameScale = 5;

var gameStarted = false;
var toChat = null;
var connected = false;

var frames = 0;

var chats = [];

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingQuality = 'low';

var areaSize = 1500;
var playerSize = 20;

var players = [
    {
        x: 200,
        y: 200,
        health: 100,
        name: "NULL - Player name not set"
    }
];

var map = {
    trees: [],
    rocks: []
};

var brokenFeaturesQueue = [

];

var lastPosition = {
    x: players[0].x,
    y: players[0].y
};

var input = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
}

const controlSize = 80;
const controlSizeString = `${controlSize}px`;

const topControl = document.getElementById('top');
const rightControl = document.getElementById('right');
const bottomControl = document.getElementById('bottom');
const leftControl = document.getElementById('left');
const middleControl = document.getElementById('space');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.getElementById('fullscreenButton').addEventListener('click', () => {
    if (!mobile) {
        alert('You are not on mobile! (All this does is fullscreen the game for smaller screens).');
        return;
    }
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    } else {
        alert('Fullscreen not supported');
    }
});

document.getElementById('toggleMobileButton').addEventListener('click', () => {
    mobile = !mobile;
    document.getElementById('mobileIdentifier').innerHTML = "You are <strong>" + (mobile ? "ON" : "NOT ON") + "</strong> mobile.";
});

document.getElementById('sendChatButton').addEventListener('click', () => {
    toChat = document.getElementById('chatInput').value;
});

document.getElementById('mobileIdentifier').innerHTML = "You are <strong>" + (mobile ? "ON" : "NOT ON") + "</strong> mobile.";

topControl.addEventListener('mousedown', (event) => {
    event.preventDefault();
    mobileInput('up', true);
});
topControl.addEventListener('mouseup', (event) => {
    event.preventDefault();
    mobileInput('up', false);
});
topControl.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    mobileInput('up', true);
});
topControl.addEventListener('pointerup', (event) => {
    event.preventDefault();
    mobileInput('up', false);
});
topControl.addEventListener('touchstart', (event) => {
    event.preventDefault();
    mobileInput('up', true);
});
topControl.addEventListener('touchend', (event) => {
    event.preventDefault();
    mobileInput('up', false);
});
rightControl.addEventListener('mousedown', (event) => {
    event.preventDefault();
    mobileInput('right', true);
});
rightControl.addEventListener('mouseup', (event) => {
    event.preventDefault();
    mobileInput('right', false);
});
rightControl.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    mobileInput('right', true);
});
rightControl.addEventListener('pointerup', (event) => {
    event.preventDefault();
    mobileInput('right', false);
});
rightControl.addEventListener('touchstart', (event) => {
    event.preventDefault();
    mobileInput('right', true);
});
rightControl.addEventListener('touchend', (event) => {
    event.preventDefault();
    mobileInput('right', false);
});
leftControl.addEventListener('mousedown', (event) => {
    event.preventDefault();
    mobileInput('left', true);
});
leftControl.addEventListener('mouseup', (event) => {
    event.preventDefault();
    mobileInput('left', false);
});
leftControl.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    mobileInput('left', true);
});
leftControl.addEventListener('pointerup', (event) => {
    event.preventDefault();
    mobileInput('left', false);
});
leftControl.addEventListener('touchstart', (event) => {
    event.preventDefault();
    mobileInput('left', true);
});
leftControl.addEventListener('touchend', (event) => {
    event.preventDefault();
    mobileInput('left', false);
});
bottomControl.addEventListener('mousedown', (event) => {
    event.preventDefault();
    mobileInput('down', true);
});
bottomControl.addEventListener('mouseup', (event) => {
    event.preventDefault();
    mobileInput('down', false);
});
bottomControl.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    mobileInput('down', true);
});
bottomControl.addEventListener('pointerup', (event) => {
    event.preventDefault();
    mobileInput('down', false);
});
bottomControl.addEventListener('touchstart', (event) => {
    event.preventDefault();
    mobileInput('down', true);
});
bottomControl.addEventListener('touchend', (event) => {
    event.preventDefault();
    mobileInput('down', false);
});
middleControl.addEventListener('mousedown', (event) => {
    event.preventDefault();
    mobileInput('space', true);
});
middleControl.addEventListener('mouseup', (event) => {
    event.preventDefault();
    mobileInput('space', false);
});
middleControl.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    mobileInput('space', true);
});
middleControl.addEventListener('pointerup', (event) => {
    event.preventDefault();
    mobileInput('space', false);
});
middleControl.addEventListener('touchstart', (event) => {
    event.preventDefault();
    mobileInput('space', true);
});
middleControl.addEventListener('touchend', (event) => {
    event.preventDefault();
    mobileInput('space', false);
});

function resizeMobileControls() {
    topControl.style.top = `${canvas.height - (controlSize * 3)}px`;
    topControl.style.left = `${controlSize}px`;
    rightControl.style.top = `${canvas.height - (controlSize * 2)}px`;
    rightControl.style.left = `${controlSize * 2}px`;
    bottomControl.style.top = `${canvas.height - (controlSize)}px`;
    bottomControl.style.left = `${controlSize}px`;
    middleControl.style.top = `${canvas.height - (controlSize * 2)}px`;
    middleControl.style.left = `${controlSize}px`;
    leftControl.style.top = `${canvas.height - (controlSize * 2)}px`;
    leftControl.style.left = `0px`;
    topControl.style.width = controlSizeString;
    topControl.style.height = controlSizeString;
    rightControl.style.width = controlSizeString;
    rightControl.style.height = controlSizeString;
    bottomControl.style.width = controlSizeString;
    bottomControl.style.height = controlSizeString;
    leftControl.style.width = controlSizeString;
    leftControl.style.height = controlSizeString;
    middleControl.style.width = controlSizeString;
    middleControl.style.height = controlSizeString;
}

resizeMobileControls();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    resizeMobileControls();
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'ArrowUp') {
        input.w = true;
    } else if (event.key === 'a' || event.key === 'ArrowLeft') {
        input.a = true;
    } else if (event.key === 's' || event.key === 'ArrowDown') {
        input.s = true;
    } else if (event.key === 'd' || event.key === 'ArrowRight') {
        input.d = true;
    } else if (event.key === ' ') {
        input.space = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'ArrowUp') {
        input.w = false;
    } else if (event.key === 'a' || event.key === 'ArrowLeft') {
        input.a = false;
    } else if (event.key === 's' || event.key === 'ArrowDown') {
        input.s = false;
    } else if (event.key === 'd' || event.key === 'ArrowRight') {
        input.d = false;
    } else if (event.key === ' ') {
        input.space = false;
    }
});

document.getElementById('startButton').addEventListener('click', () => {
    var nameInput = document.getElementById('nameInput').value;
    if (nameInput.trim() === '') {
        alert('Please enter your discord username!!!');
        return;
    }

    players[0].name = nameInput;
    connectToServer();
    connected = true;
    gameStarted = true;
    toggleUI("game");
});

document.getElementById('leaveButton').addEventListener('click', () => {
    gameStarted = false;
    ctx.fillStyle = 'lightGreen';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toggleUI("menu");
    sendMessage("playerDisconnect", 
        {
            name: players[0].name
        }
    );
    players = [{
        x: 200,
        y: 200,
        health: 100,
        name: "NULL - Player name not set"
    }];
    connected = false;
    console.log('Disconnected from game');
});

function toggleUI(gameOrMenu) {
    if (gameOrMenu === "menu") {
        document.getElementById('gameElements').style.display = 'none';
        document.getElementById('menuElements').style.display = 'initial';
        document.getElementById('mobileControls').style.display = 'none';
    } else if (gameOrMenu === "game") {
        document.getElementById('gameElements').style.display = 'block';
        document.getElementById('menuElements').style.display = 'none';
        if (mobile) {
            document.getElementById('mobileControls').style.display = 'initial';
        }
    }
}

function sendMessage(type, data) {
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }

    const message = {
        "type": type,
        "data": data
    }

    socket.send(JSON.stringify(message));
}

function connectToServer() {
    document.getElementById('fullscreenMessage').style.display = 'flex';
    socket = new WebSocket('https://kiwian-neocities-server.onrender.com/');

    socket.addEventListener('open', () => {
        console.log('Connected to the server');
        
        sendMessage("sendName", 
            {
                name: players[0].name
            }
        );
    });

    socket.addEventListener('message', (event) => {
        const messageData = event.data;
    
        if (messageData instanceof Blob) {
            const reader = new FileReader();
    
            reader.onload = function(event) {
                try {
                    const parsedMessage = JSON.parse(event.target.result);
    
                    handlePacket(parsedMessage);
                } catch (error) {
                    console.error(`Error parsing JSON packet: ${error}`);
                }
            }
    
            reader.readAsText(messageData);
        } else {
            try {
                const parsedMessage = JSON.parse(messageData);
    
                handlePacket(parsedMessage);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        }
    });
}

function handleServer () {
    socket.addEventListener('close', (event) => {
        console.log('Server connection closed');
        gameStarted = false;
        ctx.fillStyle = 'lightGreen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        toggleUI("menu");
        players = [{
            x: 200,
            y: 200,
            health: 100,
            name: "NULL - Player name not set"
        }];
        if (connected) {
            alert('The server closed');
        }
        connected = false;
    });

    toggleUI("game");
    gameStarted = true;
}

function handlePacket(parsedMessage) {
    if (!(parsedMessage.type === "playerPosition" || parsedMessage.type === "chat")) {
        console.log(`${parsedMessage.type} message from server`);
    }

    if (parsedMessage.type === 'newPlayer') {
        if (parsedMessage.data.name === players[0].name) {
            return;
        }
        players.push({
            x: 200,
            y: 200,
            health: 100,
            name: parsedMessage.data.name
        })
    } else if (parsedMessage.type === 'existingPlayers') {
        parsedMessage.data.players.forEach(player => {
            players.push({
                x: 200,
                y: 200,
                health: 100,
                name: player.name
            })
        })
    } else if (parsedMessage.type === 'playerDisconnect') {
        const player = players.filter((player) => player.name !== parsedMessage.data.name);
        if (player === players[0]) {
            return;
        } else {
            players = players.filter((player) => player.name !== parsedMessage.data.name);
        }
    } else if (parsedMessage.type === 'playerPosition') {
        console.log("position packjet from " + (player => player.name == parsedMessage.data.name));
        const index = players.findIndex(player => player.name === parsedMessage.data.name);
        if (index === 0 || index === -1) {
            return;
        }

        players[index].x = parsedMessage.data.x;
        players[index].y = parsedMessage.data.y;
    } else if (parsedMessage.type === "chat") {
        chats.push(
            {
                text: parsedMessage.data.text,
                from: parsedMessage.data.from,
                frames: frames
            }
        );
    } else if (parsedMessage.type === "broadcast") {
        alert(parsedMessage.data.text);
    } else if (parsedMessage.type === "error") {
        if (parsedMessage.data.text === "bad_name") {
            document.getElementById('nameInput').value = '';
            alert('Name is taken or invalid, please chose another.');
            connected = false;
            gameStarted = false;
        } else {
            alert(`Unknown error: ${parsedMessage.data.text}`);
        }
    } else if (parsedMessage.type === "info") {
        if (parsedMessage.data.text === "connection_sucess") {
            document.getElementById('fullscreenMessage').style.display = 'none';
            connected = true;
            handleServer();
        }
        if (parsedMessage.data.text === "connection_fail") {
            document.getElementById('fullscreenMessage').style.display = 'none';
            connected = false;
            socket = null;
            console.log("Disconnected from server");
            gameStarted = false;
        }
    } else if (parsedMessage.type === "map") {
        map.trees = parsedMessage.data.trees;
        map.rocks = parsedMessage.data.rocks;
        areaSize = parsedMessage.data.size;
    } else {
        console.error(`Recieved broken packet of type: ${parsedMessage.type} with data:`);
        console.error(parsedMessage.data);
    }
}

setInterval(function() {
    if (!gameStarted) {
        return;
    }

    handleInput();
    handlePhysics();
    renderGame();
}, 16);

setInterval(sendPackets, 50);

setInterval(function() {
    for (let i = 0; i < chats.length; i++) {
        if ((frames - chats[i].frames) > 350) {
            chats.splice(i, 1);
            i--;
        }
    }
}, 20);

function mobileInput(direction, toggle) {
    if (direction === 'up') {
        input.w = toggle;
    } else if (direction === 'left') {
        input.a = toggle;
    } else if (direction === 'right') {
        input.d = toggle;
    } else if (direction === 'down') {
        input.s = toggle;
    } else if (direction === "space") {
        input.space = toggle;
    }
}

function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function handleInput() {
    var realWalkSpeed = 10;
    var walkSpeed = realWalkSpeed / gameScale;
    var lastPosition = {
        x: players[0].x,
        y: players[0].y
    };

    if (input.w) {
        if ((input.a || input.d) && !(input.a && input.d)) {
            players[0].y -= getDistance(walkSpeed, 0, 0, walkSpeed) / 2;
        } else {
            players[0].y -= walkSpeed;
        }
    }
    if (input.a) {
        if ((input.w || input.s) && !(input.w && input.s)) {
            players[0].x -= getDistance(walkSpeed, 0, 0, walkSpeed) / 2;
        } else {
            players[0].x -= walkSpeed;
        }
    }
    if (input.s) {
        if ((input.a || input.d) && !(input.a && input.d)) {
            players[0].y += getDistance(walkSpeed, 0, 0, walkSpeed) / 2;
        } else {
            players[0].y += walkSpeed;
        }
    }
    if (input.d) {
        if ((input.w || input.s) && !(input.w && input.s)) {
            players[0].x += walkSpeed;
        } else {
            players[0].x += getDistance(walkSpeed, 0, 0, walkSpeed) / 2;
        }
    }

    if (input.space) {
        for (let tree in map.trees) {
            if (getDistance(map.trees[tree].x, map.trees[tree].y, players[0].x - (playerSize / 2), players[0].y - (playerSize / 2)) < 20 * gameScale) {
                brokenFeaturesQueue.push(map.trees[tree]);
                map.trees.splice(tree, 1);
            }
        }
        for (let rock in map.rocks) {
            if (getDistance(map.rocks[rock].x, map.rocks[rock].y, players[0].x - (playerSize / 2), players[0].y - (playerSize / 2)) < 20 * gameScale) {
                brokenFeaturesQueue.push(map.rocks[rock]);
                map.rocks.splice(rock, 1);
            }
        }
    }

    const movementX = lastPosition.x - players[0].x;
    const movementY = lastPosition.y - players[0].y;
    players[0].velocityX = movementX;
    players[0].velocityY = movementY;
}

function handlePhysics() {
    if (players[0].x < playerSize) {
        players[0].x = playerSize;
    }
    if (players[0].y < playerSize) {
        players[0].y = playerSize;
    }
    if (players[0].x > areaSize) {
        players[0].x = areaSize;
    }
    if (players[0].y > areaSize) {
        players[0].y = areaSize;
    }
}

function renderGame() {
    const rplayer = {
        x: players[0].x - (canvas.width / 2), 
        y: players[0].y - (canvas.height / 2)
    };
    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let player of players) {
        ctx.fillStyle = 'red';
        ctx.fillRect(player.x - (playerSize) - rplayer.x, player.y - (playerSize) - rplayer.y, playerSize, playerSize);
    }

    var treeSize = 10 * gameScale;
    var rockSize = 8 * gameScale;

    for (let tree of map.trees) {
        ctx.fillStyle = 'green';
        ctx.fillRect(tree.x - (treeSize / 2) - rplayer.x, tree.y - (treeSize / 2) - rplayer.y, treeSize, treeSize);
    }

    for (let rock of map.rocks) {
        ctx.fillStyle = 'grey';
        ctx.fillRect(rock.x - (rockSize / 2) - rplayer.x, rock.y - (rockSize / 2) - rplayer.y, rockSize, rockSize);
    }

    ctx.font = `${playerSize}px arial`;
    for (let player of players) {
        ctx.fillStyle = 'black';
        ctx.textAlign = "center";
        ctx.fillText(player.name, player.x - (playerSize / 2) - rplayer.x, player.y - (playerSize + 5) - rplayer.y);
    }

    var fullChat = chats.map(text => text.text).join("&77")
    var chatLines = fullChat.split("&77");

    ctx.textAlign = "left";
    if (chats.length > 0) {
        for (var i = 0; i < chatLines.length; ++i) {
            ctx.fillStyle = 'black';
            ctx.font = 'bold 15px arial';
            ctx.fillText(chats[i].from + "> ", 10, (i * 13) + 50);
            ctx.font = '15px arial';
            ctx.fillText(chatLines[i], 10 + ctx.measureText(chats[i].from + "> ").width, (i *13) + 50);
        }
    }

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'brown';
    ctx.beginPath();
    ctx.moveTo(0 - rplayer.x, 0 - rplayer.y);
    ctx.lineTo(areaSize - rplayer.x, 0 - rplayer.y);
    ctx.lineTo(areaSize - rplayer.x, areaSize - rplayer.y);
    ctx.lineTo(0 - rplayer.x, areaSize - rplayer.y);
    ctx.lineTo(0 - rplayer.x, 0 - rplayer.y);
    ctx.stroke();

    frames++;
}

function sendPackets() {
    if (!gameStarted) {
        return;
    }

    const player = players[0];
    if (lastPosition.x !== player.x || lastPosition.y !== player.y) {
        sendMessage("playerPosition", 
            {
                x: player.x,
                y: player.y,
                name: player.name
            }
        );

        lastPosition = { 
            x: player.x,
            y: player.y
        };
    }

    if (toChat !== null) {
        sendMessage("chat",
            {
                text: toChat,
                from: players[0].name
            }
        );
    }

    if (brokenFeaturesQueue.length > 0) {
        sendMessage("brokenFeatures",
            {
                features: brokenFeaturesQueue
            }
        );

        brokenFeaturesQueue = [];
    }

    toChat = null;
}

setInterval(function() {
    if (document.getElementById('fullscreenMessageText').innerHTML === "Loading Game") {
        document.getElementById('fullscreenMessageText').innerHTML = "Loading Game.";
    } else if (document.getElementById('fullscreenMessageText').innerHTML === "Loading Game.") {
        document.getElementById('fullscreenMessageText').innerHTML = "Loading Game..";
    } else if (document.getElementById('fullscreenMessageText').innerHTML === "Loading Game..") {
        document.getElementById('fullscreenMessageText').innerHTML = "Loading Game...";
    } else if (document.getElementById('fullscreenMessageText').innerHTML === "Loading Game...") {
        document.getElementById('fullscreenMessageText').innerHTML = "Loading Game";
    }
}, 333);