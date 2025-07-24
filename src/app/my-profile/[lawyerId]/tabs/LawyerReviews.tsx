"use client";

interface Review {
  client: string;
  rating: number;
  comment: string;
  date: string;
}

export const LawyerReviews = () => {
  // Fake review data
  const reviews: Review[] = [
    {
      client: "А. Батболд",
      rating: 5,
      comment: "Маш туршлагатай, үр дүнтэй зөвлөгөө өгсөн.",
      date: "2025-07-01",
    },
    {
      client: "С. Энхжин",
      rating: 4,
      comment: "Хурдан хариу өгсөн. Сэтгэл хангалуун байна.",
      date: "2025-06-28",
    },
  ];

  const totalClients = 22; // simulate number of unique clients

  // Badge logic
  let badge = "";
  let nextLevel = "";
  const current = totalClients;
  let max = 50;

  if (totalClients >= 50) {
    badge = "🏆 Elite Lawyer";
    max = 50;
  } else if (totalClients >= 20) {
    badge = "🥈 Pro Lawyer";
    nextLevel = "Elite Lawyer";
    max = 50;
  } else if (totalClients >= 10) {
    badge = "🥉 Good Lawyer";
    nextLevel = "Pro Lawyer";
    max = 20;
  } else {
    badge = "🔰 Шинэ өмгөөлөгч";
    nextLevel = "Good Lawyer";
    max = 10;
  }

  const progressPercent = Math.min((current / max) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Achievement Section */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-semibold">🎖 Амжилтын түвшин</h2>
        <p className="text-sm text-gray-600">
          Нийт <span className="font-bold">{totalClients}</span> захиалагч
        </p>
        <div className="text-lg font-semibold text-green-700">{badge}</div>

        {nextLevel && (
          <div className="text-sm text-gray-500">
            Дараагийн түвшин: <span className="font-medium">{nextLevel}</span>
          </div>
        )}

        <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-4 mt-2">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <hr className="text-gray-100" />

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Үйлчлүүлэгчдийн сэтгэгдэл
        </h2>
        {reviews.map((review, i) => (
          <div
            key={i}
            className="bg-gray-50 border rounded-lg p-4 shadow-sm space-y-1 border-gray-200"
          >
            <div className="text-sm text-gray-500">
              👤 {review.client} — {review.date}
            </div>
            <div className="text-yellow-500 text-sm">
              {"⭐".repeat(review.rating)}
            </div>
            <p className="text-gray-700 text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
