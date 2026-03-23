import { useState, useEffect } from 'react';
import { blogAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Calendar,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const BlogAdminPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletePostId, setDeletePostId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    images: [],
    is_published: true
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await blogAPI.getAll(false);
      setPosts(response.data);
    } catch (error) {
      toast.error('Eroare la încărcarea articolelor');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        images: post.images || [],
        is_published: post.is_published
      });
    } else {
      setEditingPost(null);
      setForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        images: [],
        is_published: true
      });
    }
    setShowModal(true);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm({
      ...form,
      title,
      slug: editingPost ? form.slug : generateSlug(title)
    });
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setForm({
        ...form,
        images: [...form.images, newImageUrl.trim()]
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingPost) {
        await blogAPI.update(editingPost.id, form);
        toast.success('Articol actualizat!');
      } else {
        await blogAPI.create(form);
        toast.success('Articol creat!');
      }
      setShowModal(false);
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await blogAPI.delete(deletePostId);
      toast.success('Articol șters!');
      setDeletePostId(null);
      fetchPosts();
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  return (
    <div className="space-y-6" data-testid="blog-admin-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Blog</h1>
          <p className="text-white/40 text-sm mt-1">Gestionează articolele de pe blog</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary px-4 py-2 flex items-center gap-2"
          data-testid="create-post-button"
        >
          <Plus size={16} />
          Articol Nou
        </button>
      </div>

      {/* Posts List */}
      <div className="bg-[#0A0A0A] border border-white/5">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-[#CCFF00]">SE ÎNCARCĂ...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/40">Nu există articole</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                data-testid={`post-row-${post.id}`}
              >
                {/* Thumbnail */}
                {post.images?.[0] ? (
                  <div className="w-16 h-12 bg-[#121212] overflow-hidden flex-shrink-0">
                    <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-12 bg-[#121212] flex items-center justify-center flex-shrink-0">
                    <span className="text-white/20 text-lg">N</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">{post.title}</h3>
                    {!post.is_published && (
                      <span className="text-[10px] uppercase px-2 py-0.5 bg-yellow-500/20 text-yellow-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-white/40 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {format(new Date(post.created_at), 'dd MMM yyyy', { locale: ro })}
                    </span>
                    <span>/blog/{post.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(post)}
                    className="text-white/40 hover:text-white p-2 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeletePostId(post.id)}
                    className="text-red-400 hover:bg-red-500/10 p-2 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white uppercase">
              {editingPost ? 'Editează Articol' : 'Articol Nou'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4" data-testid="blog-form">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Titlu</label>
              <input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                required
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
                placeholder="Titlul articolului"
              />
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
                placeholder="titlul-articolului"
              />
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Rezumat</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                required
                rows={2}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white resize-none"
                placeholder="Scurt rezumat al articolului"
              />
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Conținut</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={10}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white resize-none"
                placeholder="Conținutul complet al articolului..."
              />
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Imagini</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-2 text-white text-sm"
                  placeholder="URL imagine..."
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="btn-secondary px-4 py-2"
                >
                  <Plus size={14} />
                </button>
              </div>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-20 h-14 object-cover border border-white/10" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_published: !form.is_published })}
                className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                  form.is_published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
                }`}
              >
                {form.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                {form.is_published ? 'Publicat' : 'Draft'}
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-3">
                Anulează
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent className="bg-[#121212] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Șterge Articol</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Ești sigur că vrei să ștergi acest articol? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-0">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogAdminPage;
