# SCORM-Serverless Proof Of Concept

Here is a Proof Of Concept that SCORM packages can be rendered without the need for a Monolith serverside rendering SCORM LMS.

What is does

1. Registers simple Service Worker
2. This app send to Service Worker ZIP url to download
3. Service Worker Downloads the ZIP, uncompress the content and analise the imsmanifest.xml file
4. Service Worker returns to host information about SCORM version and entrypoint
5. Service Worker registers a `fetch` register which returns files from ZIP

```js
self.addEventListener("fetch", async (e) => {
  /* return file from ZIP */
});
```

6. The app creates a `iframe` with prefix from Service Worker
7. All SCORM package files are served from ZIP with Service Worker
