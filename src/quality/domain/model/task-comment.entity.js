/**
 * Represents a comment of the discussion of a record. Comments are not approvals.
 *
 * @class TaskComment
 */
export class TaskComment {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the comment.
     * @param {string} params.recordCode - Record discussed.
     * @param {string} params.author - Author.
     * @param {string} params.initials - Initials of the author.
     * @param {string} params.postedAt - When it was posted (ISO 8601).
     * @param {string} params.text - Comment text.
     */
    constructor({id = 0, recordCode = '', author = '', initials = '', postedAt = '', text = ''}) {
        this.id = id;
        this.recordCode = recordCode;
        this.author = author;
        this.initials = initials;
        this.postedAt = postedAt;
        this.text = text;
    }
}
