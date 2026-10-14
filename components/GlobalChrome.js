export default function GlobalChrome({ header, footer, children }) {
  const h = header || {};
  const f = footer || {};

  return (
    <>
      {/* GLOBAL HEADER */}
      {h.enabled && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: h.css || "",
            }}
          />

          <header
            style={{
              ...(h.sticky
                ? {
                    position: "sticky",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                  }
                : {}),
              width: "100%",
              margin: 0,
              padding: 0,
            }}
            dangerouslySetInnerHTML={{
              __html: h.html || "",
            }}
          />
        </>
      )}

      {/* PAGE CONTENT */}
      {children}

      {/* GLOBAL FOOTER */}
      {f.enabled && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: f.css || "",
            }}
          />

          <footer
            style={{
              ...(f.sticky
                ? {
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999,
                  }
                : {}),
              width: "100%",
              margin: 0,
              padding: 0,
            }}
            dangerouslySetInnerHTML={{
              __html: f.html || "",
            }}
          />
        </>
      )}
    </>
  );
}
