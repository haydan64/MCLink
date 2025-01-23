const Bedrock = require("./bds");
const API = require("./api");
const States = require("./states");
const Backup = require("./backup");


process.stdin.on("data", (data)=>{
    runProcessCommand(data.toString());
    
});

function runProcessCommand(command) {
    switch(command.split(" ")[0].trim()) {
        case("start"): {
            Bedrock.start();
            break;
        }
        case("run"): {
            console.log(eval(command.substring(4)));
            break;
        }
        default: {
            Bedrock.process.stdin.write(data);
            break;
        }
    }
}