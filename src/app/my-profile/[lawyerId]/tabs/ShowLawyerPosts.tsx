"use client";

import { PostCard } from "./post";
import { useQuery } from "@apollo/client";
import { GET_LAWYER_POSTS_BY_ID } from "@/graphql/post";

interface CommentType {
  _id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface PostType {
  id: string;
  title: string;
  lawyerId: string;
  content: {
    text: string;
  };

  mediaUrl?: string;
  mediaType?: "image" | "video";
  createdAt: string;
  comments: CommentType[];
}

type Props = {
  lawyerId: string;
};

export const ShowLawyerPosts = ({ lawyerId }: Props) => {
  const {
    data: postsData,
    loading,
    error,
  } = useQuery(GET_LAWYER_POSTS_BY_ID, {
    variables: { lawyerId: lawyerId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const posts: PostType[] = postsData?.getPostsByLawyer || [];

  return (
    <div className="space-y-6 border-none">
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
