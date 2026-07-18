import React, { useContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppContextProvider, AppContext } from "../components/appContext";
import AccessGatePanel from "../components/access/AccessGatePanel";
import StockListEditor from "../components/stock/StockListEditor";
import { parseConfigFile } from "../utils/configSerializer";
import { parseStockFile, parsePastedList } from "../utils/parseStockFile";

/**
 * Exercises owner-side flows against the real context/components (no
 * mocking) - building the item list, configuring the access gate and cash
 * fund, and round-tripping config/stock-list files.
 */
function OwnerHarness() {
  const {
    state, addStockItem, updateStockItem, removeStockItem, toggleFeaturedItem,
    setCashFund, removePledge, passAccessGateAsOwner, setIntegrations,
  } = useContext(AppContext);
  const item = state.stockList[0];

  return (
    <div>
      <button onClick={() => addStockItem({ name: "Kettle", price: 40, quantity: 1 })}>add-item</button>
      <button onClick={() => item && updateStockItem(item.id, { name: "Renamed Kettle", price: 45 })}>rename-item</button>
      <button onClick={() => item && removeStockItem(item.id)}>remove-item</button>
      <button onClick={() => item && toggleFeaturedItem(item.id)}>feature-item</button>
      <button onClick={() => setIntegrations((prev) => ({ ...prev, ownerPasscode: "letmein-owner" }))}>set-owner-passcode</button>
      <button onClick={() => setCashFund((prev) => ({ ...prev, enabled: true, title: "Honeymoon Fund" }))}>enable-cash-fund</button>
      <button
        data-testid="owner-passcode-result"
        onClick={(e) => { e.target.dataset.result = String(passAccessGateAsOwner("letmein-owner")); }}
      >
        try-owner-passcode
      </button>
      <button
        data-testid="wrong-passcode-result"
        onClick={(e) => { e.target.dataset.result = String(passAccessGateAsOwner("wrong")); }}
      >
        try-wrong-passcode
      </button>
      <div data-testid="stock-list">{JSON.stringify(state.stockList)}</div>
      <div data-testid="cash-fund">{JSON.stringify(state.cashFund)}</div>
      <div data-testid="cash-pledges">{JSON.stringify(state.cashPledges)}</div>
      <div data-testid="gate-passed">{String(state.gatePassed)}</div>
      <OwnerUnlockedDisplay />
      <button onClick={() => removePledge(Object.keys(state.cashPledges)[0])}>remove-first-pledge</button>
    </div>
  );
}

function OwnerUnlockedDisplay() {
  // ownerUnlocked lives at the top level of the context value, not nested
  // under `state`, so it needs its own reader.
  const { ownerUnlocked } = useContext(AppContext);
  return <div data-testid="owner-unlocked">{String(ownerUnlocked)}</div>;
}

function readJSON(testId) {
  return JSON.parse(screen.getByTestId(testId).textContent);
}

beforeEach(() => {
  window.localStorage.clear();
});

test("owner can add, rename, and remove an item", () => {
  render(<AppContextProvider><OwnerHarness /></AppContextProvider>);

  fireEvent.click(screen.getByText("add-item"));
  expect(readJSON("stock-list")).toHaveLength(1);
  expect(readJSON("stock-list")[0].name).toBe("Kettle");

  fireEvent.click(screen.getByText("rename-item"));
  const renamed = readJSON("stock-list")[0];
  expect(renamed.name).toBe("Renamed Kettle");
  expect(renamed.price).toBe(45);

  fireEvent.click(screen.getByText("remove-item"));
  expect(readJSON("stock-list")).toHaveLength(0);
});

