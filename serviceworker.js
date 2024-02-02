self.importScripts("modules/jszip.js");
self.importScripts("modules/mimetypes.js");
self.importScripts("modules/txml.js");
const t_xml = txml();
const zip = new JSZip();
const FOLDER_PREFIX = "__scorm__";

const getSCORMDetails = (xml, sco = "index.html") => {
  const result = {
    // TODO this is very simple test
    version: xml.includes("2004")
      ? "2004"
      : xml.includes("AICC")
      ? "AICC"
      : "1.2",
    entrypoint: "index.html",
    sco,
  };
  try {
    // TODO this should be actually based on SCO
    const dom = t_xml.simplify(t_xml.parse(xml));
    result.entrypoint = dom.manifest.resources.resource._attributes.href;
  } catch (error) {
    console.log("error", error);
  }
  return result;
};

self.addEventListener("message", async (e) => {
  const request = await fetch(e.data);
  const blob = await request.blob();

  zip.loadAsync(blob).then(async function (zip) {
    // find entry point
    const xml = await zip.file("imsmanifest.xml").async("string");
    const scormObj = getSCORMDetails(xml);
    scormObj.entrypoint =
      FOLDER_PREFIX +
      (scormObj.entrypoint.charAt(0) === "/" ? "" : "/") +
      scormObj.entrypoint;

    const allClients = await clients.matchAll();

    for (const client of allClients) {
      client.postMessage({
        scormObj,
        msg: "loaded zip",
        file: e.data,
      });
    }
  });
});

// Fetching content using Service Worker
self.addEventListener("fetch", async (e) => {
  if (e.request.url.includes(FOLDER_PREFIX)) {
    const uri = e.request.url.split(FOLDER_PREFIX)[1].substr(1).split("?")[0];
    const ext = uri.split(".").pop();
    const mime = Mimes[ext];

    if (zip.files[uri]) {
      e.respondWith(
        (async () => {
          const responseBody = await zip.file(uri).async("blob");
          return new Response(responseBody, {
            headers: { "Content-Type": mime },
          });
        })()
      );
    } else {
      console.log("zip url not exists", uri);
    }
  }
});
