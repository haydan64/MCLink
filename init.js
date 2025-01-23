/**
 * Verify if the correct operating system is being used.
 * 
 * Verify that there is a valid install of bds.
 * 
 * Verify that the bds is correct for the OS.
 * 
 * TODO: See if I can make the BDS auto install/update.
*/


const os = require('os');
const fs = require('fs');
const https = require('https');
const Config = require('./config');
const States = require("./states");

const MinecraftBDSURL = 'https://www.minecraft.net/en-us/download/server/bedrock';

const OS = getOS();
const InstalledBDS = fs.existsSync("./bds/bedrock_server.exe") ? "windows" : fs.existsSync("./bds/bedrock_server") ? "ubuntu" : "none";

console.log(InstalledBDS)
if (Config.verifyInstall) {
    fetchHTML(MinecraftBDSURL)
    .then((html)=>{
        const win = html.split("https://www.minecraft.net/bedrockdedicatedserver/bin-win/bedrock-server-")[1].split(".zip")[0];
        const lin = html.split("https://www.minecraft.net/bedrockdedicatedserver/bin-linux/bedrock-server-")[1].split(".zip")[0];
        const previewWin = html.split("https://www.minecraft.net/bedrockdedicatedserver/bin-win-preview/bedrock-server-")[1].split(".zip")[0];
        const previewLin = html.split("https://www.minecraft.net/bedrockdedicatedserver/bin-linux-preview/bedrock-server-")[1].split(".zip")[0];

        if (OS === "windows" && !Preview) downloadAndInstall("bin-win", win);
        if (OS === "linux" && !Preview) downloadAndInstall("bin-linux", lin);
        if (OS === "windows" && Preview) downloadAndInstall("bin-win-preview", previewWin);
        if (OS === "linux" && Preview) downloadAndInstall("bin-linux-preview", previewLin);
    })
    .catch(error=>{
        console.error("Could Not Verify BDS Install");
    })
}



function getOS() {
    const platform = os.platform();
    if (platform === 'win32') {
        return 'Windows';
    } else if (platform === 'linux') {
        return 'Linux';
    } else {
        return 'Unknown OS';
    }
}

function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            // A chunk of data has been received
            response.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received
            response.on('end', () => {
                resolve(data);
            });

        }).on('error', (err) => {
            reject(err);
        });
    });
}