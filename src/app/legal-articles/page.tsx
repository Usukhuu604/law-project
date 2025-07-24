"use client";

import { useState } from "react";
import { Button } from "@/components";
import { useGetAdminSpecializationsQuery } from "@/generated";
import { useQuery } from "@apollo/client";
import { GET_ALL_POSTS } from "@/graphql/post";
import { Search, Filter, Calendar, User, Tag, ChevronRight, X } from "lucide-react";

const ArticlesPage = () => {
  const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // const { lawyerId } = useParams() as { lawyerId: string };

  const { data: specData, loading: specLoading, error: specError } = useGetAdminSpecializationsQuery();
  const { data: postData, loading: postLoading, error: postError } = useQuery(GET_ALL_POSTS);

  // Specializations and posts data
  const specializations = specData?.getAdminSpecializations || [];
  const posts = postData?.getPosts || [];

  // Multi-select logic
  const handleFilter = (specId: string) => {
    setSelectedSpecIds((prev) => (prev.includes(specId) ? prev.filter((id) => id !== specId) : [...prev, specId]));
  };
  const clearFilters = () => {
    setSelectedSpecIds([]);
    setSearchTerm("");
  };

  // Filtering logic
  const filteredPosts = posts.filter((post: any) => {
    const matchesSearch =
      !searchTerm ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.text?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpec =
      selectedSpecIds.length === 0 || post.specialization?.some((spec: any) => selectedSpecIds.includes(spec.id || spec._id));

    return matchesSearch && matchesSpec;
  });

  if (specLoading || postLoading) {
    return (
      <div className="min-h-screen md:mt-100 mt-20 bg-transparent ">
        <div className="text-center space-y-4 bg-transparent">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto bg-transparent"></div>
          <p className="text-gray-600 text-lg">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  if (specError || postError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Алдаа гарлаа</h2>
          <p className="text-gray-600">{specError?.message || postError?.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Дахин оролдох
          </Button>
        </div>
      </div>
    );
  }

  console.log(filteredPosts);

  return (
    <div className="min-h-screen  px-30">
      <div className="bg-transparent ">
        <div className=" px-4 sm:px-6 lg:px-8 py-8 ">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Хуулийн нийтлэлүүд
            </h1>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Хуулийн мэргэжилтнүүдийн туршлага, зөвлөгөө болон сүүлийн үеийн хуулийн мэдээллүүд
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-5 px-15 max-w-none bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4 ">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Нийтлэл хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-row items-center gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border border-gray-300 bg-white"
              >
                <Filter className="h-4 w-4" />
                Ангилал ({specializations.length})
                <ChevronRight className={`h-4 w-4 transition-transform ${showFilters ? "rotate-90" : ""}`} />
              </Button>

              {(selectedSpecIds.length > 0 || searchTerm) && (
                <Button variant="ghost" onClick={clearFilters} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <X className="h-4 w-4 mr-2" />
                  Цэвэрлэх
                </Button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          {showFilters && (
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {specializations.map((spec: { id: string; categoryName: string }) => (
                  <Button
                    key={spec.id}
                    variant={selectedSpecIds.includes(spec.id) ? "default" : "outline"}
                    onClick={() => handleFilter(spec.id)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${
                        selectedSpecIds.includes(spec.id)
                          ? "bg-blue-600 text-white shadow-lg border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                      }
                    `}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    {spec.categoryName}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedSpecIds.length > 0 || searchTerm) && (
            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4 justify-center">
              <span className="text-sm text-gray-500 font-medium">Идэвхтэй шүүлтүүр:</span>
              {selectedSpecIds.map((specId) => {
                const spec = specializations.find((s) => s.id === specId);
                return (
                  <div key={specId} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <Tag className="h-3 w-3" />
                    {spec?.categoryName}
                    <button onClick={() => handleFilter(specId)} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {searchTerm && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <Search className="h-3 w-3" />
                  &quot;{searchTerm}&quot;
                  <button onClick={() => setSearchTerm("")} className="hover:text-green-900">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedSpecIds.length > 0
              ? `Сонгогдсон ангиллууд`
              : searchTerm
              ? `&quot;${searchTerm}&quot; хайлтын үр дүн`
              : "Бүх нийтлэлүүд"}
          </h2>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredPosts.length} нийтлэл олдлоо</div>
        </div>

        {/* Articles Grid - Modern look with PostCard */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">Нийтлэл олдсонгүй</h3>
              <p className="text-gray-500 mb-6">Таны хайлтын нөхцөлд тохирох нийтлэл байхгүй байна</p>
              {(selectedSpecIds.length > 0 || searchTerm) && (
                <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700">
                  Бүх нийтлэлийг харах
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredPosts.map((post: any) => (
                // <PostCard key={post.id} post={post} />

                <article
                  key={post._id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                  // style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 flex-shrink-0 ml-2" />
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{post.content?.text}</p>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString("mn-MN") : "Сүүлд шинэчлэгдсэн"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        <span className="font-medium">
                          {post.author?.firstName && post.author?.lastName
                            ? `${post.author.firstName} ${post.author.lastName}`
                            : post.author?.name
                            ? post.author.name
                            : post.author?.username
                            ? post.author.username
                            : "Өмгөөлөгч"}
                        </span>
                      </div>
                    </div>

                    {post.specialization && post.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {post.specialization.slice(0, 2).map((spec: any) => (
                          <span
                            key={spec.id || spec._id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {spec.categoryName}
                          </span>
                        ))}
                        {post.specialization.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600">
                            +{post.specialization.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform group-hover:scale-105">
                      Дэлгэрэнгүй унших
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
