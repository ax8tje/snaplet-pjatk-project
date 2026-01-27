jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(() => ({
    exists: () => true,
    data: () => ({ userId: "1", displayName: "Kuba" }),
  })),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => ({
    docs: [{ data: () => ({ displayName: "Kuba" }) }],
  })),
  onSnapshot: jest.fn((_, cb) => {
    cb({ exists: () => true, data: () => ({ displayName: "Kuba" }) });
    return jest.fn();
  }),
}));

import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  searchUsers,
  subscribeToUser,
} from "../userService";

describe("User Service (Firestore)", () => {
  test("creates user profile", async () => {
    const user = await createUserProfile("1", { displayName: "Kuba" });
    expect(user.displayName).toBe("Kuba");
  });

  test("gets user profile", async () => {
    const user = await getUserProfile("1");
    expect(user.displayName).toBe("Kuba");
  });

  test("updates user profile", async () => {
    const user = await updateUserProfile("1", { bio: "Dev" });
    expect(user.displayName).toBe("Kuba");
  });

  test("gets user posts", async () => {
    const posts = await getUserPosts("1");
    expect(Array.isArray(posts)).toBe(true);
  });

  test("searches users", async () => {
    const users = await searchUsers("Ku");
    expect(users.length).toBeGreaterThan(0);
  });

  test("subscribes to user", () => {
    const cb = jest.fn();
    const unsub = subscribeToUser("1", cb);

    expect(cb).toHaveBeenCalled();
    unsub();
  });
});
