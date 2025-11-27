const AddedThread = require("../../Domains/threads/entities/AddedThread");
const NewThread = require("../../Domains/threads/entities/NewThread");


class AddThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload, owner) {
        const newThread = new NewThread({ ...useCasePayload, owner });
        const addedThread = await this._threadRepository.addThread(newThread);

        return new AddedThread(addedThread);
    }
}

module.exports = AddThreadUseCase;
