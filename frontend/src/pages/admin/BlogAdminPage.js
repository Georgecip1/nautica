import { useState, useEffect, useCallback, useRef } from 'react';
import { blogAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, X, Image as ImageIcon, Upload } from 'lucide-react';
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
  
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', images: [], is_published: true });

  const fetchPosts = useCallback(async () => {
    try {
      const response = await blogAPI.getAll(false);
      setPosts(response.data);
    } catch (error) {
      toast.error('Eroare la sincronizarea blogului');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title, slug: post.slug, excerpt: post.excerpt,
        content: post.content, images: post.images || [], is_published: post.is_published
      });
    } else {
      setEditingPost(null);
      setForm({ title: '', slug: '', excerpt: '', content: '', images: [], is_published: true });
    }
    setShowModal(true);
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm({ ...form, title, slug: editingPost ? form.slug : generateSlug(title) });
  };

  // Funcția nouă de citire a fișierelor
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificăm dimensiunea (max 2MB pentru a nu îngreuna baza de date)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imaginea este prea mare. Te rugăm să folosești o imagine sub 2MB.');
      // Resetăm inputul
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result conține imaginea convertită în Base64
      setForm(prev => ({ ...prev, images: [...prev.images, reader.result] }));
      toast.success('Imagine adăugată cu succes!');
    };
    reader.readAsDataURL(file);

    // Resetăm inputul pentru a putea selecta din nou aceeași imagine dacă a fost ștearsă
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPost) {
        await blogAPI.update(editingPost.id, form);
        toast.success('Articolul a fost suprascris');
      } else {
        await blogAPI.create(form);
        toast.success('Articol publicat cu succes!');
      }
      setShowModal(false);
      fetchPosts();
    } catch (error) {
      toast.error('Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await blogAPI.delete(deletePostId);
      toast.success('Articol șters definitiv');
      setDeletePostId(null);
      fetchPosts();
    } catch (error) { toast.error('Eroare sistem'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">CMS Blog</h1>
          <p className="text-white/40 text-sm mt-1">Gestionează noutățile clubului</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary px-6 py-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <Plus size={16} /> Scrie Articol
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-[#6db025] animate-pulse font-heading text-xs tracking-widest uppercase">Se preia conținutul...</div>
        ) : posts.length === 0 ? (
          <div className="p-20 text-center text-white/30 text-xs font-bold uppercase tracking-widest">Fără conținut publicat</div>
        ) : (
          <div className="divide-y divide-white/5">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-6 p-6 hover:bg-white/[0.02] transition-colors group">
                <div className="w-24 h-16 bg-[#050505] overflow-hidden flex-shrink-0 border border-white/10 rounded-sm flex items-center justify-center relative">
                  {post.images?.[0] ? <img src={post.images[0]} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-white/10" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold uppercase tracking-tight truncate text-lg">{post.title}</h3>
                    {!post.is_published ? (
                       <span className="text-[9px] uppercase px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-black tracking-widest rounded-sm">Draft Ascuns</span>
                    ) : (
                       <span className="text-[9px] uppercase px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 font-black tracking-widest rounded-sm">Public</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/30 text-[10px] uppercase font-bold tracking-widest mt-2">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {format(new Date(post.created_at), 'dd MMM yyyy', { locale: ro })}</span>
                    <span className="opacity-50">/blog/{post.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(post)} className="text-white/20 hover:text-white p-3 border border-transparent hover:border-white/10 transition-all rounded-sm"><Edit size={16} /></button>
                  <button onClick={() => setDeletePostId(post.id)} className="text-white/20 hover:text-red-500 p-3 border border-transparent hover:border-red-500/20 transition-all rounded-sm"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto p-0 shadow-2xl">
          <DialogHeader className="p-6 border-b border-white/5 sticky top-0 bg-[#121212] z-10">
             <DialogTitle className="font-heading text-xl text-white uppercase">{editingPost ? 'Modificare Postare' : 'Editor Conținut Nou'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-white/30 text-[10px] font-black uppercase tracking-widest">Titlul Articolului</label>
                <input type="text" value={form.title} onChange={handleTitleChange} required className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#6db025] p-4 text-white outline-none" placeholder="Ex: Start cursuri 2026" />
              </div>
              <div className="space-y-1.5">
                <label className="text-white/30 text-[10px] font-black uppercase tracking-widest">Link Direct (Slug)</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full bg-[#050505] border border-white/10 p-4 text-white/50 outline-none" readOnly />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-white/30 text-[10px] font-black uppercase tracking-widest">Rezumat (Apare în lista publică)</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required rows={2} className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#6db025] p-4 text-white resize-none outline-none" placeholder="Scurtă descriere..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/30 text-[10px] font-black uppercase tracking-widest">Corpul Textului</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={12} className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#6db025] p-4 text-white resize-none outline-none font-mono text-sm leading-relaxed" placeholder="Scrie aici conținutul..." />
            </div>

            <div className="space-y-3 bg-white/[0.02] p-6 border border-white/5 rounded-sm">
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest block">Galerie Imagini</label>
              
              <div className="flex gap-4 items-center">
                {/* Input ascuns pentru selectarea fișierului */}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-white/5 border border-white/10 hover:border-[#6db025]/50 hover:bg-[#6db025]/5 hover:text-[#6db025] text-white/60 px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all rounded-sm"
                >
                  <Upload size={16} /> Încarcă din PC
                </button>
                <span className="text-white/20 text-xs italic">Dimensiune maximă: 2MB / imagine</span>
              </div>
              
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-white/5">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group w-24 h-24 border border-white/10 bg-black overflow-hidden shadow-xl rounded-sm">
                      <img src={img} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute top-0 right-0 w-6 h-6 bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setForm({ ...form, is_published: !form.is_published })} className={`flex items-center gap-2 px-6 py-4 font-bold uppercase text-[10px] tracking-widest transition-colors flex-1 justify-center sm:flex-none ${form.is_published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                {form.is_published ? <><Eye size={16} /> Articolul va fi Public</> : <><EyeOff size={16} /> Salvează ca Draft Ascuns</>}
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 py-4 uppercase font-black tracking-widest text-sm disabled:opacity-20 w-full">
                {saving ? 'Se salvează...' : 'Salvează Postarea'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent className="bg-[#121212] border-white/10"><AlertDialogHeader><AlertDialogTitle className="text-white uppercase font-heading text-red-500">Eliminare Articol</AlertDialogTitle><AlertDialogDescription className="text-white/40">Această acțiune va șterge postarea de pe blogul public.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="bg-white/5 border-0 text-white">Anulează</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white border-0">Șterge Definitiv</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogAdminPage;