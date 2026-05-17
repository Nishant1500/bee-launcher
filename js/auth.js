var pass = document.getElementById('pass');
var t = document.getElementById('type');
var v = document.getElementById('version');
var resourcePackStatus = document.getElementById('resourcePackStatus');
var electronRemote = require('electron').remote;
var fs = require('fs');
var os = require('os');
var path = require('path');

function getMinecraftDirectory() {
    if (process.platform === 'win32') {
        return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), '.minecraft');
    }

    if (process.platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support', 'minecraft');
    }

    return path.join(os.homedir(), '.minecraft');
}

function setResourcePackStatus(message, error) {
    resourcePackStatus.textContent = message;
    resourcePackStatus.className = error ? 'resource-pack-error' : 'resource-pack-success';
}

async function uploadResourcePack() {
    var result = await electronRemote.dialog.showOpenDialog(electronRemote.getCurrentWindow(), {
        title: 'Select Minecraft Resource Pack',
        buttonLabel: 'Upload Pack',
        properties: ['openFile'],
        filters: [
            { name: 'Minecraft Resource Packs', extensions: ['zip'] }
        ]
    });

    if (result.canceled || !result.filePaths.length) {
        return;
    }

    var sourcePath = result.filePaths[0];
    var destinationDirectory = path.join(getMinecraftDirectory(), 'resourcepacks');
    var destinationPath = path.join(destinationDirectory, path.basename(sourcePath));

    try {
        fs.mkdirSync(destinationDirectory, { recursive: true });
        fs.copyFileSync(sourcePath, destinationPath);
        setResourcePackStatus('Pack uploaded to resourcepacks.', false);
    } catch (error) {
        setResourcePackStatus('Could not upload pack: ' + error.message, true);
    }
}

var change = (type) => {
    pass.disabled = type == 0
}

function launch() {
    if (!document.getElementById('user').value) {
        logError('Your Username is Blank');
    } else {
        if (t.options[t.selectedIndex].value == 1 && (!document.getElementById('pass').value)) {
            logError('Your Password is Blank');
        } else {
            var op = {
                user: document.getElementById('user').value,
                pass: document.getElementById('pass').value,
                cracked: t.options[t.selectedIndex].value == 0,
                version: v.options[v.selectedIndex].value
            }
            window.launch(JSON.stringify(op));
            ['launchButton', 'resourcePackButton', 'user', 'pass', 'type', 'version'].forEach((id) => {
                document.getElementById(id).disabled = true;
            });
        }
    }
}

function log(log) {
    document.getElementById('log').innerHTML += `${log}<br>`;
}

function logError(string) {
    ['launchButton', 'resourcePackButton', 'user', 'pass', 'type', 'version'].forEach((id) => {
        document.getElementById(id).disabled = false;
    });
    var logElement = document.getElementById('log');
    if (logElement) {
        logElement.innerHTML += `<p class="error">${string}</p><br>`;
    } else {
        setResourcePackStatus(string, true);
    }
}

var getVersions = (str) => {
    var obj = JSON.parse(str);
    var releases = obj.versions.filter((element) => {
        return element.type == 'release';
    });
    releases.forEach((element) => {
        v.insertAdjacentHTML('beforeend', `<option value="${element.id}">${element.id}</option>`)
    });
};
