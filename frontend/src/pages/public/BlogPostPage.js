import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { blogAPI } from '../../lib/api';
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await blogAPI.getOne(slug);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ro });
    } catch {
      return dateString;
    }
  };

  const nextImage = () => {
    if (post?.images) {
      setCurrentImage((prev) => (prev + 1) % post.images.length);
    }
  };

  const prevImage = () => {
    if (post?.images) {
      setCurrentImage((prev) => (prev - 1 + post.images.length) % post.images.length);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <div className="animate-pulse text-[#CCFF00] font-heading">SE ÎNCARCĂ...</div>
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
          <p className="text-white/60 mb-4">Articolul nu a fost găsit.</p>
          <Link to="/blog" className="text-[#CCFF00] hover:underline">
            Înapoi la blog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="pt-32 pb-20 bg-[#050505]" data-testid="blog-post">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Înapoi la blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
              <Calendar size={14} />
              {formatDate(post.created_at)}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase leading-tight">
              {post.title}
            </h1>
          </header>

          {/* Images Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="mb-12">
              <div className="relative aspect-video bg-[#0A0A0A] overflow-hidden">
                <img
                  src={post.images[currentImage]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                
                {post.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight size={20} className="text-white" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {post.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentImage ? 'bg-[#CCFF00]' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {post.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {post.images.map((image, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`flex-shrink-0 w-20 h-14 overflow-hidden border-2 transition-colors ${
                        i === currentImage ? 'border-[#CCFF00]' : 'border-transparent opacity-50'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Excerpt */}
          <div className="mb-8 p-6 bg-[#0A0A0A] border-l-4 border-[#CCFF00]">
            <p className="text-white/70 text-lg leading-relaxed italic">
              {post.excerpt}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {post.content.split('\n').map((paragraph, i) => (
              paragraph.trim() && (
                <p key={i} className="text-white/70 leading-relaxed mb-6">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        </div>
      </article>
    </PublicLayout>
  );
};

export default BlogPostPage;
