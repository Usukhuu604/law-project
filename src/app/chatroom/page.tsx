"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, gql } from "@apollo/client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import ChatRoom from "@/components/chat/ChatRoom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Search,
  Loader2,
  AlertCircle,
  X,
  Menu,
  MessageSquare,
  WifiOff,
} from "lucide-react";
import { GET_LAWYERS_BY_IDS } from "@/graphql/lawyer";
import { debounce } from "lodash";

const GET_CHAT_ROOMS = gql`
  query GetChatRoomByUser($userId: String!) {
    getChatRoomByUser(userId: $userId) {
      _id
      participants
      appointmentId
      allowedMedia
      lastMessage {
        chatRoomId
        ChatRoomsMessages {
          _id
          userId
          type
          content
          createdAt
        }
      }
    }
  }
`;

const GET_LAWYER_BY_ID = gql`
  query GetLawyerById($lawyerId: ID!) {
    getLawyerById(lawyerId: $lawyerId) {
      _id
      lawyerId
      clerkUserId
      clientId
      firstName
      lastName
      email
      licenseNumber
      bio
      university
      specialization {
        _id
        lawyerId
        specializationId
        categoryName
        subscription
        pricePerHour
      }
      achievements {
        _id
        title
        description
        threshold
        icon
      }
      status
      document
      rating
      profilePicture
      createdAt
      updatedAt
    }
  }
`;

interface LastMessage {
  content: string;
  timestamp: string;
  senderId: string;
}

interface ChatRoom {
  _id: string;
  participants: string[];
  appointmentId: string;
  allowedMedia: string;
  lastMessage?: LastMessage;
  unreadCount?: number;
}

interface Lawyer {
  _id: string;
  lawyerId: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

// Custom hook for responsive design
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return { isMobile, isTablet };
};

// Custom hook for network status
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return isOnline;
};

