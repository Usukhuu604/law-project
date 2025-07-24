export interface CommentType {
    _id: string;
    author: string;
    content: string;
    createdAt: string;
  }
  
  export interface PostType {
    _id: string;
    title: string;
    content: string;
    specialization: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    createdAt: string;
    comments: CommentType[];
  }
  