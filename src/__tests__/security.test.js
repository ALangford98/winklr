import React, { useContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppContextProvider, AppContext } from "../components/appContext";
import SuggestionsPanel from "../components/suggestions/SuggestionsPanel";
import { encodeConfigToHash, decodeConfigFromHash } from "../utils/shareableUrl";
import { sha256 } from "../utils/sha256";
import { generateStoreHTML } from "../utils/generateStoreHTML";

/**
 * Regression tests for two concrete issues found in a security review:
 *
 * 1. The "Copy link" / Share FAB feature used to embed the entire
 *    `integrations` object - including the Owner passcode - into the
 *    shareable URL hash. Since that link is specifically the thing handed to
 *    guests, this let anyone who received a completely normal registry link
 *    read the owner's passcode straight out of the URL (or have it silently
 *    applied to their own session), defeating the one thing that's supposed
 *    to distinguish a guest from the owner.
 * 2. A gift suggestion's "link" field is free text from a guest. Rendering
 *    it as a clickable href without checking the scheme let someone submit a
 *    javascript: URL that would run in the registry owner's browser the
 *    moment they clicked "View link".
 */

beforeEach(() => {
  window.localStorage.clear();
});

test("the shareable link never carries the owner passcode, even when one is set", () => {
  function Harness() {
    const { state, setIntegrations } = useContext(AppContext);
    return (
      <div>
        <button onClick={() => setIntegrations((prev) => ({ ...prev, ownerPasscode: "super-secret", firebaseDatabaseUrl: "https://example.firebaseio.com" }))}>
          set-passcode
        </button>
        <div data-testid="hash">{encodeConfigToHash(state)}</div>
      </div>
    );
  }

  render(<AppContextProvider><Harness /></AppContextProvider>);
  fireEvent.click(screen.getByText("set-passcode"));

  const hash = screen.getByTestId("hash").textContent;
  expect(hash).not.toMatch(/super-secret/);

  // The Firebase URL - which guests legitimately need for live sync - should
  // still be there; only the passcode is stripped.
  const decoded = decodeConfigFromHash(hash);
  expect(decoded.integrations.firebaseDatabaseUrl).toBe("https://example.firebaseio.com");
  expect(decoded.integrations.ownerPasscode).toBeUndefined();
});

test("a suggestion with a javascript: URL is not rendered as a clickable link", () => {
  // Goes in via the same context action a real (or spoofed) submission would
  // use - the point is that the *render* is guarded, not just the form,
  // since a suggestion could also arrive via a direct Firebase write that
  // bypasses the form's own validation entirely.
  function Harness() {
    const { suggestGift } = useContext(AppContext);
    return (
      <button onClick={() => suggestGift({ name: "Evil Item", quantity: 1, email: "guest@example.com", link: "javascript:alert(document.cookie)" })}>
        seed-malicious-suggestion
      </button>
    );
  }

  render(
    <AppContextProvider>
      <Harness />
      <SuggestionsPanel />
    </AppContextProvider>
  );

  fireEvent.click(screen.getByText("seed-malicious-suggestion"));

  expect(screen.getByText("Evil Item")).toBeInTheDocument();
  expect(screen.queryByText(/view link/i)).not.toBeInTheDocument();
});

test("a suggestion with a normal https:// URL is still rendered as a clickable link", () => {
  function Harness() {
    const { suggestGift } = useContext(AppContext);
    return (
      <button onClick={() => suggestGift({ name: "Nice Item", quantity: 1, email: "guest@example.com", link: "https://example.com/item" })}>
        seed-normal-suggestion
      </button>
    );
  }

  render(
    <AppContextProvider>
      <Harness />
      <SuggestionsPanel />
    </AppContextProvider>
  );

  fireEvent.click(screen.getByText("seed-normal-suggestion"));

  const link = screen.getByText(/view link/i);
  expect(link).toHaveAttribute("href", "https://example.com/item");
});

// ── Exported site: passwords ship as hashes, never plaintext ─────────────

