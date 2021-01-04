var pass = document.getElementById('pass');
var t = document.getElementById('type');
var v = document.getElementById('version');
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
            ['launchButton', 'user', 'pass', 'type', 'version'].forEach((id) => {
                document.getElementById(id).disabled = true;
            });
        }
    }
}

function log(log) {
    document.getElementById('log').innerHTML += `${log}<br>`;
}

function logError(string) {
    ['launchButton', 'user', 'pass', 'type', 'version'].forEach((id) => {
        document.getElementById(id).disabled = false;
    });
    document.getElementById('log').innerHTML += `<p class="error">${string}</p><br>`;
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