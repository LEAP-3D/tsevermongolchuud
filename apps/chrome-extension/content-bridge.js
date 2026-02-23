(function () {
  const emitInstalled = () => {
    window.postMessage(
      {
        source: "safekid-extension",
        type: "SAFEKID_EXTENSION_INSTALLED",
        installed: true,
      },
      "*",
    );
  };

  emitInstalled();
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (data?.type === "SAFEKID_EXTENSION_PING") {
      emitInstalled();
    }
  });
})();