export default function MessengerLayout() {
  const { user, isLoaded: userLoaded } = useUser();
  const userId = user?.id;
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { isMobile, isTablet } = useResponsive();
  const isOnline = useNetworkStatus();

  // Debounced search query
  const debouncedSetSearch = useCallback(
    debounce((query: string) => setDebouncedSearchQuery(query), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);

  // Auto-close sidebar on mobile when screen size changes
  useEffect(() => {
    if (isMobile && selectedRoomId) {
      setSidebarOpen(false);
    } else if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile, selectedRoomId]);

  // Enhanced query with error handling and retry logic
  const { data, loading, error, refetch } = useQuery(
    GET_CHAT_ROOMS,
    {
      variables: { userId },
      skip: !userId || !userLoaded,
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      pollInterval: isOnline ? 30000 : 0, // Stop polling when offline
      notifyOnNetworkStatusChange: true,
      onError: (err) => {
        console.error("Chat rooms query error:", err);
      },
    }
  );

  // Get selected room and other participant
  const selectedRoomObj = useMemo(
    () =>
      data?.getChatRoomByUser?.find((r: ChatRoom) => r._id === selectedRoomId),
    [data?.getChatRoomByUser, selectedRoomId]
  );

  const selectedOtherId = useMemo(
    () => selectedRoomObj?.participants.find((id: string) => id !== userId),
    [selectedRoomObj?.participants, userId]
  );

  // Fetch lawyer info for the selected chat with error handling
  const { data: selectedLawyerData } = useQuery(
    GET_LAWYER_BY_ID,
    {
      variables: { lawyerId: selectedOtherId },
      skip: !selectedOtherId,
      errorPolicy: "all",
    }
  );

  // Enhanced profile getter with fallback handling
  const getProfile = useCallback(
    (id: string) => {
      if (id === userId) {
        return {
          name: user?.fullName || user?.firstName || "Та",
          avatar: user?.imageUrl || "",
          initials:
            user?.firstName?.charAt(0) || user?.fullName?.charAt(0) || "Т",
        };
      }
      return {
        name: `User ${id.slice(-4)}`,
        avatar: "",
        initials: id.charAt(0).toUpperCase(),
      };
    },
    [userId, user]
  );

  // Memoized chat rooms with sorting
  const chatRooms: ChatRoom[] = useMemo(() => {
    const rooms = data?.getChatRoomByUser || [];

    // Sort by last message timestamp and unread count
    return [...rooms].sort((a, b) => {
      // Prioritize rooms with unread messages
      if (a.unreadCount && !b.unreadCount) return -1;
      if (!a.unreadCount && b.unreadCount) return 1;

      // Then sort by last message timestamp
      const aTime = a.lastMessage?.timestamp
        ? new Date(a.lastMessage.timestamp).getTime()
        : 0;
      const bTime = b.lastMessage?.timestamp
        ? new Date(b.lastMessage.timestamp).getTime()
        : 0;
      return bTime - aTime;
    });
  }, [data]);

  // Enhanced filtered rooms with better search logic
  const filteredRooms: ChatRoom[] = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return chatRooms;

    const query = debouncedSearchQuery.toLowerCase();
    return chatRooms.filter((room: ChatRoom) => {
      const otherId = room.participants.find((id: string) => id !== userId);
      if (!otherId) return false;

      const profile = getProfile(otherId);
      const lastMessage = room.lastMessage?.content?.toLowerCase() || "";

      return (
        profile.name.toLowerCase().includes(query) ||
        lastMessage.includes(query) ||
        otherId.toLowerCase().includes(query)
      );
    });
  }, [debouncedSearchQuery, chatRooms, userId, getProfile]);

  // Batch fetch lawyer IDs with deduplication
  const lawyerIds = useMemo(() => {
    const ids = new Set(
      filteredRooms
        .map((room) => room.participants.find((id) => id !== userId))
        .filter(Boolean) as string[]
    );
    return Array.from(ids);
  }, [filteredRooms, userId]);

  // Batch fetch all lawyers' info with error handling
  const { data: lawyersData } = useQuery(
    GET_LAWYERS_BY_IDS,
    {
      variables: { ids: lawyerIds },
      skip: lawyerIds.length === 0,
      errorPolicy: "all",
    }
  );

  // Enhanced lawyer map with better indexing
  const lawyerMap = useMemo(() => {
    const map: Record<string, Lawyer> = {};
    if (lawyersData?.getLawyersByIds) {
      lawyersData.getLawyersByIds.forEach((lawyer: Lawyer) => {
        if (lawyer?.lawyerId) {
          map[lawyer.lawyerId] = lawyer;
        }
      });
    }

    return map;
  }, [lawyersData]);

  // Enhanced handlers
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSelectRoom = useCallback(
    (roomId: string) => {
      setSelectedRoomId(roomId);
      if (isMobile) {
        setSidebarOpen(false);
      }
    },
    [isMobile]
  );

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    refetch().catch(console.error);
  }, [refetch]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
          case "b":
            e.preventDefault();
            toggleSidebar();
            break;
        }
      }

      if (e.key === "Escape") {
        if (searchQuery) {
          clearSearch();
        } else if (isMobile && sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, clearSearch, searchQuery, isMobile, sidebarOpen]);

  // Format timestamp helper
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Өчигдөр";
    } else if (diffDays < 7) {
      return `${diffDays} өдрийн өмнө`;
    }
    return date.toLocaleDateString();
  }, []);

  // Loading states
  const isInitialLoading = loading && !data;
  const isRefreshing = loading && !!data;

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-800">
      {/* Network status indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
          <WifiOff className="inline w-4 h-4 mr-2" />
          Интернетийн холболт тасарсан байна
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"} ${
          isTablet ? "w-[320px]" : "w-[380px]"
        }`}
      >
        <aside className="w-full h-full flex flex-col shadow-lg bg-white border-r border-gray-200">
          {/* Header */}
          <div className="flex flex-col items-center justify-center px-6 py-4 border-b border-gray-200 relative">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Чатууд</h2>
              {isRefreshing && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
            </div>

            {/* Selected lawyer info */}
            {selectedLawyerData?.getLawyerById && (
              <div className="flex flex-col items-center mt-2 mb-2">
                <div className="relative">
                  <Avatar className="w-16 h-16 mb-1">
                    <AvatarImage
                      src={
                        selectedLawyerData.getLawyerById.profilePicture ||
                        "/default-avatar.png"
                      }
                      alt={`${selectedLawyerData.getLawyerById.firstName} ${selectedLawyerData.getLawyerById.lastName}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                      {selectedLawyerData.getLawyerById.firstName?.charAt(0) ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  {selectedLawyerData.getLawyerById.isOnline && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <span className="font-semibold text-gray-800 text-lg text-center">
                  {selectedLawyerData.getLawyerById.firstName}{" "}
                  {selectedLawyerData.getLawyerById.lastName}
                </span>
                {selectedLawyerData.getLawyerById.lastSeen &&
                  !selectedLawyerData.getLawyerById.isOnline && (
                    <span className="text-xs text-gray-500">
                      Сүүлд:{" "}
                      {formatTimestamp(
                        selectedLawyerData.getLawyerById.lastSeen
                      )}
                    </span>
                  )}
              </div>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2 absolute top-4 right-4 hover:bg-gray-100"
              aria-label="Sidebar хаах (Ctrl+B)"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Хайх... (Ctrl+K)"
                className="pl-10 pr-10 py-3 rounded-xl bg-gray-100 border-gray-200 focus:bg-white transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 hover:bg-gray-200"
                  aria-label="Хайлт цэвэрлэх"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            {debouncedSearchQuery && (
              <p className="text-xs text-gray-500 mt-2">
                &quot{debouncedSearchQuery}&quot хайж байна...
              </p>
            )}
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {isInitialLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-500">
                  Чатууд ачааллаж байна...
                </p>
              </div>
            ) : error && !data ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
                <div className="p-4 rounded-full bg-red-100">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-red-600 mb-1">
                    Алдаа гарлаа
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {!isOnline
                      ? "Интернетийн холболтоо шалгана уу"
                      : "Чатуудыг ачаалахад алдаа гарлаа"}
                  </p>
                  {retryCount > 0 && (
                    <p className="text-xs text-gray-400">
                      Оролдлого: {retryCount}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  disabled={!isOnline}
                >
                  <Loader2 className="w-4 h-4 mr-2" />
                  Дахин оролдох
                </Button>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
                <div className="p-4 rounded-full bg-gray-100">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-600 mb-1">
                    {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Чат олдсонгүй"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {searchQuery
                      ? "Өөр түлхүүр үг оролдоно уу"
                      : "Шинэ чат эхлүүлээрэй"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredRooms.map((room: ChatRoom) => {
                  const otherId = room.participants.find(
                    (id: string) => id !== userId
                  );
                  const selected = room._id === selectedRoomId;
                  const lawyer = otherId ? lawyerMap[otherId] : undefined;
                  const hasUnread = (room.unreadCount || 0) > 0;

                  // Enhanced name and avatar logic
                  let name = "Хэрэглэгч";
                  let avatar = "/default-avatar.png";
                  let initial = "?";
                  let isOnlineStatus = false;

                  if (lawyer) {
                    name = `${lawyer.firstName || ""} ${
                      lawyer.lastName || ""
                    }`.trim();
                    avatar = lawyer.profilePicture || avatar;
                    initial = lawyer.firstName?.charAt(0) || "?";
                    isOnlineStatus = lawyer.isOnline || false;
                  } else if (otherId) {
                    name = `User ${otherId.slice(-4)}`;
                    initial = otherId.charAt(0).toUpperCase();
                  }

                  return (
                    <div
                      key={room._id}
                      onClick={() => handleSelectRoom(room._id)}
                      className={`group relative p-3 flex gap-3 items-start cursor-pointer rounded-xl transition-all duration-200 hover:scale-[1.01] ${
                        selected
                          ? "bg-blue-50 border-l-4 border-blue-600 shadow-md"
                          : hasUnread
                          ? "bg-blue-25 hover:bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={avatar} alt={name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        {isOnlineStatus && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-semibold text-gray-800 truncate ${
                              hasUnread ? "font-bold" : ""
                            }`}
                          >
                            {name}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {room.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(room.lastMessage.timestamp)}
                              </span>
                            )}
                            {hasUnread && (
                              <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                {room.unreadCount! > 9
                                  ? "9+"
                                  : room.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>

                        <p
                          className={`text-sm text-gray-600 truncate ${
                            hasUnread ? "font-medium" : ""
                          }`}
                        >
                         
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Sidebar Trigger (for mobile) */}
      {!sidebarOpen && (
        <Button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          size="sm"
          aria-label="Sidebar нээх (Ctrl+B)"
        >
          <Menu className="w-5 h-5 text-white" />
        </Button>
      )}

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Chat Section */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedRoomId ? (
          <ChatRoom chatRoomId={selectedRoomId} />
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400">
            <div className="text-center space-y-4 max-w-md px-4">
              <div className="p-6 rounded-full bg-gray-100 mx-auto w-fit">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-600">
                  Чат сонгогдоогүй байна
                </h3>
                <p className="text-gray-500 mb-4">
                  Харилцах хүнээ сонгоод чат эхлүүлээрэй
                </p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>⌨️ Товчлол:</p>
                  <p>Ctrl+K - Хайх</p>
                  <p>Ctrl+B - Sidebar</p>
                  <p>Esc - Гарах</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
