import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreatorHeader from "@/components/creatorDashboard/CreatorHeader";
import CreatorSideBar from "@/components/creatorDashboard/CreatorSideBar";
import {
  Upload,
  Camera,
  Video,
  Image,
  MapPin,
  Tag,
  DollarSign,
  Eye,
  Youtube,
  CloudUpload,
  X,
  Check,
  AlertCircle,
  Loader2,
  FileVideo,
} from "lucide-react";

const UploadContent = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    location: "",
    latitude: "",
    longitude: "",
    resolution: "4K",
    duration: "",
    youtubePreview: "",
    price: "",
    licenseType: "ROYALTY_FREE",
    droneModel: "",
    shootingDate: "",
    weatherConditions: "",
    altitude: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const categories = [
    "Landscape",
    "Urban",
    "Real Estate",
    "Events",
    "Tourism",
    "Agriculture",
    "Construction",
    "Sports",
    "Nature",
    "Industrial",
  ];

  const licenseTypes = [
    {
      value: "ROYALTY_FREE",
      label: "Royalty Free",
      description: "One-time purchase, unlimited use",
    },
    {
      value: "LIMITED_USE",
      label: "Limited Use",
      description: "Specific usage terms apply",
    },
    {
      value: "EXCLUSIVE",
      label: "Exclusive License",
      description: "Buyer gets exclusive rights",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    for (const file of files) {
      if (!isValidFileType(file)) {
        showError("Invalid File", `${file.name} is not a supported file type`);
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        showError("File Too Large", `${file.name} exceeds 100MB limit`);
        return;
      }
    }

    setSelectedFiles(files);
    showSuccess("Files Selected", `${files.length} file(s) ready for upload`);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isValidFileType = (file) => {
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    return allowedTypes.includes(file.type);
  };

  const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showError("Validation Error", "Please select at least one media file");
      return;
    }

    if (
      formData.youtubePreview &&
      !validateYouTubeUrl(formData.youtubePreview)
    ) {
      showError("Validation Error", "Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Create FormData for multipart upload
      const uploadFormData = new FormData();

      // Add the JSON data
      uploadFormData.append(
        "data",
        JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          location: formData.location,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          resolution: formData.resolution,
          duration: formData.duration ? parseInt(formData.duration) : null,
          youtubePreview: formData.youtubePreview || null,
          price: parseFloat(formData.price),
          licenseType: formData.licenseType,
          droneModel: formData.droneModel || null,
          shootingDate: formData.shootingDate || null,
          weatherConditions: formData.weatherConditions || null,
          altitude: formData.altitude || null,
        })
      );

      // Add files
      selectedFiles.forEach((file) => {
        uploadFormData.append("files", file);
      });

      // Upload with improved error handling and timeout
      const xhr = new XMLHttpRequest();

      // Set timeout to 10 minutes for large file uploads
      xhr.timeout = 600000; // 10 minutes

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.onload = () => {
        console.log("Upload completed with status:", xhr.status);
        if (xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            showSuccess(
              "Content Uploaded Successfully!",
              "Your drone footage has been uploaded and is pending review."
            );

            // Reset form
            setFormData({
              title: "",
              description: "",
              category: "",
              tags: [],
              location: "",
              latitude: "",
              longitude: "",
              resolution: "4K",
              duration: "",
              youtubePreview: "",
              price: "",
              licenseType: "ROYALTY_FREE",
              droneModel: "",
              shootingDate: "",
              weatherConditions: "",
              altitude: "",
            });
            setSelectedFiles([]);
            setTagInput("");

            // Navigate to content management
            setTimeout(() => {
              navigate("/creator/content");
            }, 2000);
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
            showError(
              "Upload Error",
              "Upload completed but response was invalid"
            );
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            throw new Error(
              errorResponse.message || `Upload failed with status ${xhr.status}`
            );
          } catch (parseError) {
            throw new Error(
              `Upload failed with status ${xhr.status}: ${xhr.statusText}`
            );
          }
        }
      };

      xhr.onerror = () => {
        console.error("Network error occurred during upload");
        showError(
          "Network Error",
          "Connection failed. Please check your internet connection and try again."
        );
      };

      xhr.ontimeout = () => {
        console.error("Upload timeout occurred");
        showError(
          "Upload Timeout",
          "Upload took too long. Please try with smaller files or check your connection."
        );
      };

      xhr.onabort = () => {
        console.error("Upload was aborted");
        showError(
          "Upload Cancelled",
          "Upload was cancelled. Please try again."
        );
      };

      // Test connection first
      const testResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/test-db`
      );
      if (!testResponse.ok) {
        throw new Error("Server is not responding. Please try again later.");
      }

      console.log(
        "Starting upload to:",
        `${import.meta.env.VITE_API_BASE_URL}/api/content/creator/upload`
      );
      xhr.open(
        "POST",
        `${import.meta.env.VITE_API_BASE_URL}/api/content/creator/upload`
      );
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(uploadFormData);
    } catch (error) {
      console.error("Submit error:", error);
      showError("Upload Failed", error.message || "Failed to upload content");
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CreatorHeader />
      <CreatorSideBar />

      <main className="ml-64 pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Upload Drone Content
            </h1>
            <p className="text-gray-400">
              Share your aerial footage with the world
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter footage title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your footage..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} className="bg-blue-600 text-white">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Add tags..."
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CloudUpload className="h-5 w-5 mr-2" />
                  Media Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="video/mp4,video/quicktime,image/jpeg,image/jpg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="media-upload"
                    disabled={loading}
                  />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-300 mb-2">
                      Select Videos & Images
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports MP4, MOV, JPG, PNG (Max 100MB per file)
                    </p>
                  </label>
                </div>

                {loading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Selected Files:</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {file.type.startsWith("video/") ? (
                              <FileVideo className="h-5 w-5 text-purple-400" />
                            ) : (
                              <Image className="h-5 w-5 text-blue-400" />
                            )}
                            <div>
                              <p className="text-white text-sm">{file.name}</p>
                              <p className="text-gray-400 text-xs">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Resolution
                    </label>
                    <select
                      name="resolution"
                      value={formData.resolution}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="4K">4K (3840x2160)</option>
                      <option value="2K">2K (2560x1440)</option>
                      <option value="HD">HD (1920x1080)</option>
                      <option value="720p">720p (1280x720)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Drone Model
                    </label>
                    <input
                      type="text"
                      name="droneModel"
                      value={formData.droneModel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., DJI Mavic 3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    YouTube Preview Link
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                    <input
                      type="url"
                      name="youtubePreview"
                      value={formData.youtubePreview}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Add a YouTube link for preview (recommended for
                    videos)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location & Licensing */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location & Licensing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Santorini, Greece"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full pl-12 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="29.99"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Latitude (Optional)
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 36.4618"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Longitude (Optional)
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 25.3753"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    License Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {licenseTypes.map((license) => (
                      <label key={license.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="licenseType"
                          value={license.value}
                          checked={formData.licenseType === license.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            formData.licenseType === license.value
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-600 hover:border-slate-500"
                          }`}
                        >
                          <h4 className="font-medium text-white">
                            {license.label}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {license.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/creator/content")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || selectedFiles.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Content
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UploadContent;
