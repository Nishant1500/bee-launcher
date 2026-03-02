var pass = document.getElementById('pass');
var t = document.getElementById('type');
var v = document.getElementById('version');
var textureInput = document.getElementById('customTextureInput');
const CUSTOM_TEXTURE_STORAGE_KEY = 'bee.launcher.customTexture';

function applyCustomTexture(textureDataUrl) {
    if (textureDataUrl) {
        document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('${textureDataUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    } else {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
    }
}

function openTexturePicker() {
    if (textureInput) {
        textureInput.click();
    }
}

function resetTexture() {
    localStorage.removeItem(CUSTOM_TEXTURE_STORAGE_KEY);
    applyCustomTexture(null);
}

if (textureInput) {
    textureInput.addEventListener('change', function() {
        const file = this.files && this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            const textureDataUrl = evt.target.result;
            localStorage.setItem(CUSTOM_TEXTURE_STORAGE_KEY, textureDataUrl);
            applyCustomTexture(textureDataUrl);
        };
        reader.readAsDataURL(file);
    });

    const savedTexture = localStorage.getItem(CUSTOM_TEXTURE_STORAGE_KEY);
    if (savedTexture) {
        applyCustomTexture(savedTexture);
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