import { world, system } from '@minecraft/server';


class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listenerToRemove) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => {
            listener(...args);
        });
    }
}

// Example usage:
export const Link = new EventEmitter();



world.afterEvents.playerSpawn.subscribe((e) => {
    const player = e.player;
    runEvent("Player Spawned", {
        username: player.name,
        location: [player.location.x, player.location.y, player.location.z],
        dimension: player.dimension.id,
        gamemode: player.getGameMode(),
        tags: player.getTags()
    })
});

world.beforeEvents.chatSend.subscribe((e)=>{
    runEvent("Player Message", {
        player: e.sender,
        message: e.message
    })
});

world.afterEvents.playerGameModeChange.subscribe((e) => {
    runEvent("Player Gamemode Change", {
        player: e.player.name,
        gamemode: e.toGameMode
    })
});

world.afterEvents.playerPlaceBlock.subscribe((e) => {
    runEvent("Player Place", {
        location: [e.block.location.x, e.block.location.y, e.block.location.z],
        dimension: e.dimension.id,
        player: e.player.name,
        block:  e.block.permutation.type.id
    })
});
world.afterEvents.playerBreakBlock.subscribe((e) => {
    runEvent("Player Break", {
        location: [e.block.location.x, e.block.location.y, e.block.location.z],
        dimension: e.dimension.id,
        player: e.player.name,
        block: e.brokenBlockPermutation.type.id
    })
});

world.afterEvents.weatherChange.subscribe((e) => {
    runEvent("Weather", {
        previous: e.previousWeather,
        new: e.newWeather
    });
});

world.afterEvents.entityDie.subscribe((e) => {
    runEvent("Death", {
        "dead": e.deadEntity.typeId,
        "deadName": (e.deadEntity?.typeId === "minecraft:player") ? e.deadEntity?.name : e.deadEntity?.nameTag,
        "cause": e.damageSource.cause,
        "killer": e.damageSource.damagingEntity?.typeId,
        "killerName": (e.damageSource.damagingEntity?.typeId === "minecraft:player") ? e.damageSource.damagingEntity?.name : e.damageSource.damagingEntity?.nameTag,
        "location": [e.deadEntity.location.x,e.deadEntity.location.y,e.deadEntity.location.z],
        "dimension": e.deadEntity
    })
});

world.afterEvents.explosion.subscribe((e)=>{
    runEvent("Explosion", {
        dimension: e.dimension.id,
        source: e.source?.typeId,
        sourceName: e.source?.nameTag,
        sourceLocation: e.source ? [e.source.location.x, e.source.location.y, e.source.location.z] : undefined
    })
})

world.afterEvents.gameRuleChange.subscribe((e)=>{
    runEvent("Gamerule Change", {
        rule: e.rule,
        value: e.value
    })
})

world.afterEvents.itemUse.subscribe((e)=>{
    if(e.source.typeId !== "minecraft:player") return;
    runEvent("Item Use", {
        player: e.source.name,
        location: e.source.location,
        dimension: e.source.dimension.id,
        item: e.itemStack.typeId,
        amount: e.itemStack.amount
    });
});

world.afterEvents.itemUseOn.subscribe((e)=>{
    if(!e.isFirstEvent) return;
    if(e.source.typeId !== "minecraft:player") return;
    runEvent("Item Use On", {
        player: e.source.name,
        location: [e.source.location.x,e.source.location.y,e.source.location.z],
        dimension: e.source.dimension.id,
        item: e.itemStack.typeId,
        amount: e.itemStack.amount,
        block: e.block.typeId,
        blockLoc: [e.block.x, e.block.y, e.block.z]
    });
});

world.afterEvents.playerInteractWithBlock.subscribe((e)=>{
    if(!e.isFirstEvent) return;
    runEvent("Player Interact Block", {
        location: [e.block.location.x, e.block.location.y, e.block.location.z],
        dimension: e.player.dimension.id,
        player: e.player.name,
        block: e.block.typeId,
        item: e.beforeItemStack?.typeId,
        amount: e.beforeItemStack?.amount
    })
});

world.afterEvents.playerInteractWithEntity.subscribe((e)=>{
    runEvent("Player Interact Entity", {
        location: [e.target.location.x, e.target.location.y, e.target.location.z],
        dimension: e.player.dimension.id,
        player: e.player.name,
        target: e.target.typeId,
        targetName: e.target.nameTag,
        item: e.beforeItemStack?.typeId,
        amount: e.beforeItemStack?.amount
    })  
})

system.runInterval(()=>{
    let players = world.getAllPlayers();
    const pd = [];
    for(let i = 0; i < players.length; i++) {
        const player = players[i];
        pd.push({
            location: [player.location.x, player.location.y, player.location.z],
            gamemode: player.getGameMode(),
            tags: player.getTags()
        });
    }
    runEvent("Players Update", pd);
},20);


system.afterEvents.scriptEventReceive.subscribe((e)=>{
    if(e.id.startsWith("link:")) {
        const event = e.id.substring(5);
        const data = JSON.parse(e.message);
        if(event === "callbackReturn") {
            if(!eventCallbacks[data.cbID]) return console.error(`Error: Event Callback (${e.message}) does not exist.`) 
            eventCallbacks[data.cbID].cb(data.message);
            system.clearRun(eventCallbacks[data.cbID].timeout)
            delete eventCallbacks[data.cbID];
            return;
        } else if(event === "callback") {
            console.log(data.event);
            Link.emit("=>" + data.event, data.message, (message) => {
                runEvent("callbackReturn", {
                    cbID: data.cbID,
                    message: message
                })
            })
        }
    }
})

const eventCallbacks = {};

export const runEvent = function(event, data) {
    console.info(`@${event}>${JSON.stringify(data)}`);
}

export const runCallback = function(event, message, cb) {
    const cbID = generateRandomString(10);

    //If the server does not respond to the callback in 5 seconds, throw an error.
    const errorTimeout = system.runTimeout(() => {
        delete eventCallbacks[cbID]
        cb(null, new Error("No Response."));
    }, 200);


    eventCallbacks[cbID] = {
        cb: cb,
        timeout: errorTimeout
    }

    runEvent("callback", {
        cbID: cbID,
        event: event,
        message: message
    });
}

export const runCallbackAsync = function(event, message) {
    return new Promise((res, rej)=> {
        runCallback(event, message, (data, error)=> {
            if(error) {
                rej(error);
            }
            res(data);
        });
    })
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}