import { getMembershipPageBySlug } from "../../../app/actions/membership-pages";
import { ContentItem } from "../../../types/membership-page";
import { notFound } from "next/navigation";

interface MembershipPageProps {
  params: {
    slug: string;
  };
}

function getVideoEmbedUrl(input: string): string {
  // Prüfen, ob es eine reine ID ist (nur Zahlen und Buchstaben)
  const isSimpleId = /^[a-zA-Z0-9_-]+$/.test(input);
  
  if (isSimpleId) {
    // Wenn die ID 11 Zeichen lang ist, ist es wahrscheinlich YouTube
    if (input.length === 11) {
      return `https://www.youtube.com/embed/${input}`;
    }
    // Wenn es nur Zahlen sind, ist es wahrscheinlich Vimeo
    if (/^\d+$/.test(input)) {
      return `https://player.vimeo.com/video/${input}?h=00000000`;
    }
  }

  // YouTube URL Erkennung
  const youtubeMatch = input.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo URL Erkennung
  const vimeoMatch = input.match(/vimeo\.com\/(?:.*#|.*)\/?([\d]+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?h=00000000`;
  }

  // Wenn es bereits eine Embed-URL ist, diese unverändert zurückgeben
  if (input.includes('/embed/') || input.includes('/video/')) {
    return input;
  }

  return input;
}

export default async function MembershipPage({ params }: MembershipPageProps) {
  const page = await getMembershipPageBySlug(params.slug);
  if (!page) notFound();

  const renderContent = (item: ContentItem) => {
    switch (item.type) {
      case "text":
        return (
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        );
      case "image":
        return (
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={item.content}
              alt={item.title}
              className="w-full h-auto object-cover"
            />
          </div>
        );
      case "image-grid":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {item.images?.map((imageUrl, index) => (
              <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`${item.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        );
      case "video":
        return (
          <div className="relative overflow-hidden rounded-lg aspect-video bg-gray-50">
            <video
              src={item.content}
              controls
              className="w-full h-full object-cover"
            />
          </div>
        );
      case "video-embed":
        const embedUrl = getVideoEmbedUrl(item.content);
        const isVimeo = embedUrl.includes('vimeo.com');
        const isYoutube = embedUrl.includes('youtube.com');

        if (!embedUrl) {
          return (
            <div className="bg-gray-50 rounded-lg p-6 text-gray-500">
              Ungültige Video-URL oder ID
            </div>
          );
        }

        return (
          <div className="relative overflow-hidden rounded-lg bg-gray-50">
            <div className={`relative ${item.aspectRatio || 'aspect-video'}`}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin"
                loading="lazy"
                sandbox={isVimeo ? "allow-same-origin allow-scripts allow-popups" : "allow-same-origin allow-scripts"}
                title={item.title || "Video"}
              />
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M12 2v20M2 10h20M2 14h20" />
              </svg>
              <span className="text-gray-700 text-lg font-medium">{item.title || "Audio"}</span>
            </div>
            <audio
              src={item.content}
              controls
              className="w-full"
            />
          </div>
        );
      case "pdf":
        return (
          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 flex items-center gap-3 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:scale-110 transition-transform duration-200"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <span className="font-medium text-lg">{item.title || "PDF öffnen"}</span>
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimalistisch und hell */}
      <div className="bg-gray-50/50">
        <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-left text-gray-900">
            {page.title}
          </h1>
          
          {page.content.description && (
            <p className="mt-4 text-lg text-gray-600 max-w-3xl">
              {page.content.description}
            </p>
          )}
        </div>
      </div>

      {/* Content Section - Hell und elegant */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24 py-12">
        <div className="space-y-16">
          {page.content.items
            .sort((a: ContentItem, b: ContentItem) => a.order - b.order)
            .map((item: ContentItem, index: number) => (
              <div 
                key={item.id} 
                className="relative"
              >
                {/* Subtiler Abschnittsteiler */}
                {index > 0 && (
                  <div className="absolute -top-8 left-0 right-0 h-px bg-gray-100" />
                )}

                {/* Content */}
                <div className="space-y-4">
                  {item.title && (
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {item.title}
                    </h2>
                  )}
                  {renderContent(item)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
