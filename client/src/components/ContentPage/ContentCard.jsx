import React from 'react'

const ContentCard = ({ content }) => {
    const {
        title,
        description,
        category,
        tags,
        location,
        resolution,
        duration,
        youtubePreview,
        price,
        licenseType,
        droneModel,
        thumbnailFile,
        views,
        downloads
    } = content;

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getYouTubeVideoId = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/);
        return match ? match[1] : null;
    };

    const videoId = getYouTubeVideoId(youtubePreview);
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="relative w-full h-48 bg-slate-700 overflow-hidden">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700 text-gray-400">
                        <span>No Preview</span>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(duration)}
                </div>
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {resolution}
                </div>
            </div>
            
            <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-4">{description}</p>
                
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="text-gray-300">{category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-300">{location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Drone:</span>
                        <span className="text-gray-300">{droneModel}</span>
                    </div>
                    {tags && tags.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Tags:</span>
                            <div className="flex flex-wrap gap-1">
                                {tags.map((tag, index) => (
                                    <span key={index} className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-4 text-sm">
                    <div className="text-center">
                        <span className="block text-white font-semibold">{views}</span>
                        <span className="text-gray-500 text-xs">Views</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-white font-semibold">{downloads}</span>
                        <span className="text-gray-500 text-xs">Downloads</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-green-400">${price}</span>
                        <span className="text-xs text-gray-500">{licenseType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex gap-2">
                        {youtubePreview && (
                            <a 
                                href={youtubePreview} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded transition-colors duration-200"
                            >
                                Preview
                            </a>
                        )}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors duration-200">
                            Purchase
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContentCard