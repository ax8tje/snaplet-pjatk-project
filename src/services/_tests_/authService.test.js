
import { getCurrentUser } from "../authService";

describe("authService", () => {
  test("getCurrentUser returns null when not logged in", () => {
    const user = getCurrentUser();
    expect(user).toBe(null);
  });
});
