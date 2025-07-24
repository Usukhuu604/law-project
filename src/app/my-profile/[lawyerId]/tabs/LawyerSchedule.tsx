"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Edit3,
  Save,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useMutation, gql } from "@apollo/client";

const SET_AVAILABILITY = gql`
  mutation SetAvailability($input: SetAvailabilityInput!) {
    setAvailability(input: $input) {
      _id
      lawyerId
      availableDays {
        day
        startTime
        endTime
        booked
      }
    }
  }
`;

const UPDATE_AVAILABILITY = gql`
  mutation UpdateAvailabilityDate($input: UpdateAvailabilityDateInput!) {
    updateAvailabilityDate(input: $input) {
      _id
      lawyerId
      availableDays {
        day
        startTime
        endTime
        booked
      }
    }
  }
`;

type Availability = Record<string, string[]>;

interface LawyerScheduleProps {
  lawyerId: string;
}

interface UpdateFormState {
  oldDay: string;
  oldStart: string;
  oldEnd: string;
  newDay: string;
  newStart: string;
  newEnd: string;
}

const generateHourlySlots = (startHour = 0, endHour = 24): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {

    const timeString = `${hour.toString().padStart(2, "0")}:00`;
    slots.push(timeString);
  }
  return slots;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m + minutes);
  return date.toTimeString().slice(0, 5);
};

