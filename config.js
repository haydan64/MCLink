module.exports = {
    /**
     * Server Management
     */
    "usePreview": false, //Verify/Update to the preview version of the bds.
    "verifyInstall": false, //MCLink will check if the installed BDS is the current recent version.
    "autoUpdate": false, //If the server should auto update when MCLink is started. (Ignored if verifyInstall is false)
    "autoStart": true, //when MCLink starts, start the BDS aswell.
    "logs": true,

    /** WEBSOCKETS
     * Websockets can be used to connect the bds with external apps.
     */
    "websocketMode": "connect", //'listen' or 'connect'. listening will allow connections to MCLink. Connecting MCLink will connect to a websocket.
    "websocketPort": 8080, //The port the websocket will listen or connect to.
    "websocketHost": "localhost", //The host for the websocket to connect to. (Ignored if websocketMode is 'listen')
    "PlayerTrackingInterval": 0, //How often the MC server should report player positions. (# of MC Ticks, use 0 to disable)
    "allowConnections": ["127.0.0.1"], //IPs to allow a connection from if websocketMode is 'listen'. Use true to allow all.

    /** BACKUPS
     *To prevent a backup from being deleted, rename the backup to start with P, OR to NOT start with D, W, M, or Y 
     */
    "backDirectory": "./backups",
    "backupPeriod": 30, //Minutes between backups
    "deletedDailyBackups": 1, //# of daily backups before a weekly backup. (Deleted after 24 hours)
    "deletedWeeklyBackups": 1, //# of weekly backups before a monthly backup. (Deleted after 7 days)
    "deletedMonthlyBackups": 2, //# of monthly backups before a yearly backup. (Deleted after 30 days)
    "deletedYearlyBackups": 2, //# of yearly backups before a permanent Backup. (Deleted after 365 days)
    "permanentBackups": true //If false, every yearly backup will be a yearly backup.
}