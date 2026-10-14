import { getDb } from "../../lib/db";
import TrackingScripts, {
  TrackingNoScript,
} from "../../components/TrackingScripts";
import GlobalCodeInjector from "../../components/GlobalCodeInjector";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicLayout({ children }) {
  const settings = {};

  try {
    const db = getDb();

    const [rows] = await db.query(`
      SELECT setting_key, setting_value
      FROM settings
      WHERE setting_key IN (
        'gtm_id',
        'meta_pixel_id',
        'ga4_id',
        'global_head_code',
        'global_body_start_code',
        'global_body_end_code',
        'header_enabled',
        'header_html',
        'header_css',
        'footer_enabled',
        'footer_sticky',
        'footer_html',
        'footer_css'
      )
    `);

    for (const row of rows) {
      settings[row.setting_key] = row.setting_value ?? "";
    }
  } catch (error) {
    console.error("Public settings load failed:", error);
  }

  const headerEnabled =
    String(settings.header_enabled ?? "1") !== "0";

  const footerEnabled =
    String(settings.footer_enabled ?? "1") !== "0";

  const footerSticky =
    String(settings.footer_sticky ?? "0") === "1";

  return (
    <>
      {/* TRACKING */}
      <TrackingScripts
        gtmId={settings.gtm_id}
        metaPixelId={settings.meta_pixel_id}
        ga4Id={settings.ga4_id}
      />

      <TrackingNoScript gtmId={settings.gtm_id} />

      <GlobalCodeInjector
        headCode={settings.global_head_code}
        bodyStartCode={settings.global_body_start_code}
        bodyEndCode={settings.global_body_end_code}
      />

      {/* HEADER CSS */}
      {headerEnabled && settings.header_css && (
        <style
          dangerouslySetInnerHTML={{
            __html: settings.header_css,
          }}
        />
      )}

      {/* GLOBAL HEADER */}
      {headerEnabled && (
        <header
          id="global-site-header"
          style={{
            width: "100%",
            margin: 0,
            padding: 0,
          }}
          dangerouslySetInnerHTML={{
            __html: settings.header_html || "",
          }}
        />
      )}

      {/* LANDING PAGE */}
      {children}

      {/* FOOTER CSS */}
      {footerEnabled && settings.footer_css && (
        <style
          dangerouslySetInnerHTML={{
            __html: settings.footer_css,
          }}
        />
      )}

      {/* GLOBAL FOOTER */}
      {footerEnabled && (
        <footer
          id="global-site-footer"
          style={{
            width: "100%",
            margin: 0,
            padding: 0,

            ...(footerSticky
              ? {
                  position: "fixed",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999999,
                }
              : {}),
          }}
          dangerouslySetInnerHTML={{
            __html:
              settings.footer_html ||
              "<div style='padding:15px;background:#111;color:#fff;text-align:center'>Footer</div>",
          }}
        />
      )}
    </>
  );
}