export default function LawyerSchedule({ lawyerId }: LawyerScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availability, setAvailability] = useState<Availability>({});
  const [isLoading, setSaving] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [notification, setNotification] = useState("");

  const [updateForm, setUpdateForm] = useState<UpdateFormState>({
    oldDay: "",
    oldStart: "",
    oldEnd: "",
    newDay: "",
    newStart: "",
    newEnd: "",
  });

  const [setAvailabilityMutation] = useMutation(SET_AVAILABILITY);
  const [updateAvailabilityDate] = useMutation(UPDATE_AVAILABILITY);

  const selectedDateKey = selectedDate.toISOString().split("T")[0];
  const selectedTimeSlots = availability[selectedDateKey] || [];
  const timeSlots = generateHourlySlots();

  useEffect(() => {
    const now = new Date();
    const cutoff = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    const weekLater = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 7
    );

    const newAvailability = Object.entries(availability).reduce(
      (acc: Availability, [dateKey, slots]) => {
        const dateObj = new Date(dateKey);
        if (dateObj >= cutoff && dateObj <= weekLater) {
          acc[dateKey] = slots;
        }
        return acc;
      },
      {}
    );

    setAvailability(newAvailability);
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const toggleTimeSlot = (time: string) => {
    setAvailability((prev) => {
      const current = prev[selectedDateKey] || [];
      const updated = current.includes(time)
        ? current.filter((t) => t !== time)
        : [...current, time].sort();
      return {
        ...prev,
        [selectedDateKey]: updated,
      };
    });
  };

  // const removeTimeSlot = (dateKey: string, time: string) => {
  //   setAvailability((prev) => {
  //     const filtered = prev[dateKey].filter((t) => t !== time);
  //     const updated = { ...prev, [dateKey]: filtered };
  //     if (filtered.length === 0) delete updated[dateKey];
  //     return updated;
  //   });
  // };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const availableDays = Object.entries(availability).flatMap(
        ([dateKey, slots]) =>
          slots.map((startTime) => ({
            day: dateKey,
            startTime,
            endTime: addMinutesToTime(startTime, 30),
          }))
      );

      if (availableDays.length === 0) {
        showNotification("Хадгалах цаг сонгоно уу");
        setSaving(false);
        return;
      }

      await setAvailabilityMutation({
        variables: { input: { availableDays } },
      });
      showNotification("Хуваарь амжилттай хадгалагдлаа! ✅");
    } catch (error) {
      showNotification("Алдаа гарлаа. Дахин оролдоно уу.");
      if (error instanceof Error) {
        showNotification(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateAvailabilityDate({
        variables: {
          input: {
            lawyerId,
            oldDay: updateForm.oldDay,
            oldStartTime: updateForm.oldStart,
            oldEndTime: updateForm.oldEnd,
            newDay: updateForm.newDay,
            newStartTime: updateForm.newStart,
            newEndTime: updateForm.newEnd,
          },
        },
      });

      setUpdateForm({
        oldDay: "",
        oldStart: "",
        oldEnd: "",
        newDay: "",
        newStart: "",
        newEnd: "",
      });
      setShowUpdateForm(false);
      showNotification("Хуваарь амжилттай шинэчлэгдлээ! ✅");
    } catch (error) {
      showNotification("Алдаа гарлаа. Дахин оролдоно уу.");
      if (error instanceof Error) {
        showNotification(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const clearAllSlots = () => {
    setAvailability({});
    showNotification("Бүх цаг арилгагдлаа");
  };

  const addQuickSlots = (startHour: number, endHour: number) => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour - 1 || endHour % 1 !== 0) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }

    setAvailability((prev) => ({
      ...prev,
      [selectedDateKey]: [
        ...new Set([...(prev[selectedDateKey] || []), ...slots]),
      ].sort(),
    }));
    showNotification(`${startHour}:00-${endHour}:00 цагууд нэмэгдлээ`);
  };

  const now = new Date();
  // const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="max-w-9xl mx-auto  space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Хуварийн удирдлага</h1>
        </div>
        <p className="text-blue-100">Та өөрийн боломжит цагийг тохируулна уу</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4" />
          {notification}
        </div>
      )}

      <div className="grid-cols-3 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Өдөр сонгох
            </h2>

            {/* Simple Calendar */}
            <div className="space-y-4">
             

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(now);
                  date.setDate(now.getDate() + i);
                  const dateKey = date.toISOString().split("T")[0];
                  const isSelected = dateKey === selectedDateKey;
                  const hasSlots = availability[dateKey]?.length > 0;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-3 rounded-xl text-sm font-medium transition-all duration-200 relative
                        ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-lg scale-105"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }

                      `}
                    >
                      {date.getDate()}
                      {hasSlots && (
                        <div
                          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                            isSelected ? "bg-yellow-400" : "bg-green-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Сонгосон өдөр:</strong>
                <br />
                {formatDate(selectedDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Time Slots Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Цаг сонгох
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => addQuickSlots(9, 12)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Өглөө (9-12)
                  </button>
                  <button
                    onClick={() => addQuickSlots(13, 17)}
                    className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    Үдээс хойш (13-17)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => toggleTimeSlot(time)}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2
                      ${
                        selectedTimeSlots.includes(time)
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-300 shadow-lg scale-105"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    {time} - {addMinutesToTime(time, 60)}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Selection Summary */}
            <div className="p-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                {selectedTimeSlots.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{formatDate(selectedDate)}</strong> өдөр сонгосон
                      цагууд:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTimeSlots.map((time) => (

                        <span key={time} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {time} - {addMinutesToTime(time, 60)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Цаг сонгоно уу
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={saveAvailability}
                  disabled={isLoading || selectedTimeSlots.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Хадгалах
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowUpdateForm(!showUpdateForm)}
                  className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Засах
                </button>

                {Object.keys(availability).length > 0 && (
                  <button
                    onClick={clearAllSlots}
                    className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Арилгах
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Form */}
      {showUpdateForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            Хуваарь шинэчлэх
          </h3>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Хуучин мэдээлэл</h4>
                <input
                  type="date"
                  value={updateForm.oldDay}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      oldDay: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={updateForm.oldStart}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        oldStart: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    value={updateForm.oldEnd}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        oldEnd: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Шинэ мэдээлэл</h4>
                <input
                  type="date"
                  value={updateForm.newDay}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      newDay: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={updateForm.newStart}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        newStart: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    value={updateForm.newEnd}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        newEnd: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdateAvailability}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? "Шинэчилж байна..." : "Шинэчлэх"}
              </button>
              <button
                onClick={() => setShowUpdateForm(false)}
                className="py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Болих
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Selected Times Overview */}
      {Object.keys(availability).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Өмгөөлөгчийн бүх сонгосон хуваарь
          </h3>
          <div className="space-y-4">
            {Object.entries(availability).map(([dateKey, slots]) => (
              <div
                key={dateKey}
                className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">
                    📅 {new Date(dateKey).toLocaleDateString("mn-MN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                  </h4>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {slots.length} цаг
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <div
                      key={slot}
                      className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="font-medium">
                        {slot} - {addMinutesToTime(slot, 60)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
