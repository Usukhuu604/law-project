import { gql } from "@apollo/client";

export const GET_LAWYER_POSTS_BY_ID = gql`
  query GetLawyerPosts($lawyerId: ID!) {
    getPostsByLawyer(lawyerId: $lawyerId) {
      _id
      id
      lawyerId
      title
      content {
        text
        image
        video
        audio
      }
      specialization {
        id
        categoryName
      }
      type
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_POSTS = gql`
  query GetPosts {
    getPosts {
      _id
      id
      lawyerId
      title
      content {
        text
        image
        video
        audio
      }
      specialization {
        id
        categoryName
      }
      type
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      _id
      id
      lawyerId
      title
      content {
        text
        image
        video
        audio
      }
      specialization {
        id
        categoryName
      }
      type
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($postId: ID!, $input: UpdatePostInput!) {
    updatePost(postId: $postId, input: $input) {
      _id
      id
      lawyerId
      title
      content {
        text
        image
        video
        audio
      }
      specialization {
        id
        categoryName
      }
      type
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

export const GET_ALL_POSTS_FROM_LAWYERS = gql`
  query GetPosts {
    getPosts {
      _id
      id
      lawyerId
      title
      content {
        text
        image
        video
        audio
      }
      specialization {
        id
        categoryName
      }
      type
      createdAt
      updatedAt
    }
  }
`;
