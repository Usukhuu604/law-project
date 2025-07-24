"use client";
import React from "react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { GET_ALL_POSTS_FROM_LAWYERS } from "@/graphql/post";
import { useQuery } from "@apollo/client";
import { LawyerArticleCard } from "./LawyerArticleCard";
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

const ShowArticleFromLawyers = () => {
  const { push } = useRouter();
  const { data, loading, error } = useQuery(GET_ALL_POSTS_FROM_LAWYERS);
  const allLawyersPosts: ArticleType[] = data?.getPosts || [];

  if (error) console.log(error.message);

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Мэргэжилтнүүдийн нийтлэлийг унших</h2>
        <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
          Манай хуулийн мэргэжилтнүүдийн нийтлэл, зөвлөгөөг үнэгүй авч байгаарай
        </p>

        {loading && (
          <div className="flex justify-center items-center my-6">
            <LoaderCircle className="animate-spin w-8 h-8 text-gray-400" />
          </div>
        )}

        {error && <p className="text-red-500 mb-6">Алдаа: {error.message}</p>}

        <article className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {allLawyersPosts.slice(0, 3).map((article) => (
            <LawyerArticleCard key={article._id} article={article} />
          ))}
        </article>

        <div className="mt-8 sm:mt-10 md:mt-12">
          <Button
            onClick={() => push("/legal-articles")}
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-[#003366] text-white font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 text-base sm:text-lg"
          >
            Бүх нийтлэлийг унших
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShowArticleFromLawyers;
