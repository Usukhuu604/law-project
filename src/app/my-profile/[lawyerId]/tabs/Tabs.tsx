"use client";

import { useState } from "react";



import { FileText, Star, Calendar, UserPenIcon, Newspaper } from "lucide-react";

import { ShowLawyerPosts } from "./ShowLawyerPosts";
import { LawyerReviews } from "./LawyerReviews";
import LawyerSchedule from "./LawyerSchedule";
import { LawyerProfileHeader } from "@/app/my-profile/[lawyerId]/tabs/LawyerHeader";
import { Button } from "@/components";
import CreatePost from "./post/CreatePost";

type TabType = "profile" | "posts" | "reviews" | "schedule" | "clients" | "createPost";

type SidebarTabsProps = {
  lawyerId: string;
};

const SidebarTabs = ({ lawyerId }: SidebarTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "profile",
      label: "Профайл",
      icon: <UserPenIcon className="w-4 h-4" />,
    },
    {
      id: "createPost",
      label: "Нийтлэл үүсгэх",
      icon: <Newspaper className="w-4 h-4" />,
    },
    {
      id: "schedule",
      label: "Хуваарь",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "posts",
      label: "Нийтлэлүүд",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "reviews",
      label: "Сэтгэгдлүүд",
      icon: <Star className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-[800] flex flex-col md:flex-row gap-6 ">
      <aside className="md:w-60 w-full rounded-xl bg-white  p-4 border-none ">
        <nav className="flex flex-col md:space-y-2 space-x-2 md:space-x-0 gap-3 ">
          {tabItems.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-150 text-sm w-full justify-start hover:cursor-pointer

     

                ${
                  activeTab === tab.id
                    ? "bg-[#316eea] text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}

            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </nav>
      </aside>

      <section className="flex-1 bg-white rounded-xl ">
        {activeTab === "profile" && <LawyerProfileHeader lawyerId={lawyerId} />}
        {activeTab === "schedule" && <LawyerSchedule lawyerId={lawyerId} />}
        {activeTab === "posts" && <ShowLawyerPosts lawyerId={lawyerId} />}
        {activeTab === "reviews" && <LawyerReviews />}
        {activeTab === "createPost" && <CreatePost />}
      </section>
    </div>
  );
};

export default SidebarTabs;