test("owner can add, edit, and remove an item's detail fields in the editor", () => {
  render(
    <AppContextProvider>
      <OwnerHarness />
      <StockListEditor />
    </AppContextProvider>
  );

  fireEvent.click(screen.getByText("add-item"));
  fireEvent.click(screen.getByTitle("Edit"));
  fireEvent.click(screen.getByText("+ Add field"));
  fireEvent.change(screen.getByPlaceholderText("Label"), { target: { value: "Notes" } });
  fireEvent.change(screen.getByPlaceholderText("Value"), { target: { value: "Any colour but beige" } });
  fireEvent.click(screen.getByText("Save"));
  expect(readJSON("stock-list")[0].metadata).toEqual({ Notes: "Any colour but beige" });

  // Reopen: the saved field round-trips into the form; blanking its label
  // drops the field on save (that's how a field is removed-by-emptying).
  fireEvent.click(screen.getByTitle("Edit"));
  expect(screen.getByPlaceholderText("Value").value).toBe("Any colour but beige");
  fireEvent.change(screen.getByPlaceholderText("Label"), { target: { value: "" } });
  fireEvent.click(screen.getByText("Save"));
  expect(readJSON("stock-list")[0].metadata).toEqual({});
});

test("featuring an item un-features every other item (only one hero at a time)", () => {
  render(<AppContextProvider><OwnerHarness /></AppContextProvider>);

  fireEvent.click(screen.getByText("add-item"));
  fireEvent.click(screen.getByText("add-item"));
  fireEvent.click(screen.getByText("feature-item")); // features stockList[0]

  const afterFirst = readJSON("stock-list");
  expect(afterFirst[0].featured).toBe(true);
  expect(afterFirst[1].featured).toBe(false);
});

test("enabling the Guest Access gate never locks out the person turning it on", () => {
  function Wrapper() {
    const { state } = useContext(AppContext);
    return (
      <div>
        <AccessGatePanel />
        <div data-testid="gate-passed">{String(state.gatePassed)}</div>
      </div>
    );
  }

  render(<AppContextProvider><Wrapper /></AppContextProvider>);

  fireEvent.click(screen.getByLabelText(/require a password/i));
  fireEvent.change(screen.getByPlaceholderText("Registry password"), { target: { value: "family2026" } });

  // The owner just switched the gate on for a registry they're already
  // looking at - they must not be booted to the gate screen themselves.
  expect(screen.getByTestId("gate-passed").textContent).toBe("true");
});

test("the owner passcode is a working bypass independent of the guest gate password", () => {
  render(<AppContextProvider><OwnerHarness /></AppContextProvider>);

  fireEvent.click(screen.getByText("set-owner-passcode"));

  fireEvent.click(screen.getByText("try-wrong-passcode"));
  expect(screen.getByTestId("wrong-passcode-result").dataset.result).toBe("false");
  expect(readJSON("owner-unlocked")).toBe(false);

  fireEvent.click(screen.getByText("try-owner-passcode"));
  expect(screen.getByTestId("owner-passcode-result").dataset.result).toBe("true");
  expect(readJSON("gate-passed")).toBe(true);
  expect(readJSON("owner-unlocked")).toBe(true);
});

test("owner can turn on the cash fund and remove a pledge a guest recorded", async () => {
  function Wrapper() {
    const { pledgeCash } = useContext(AppContext);
    return (
      <div>
        <OwnerHarness />
        <button onClick={() => pledgeCash({ name: "Aunt Jo", email: "jo@example.com", amount: 50, message: "Congrats!" })}>
          guest-pledges
        </button>
      </div>
    );
  }

  render(<AppContextProvider><Wrapper /></AppContextProvider>);

  fireEvent.click(screen.getByText("enable-cash-fund"));
  expect(readJSON("cash-fund").enabled).toBe(true);
  expect(readJSON("cash-fund").title).toBe("Honeymoon Fund");

  await fireEvent.click(screen.getByText("guest-pledges"));
  expect(Object.keys(readJSON("cash-pledges"))).toHaveLength(1);

  fireEvent.click(screen.getByText("remove-first-pledge"));
  expect(Object.keys(readJSON("cash-pledges"))).toHaveLength(0);
});

