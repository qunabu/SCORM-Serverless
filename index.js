const examples = [
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/SequencingRandomTest_SCORM20043rdEdition.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/SequencingPreOrPostTestRollup_SCORM20043rdEdition.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/SequencingPostTestRollup4thEd_SCORM20044thEdition.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/SequencingPostTestRollup_SCORM20043rdEdition.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/SequencingForcedSequential_SCORM20043rdEdition.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/RunTimeAdvancedCalls_SCORM20043rdEdition.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/RuntimeBasicCalls_SCORM20043rdEdition.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/RuntimeBasicCalls_SCORM12.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/RuntimeMinimumCalls_SCORM20043rdEdition.zip",
  "https://scorm.com/wp-content/assets/golf_examples/PIFS/RuntimeMinimumCalls_SCORM12.zip",
];
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

function loading(isLoading = true) {
  document.getElementById("loading").style.display = isLoading
    ? "flex"
    : "none";
}

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

  const scoEl = document.getElementById("scos");
  const iframeEl = document.getElementById("iframe_el");

  scoEl.innerHTML == "";

  loading(false);

  scormObj.resources
    .filter((resource) => {
      if (resource._attributes["adlcp:scormType"]) {
        return resource._attributes["adlcp:scormType"] === "sco";
      }
      return true;
    })
    .forEach((resource) => {
      const button = document.createElement("button");
      button.innerText = resource._attributes.identifier;
      scoEl.appendChild(button);
      button.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = `${scormObj.PREFIX}/${resource._attributes.href}`;
        iframeEl.innerHTML = "";
        iframeEl.appendChild(iframe);
        loading(false);
        document.getElementById("entry").style.display = "none";
        document.getElementById("scos").style.display = "none";
      });
    });

  console.log(scormObj.resources);
});

function register(url = "serviceworker.js") {
  return new Promise((resolve, reject) => {
    navigator.serviceWorker.register(url).then((reg) => {
      if (!reg.active) {
        (reg.installing || reg.waiting).addEventListener("statechange", () => {
          resolve(reg.active);
        });
      } else {
        requestAnimationFrame(() => resolve(reg.active));
      }
    });
  });

  /*
  return new Promise((resolve, reject) => {

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("serviceworker.js");

    navigator.serviceWorker.ready.then((registration) => {
      
    });


  } else {
    reject();
  })
  */
}

function init() {
  loading();

  register().then((reg) => {
    navigator.serviceWorker.ready.then((registration) => {
      //console.log("ready", registration);
      loading(false);
    });
    //console.log("Service Worker registered", reg);
  });
  document.getElementById("open-scorm").addEventListener("click", () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage(
        document.getElementById("scorm-url").value
      );
      loading(true);
    });
  });

  document
    .getElementById("scorm-select")
    .addEventListener("change", (event) => {
      document.getElementById("scorm-url").value = event.target.value;
    });

  examples.forEach((url) => {
    document.getElementById(
      "scorm-select"
    ).innerHTML += `<option>${url}</option>`;
  });

  document.getElementById("scorm-url").value = examples[0];
}

init();
