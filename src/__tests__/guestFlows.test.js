import React, { useContext } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AppContextProvider, AppContext } from "../components/appContext";
import App from "../App";
import SuggestGiftForm from "../components/suggestions/SuggestGiftForm";
import CashFundCard from "../components/cashfund/CashFundCard";

/**
 * Exercises guest-side flows (the people a registry owner is building the
 * site *for*) against the real context/components - reservations, gift
 * suggestions, cash pledges, and the access gate - including what happens
 * when Firebase sync is configured but the network call fails, since a
 * guest should never be told something worked when it silently didn't.
 */
function GuestHarness() {
  const {
    state, addStockItem, reserveItem, passAccessGate, suggestGift, pledgeCash,
    setIntegrations, setCashFund, setWebsiteType,
  } = useContext(AppContext);
  const item = state.stockList[0];

  return (
    <div>
      <button onClick={() => setWebsiteType("registry")}>as-registry</button>
      <button onClick={() => addStockItem({ name: "Blender", quantity: 1 })}>seed-item</button>
      <button onClick={() => passAccessGate("Guest One", "guest@example.com")}>pass-gate</button>
      <button onClick={() => item && reserveItem(item.id, 1)}>reserve</button>
      <button onClick={() => setIntegrations((prev) => ({ ...prev, firebaseDatabaseUrl: "https://example-project.firebaseio.com" }))}>
        configure-firebase
      </button>
      <button onClick={() => setCashFund((prev) => ({ ...prev, enabled: true }))}>enable-cash-fund</button>
      <button onClick={() => { suggestGift({ name: "Rug", quantity: 1, email: "guest@example.com" }); }}>suggest-gift</button>
      <button onClick={() => { pledgeCash({ name: "Guest", email: "guest@example.com", amount: 25 }); }}>pledge-cash</button>
      <button onClick={() => { pledgeCash({ name: "Guest", email: "guest@example.com", amount: 0 }); }}>pledge-zero</button>
      <div data-testid="guest-name">{state.guestName}</div>
      <div data-testid="guest-email">{state.guestEmail}</div>
      <div data-testid="gate-passed">{String(state.gatePassed)}</div>
      <div data-testid="reservations">{JSON.stringify(state.reservations)}</div>
      <div data-testid="suggestions">{JSON.stringify(state.suggestions)}</div>
      <div data-testid="cash-pledges">{JSON.stringify(state.cashPledges)}</div>
    </div>
  );
}

function readJSON(testId) {
  return JSON.parse(screen.getByTestId(testId).textContent);
}

const originalFetch = global.fetch;

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  global.fetch = originalFetch;
});

test("passing the access gate records the guest's name and email for the rest of the visit", () => {
  render(<AppContextProvider><GuestHarness /></AppContextProvider>);

  fireEvent.click(screen.getByText("pass-gate"));

  expect(screen.getByTestId("guest-name").textContent).toBe("Guest One");
  expect(screen.getByTestId("guest-email").textContent).toBe("guest@example.com");
  expect(screen.getByTestId("gate-passed").textContent).toBe("true");
});

test("an email entered at the gate autofills in both the suggestion form and the cash fund form", () => {
  // The forms read the guest's email as their initial value on mount, so
  // they must not exist yet until *after* the gate is passed - exactly like
  // the real app, where AccessGateScreen blocks Home (and everything in it)
  // from ever mounting until state.gatePassed flips to true.
  function Wrapper() {
    const { state } = useContext(AppContext);
    if (!state.gatePassed) return <GuestHarness />;
    return (
      <div>
        <GuestHarness />
        <SuggestGiftForm align="center" />
        <CashFundCard />
      </div>
    );
  }

  render(<AppContextProvider><Wrapper /></AppContextProvider>);

  fireEvent.click(screen.getByText("enable-cash-fund"));
  fireEvent.click(screen.getByText("pass-gate"));

  const emailInputs = screen.getAllByPlaceholderText("Your email");
  expect(emailInputs.length).toBeGreaterThanOrEqual(2);
  emailInputs.forEach((input) => expect(input).toHaveValue("guest@example.com"));
});

