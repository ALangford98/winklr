import React, { useContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppContextProvider, AppContext } from "../components/appContext";

/**
 * Exercises the real reservation logic in appContext.js end-to-end (no
 * mocking of reserveItem) by rendering the actual provider and driving it
 * through simple buttons. Firebase is never configured in these tests, so
 * every reservation goes through the localStorage-backed code path.
 */
function Harness() {
  const { state, addStockItem, reserveItem, setGuestName } = useContext(AppContext);
  const item = state.stockList[0];

  return (
    <div>
      <button onClick={() => addStockItem({ name: "Limited Item", quantity: 2 })}>seed-limited</button>
      <button onClick={() => addStockItem({ name: "Unlimited Item", quantity: 0 })}>seed-unlimited</button>
      <button onClick={() => setGuestName("Alice")}>as-alice</button>
      <button onClick={() => setGuestName("Bob")}>as-bob</button>
      <button onClick={() => setGuestName("")}>as-anonymous</button>
      <button onClick={() => item && reserveItem(item.id, 1)}>reserve</button>
      <button onClick={() => item && reserveItem(item.id, -1)}>unreserve</button>
      <div data-testid="reservations">{JSON.stringify(state.reservations)}</div>
    </div>
  );
}

function renderHarness() {
  render(
    <AppContextProvider>
      <Harness />
    </AppContextProvider>
  );
}

function readReservations() {
  return JSON.parse(screen.getByTestId("reservations").textContent);
}

function totalReserved(reservations, itemId) {
  return Object.values(reservations[itemId] || {}).reduce((sum, n) => sum + n, 0);
}

beforeEach(() => {
  window.localStorage.clear();
});

test("a guest can reserve multiple of an unlimited item", () => {
  renderHarness();
  fireEvent.click(screen.getByText("seed-unlimited"));
  fireEvent.click(screen.getByText("as-alice"));

  fireEvent.click(screen.getByText("reserve"));
  fireEvent.click(screen.getByText("reserve"));
  fireEvent.click(screen.getByText("reserve"));

  const reservations = readReservations();
  const itemId = Object.keys(reservations)[0];
  expect(reservations[itemId].Alice).toBe(3);
});

test("total reservations on a limited item cannot exceed its quantity, even from one guest hammering the button", () => {
  renderHarness();
  fireEvent.click(screen.getByText("seed-limited")); // quantity: 2
  fireEvent.click(screen.getByText("as-alice"));

  fireEvent.click(screen.getByText("reserve"));
  fireEvent.click(screen.getByText("reserve"));
  fireEvent.click(screen.getByText("reserve")); // should be a no-op, already at cap
  fireEvent.click(screen.getByText("reserve"));

  const reservations = readReservations();
  const itemId = Object.keys(reservations)[0];
  expect(totalReserved(reservations, itemId)).toBe(2);
  expect(reservations[itemId].Alice).toBe(2);
});

test("two guests sharing a limited item split it without exceeding the total", () => {
  renderHarness();
  fireEvent.click(screen.getByText("seed-limited")); // quantity: 2

  fireEvent.click(screen.getByText("as-alice"));
  fireEvent.click(screen.getByText("reserve")); // Alice: 1

  fireEvent.click(screen.getByText("as-bob"));
  fireEvent.click(screen.getByText("reserve")); // Bob: 1, total now 2 (fully reserved)
  fireEvent.click(screen.getByText("reserve")); // Bob tries again - should be blocked, total already at cap

  const reservations = readReservations();
  const itemId = Object.keys(reservations)[0];
  expect(reservations[itemId].Alice).toBe(1);
  expect(reservations[itemId].Bob).toBe(1);
  expect(totalReserved(reservations, itemId)).toBe(2);
});

test("a guest cannot decrement another guest's reservation", () => {
  renderHarness();
  fireEvent.click(screen.getByText("seed-unlimited"));

  fireEvent.click(screen.getByText("as-bob"));
  fireEvent.click(screen.getByText("reserve")); // Bob: 1

  fireEvent.click(screen.getByText("as-alice"));
  fireEvent.click(screen.getByText("unreserve")); // Alice has 0 - should not touch Bob's

  const reservations = readReservations();
  const itemId = Object.keys(reservations)[0];
  expect(reservations[itemId].Bob).toBe(1);
  expect(reservations[itemId].Alice).toBeUndefined();
});

test("releasing a reservation down to zero removes the guest's entry entirely", () => {
  renderHarness();
  fireEvent.click(screen.getByText("seed-unlimited"));
  fireEvent.click(screen.getByText("as-alice"));

  fireEvent.click(screen.getByText("reserve"));
  fireEvent.click(screen.getByText("unreserve"));

  const reservations = readReservations();
  const itemId = Object.keys(reservations)[0];
  expect(reservations[itemId]).toBeUndefined();
});

test("reserving with no guest name set falls back to a shared 'Anonymous' bucket", () => {
  renderHarness();
  fireEvent.click(screen.getByText("seed-unlimited"));
  fireEvent.click(screen.getByText("as-anonymous"));

  fireEvent.click(screen.getByText("reserve"));

  const reservations = readReservations();
  const itemId = Object.keys(reservations)[0];
  expect(reservations[itemId].Anonymous).toBe(1);
});
