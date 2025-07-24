import { useQuery } from "@apollo/client";
import { GET_LAWYER_BY_LAWYERID_QUERY } from "@/graphql/lawyer";
import React from "react";
import { LoaderCircle } from "lucide-react";

type ArticleType = {
  _id: string;
  id: string;
  lawyerId: string;
  title: string;
  content: string | { text?: string; image?: string; video?: string; audio?: string };
  specialization: Array<{ id: string; categoryName: string }>;
  type: string;
  createdAt: string;
  updatedAt?: string;
};

export const LawyerArticleCard = ({ article }: { article: ArticleType }) => {
  const { data: lawyerData, loading } = useQuery(GET_LAWYER_BY_LAWYERID_QUERY, {
    variables: { lawyerId: article.lawyerId },
    skip: !article.lawyerId,
  });

  return (
    <div className="bg-[#eee] rounded-lg shadow-sm overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 mb-2">
          <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ""}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2">{article.title}</h3>
        <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 flex-grow line-clamp-3">
          {typeof article.content === "string" ? article.content : article.content?.text || ""}
        </p>
        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-200">
          <span className="font-medium text-[18px]">
            {loading ? (
              <div className="flex justify-center items-center my-6">
                <LoaderCircle className="animate-spin w-8 h-8 text-gray-400" />
              </div>
            ) : (
              lawyerData?.getLawyerById?.firstName || "Anonymous"
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