describe("sha256 util", () => {
  const nodeCrypto = require("crypto");
  const ref = (s) => nodeCrypto.createHash("sha256").update(s, "utf8").digest("hex");

  test.each([
    "", "abc", "family2026",
    "a".repeat(55), "b".repeat(56), "c".repeat(64), "d".repeat(200),
    "pässwörd with ünïcode 🎁",
  ])("matches Node's native sha256 for %j", (input) => {
    expect(sha256(input)).toBe(ref(input));
  });
});

describe("exported store.html", () => {
  const OWNER_PASSCODE = "super-secret-owner-passcode";
  const GATE_PASSWORD = "family2026-gate";

  const exportState = {
    websiteType: "registry",
    stockList: [],
    widgets: {},
    theme: { palette: "dark", primaryColor: "#316dca", custom: {} },
    integrations: {
      firebaseDatabaseUrl: "https://example-project.firebaseio.com",
      stripePublishableKey: "", mapboxToken: "",
      ownerPasscode: OWNER_PASSCODE,
    },
    accessGate: { enabled: true, password: GATE_PASSWORD },
    // A data-URL logo skips the fetch() of the bundled wordmark, which
    // isn't available under jsdom.
    brand: { logo: "data:image/svg+xml;base64,PHN2Zy8+", pageTitle: "Test Registry", currencyPrefix: "$" },
    cashFund: { enabled: false },
    decals: [], categoryConfig: {}, groupByCategory: true,
    giftSuggestionsEnabled: true, siteId: "testsite",
    layoutConfig: "grid", tileConfig: "standard",
    layoutAlign: "center", searchAlign: "center", suggestFormAlign: "center",
  };

  test("never contains either passcode in plaintext - only their hashes", async () => {
    const html = await generateStoreHTML(exportState);

    expect(html).not.toContain(OWNER_PASSCODE);
    expect(html).not.toContain(GATE_PASSWORD);
    expect(html).toContain(sha256(OWNER_PASSCODE));
    expect(html).toContain(sha256(GATE_PASSWORD));
  });

  test("the sha256 embedded in the exported page produces the same digests as the app's copy", async () => {
    const html = await generateStoreHTML(exportState);

    // Pull the inlined implementation (constant table + function) out of the
    // exported page and execute it - this is the exact code a guest's
    // browser runs, so the two copies drifting apart would break every
    // deployed gate even though the app's own unit tests still pass.
    const match = html.match(/var SHA256_K = \[[\s\S]*?\n}\n/);
    expect(match).not.toBeNull();
    // eslint-disable-next-line no-new-func
    const embeddedSha256 = new Function(match[0] + "; return sha256;")();

    for (const input of ["", "abc", OWNER_PASSCODE, GATE_PASSWORD, "ünïcode 🎁"]) {
      expect(embeddedSha256(input)).toBe(sha256(input));
    }
  });

  test("a guest can actually pass the exported site's gate with the right password (and not with the wrong one)", async () => {
    // Full end-to-end: run the real exported artifact in a scripted DOM and
    // drive the gate form the way a guest would. Firebase left unconfigured
    // so the page stays on its localStorage-only code paths under jsdom.
    const { JSDOM } = require("jsdom");
    const html = await generateStoreHTML({
      ...exportState,
      integrations: { ...exportState.integrations, firebaseDatabaseUrl: "" },
    });

    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      url: "https://example.com/store.html",
      virtualConsole: new (require("jsdom").VirtualConsole)(), // swallow jsdom's "navigation not implemented" noise
    });
    const doc = dom.window.document;
    dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles: true }));

    // The gate screen should be up, and the page must not have leaked the password anywhere.
    expect(doc.getElementById("access-gate-form")).not.toBeNull();

    const submitGate = (password) => {
      doc.getElementById("gate-email").value = "guest@example.com";
      doc.getElementById("gate-handle").value = "Guest One";
      doc.getElementById("gate-password").value = password;
      doc.getElementById("access-gate-form").dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true })
      );
    };

    submitGate("wrong-password");
    expect(dom.window.localStorage.getItem("wk_testsite_gate_passed")).toBeNull();
    expect(doc.getElementById("gate-error").style.display).toBe("block");

    submitGate(GATE_PASSWORD);
    expect(dom.window.localStorage.getItem("wk_testsite_gate_passed")).toBe("1");
  });
});
