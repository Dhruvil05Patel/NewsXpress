export default function NewsCard({
    title,
    summary,
    imageUrl,
    newsUrl,
    source,
    timestamp,
    category,
    readTime,
}) {
    return (
        <article className="flex flex-col h-full">
            {/* Image */}
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full aspect-video object-cover"
                />
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                    {category}
                </span>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4">
                <h2 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h2>
                <p className="text-sm text-gray-600 flex-1 line-clamp-3">{summary}</p>

                <div className="mt-4 text-xs text-gray-500">
                    <span>{source}</span> • <span>{timestamp}</span>
                </div>

                {/* Footer */}
                <div className="mt-3 flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{readTime} min read</span>
                    <a
                        href={newsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        Read More →
                    </a>
                </div>
            </div>
        </article>
    );
}
