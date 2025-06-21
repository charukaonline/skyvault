import ContentCard from "@/components/ContentPage/ContentCard";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiConfig } from "@/config/api";

const Content = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Drone Content | SkyVault";
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      // For now, using mock data since we don't have the API endpoint
      // Replace this with actual API call when backend is ready
      const mockContent = {
        _id: "68477ebdb2f0056475c7b766",
        creatorId: "68440464cc8c347dbbcca208",
        title: "test video 1",
        description: "asdasd asdasdasdas asdasda",
        category: "Landscape",
        tags: ["nature"],
        location: "Sri Lanka",
        resolution: "720p",
        duration: 44,
        youtubePreview: "https://youtu.be/r6HTCiPwJr8",
        price: 30,
        licenseType: "ROYALTY_FREE",
        droneModel: "DJI Mavic 3",
        mediaFiles: [{}],
        thumbnailFile: {},
        status: "PENDING_REVIEW",
        views: 1250,
        downloads: 23,
        earnings: 0,
        createdAt: "2025-06-10T00:39:22.178+00:00",
        updatedAt: "2025-06-10T00:39:22.178+00:00"
      };

      setContents([mockContent]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching content:", error);
      setError("Failed to load content");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative container mx-auto px-6 py-20 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-white">Loading content...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative container mx-auto px-6 py-20 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-400">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative container mx-auto px-6 py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Drone Content Marketplace
          </h1>
          <p className="text-gray-300 text-lg">
            Discover premium aerial footage from professional drone creators
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <ContentCard key={content._id} content={content} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Content;
