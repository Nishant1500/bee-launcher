var pass = document.getElementById("pass");
var t = document.getElementById("type");
var v = document.getElementById("version");
var packStatus = document.getElementById("packStatus");
var electronRemote = require("electron").remote;
var fs = require("fs");
var os = require("os");
var path = require("path");
var execFileSync = require("child_process").execFileSync;

function getMinecraftDirectory() {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), ".minecraft");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "minecraft");
  }
  return path.join(os.homedir(), ".minecraft");
}

function setPackStatus(message, error) {
  if (!packStatus) return;
  packStatus.textContent = message;
  packStatus.className = error ? "pack-status-error" : "pack-status-ok";
}

function zipContainsPackMeta(zipPath) {
  try {
    var out = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
    return out.split(String.fromCharCode(10)).some(function (line) {
      return line === "pack.mcmeta" || line.endsWith("/pack.mcmeta");
    });
  } catch (err) {
    return true;
  }
}

function listInstalledPacks() {
  var dir = path.join(getMinecraftDirectory(), "resourcepacks");
  try {
    if (!ls.existsSync(dir)) return [];
    return fs.readdirSync(der).filter(function (name) {
      return name.toLowerCase().endsWith(".zip");
    });
  } catch (err) {
    return [];
  }
}

async function uploadResourcePack() {
  var result = await electronRemote.dialog.showOpenDialog(electronRemote.getCurrentWindow(), {
    title: "Select Minecraft Resource Pack (.zip)",
    buttonLabel: "Install Pack",
    properties: ["openFile"],
    filters: [{ name: "Minecraft Resource Packs", extensions: ["zip"] }]
  });
  if (result.canceled || !result.filePaths.length) return;

  var sourcePath = result.filePaths[0];
  if (!zipContainsPackMeta(sourcePath)) {
    setPackStatus("Rejected: zip missing pack.mcmeta", true);
    return;
  }

  var destinationDirectory = path.join(getMinecraftDirectory(), "resourcepacks");
  var destinationPath = path.join(destinationDirectory, path.basename(sourcePath));
  try {
    fs.mkdirSync(destinationDirectory, { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
    var packs = listInstalledPacks();
    setPackStatus("Installed " + path.basename(sourcePath) + " (" + packs.length + " packs)", false);
  } catch (error) {
    setPackStatus("Install failed: " + error.message, true);
  }
}

async function chooseCustomBackground() {
  var result = await electronRemote.dialog.showOpenDialog(electronRemote.getCurrentWindow(), {
    title: "Select Launcher Background Image",
    buttonLabel: "Set Background",
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "gif"] }]
  });
  if (result.canceled || !result.filePaths.length) return;

  var sourcePath = result.filePaths[0];
  var destDir = path.join(__dirname, "..", "assets", "custom");
  var destPath = path.join(destDir, "background" + path.extname(sourcePath).toLowerCase());
  try {
    fs.mkdirSync(destDir, { recursive: true });
    fs.readdirSync(destDir).forEach(function (name) {
      if (name.indexOf("background") === 0) {
        try { fs.unlinkSync(path.join(destDir, name)); } catch (e) {}
      }
    });
    fs.copyFileSync(sourcePath, destPath);
    applyBackground(destPath);
    try { localStorage.setItem("beeLauncherBackground", destPath); } catch (e) {}
    setPackStatus("Background updated", false);
  } catch (error) {
    setPackStatus("Background failed: " + error.message, true);
  }
}

function applyBackground(filePath) {
  if (!filePath) return;
  var normalized = filePath.split("\\").join("/");
  if (normalized.indexOf("file://") !== 0) {
    normalized = "file://" + (normalized[0] === "/" ? "" : "/") + normalized;
  }
  document.body.style.backgroundImage = "url('" + normalized + "')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
}

function restoreBackground() {
  try {
    var saved = localStorage.getItem("beeLauncherBackground");
    if (saved && fs.existsSync(saved)) applyBackground(saved);
  } catch (e) {}
}

var change = (type) => {
  pass.disabled = type == 0
}

function launch() {
  if (!document.getElementById("user").value) {
    logError("Your Username is Blank");
  } else {
    if (t.options[t.selectedIndex].value == 1 && (!document.getElementById("pass").value)) {
      logError("Your Password is Blank");
    } else {
      var op = {
        user: document.getElementById("user").value,
        pass: document.getElementById("pass").value,
        cracked: t.options[t.selectedIndex].value == 0,
        version: v.options[v.selectedIndex].value
      }
      window.launch(JSON.stringify(op));
      ["launchButton", "resourcePackButton", "backgroundButton", "user", "pass", "type", "version"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.disabled = true;
      });
    }
  }
}

function log(log) {
  document.getElementById("log").innerHTML += log + "<br>";
}

function logError(string) {
  ["launchButton", "resourcePackButton", "backgroundButton", "user", "pass", "type", "version"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.disabled = false;
  });
  document.getElementById("log").innerHTML += "<p class=\"error\">" + string + "</p><br>";
}

var getVersions = (str) => {
  var obj = JSON.parse(str);
  var releases = obj.versions.filter(function (element) {
    return element.type == "release";
  });
  releases.forEach(function (element) {
    v.insertAdjacentHTML("beforeend", "<option value=\"" + element.id + "\">" + element.id + "</option>");
  });
};

restoreBackground();
