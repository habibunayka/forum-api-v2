const AddCommentUseCase = require("../AddCommentUseCase");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

describe("AddCommentUseCase", () => {
    it("should orchestrate the add comment action correctly", async () => {
        // Arrange
        const useCasePayload = {
            content: "sebuah comment",
        };
        const threadId = "thread-123";
        const owner = "user-123";

        const expectedAddedComment = new AddedComment({
            id: "comment-123",
            content: useCasePayload.content,
            owner,
        });

        // Mocking
        const mockThreadRepository = {
            verifyThreadExists: jest.fn().mockResolvedValue(),
        };

        const mockCommentRepository = {
            addComment: jest.fn().mockResolvedValue(
                new AddedComment({
                    id: "comment-123",
                    content: useCasePayload.content,
                    owner,
                })
            ),
        };

        const addCommentUseCase = new AddCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        const addedComment = await addCommentUseCase.execute(
            useCasePayload,
            threadId,
            owner
        );

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
            threadId
        );
        expect(mockCommentRepository.addComment).toBeCalledWith(
            new NewComment({
                content: useCasePayload.content,
                threadId,
                owner,
            })
        );
        expect(addedComment).toStrictEqual(expectedAddedComment);
    });
});