test("importing a config file round-trips the cash fund and site id fields", async () => {
  const config = {
    version: 1,
    siteId: "abc12345",
    websiteType: "registry",
    cashFund: { enabled: true, title: "New House Fund", bankDetailsEnabled: true, bankDetails: "PayPal.me/example" },
  };
  const file = new File([JSON.stringify(config)], "winklr-config.json", { type: "application/json" });

  const parsed = await parseConfigFile(file);

  expect(parsed.siteId).toBe("abc12345");
  expect(parsed.cashFund.enabled).toBe(true);
  expect(parsed.cashFund.bankDetails).toBe("PayPal.me/example");
});

test("importing a spreadsheet-style stock file recognises quantity and category column aliases", async () => {
  const rows = [
    { Name: "Blender", Qty: "3", Category: "Kitchen, Small Appliances", Price: "60" },
  ];
  const file = new File([JSON.stringify(rows)], "items.json", { type: "application/json" });

  const items = await parseStockFile(file);

  expect(items).toHaveLength(1);
  expect(items[0].name).toBe("Blender");
  expect(items[0].quantity).toBe(3);
  expect(items[0].price).toBe(60);
  expect(items[0].categories).toEqual(["Kitchen", "Small Appliances"]);
});

test("pasting a plain text list generates stock items, surviving real-world copy artifacts", () => {
  // Real sample from a baby registry pasted out of a phone app - note the
  // ‌ zero-width non-joiners most lines start with, the double space
  // after "Bottles -", and the missing space in "brush -non specific".
  const pasted = [
    "Nappies - Huggies extra care",
    "‌Polaroid camera",
    "‌Baby wrap - Snuggletime Snuggleroo wrap",
    "‌Soft-Structured Carrier - Snuggleroo Hip Seat Baby Carrier",
    "‌Clothes - non specific ",
    "‌Swaddles - large, cotton muslin or bamboo",
    "Feeding pillow - non specific ",
    "‌Pacifiers - Silicone, different ages, Must pass triangle test",
    "‌Gift card (clicks/dischem) or Money",
    "‌Toys - non specific ",
    "‌Books - non specific ",
    "‌Burp Cloths/bibs - non specific ",
    "‌Bottles -  Pigeon Soft Touch",
    "‌Bowls - non specific ",
    "‌Spoons/sporks - non specific",
    "‌Finger tooth brush -non specific",
    "‌Nasal aspirator - non specific ",
    "‌Baby bath - non specific",
    "‌Odour control nappy bin",
    "‌Adjustable high chair - non specific",
    "", "   ",
  ].join("\n");

  const items = parsePastedList(pasted);

  expect(items).toHaveLength(20); // blank lines dropped

  const byName = Object.fromEntries(items.map((i) => [i.name, i]));

  // Name/details split on the first dash
  expect(byName["Nappies"].metadata.Details).toBe("Huggies extra care");
  expect(byName["Pacifiers"].metadata.Details).toBe("Silicone, different ages, Must pass triangle test");

  // Hyphenated names (no space before the hyphen) stay whole
  expect(byName["Soft-Structured Carrier"].metadata.Details).toBe("Snuggleroo Hip Seat Baby Carrier");

  // Lines with no dash become plain items with no Details
  expect(byName["Polaroid camera"].metadata).toEqual({});
  expect(byName["Gift card (clicks/dischem) or Money"].metadata).toEqual({});

  // Sloppy spacing around the dash still parses
  expect(byName["Bottles"].metadata.Details).toBe("Pigeon Soft Touch");
  expect(byName["Finger tooth brush"].metadata.Details).toBe("non specific");

  // No invisible characters survive into names
  for (const item of items) {
    expect(item.name).not.toMatch(/[\u200b-\u200f\u2060\ufeff]/);
    expect(item.name).toBe(item.name.trim());
    expect(item.id).toBeTruthy();
  }
});
