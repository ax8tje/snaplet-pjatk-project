import { sendMessage } from "../messageService";

describe("messageService", () => {
  test("sendMessage should not throw error", async () => {
    await expect(
      sendMessage("user1", "user2", "Hello world")
    ).resolves.not.toThrow();
  });
});
