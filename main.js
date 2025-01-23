const Bedrock = require("./bds");
const Discord = require("./discord/discord");

process.stdin.on("data", (data)=>{
    switch(data.toString().split(" ")[0].trim()) {
        case("start"): {
            Bedrock.start();
            break;
        }
        case("run"): {
            console.log(eval(data.toString().substring(4)));
            break;
        }
        default: {
            Bedrock.process.stdin.write(data);
            break;
        }
    }
});