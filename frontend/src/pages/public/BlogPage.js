import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { blogAPI } from '../../lib/api';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await blogAPI.getAll();
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
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

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#050505]" data-testid="blog-hero">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
            Blog
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-tight mb-4">
            Noutăți și Sfaturi
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Articole despre natație, sfaturi pentru antrenament și noutăți de la clubul nostru.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 bg-[#050505]" data-testid="blog-posts">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-[#CCFF00] font-heading">SE ÎNCARCĂ...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 mb-4">Nu există articole publicate încă.</p>
              <p className="text-white/30 text-sm">Revino curând pentru noutăți!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group block"
                  data-testid={`blog-post-${post.slug}`}
                >
                  <article className="h-full bg-[#0A0A0A] border border-white/5 overflow-hidden hover:border-[#CCFF00]/30 transition-all">
                    {/* Image */}
                    {post.images && post.images.length > 0 ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-[#121212] flex items-center justify-center">
                        <span className="text-[#CCFF00]/20 font-heading text-4xl">N</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
                        <Calendar size={12} />
                        {formatDate(post.created_at)}
                      </div>

                      <h2 className="font-heading text-xl font-bold text-white uppercase mb-3 group-hover:text-[#CCFF00] transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <span className="inline-flex items-center gap-2 text-[#CCFF00] text-sm font-heading uppercase tracking-wider">
                        Citește mai mult
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default BlogPage;
