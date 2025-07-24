"use client";

import { Button, Badge } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GET_SPECIALIZATION_BY_LAWYER_ID } from "@/graphql/specializationsbylawyer";
import { useQuery } from "@apollo/client";

type LawyerCardProps = {
  id: string;
  name: string;
  status: string;
  avatarImage?: string;
  rating?: number;
  reviewCount?: number;
};

const LawyerCard = ({ id, name, status, avatarImage, rating, reviewCount }: LawyerCardProps) => {
  const [activeSpecialtyIndex, setActiveSpecialtyIndex] = useState<number | null>(null);

  const { data: specializationData, loading: specialLoad } = useQuery(GET_SPECIALIZATION_BY_LAWYER_ID, {
    variables: { lawyerId: id },
  });

  const handleClick = (index: number) => {
    setActiveSpecialtyIndex(activeSpecialtyIndex === index ? null : index);
  };

  const router = useRouter();

  const handleDelgerenguiClick = () => {
    router.push(`/lawyer/${id}`);
  };

  return (
    <div
      className="
        bg-[#eee] rounded-xl shadow-lg
        p-5 sm:p-6
        flex flex-col flex-grow-0 items-center text-center
        transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl
        w-full max-w-sm
        mx-auto
      "
    >
      <div className="mb-4">
        <div className="w-20 h-20 bg-[#8bc34a] rounded-full mx-auto mb-3 overflow-hidden">
          {avatarImage && (
            <img
              src={process.env.R2_PUBLIC_DOMAIN + "/" + avatarImage}
              className="size-full object-cover rounded-full"
              alt="Lawyer Avatar"
            />
          )}
        </div>
        <h3 className="text-xl font-semibold text-[#333333] mb-0.5">{name}</h3>
        <div className="w-full mb-5 text-left pl-4 mt-auto">
          <p className="flex justify-center items-center text-gray-700 text-sm mb-1.5">
            <span
              className={`mr-1.5 font-extrabold text-lg flex ${
                status?.toLowerCase() === "verified" ? "text-green-800" : "text-yellow-800"
              }`}
            >
              {status ? status : `${rating ?? 0} ★ (${reviewCount ?? 0})`}
            </span>
          </p>
        </div>
        <div className="p-2">
          {specialLoad ? (
            <p className="text-center py-2 text-sm">Ачааллаж байна...</p>
          ) : (
            <div className="flex flex-wrap justify-center">
              {specializationData?.getSpecializationsByLawyer.map(
                (
                  spec: {
                    specializationId: string;
                    categoryName: string;
                    pricePerHour: number | null;
                  },
                  index: number
                ) => (
                  <Badge
                    key={spec.specializationId}
                    onClick={() => handleClick(index)}
                    variant="default"
                    className={`
                      px-2 py-1 rounded-full text-[13px] font-medium m-0.5 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200
                      ${
                        activeSpecialtyIndex === index
                          ? "bg-blue-600 text-white"
                          : "bg-[#003366] text-white hover:bg-[#2EC4B6] hover:text-black"
                      }
                    `}
                  >
                    {spec.categoryName}
                    {activeSpecialtyIndex === index && (
                      <span className="ml-1">{spec.pricePerHour ? `/ ₮${spec.pricePerHour}/цаг` : "/ үнэгүй"}</span>
                    )}
                  </Badge>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2.5 mt-auto">
        <Button
          onClick={handleDelgerenguiClick}
          className="w-full bg-[#003366] text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors duration-200 text-base"
        >
          Мэдээлэл харах
        </Button>
      </div>
    </div>
  );
};

export default LawyerCard;
