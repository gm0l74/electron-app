/*--------------------------------
* Electron Desktop App
* File : win.js
*
* @ author              gmoita
* @ version             1.0
*
*	@ start date					21 03 2019
*	@ last update					21 03 2019
*
* Description
* Creates the overall structure
* barebones.
* Initialize the titlebar.
*--------------------------------*/

/*--------------------------------
* Imports and Constants
*--------------------------------*/
const { remote } = require('electron');
const { rootPath } = require('electron-root-path');

const path = require('path');
const isOnline = require('is-online');
const yamlparser = require(path.join(
  rootPath, '/src/config/lib/yamlparser'
));

const BrowserWindow = remote.BrowserWindow;

/*-----------------------
* Loaders
*------------------------*/
/*--------------------------------
* Function: Load CSS File
*--------------------------------*/
function loadCSSFile (url, callback) {
  let style = document.createElement("link");

  /* Handle the argument's callback at the end of the load */
  if (style.readyState) {
    /* For Internet Explorer */
    style.onreadystatechange = function() {
      if (style.readyState == "loaded" ||
          style.readyState == "complete") {
        style.onreadystatechange = null;
        callback();
      }
    };
  } else {
    /* Other than Internet Explorer */
    style.onload = function() {
      callback();
    };
  }

  /* Set the link attributes */
  style.href = url;
  style.type = "text/css";
  style.rel = "stylesheet";

  document.getElementsByTagName("head")[0].appendChild(style);
}

