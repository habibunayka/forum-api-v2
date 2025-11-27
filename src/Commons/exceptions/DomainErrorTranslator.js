const AuthorizationError = require('./AuthorizationError');
const InvariantError = require('./InvariantError');
const NotFoundError = require('./NotFoundError');

const DomainErrorTranslator = {
    translate(error) {
      return DomainErrorTranslator._directories[error.message] || error;
    },
};

DomainErrorTranslator._directories = {
    // USER
    'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
    'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
    'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
    'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),

    // AUTHENTICATION
    'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
    'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
    'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
    'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
    'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
    'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),

    // THREAD
    'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'),
    'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai'),
    'THREAD_REPOSITORY.NOT_FOUND': new NotFoundError('thread tidak ditemukan'),

    // COMMENT
    'NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada'),
    'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menambahkan komentar karena tipe data tidak sesuai'),
    'COMMENT_REPOSITORY.NOT_FOUND': new NotFoundError('komentar tidak ditemukan'),
    'COMMENT_REPOSITORY.UNAUTHORIZED': new AuthorizationError('anda tidak berhak mengakses resource ini'),

    // REPLY
    'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan balasan karena properti yang dibutuhkan tidak ada'),
    'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menambahkan balasan karena tipe data tidak sesuai'),
    'REPLY_REPOSITORY.NOT_FOUND': new NotFoundError('balasan tidak ditemukan'),
    'REPLY_REPOSITORY.UNAUTHORIZED': new AuthorizationError('anda tidak berhak mengakses resource ini'),
};

module.exports = DomainErrorTranslator;
