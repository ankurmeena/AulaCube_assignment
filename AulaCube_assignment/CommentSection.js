import React, { useState } from 'react';
import './CommentSection.css';

const CommentSection = ({ persistComments = false }) => {
  const [comments, setComments] = useState(
    persistComments ? JSON.parse(localStorage.getItem('comments')) || [] : []
  );
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [sortAscendingByDate, setSortAscendingByDate] = useState(false);
  const [sortAscendingByReplies, setSortAscendingByReplies] = useState(false);

  // for creating new comment
  const handlePostComment = () => {
    if (newComment.trim() !== '') {
      setComments([
        ...comments,
        {
          id: Date.now(),
          text: newComment,
          replies: [],
          timestamp: new Date().toLocaleString(),
          likes: 0,
        },
      ]);

      setNewComment('');

      if (persistComments) {
        localStorage.setItem('comments', JSON.stringify(comments));
      }
    }
  };

  //handling the delete operation for noth commment and replies
  const handleDelete = (commentId, replyId) => {
    let updatedComments;

    if (replyId !== undefined) {
      // Delete a reply
      updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== replyId),
          };
        }
        return comment;
      });
    } else {
      // Delete a comment
      updatedComments = comments.filter((comment) => comment.id !== commentId);
    }

    setComments(updatedComments);

    if (persistComments) {
      localStorage.setItem('comments', JSON.stringify(updatedComments));
    }
  };


  //handling the reply messages upto 3 level
  const handleReply = (commentId, replyId, replyText) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId && comment.replies.length < 3) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: Date.now(),
              text: replyText,
              timestamp: new Date().toLocaleString(),
              likes: 0,
            },
          ],
        };
      } else if(comment.replies.length>=2){
        showAlert();
      }else if (comment.replies.length > 0 && comment.replies.find((reply) => reply.id === replyId)) {
        const updatedReplies = comment.replies.map((reply) =>
          reply.id === replyId && reply.replies.length < 3
            ? {
              ...reply,
              replies: [
                ...reply.replies,
                {
                  id: Date.now(),
                  text: replyText,
                  timestamp: new Date().toLocaleString(),
                  likes: 0,
                },
              ],
            }
            : reply
        );
        return {
          ...comment,
          replies: updatedReplies,
        };
      }
      setNewComment('');
      return comment;
    });

    setComments(updatedComments);
    setReplyTo(null);

    if (persistComments) {
      localStorage.setItem('comments', JSON.stringify(updatedComments));
    }
  };

  // handling the like operation
  const handleLike = (commentId, replyId) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId && replyId === undefined) {
        return {
          ...comment,
          likes: comment.likes + 1,
        };
      } else if (comment.replies.length > 0 && comment.replies.find((reply) => reply.id === replyId)) {
        const updatedReplies = comment.replies.map((reply) =>
          reply.id === replyId
            ? {
              ...reply,
              likes: reply.likes + 1,
            }
            : reply
        );
        return {
          ...comment,
          replies: updatedReplies,
        };
      }
      return comment;
    });

    setComments(updatedComments);

    if (persistComments) {
      localStorage.setItem('comments', JSON.stringify(updatedComments));
    }
  };

  const handleToggleReply = (commentId, replyId) => {
    setReplyTo(replyTo => {
      if (replyTo && replyTo.commentId === commentId && replyTo.replyId === replyId) {
        return null; // Clear replyTo if it matches the current comment and reply
      }
      return { commentId, replyId }; // Set replyTo otherwise
    });
  };

  const showReplyInput = (commentId, replyId) => {
    const replyInfo = replyTo && replyTo.commentId === commentId && replyTo.replyId === replyId;
    return replyInfo;
  };

  const showAlert = () => {
    alert('Maximum 3 levels of replies are allowed.');
  };

  //handling sorting by date
  const handleSortComments = () => {
    setSortAscendingByDate(!sortAscendingByDate);
    const sortedComments = [...comments].sort((a, b) => {
      return sortAscendingByDate ? a.timestamp.localeCompare(b.timestamp) : b.timestamp.localeCompare(a.timestamp);
    });

    setComments(sortedComments);
  };

  //handling sorting by size of replies
  const handleSortCommentsByReplies = () => {
    setSortAscendingByReplies(!sortAscendingByReplies);
    const sortedComments = [...comments].sort((a, b) => {
      const repliesA = a.replies.length;
      const repliesB = b.replies.length;

      return sortAscendingByReplies ? repliesA - repliesB : repliesB - repliesA;
    });

    setComments(sortedComments);
  };

  // template we created 
  return (
    <div className="comment-section">
      <div className="header">
        <div className="header-left">
          <p>What's on your mind?</p>
          <textarea
            rows="4"
            placeholder="...enter text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <div className="header-right">
          <button onClick={handlePostComment}>Post</button>
        </div>
      </div>
      <hr />
      <div className="comments">
        <div className="sort">
          <button className="sort-button" onClick={handleSortComments}>
            {sortAscendingByDate ? 'Sort Oldest First' : 'Sort Newest First'}
          </button>
          <button className="sort-button" onClick={handleSortCommentsByReplies}>
            {sortAscendingByReplies ? 'Sort Least to Most Replies' : 'Sort Most to Least Replies'}
          </button>
        </div>

        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <p>{comment.text}</p>
              <div className="likes">
                <span role="img" aria-label="star">
                  ⭐️
                </span>{' '}
                {comment.likes} {comment.likes === 1 ? 'Like' : 'Likes'}
              </div>
            </div>
            <p className="timestamp">Posted on: {comment.timestamp}</p>
            <div className="buttons">
              <button onClick={() => handleToggleReply(comment.id, undefined)}>
                {showReplyInput(comment.id, undefined) ? 'Cancel Reply' : 'Reply'}
              </button>
              <button className="delete" onClick={() => handleDelete(comment.id, undefined)}>
                Delete
              </button>
              <button onClick={() => handleLike(comment.id, undefined)}>
                <span role="img" aria-label="star">
                  ⭐️
                </span>
              </button>
            </div>

            {showReplyInput(comment.id, undefined) && (
              <div className="reply-input">
                <textarea
                  rows="2"
                  placeholder="Write a reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={() => handleReply(comment.id, undefined, newComment)}>Submit</button>
              </div>
            )}

            <div className="replies">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="reply">
                  <div className="reply-header">
                    <p>{reply.text}</p>
                    <div className="likes">
                      <span role="img" aria-label="star">
                        ⭐️
                      </span>{' '}
                      {reply.likes} {reply.likes === 1 ? 'Like' : 'Likes'}
                    </div>
                  </div>
                  <p className="timestamp">Posted on: {reply.timestamp}</p>
                  <div className="buttons">
                    <button onClick={() => handleToggleReply(comment.id, reply.id)}>
                      {showReplyInput(comment.id, reply.id) ? 'Cancel Reply' : 'Reply'}
                    </button>
                    <button className="delete" onClick={() => handleDelete(comment.id, reply.id)}>
                      Delete
                    </button>
                    <button onClick={() => handleLike(comment.id, reply.id)}>
                      <span role="img" aria-label="star">
                        ⭐️
                      </span>
                    </button>
                  </div>

                  {showReplyInput(comment.id, reply.id) && (
                    <div className="reply-input">
                      <textarea
                        rows="2"
                        placeholder="Write a reply..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button onClick={() => handleReply(comment.id, reply.id, newComment)}>Submit</button>
                    </div>
                  )}
                </div>
              ))}
              {comment.replies.length < 3 && (
                <div className="reply-button">
                  <button
                    onClick={() =>
                      showReplyInput(comment.id, undefined) ? showAlert() : handleToggleReply(comment.id, undefined)
                    }
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
