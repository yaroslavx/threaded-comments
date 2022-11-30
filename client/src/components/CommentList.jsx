import Comment from './Comment';

const CommentList = ({ comments }) => {
  return comments.map((comment) => (
    <div key={comment.id} className='comment-stack'>
      <Comment {...comment} />
    </div>
  ));
};

export default CommentList;