test("a gift suggestion is recorded locally when no Firebase project is configured", () => {
  render(<AppContextProvider><GuestHarness /></AppContextProvider>);

  fireEvent.click(screen.getByText("suggest-gift"));

  const suggestions = readJSON("suggestions");
  expect(Object.values(suggestions)).toHaveLength(1);
  expect(Object.values(suggestions)[0].name).toBe("Rug");
});

test("a gift suggestion is never shown as sent when the Firebase write actually fails", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false });

  function Wrapper() {
    const { suggestGift } = useContext(AppContext);
    const [result, setResult] = React.useState(null);
    return (
      <div>
        <GuestHarness />
        <button
          onClick={async () => setResult(await suggestGift({ name: "Rug", quantity: 1, email: "guest@example.com" }))}
        >
          suggest-and-capture
        </button>
        <div data-testid="suggest-result">{String(result)}</div>
      </div>
    );
  }

  render(<AppContextProvider><Wrapper /></AppContextProvider>);
  fireEvent.click(screen.getByText("configure-firebase"));

  await act(async () => {
    fireEvent.click(screen.getByText("suggest-and-capture"));
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(screen.getByTestId("suggest-result").textContent).toBe("false");
  expect(Object.keys(readJSON("suggestions"))).toHaveLength(0);
});

test("a cash pledge of zero or less is rejected instead of being recorded", () => {
  render(<AppContextProvider><GuestHarness /></AppContextProvider>);

  fireEvent.click(screen.getByText("pledge-zero"));

  expect(Object.keys(readJSON("cash-pledges"))).toHaveLength(0);
});

test("a cash pledge is recorded locally when no Firebase project is configured", () => {
  render(<AppContextProvider><GuestHarness /></AppContextProvider>);

  fireEvent.click(screen.getByText("pledge-cash"));

  const pledges = Object.values(readJSON("cash-pledges"));
  expect(pledges).toHaveLength(1);
  expect(pledges[0].amount).toBe(25);
});

test("a reservation still applies locally even when the Firebase write itself fails", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false });

  render(<AppContextProvider><GuestHarness /></AppContextProvider>);
  fireEvent.click(screen.getByText("as-registry"));
  fireEvent.click(screen.getByText("seed-item"));
  fireEvent.click(screen.getByText("pass-gate"));
  fireEvent.click(screen.getByText("configure-firebase"));

  await act(async () => {
    fireEvent.click(screen.getByText("reserve"));
    await Promise.resolve();
    await Promise.resolve();
  });

  const reservations = readJSON("reservations");
  const itemId = Object.keys(reservations)[0];
  // Without the fallback, a failed write leaves reservations empty and the
  // guest's click looks like it did nothing at all.
  expect(reservations[itemId]["Guest One"] ?? reservations[itemId]?.Anonymous).toBeGreaterThan(0);
});

test("a misconfigured Firebase URL does not crash the app for a guest viewing the page", () => {
  window.localStorage.setItem("winklr_integrations", JSON.stringify({
    stripePublishableKey: "", mapboxToken: "", ownerPasscode: "",
    firebaseDatabaseUrl: "not-a-real-url",
  }));

  expect(() => {
    render(<AppContextProvider><App /></AppContextProvider>);
  }).not.toThrow();

  expect(screen.getByRole("button", { name: /^edit mode$/i })).toBeInTheDocument();
});

test("a guest can pass a password-protected gate end-to-end and reach the storefront", () => {
  window.localStorage.setItem("winklr_accessGate", JSON.stringify({ enabled: true, password: "family2026" }));
  window.localStorage.setItem("winklr_stockList", JSON.stringify([
    { id: "item-1", name: "Toaster", image: "", price: 20, metadata: {}, categories: [], quantity: 1, nameRequired: true, is_sample: false, featured: false },
  ]));

  render(<AppContextProvider><App /></AppContextProvider>);

  expect(screen.getByText(/enter your details and the registry password/i)).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText("Your email"), { target: { value: "guest@example.com" } });
  fireEvent.change(screen.getByPlaceholderText(/display name/i), { target: { value: "Guest One" } });
  fireEvent.change(screen.getByPlaceholderText("Registry password"), { target: { value: "family2026" } });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));

  expect(screen.getByText("Toaster")).toBeInTheDocument();
});
