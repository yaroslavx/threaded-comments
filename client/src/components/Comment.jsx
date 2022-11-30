import { IconButton } from './IconButton';
import { FaHeart, FaReply, FaEdit, FaTrash } from 'react-icons/fa';
import { usePost } from '../contexts/PostContext';
import CommentList from './CommentList';
import { useState } from 'react';
import { useAsyncFn } from '../hooks/useAsync';
import {
  createComment,
  updateComment,
  deleteComment,
} from '../services/comment';
import CommentForm from './CommentForm';
import { useUser } from '../hooks/useUser';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const Comment = ({ id, message, user, createdAt }) => {
  const {
    post,
    getReplies,
    createLocalComment,
    updateLocalComment,
    deleteLocalComment,
  } = usePost();
  const childComments = getReplies(id);
  const [areChildrenHidden, setAreChildrenHidden] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const createCommentFn = useAsyncFn(createComment);
  const updateCommentFn = useAsyncFn(updateComment);
  const deleteCommentFn = useAsyncFn(deleteComment);
  const currentUser = useUser();

  function onCommentReply(message) {
    return createCommentFn
      .execute({ postId: post.id, message, parentId: id })
      .then((comment) => {
        setIsReplying(false);
        createLocalComment(comment);
      });
  }

  function onCommentUpdate(message) {
    return updateCommentFn
      .execute({ postId: post.id, message, id })
      .then((comment) => {
        setIsEditing(false);
        updateLocalComment(id, comment.message);
      });
  }

  function onCommentDelete() {
    return deleteCommentFn
      .execute({ postId: post.id, id })
      .then((comment) => deleteLocalComment(comment.id));
  }

  return (
    <>
      <div className='comment'>
        <div className='header'>
          <span className='name'>{user.name}</span>
          <span className='date'>
            {dateFormatter.format(Date.parse(createdAt))}
          </span>
        </div>
        {isEditing ? (
          <CommentForm
            autoFocus
            initialValue={message}
            onSubmit={onCommentUpdate}
            loading={updateComment.loading}
            error={updateComment.error}
          />
        ) : (
          <div className='message'>{message}</div>
        )}
        <div className='footer'>
          <IconButton Icon={FaHeart} aria-label='Like'>
            2
          </IconButton>
          <IconButton
            onClick={() => setIsReplying((prev) => !prev)}
            isActive={isReplying}
            Icon={FaReply}
            aria-label={isReplying ? 'Cancel Reply' : 'Reply'}
          />
          {user.id === currentUser.id && (
            <>
              <IconButton
                onClick={() => setIsEditing((prev) => !prev)}
                isActive={isEditing}
                Icon={FaEdit}
                aria-label={isEditing ? 'Cancel Editing' : 'Edit'}
              />
              <IconButton
                disabled={deleteComment.loading}
                onClick={onCommentDelete}
                Icon={FaTrash}
                aria-label='Delete'
                color='danger'
              />
            </>
          )}
        </div>
      </div>
      {isReplying && (
        <div className='mt-1 ml-3'>
          <CommentForm
            autoFocus
            onSubmit={onCommentReply}
            loading={createCommentFn.loading}
            error={createCommentFn.error}
          />
        </div>
      )}
      {childComments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${
              areChildrenHidden ? 'hide' : ''
            }`}
          >
            <button
              className='collapse-line'
              aria-label='Hide Replies'
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className='nested-comments'>
              <CommentList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? 'hide' : ''}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
};

export default Comment;
