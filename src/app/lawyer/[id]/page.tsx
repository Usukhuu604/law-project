"use client";

import { useState } from "react";
import {
  Mail,
  Star,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { use } from "react";
import { useUser } from "@clerk/nextjs";

const GET_LAWYER_BY_LAWYERID_QUERY = gql`
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

const GET_AVAILABILITY = gql`
  query GetAvailability($lawyerId: String!) {
    getAvailability(lawyerId: $lawyerId) {
      availableDays {
        day
        startTime
        endTime
        booked
      }
    }
  }
`;

const GET_SPECIALIZATIONS_BY_LAWYER = gql`
  query GetSpecializationsByLawyer($lawyerId: ID!) {
    getSpecializationsByLawyer(lawyerId: $lawyerId) {
      _id
      lawyerId
      specializationId
      categoryName
      subscription
      pricePerHour
    }
  }
`;

const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      id
      clientId
      lawyerId
      status
      chatRoomId
      subscription
      slot {
        day
        startTime
        endTime
        booked
      }
      specialization {
        _id
        lawyerId
        specializationId
        categoryName
        subscription
        pricePerHour
      }
      notes
      specializationId
    }
  }
`;

type Props = {
  params: Promise<{ id: string }>;
};

interface AppointmentSlot {
  day: string;
  startTime: string;
  endTime: string;
  booked: boolean;
}

const LawyerProfile = ({ params }: Props) => {
  const { id } = use(params);

  // All hooks at the top
  const {
    data: lawyerData,
    loading: lawyerLoading,
    error: lawyerError,
  } = useQuery(GET_LAWYER_BY_LAWYERID_QUERY, { variables: { lawyerId: id } });

  const { data: availabilityData, loading: availabilityLoading } = useQuery<{
    getAvailability: Array<{
      availableDays: AppointmentSlot[];
    }>;
  }>(GET_AVAILABILITY, {
    variables: { lawyerId: id },
    skip: false,
  });

  const { data: specializationsData, loading: specializationsLoading } =
    useQuery<{
      getSpecializationsByLawyer: Array<{
        _id: string;
        lawyerId: string;
        specializationId: string;
        categoryName?: string;
        subscription: boolean;
        pricePerHour?: number;
      }>;
    }>(GET_SPECIALIZATIONS_BY_LAWYER, { variables: { lawyerId: id } });

  const { user: currentUser, isSignedIn } = useUser();

  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "book">(
    "overview"
  );
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(
    null
  );
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [appointmentStatus, setAppointmentStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSpecializationId, setSelectedSpecializationId] =
    useState<string>("");

  const [createAppointment, { loading: creatingAppointment }] = useMutation(
    CREATE_APPOINTMENT,
    {
      onCompleted: () => {
        setAppointmentStatus({
          type: "success",
          message:
            "Цаг захиалга амжилттай үүслээ!",
        });
        setSelectedSlot(null);
        setAppointmentNotes("");
        setShowBookingModal(false);
      },
      onError: (error) => {
        setAppointmentStatus({
          type: "error",
          message:
            error.message ||
            "Цаг захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.",
        });
      },
    }
  );

  // Only after all hooks, do conditional returns
  if (lawyerLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (lawyerError || !lawyerData?.getLawyerById) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Алдаа гарлаа
          </h3>
          <p className="text-gray-600">
            Хуульчийн мэдээлэл олдсонгүй. Дахин оролдоно уу.
            <br />
            <span className="text-xs text-gray-400">
              id param: {String(id)}
            </span>
            <br />
            <span className="text-xs text-gray-400">
              lawyerData: {JSON.stringify(lawyerData)}
            </span>
            <br />
            <span className="text-xs text-gray-400">
              error: {lawyerError?.message}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const lawyer = lawyerData.getLawyerById;
  if (!isSignedIn) {
    return (
      <div className="text-center py-12 text-lg">
        Та нэвтэрч орсны дараа цаг захиалах боломжтой.
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    // Handle 'YYYY.M.D' format (e.g., '2025.7.26')
    if (/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(dateString)) {
      const [year, month, day] = dateString.split(".");
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      ).toLocaleDateString("mn-MN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    // fallback for other formats
    return dateString;
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  // Handle appointment creation
  const handleCreateAppointment = async () => {
    console.log(
      "Booking appointment for slot:",
      selectedSlot,
      "user:",
      currentUser,
      "lawyerId:",
      lawyer._id,
      "specializationId:",
      selectedSpecializationId
    );
    if (!selectedSlot || !currentUser) {
      setAppointmentStatus({
        type: "error",
        message: "Нэвтэрч орохоос өмнө цаг захиалах боломжгүй.",
      });
      return;
    }
    if (!selectedSpecializationId) {
      setAppointmentStatus({
        type: "error",
        message: "Та мэргэжлийн чиглэлээ сонгоно уу.",
      });
      return;
    }
    try {
      await createAppointment({
        variables: {
          input: {
            clientId: currentUser.id,
            lawyerId: id,
            specializationId: selectedSpecializationId,
            slot: {
              day: selectedSlot.day,
              startTime: selectedSlot.startTime,
              endTime: selectedSlot.endTime,
            },
            notes: appointmentNotes.trim(),
          },
        },
      });
    } catch (error) {
      let message = "Appointment creation error: ";
      if (error instanceof Error) {
        message += error.message;
        if (error.message.includes("not available")) {
          message =
            "Сонгосон цаг аль хэдийн захиалагдсан байна эсвэл олдсонгүй.";
        }
      } else {
        message += String(error);
      }
      setAppointmentStatus({
        type: "error",
        message,
      });
      console.error("Appointment creation error:", error);
    }
  };

  // Group available slots by date
  const slots =
    availabilityData?.getAvailability?.[0]?.availableDays?.filter(
      (slot) => !slot.booked
    ) || [];
  const groupedSlots = slots.reduce(
    (acc: Record<string, AppointmentSlot[]>, slot) => {
      if (!acc[slot.day]) {
        acc[slot.day] = [];
      }
      acc[slot.day].push(slot);
      return acc;
    },
    {}
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* About Section with responsiveness */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl md:flex md:flex-col md:gap-4 md:w-full sm:w-full">
              <h3 className="font-bold text-xl mb-4 text-gray-800">
                Танилцуулга
              </h3>
              <p className="text-gray-700 leading-relaxed md:w-full sm:w-full">
                {lawyer.bio || "Танилцуулга байхгүй байна."}
              </p>
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-bold text-xl mb-2">
                Үйлчлүүлэгчдийн сэтгэгдэл
              </h3>
              <div className="flex items-center justify-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(lawyer.rating) ? "fill-current" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{lawyer.rating}</span>
                <span className="text-gray-500">
                  ({lawyer.reviews} сэтгэгдэл)
                </span>
              </div>
            </div>
          </div>
        );
      case "book":
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="font-bold text-xl mb-2">Цаг захиалах</h3>
              <p className="text-gray-600">
                Боломжит цагуудаас сонгон цаг захиална уу
              </p>
            </div>
            {/* Specialization selector - full width */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Мэргэжлийн чиглэлээ сонгоно уу
              </label>
              <select
                value={selectedSpecializationId}
                onChange={(e) => setSelectedSpecializationId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={specializationsLoading}
              >
                <option value="">-- Сонгох --</option>
                {specializationsData?.getSpecializationsByLawyer.map((spec) => (
                  <option key={spec._id} value={spec.specializationId}>
                    {spec.categoryName || spec.specializationId}
                  </option>
                ))}
              </select>
            </div>

            {/* Status message remains same */}

            {/* Status Messages */}
            {appointmentStatus.type && (
              <div
                className={`p-4 rounded-lg ${
                  appointmentStatus.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center">
                  {appointmentStatus.type === "success" ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  {appointmentStatus.message}
                </div>
              </div>
            )}

            {/* Available Slots */}
            {availabilityLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">
                  Боломжит цагуудыг ачааллаж байна...
                </p>
              </div>
            ) : Object.keys(groupedSlots).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedSlots).map(([date, slots]) => (
                  <div
                    key={date}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800">
                        {formatDate(date)}
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {slots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setShowBookingModal(true);
                            }}
                            className="p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 text-center"
                          >
                            <div className="flex items-center justify-center gap-1 text-blue-600">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Боломжит цаг байхгүй
                </h3>
                <p className="text-gray-600">
                  Одоогоор захиалах боломжтой цаг байхгүй байна.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-8  md:w-200 flex flex-col justify-center items-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 w-full">
            <div className="flex justify-center flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <img
                  src={
                    `${process.env.R2_PUBLIC_DOMAIN}/${lawyer.profilePicture}` ||
                    "/api/placeholder/120/120"
                  }
                  alt={`${lawyer.firstName} ${lawyer.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {lawyer.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {lawyer.firstName} {lawyer.lastName}
                </h1>
                <p className="text-blue-100 text-lg font-medium mb-3">
                  {lawyer.specialization}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100">
                  {lawyer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{lawyer.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span>
                      {lawyer.rating} ({lawyer.reviews} үнэлгээ)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-5 w-5 text-blue-600" />
                <a
                  href={`mailto:${lawyer.email}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {lawyer.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-sm p-1 flex">
            {[
              { id: "overview", label: "Танилцуулга", icon: User },
              { id: "reviews", label: "Сэтгэгдэл", icon: Star },
              { id: "book", label: "Цаг захиалах", icon: Calendar },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          {renderTabContent()}
        </div>

        {/* Booking Confirmation Modal */}
        {showBookingModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">
                Цаг захиалга баталгаажуулах
              </h3>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">
                      Огноо: {formatDate(selectedSlot.day)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">
                      Цаг: {formatTime(selectedSlot.startTime)} -{" "}
                      {formatTime(selectedSlot.endTime)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Нэмэлт тэмдэглэл (заавал биш)
                  </label>
                  <textarea
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    placeholder="Танай асуудлын тухай товч мэдээлэл..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSlot(null);
                    setAppointmentNotes("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Цуцлах
                </button>
                <button
                  onClick={handleCreateAppointment}
                  disabled={creatingAppointment}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creatingAppointment ? "Захиалж байна..." : "Захиалах"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerProfile;
