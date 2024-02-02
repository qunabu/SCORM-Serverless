function scorm12(settings) {
  window.API = new Scorm12API(settings);
  //window.API.loadFromJSON(cmi);

  window.API.on("LMSSetValue.cmi.*", function (CMIElement, value) {
    const data = {
      cmi: {
        [CMIElement]: value,
      },
    };

    post(data);
  });

  window.API.on("LMSGetValue.cmi.*", function (CMIElement) {
    get(CMIElement)
      //.then((res) => res.json())
      .then((res) => {
        window.API.LMSSetValue(CMIElement, res);
      });
  });

  window.API.on("LMSCommit", function () {
    const data = {
      cmi: window.API.cmi,
    };

    post(data);
  });
}

function scorm2004(settings) {
  window.API_1484_11 = new Scorm2004API(settings);
  //window.API_1484_11.loadFromJSON(cmi);

  window.API_1484_11.on("SetValue.cmi.*", function (CMIElement, value) {
    const data = {
      cmi: {
        [CMIElement]: value,
      },
    };

    post(data);
  });

  window.API_1484_11.on("GetValue.cmi.*", function (CMIElement) {
    get(CMIElement)
      //.then((res) => res.json())
      .then((res) => {
        window.API_1484_11.SetValue(CMIElement, res);
      });
  });

  window.API_1484_11.on("Commit", function () {
    const data = {
      cmi: window.API_1484_11.cmi,
    };

    post(data);
  });
}

function aicc(settings) {
  window.API = new AICC(settings);
}

function post(data) {
  console.log("TODO: Implement your BACKEND endpoint for set data:", data);
  return new Promise((resolve, reject) => {
    resolve(data);
  });
}

function get(key) {
  console.log("TODO: Implement your BACKEND endpoint for get key:", key);
  return new Promise((resolve, reject) => {
    resolve(key);
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("serviceworker.js");

  navigator.serviceWorker.ready.then((registration) => {
    document.getElementById("open-scorm").addEventListener("click", () => {
      registration.active.postMessage(
        document.getElementById("scorm-url").value
      );
      document.getElementById("loading").style.display = "flex";
      document.getElementById("entry").style.display = "none";
    });
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    const scormObj = event.data.scormObj;
    // Those Settings should be fetched from the backend
    const settings = {};

    if (scormObj.version === "2004") {
      scorm2004(settings);
    } else if (scormObj.version === "AICC") {
      aicc(settings);
    } else {
      scorm12(settings);
    }

    const iframe = document.createElement("iframe");
    iframe.src = scormObj.entrypoint;
    document.body.appendChild(iframe);

    document.getElementById("loading").style.display = "none";
  });
}