/*--------------------------------
* Function: Load JS File
*--------------------------------*/
function loadJSFile (url, callback) {
  let script = document.createElement("script");

  /* Handle the argument's callback at the end of the load */
  if (script.readyState) {
    /* For Internet Explorer */
    script.onreadystatechange = function() {
      if (script.readyState == "loaded" ||
          script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    /* Other than Internet Explorer */
    script.onload = function() {
      callback();
    };
  }

  /* Setup the new script url */
  script.src = url;

  document.getElementsByTagName("head")[0].appendChild(script);
}

/*-----------------------
* Page Structure
*------------------------*/
/*--------------------------------
* Function: Init TitleBar
*--------------------------------*/
function initTitleBar (appName) {
  /* Retrieve necessary elements */
  let TitleBar = document.getElementById("window-titlebar");
  let TitleBarTitle = document.getElementById("window-titlebar-title");

  let MinBtn = document.getElementById("window-min-btn");
  let MaxBtn = document.getElementById("window-max-btn");
  let ExitBtn = document.getElementById("window-close-btn");

  TitleBarTitle.innerHTML = appName;

  let sysPlatform;
  if (process.platform === "win32") {
    sysPlatform = "windows";

    MinBtn.innerHTML = "&#8722;";
    MaxBtn.innerHTML = "&#10064;";
    ExitBtn.innerHTML = "&#10005;";
  } else if (process.platform === "darwin") {
    sysPlatform = "mac";
  } else {
    sysPlatform = "linux";
    MinBtn.innerHTML = "&#8722;";
    MaxBtn.innerHTML = "&#9744;";
    ExitBtn.innerHTML = "&#10005;";
  }

  TitleBar.setAttribute("class", sysPlatform);

  /* Adding functionality on: Minimize Window Button */
  MinBtn.addEventListener("click", (e) => {
    let window = BrowserWindow.getFocusedWindow();

    window.minimize();
  });

  /* Adding functionality on: Maximize Window Button */
  MaxBtn.addEventListener("click", (e) => {
    let window = BrowserWindow.getFocusedWindow();

    if (window.isMaximized())
      window.unmaximize();
    else
      window.maximize();
  });

  /* Adding functionality on: Exit Window Button */
  ExitBtn.addEventListener("click", (e) => {
    let window = BrowserWindow.getFocusedWindow();

    window.close();
  });
}

/*--------------------------------
* Function: Create HTML Page
*--------------------------------*/
function createHTMLPage () {
  /* Creates the overall layout of any app
      TitleBar and the element to render everything else (root)
  */

  /* Create the titlebar */
  let TitleBar = document.createElement("div");
  TitleBar.setAttribute("id", "window-titlebar");

  let TitleBarTitle = document.createElement("div");
  TitleBarTitle.setAttribute("id", "window-titlebar-title");
  TitleBar.appendChild(TitleBarTitle);

  /* Create the titlebar buttons */
  let TitleBarButtons = document.createElement("div");
  TitleBarButtons.setAttribute("id", "window-titlebar-btns");

  let MinimizeButton = document.createElement("a");
  MinimizeButton.setAttribute("href", "#");
  MinimizeButton.setAttribute("id", "window-min-btn");

  TitleBarButtons.appendChild(MinimizeButton);

  let MaximizeButton = document.createElement("a");
  MaximizeButton.setAttribute("href", "#");
  MaximizeButton.setAttribute("id", "window-max-btn");

  TitleBarButtons.appendChild(MaximizeButton);

  let ExitButton = document.createElement("a");
  ExitButton.setAttribute("href", "#");
  ExitButton.setAttribute("id", "window-close-btn");

  TitleBarButtons.appendChild(ExitButton);

  TitleBar.appendChild(TitleBarButtons);

  /* Create the root element to load everything else */
  let Root = document.createElement("div");
  Root.setAttribute("id", "window-root");

  /* Render elements in the Browser Window's body */
  let body = document.getElementsByTagName("body")[0];
  body.appendChild(TitleBar);
  body.appendChild(Root);
}

/*-----------------------
* Animations
*------------------------*/
/*--------------------------------
* Function: Start Loading Animation
*--------------------------------*/
function startLoadingAnimation () {
  let Wheel = document.createElement("div");
  Wheel.setAttribute("id", "root-loading-wheel");

  let Text = document.createElement("h1");
  Text.setAttribute("id", "root-loading-text");
  Text.setAttribute("data-text", "Loading...");
  Text.innerHTML = "Loading...";

  let Root = document.getElementById("window-root");
  Root.appendChild(Wheel);
  Root.appendChild(Text);
}

/*--------------------------------
* Function: Stop Loading Animation
*--------------------------------*/
function stopLoadingAnimation () {
  $('#root-loading-wheel').remove();
  $('#root-loading-text').remove();
}

/*-----------------------
* Renders
*------------------------*/
/*--------------------------------
* Function: Check Connection Status
*--------------------------------*/
async function checkConnectionStatus () {
  return await isOnline();
}

/*--------------------------------
* Function: Page Renderer
*--------------------------------*/
function pageRenderer (
  status, indexPath, noOfflineOp = false, offlinePath = null
) {
  if (noOfflineOp) {
    if (status) {
      $("#window-root").html(
        '<object data="' + indexPath + '" width="100%" height="100%"/>'
      );
    } else {
      /* Load connection error page instead */
      $("#window-root").load(offlinePath);
    }
  } else {
    $("#window-root").load(indexPath);
  }
}

/*-----------------------
* To Execute
*------------------------*/
let yamldoc = yamlparser.openFile(path.join(rootPath, 'config.yml'));

if (yamldoc == null) {
  remote.getCurrentWindow().close();
}

let name = yamlparser.getSetting(yamldoc, ['app', 'name']);
let noOfflineOp = yamlparser.getSetting(yamldoc, ['op', 'offline_warning']);

/* Setup page title */
document.getElementsByTagName("title")[0].innerHTML = name;

/* Create the barebones */
createHTMLPage();
initTitleBar(name);

/* Load CSS files */
loadCSSFile('./assets/css/loading.css', () => {});

if (noOfflineOp) {
  window.addEventListener('load', function() {
    function updateOnlineStatus (ev) {
      pageRenderer(
        navigator.onLine,
        yamlparser.getSetting(yamldoc, ['app', 'url']),
        noOfflineOp,
        path.join(rootPath, '/src/500.html')
      );
    }

    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  });
}

/* Load other libraries */
startLoadingAnimation();

/* Before the import of libraries */
if (typeof module === 'object') {
  window.module = module;
  module = undefined;
}

/* Import needed libraries */
loadJSFile("./config/lib/jquery.js", () => {
  /*
    Once the last library is loaded,
    the loading animation can stop
    and the main js code can be injected
    Delay of 750 ms
  */
  setTimeout(() => {
    checkConnectionStatus().then(function (status) {
      stopLoadingAnimation();

      pageRenderer(
        status,
        yamlparser.getSetting(yamldoc, ['app', 'url']),
        noOfflineOp,
        path.join(rootPath, '/src/500.html')
      );
    });
  }, 750);
});

/* After the import of the js libraries */
if (window.module) {
  module = window.module;
}
