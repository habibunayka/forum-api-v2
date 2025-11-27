const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddThreadUseCase = require("../AddThreadUseCase");

describe("AddThreadUseCase", () => {
    it("should orchestrate the add thread action correctly", async () => {
        // Arrange
        const useCasePayload = {
            title: "Judul thread",
            body: "Isi thread",
        };
        const owner = "user-123";

        const expectedAddedThread = new AddedThread({
            id: "thread-123",
            title: useCasePayload.title,
            owner,
        });

        // Mocking
        const mockThreadRepository = {
            addThread: jest.fn().mockResolvedValue(
                new AddedThread({
                    id: "thread-123",
                    title: useCasePayload.title,
                    owner,
                })
            ),
        };

        const addThreadUseCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const addedThread = await addThreadUseCase.execute(
            useCasePayload,
            owner
        );

        // Assert
        expect(mockThreadRepository.addThread).toBeCalledWith(
            new NewThread({ ...useCasePayload, owner })
        );
        expect(addedThread).toStrictEqual(expectedAddedThread);
    });
});
