"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_COMMENT, GET_COMMENTS_BY_POST } from "@/graphql/comment";
import { Heart, MessageCircle, Send, User, Calendar, Tag } from "lucide-react";
import { GET_LAWYER_BY_LAWYERID_QUERY } from "@/graphql/lawyer";
import { useRouter } from "next/navigation";

type CommentType = {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
};

type PostType = {
  id: string;
  lawyerId: string;
  title: string;
  content: {
    text: string;
  };
  mediaUrl?: string;
  mediaType?: "image" | "video";
  createdAt: string;
  comments: CommentType[];
};

export const PostCard = ({ post }: { post: PostType }) => {
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0); // demo like count
  const [showAllComments, setShowAllComments] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_COMMENTS_BY_POST, {
    variables: { postId: post.id },
  });

  const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      setCommentText("");
      refetch();
    },
    onError: (error: any) => {
      setLocalError(error.message || "Коммент нэмэхэд алдаа гарлаа.");
      setTimeout(() => setLocalError(null), 2500);
    },
  });

  const handleAddComment = async () => {
    setLocalError(null);
    if (!commentText.trim()) {
      setLocalError("Сэтгэгдэл хоосон байна!");
      return;
    }
    await createComment({
      variables: {
        input: {
          postId: post.id,
          content: commentText,
        },
      },
    });
  };

  const { data: lawyerData } = useQuery(GET_LAWYER_BY_LAWYERID_QUERY, {
    variables: { lawyerId: post.lawyerId },
  });

  const lawyerName = `${lawyerData?.getLawyerById.firstName || "Хуульч"} ${lawyerData?.getLawyerById.lastName || ""}`;
  console.log("Lawyer Name:", lawyerData);

  const handleLike = () => {
    setIsLiked((liked) => !liked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleAddComment();
    }
  };

  const comments: CommentType[] = data?.getCommentsByPost ?? post.comments ?? [];
  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Яг одоо";
    if (diffMins < 60) return `${diffMins} минутын өмнө`;
    if (diffHours < 24) return `${diffHours} цагийн өмнө`;
    if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
    return date.toLocaleDateString("mn-MN");
  };

  const router = useRouter();

  const handleClick = () => {
    router.push(`/lawyer/${post.lawyerId}`);
  };

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
              onClick={handleClick}
            >
              <Tag className="w-3 h-3" />
              <span>{lawyerName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            {formatDate(post.createdAt)}
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.content.text}</p>
      </div>

      {post.mediaType === "image" && post.mediaUrl && (
        <div className="relative">
          <img
            src={post.mediaUrl}
            alt="Post attachment"
            className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
          />
        </div>
      )}
      {post.mediaType === "video" && post.mediaUrl && (
        <div className="px-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <video controls src={post.mediaUrl} className="w-full h-full object-cover" preload="metadata" />
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                isLiked ? "bg-red-50 text-red-600 hover:bg-red-100" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart className={`w-5 h-5 transition-all ${isLiked ? "fill-current" : ""}`} />
              <span className="font-medium text-sm">{likeCount}</span>
            </button>

            <button
              onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium text-sm">{comments.length}</span>
            </button>
          </div>
        </div>
      </div>

      {isCommentsExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-4 bg-gray-50">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    placeholder="Сэтгэгдэл бичих... (Ctrl+Enter дарж илгээнэ үү)"
                    className="w-full border border-gray-200 rounded-lg p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={creating}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={creating || !commentText.trim()}
                    className="absolute right-2 bottom-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-2"
                  >
                    {creating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {localError && <div className="text-xs text-red-600 mt-2">{localError}</div>}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-gray-600">Коммент уншиж байна...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">Коммент уншихад алдаа гарлаа. Дахин оролдоно уу.</div>
            )}

            {displayedComments.map((comment) => (
              <div key={comment._id} className="flex gap-3 group">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{comment.author?.slice(0, 2).toUpperCase() || "??"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 group-hover:bg-gray-200 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{comment.author?.slice(0, 8) || "Зочин"}***</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {hasMoreComments && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                Бүх коммент үзэх ({comments.length - 3} бусад)
              </button>
            )}

            {comments.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Одоохондоо сэтгэгдэл байхгүй байна.</p>
                <p className="text-sm">Эхний сэтгэгдлийг та бичээрэй!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
