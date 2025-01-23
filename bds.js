const path = require("path");
const { EventEmitter } = require('events');
const { spawn } = require("child_process");
const config = require("./config.json");
const env = Object.create(process.env);

const TimestampRegex = /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}:\d{3} (?:INFO|ERROR|WARN|DEBUG|TRACE)\]/gm;

/** KEYWORDS
 *  -[2024-11-25 23:28:42:449 INFO] Opening level 'worlds/Bedrock level/db'
 *  -[2024-11-25 23:28:43:087 INFO] Server started.
 *  -Quit correctly
 *  -[2024-11-26 00:46:29:352 INFO] Data saved. Files are now ready to be copied.
     Bedrock level/db/000005.ldb:455, Bedrock level/db/000008.ldb:456, Bedrock level/db/000011.ldb:455, Bedrock level/db/000012.log:0, Bedrock level/db/CURRENT:16, Bedrock level/db/MANIFEST-000010:203, Bedrock level/level.dat:2883, Bedrock level/level.dat_old:2883, Bedrock level/levelname.txt:13
 */
const eventCallbacks = {};

class bds extends EventEmitter {
    constructor() {
        super();
        this.players = {};
        this.status = "offline"; // offline, online, starting, stopping, errored
        this.process = null;
        this.start();
    }
    start() {
        return new Promise(async (res, rej) => {
            if (this.status === "online") {
                await this.stop();
            }
            this.players = {};
            this.status = "starting";
            if (config.OS === "Ubuntu") {
                env.LD_LIBRARY_PATH = '.';
                this.process = spawn("./bedrock_server", { env, cwd: './bds' });
            } else if (config.OS === "Windows") {
                this.process = spawn('./bds/bedrock_server.exe');
            } else {
                throw new Error("Invalid OS specified in the config. Accepeted values are Windows and Ubuntu.");
            }
            this.process.stdout.on("data", async (message) => {
                message = message.toString().trim();
                if (message.match(TimestampRegex)) {
                    message.split(TimestampRegex).forEach((/**@type String */message) => {
                        message = message.trim();
                        if (message.length === 0) return;
                        if (message.startsWith("[Scripting] ")) {
                            message = message.substring(12).trim();
                            if (message.startsWith("@")) {
                                try {
                                    const event = message.substring(1, message.indexOf(">"));
                                    message = message.substring(message.indexOf(">") + 1).trim();
                                    if (message.length === 0) {
                                        this.emit("@" + event);
                                        return;
                                    }
                                    const data = JSON.parse(message);

                                    this.emit("@" + event, data);
                                } catch (e) {
                                    console.error("Couldn't parse event data: ", e);
                                }
                            } else {
                                console.log("@[Script] " + message);
                            }
                        }
                        else if (message.startsWith("Data saved. Files are now ready to be copied.")) {

                        } else if (message.startsWith("Server started.")) {
                            if (this.status === "starting") this.status = "online";
                        } else {
                            console.log("#" + message);
                        }
                    })
                } else {
                    switch (message) {
                        case "Quit correctly": {
                            console.log("%Quit correctly!");
                            this.forceStop();
                            break;
                        }
                        default: {
                            console.log("%" + message);
                        }
                    }
                }
            })
        })
    }
    stop() {
        return new Promise(async (res, rej) => {
            this.runCommand("stop");
            this.status = "stopping";
        })
    }
    forceStop() {
        this.process.kill('SIGINT');
        this.status = "offline";
        this.process = null;
        this.players = {};
    }
    restart() {
        return new Promise(async (res, rej) => {
            await this.stop();
            await this.start();
        })
    }
    runCommand(command) {
        if (this.status !== "online") return false;
        this.process.stdin.write(command + "\n");
        return true;
    }
    runEvent(event, message) {
        this.runCommand(`scriptevent link:${event} ${JSON.stringify(message)}`);
    }

    backup() {
        
    }

    /**
     * 
     * @param {String} event 
     * @param {*} message 
     * @param {Function} cb 
     */
    runCallback(event, message, cb) {
        const cbID = generateRandomString(10);

        //If the server does not respond to the callback in 5 seconds, throw an error.
        const errorTimeout = setTimeout(() => {
            delete eventCallbacks[cbID]
            cb(null, new Error("No Response."));
        }, 5000);

        eventCallbacks[cbID] = {
            cb: cb,
            timeout: errorTimeout
        }

        this.runEvent("callback", {
            cbID: cbID,
            event: event,
            message: message
        });
    }
    runInternalCommand(command) {

    }
}

const Bedrock = new bds();

Bedrock.on("@World Initialized", () => {

    console.log("World Initialized!");
});

Bedrock.on("@callback", (data) => {
    Bedrock.emit("=>" + data.event, data.message, (message) => {
        Bedrock.runEvent("callbackReturn", {
            cbID: data.cbID,
            message: message
        })
    })
});

Bedrock.on("@callbackReturn", (data)=> {
    if(!eventCallbacks[data.cbID]) return console.error("Error: Event Callback does not exist.");
    eventCallbacks[data.cbID].cb(data.message);
    delete eventCallbacks[data.cbID];
    return;
})



function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}


module.exports = Bedrock;


// Bedrock.on("=>ping", (message, cb) => {
//     cb(message + " Pong!")
// })


// setInterval(()=>{
//     Bedrock.runCallback("ping", "Hey", (message, error)=>{
//         if(error) return;
//         console.log(message);
//     })
// },1000)
