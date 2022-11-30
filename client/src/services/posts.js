import { makeRequest } from './makeRequest';

export const getPosts = () => {
  return makeRequest('/posts');
};

export function getPost(id) {
  return makeRequest(`/posts/${id}`);
}
