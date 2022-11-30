import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getPosts } from '../services/posts';

const PostList = () => {
  const { loading, error, value: posts } = useAsync(getPosts);

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>Something went wrong...</h1>;

  return posts.map((post) => {
    return (
      <h1 key={post.id}>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h1>
    );
  });
};

export default PostList;
