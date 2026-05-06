'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const DEFAULT_AVATAR = "/logoperfil.png";
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setPhone(data.telefono || "");
          setEmail(data.email || "");
          setAvatarUrl(DEFAULT_AVATAR);
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      }
    };

    fetchProfile();
  }, []);

  // Controlar la visualización del menú inferior y el scroll cuando el perfil está abierto
  useEffect(() => {
    if (isProfileOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    };
  }, [isProfileOpen]);

  const closeProfile = () => {
    setIsProfileOpen(false);
    setIsEditing(false);
    setPassword("");
    setShowPassword(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          telefono: phone,
          email: email,
          password: password || undefined
          // No enviamos el logo para evitar modificaciones
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        setPassword("");
        alert('Perfil actualizado correctamente');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login'; // Forzamos recarga completa para limpiar el estado
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Eliminamos handleImageChange ya que no se permitirá cambiar la foto

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl shadow-[0_8px_32px_rgba(19,31,0,0.06)] flex justify-between items-center px-6 py-3" style={{ backgroundColor: '#647B4E' }}>
        <div className="flex items-center">
          <img 
            alt="SkyAGRO Logo" 
            className="h-10 w-auto object-contain block" 
            src="https://skyagro.s3.us-east-1.amazonaws.com/logo.png" 
            draggable={false} 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex items-center gap-3">
          {name && (
            <span className="text-white font-headline font-bold text-sm max-w-[120px] sm:max-w-[200px] truncate">
              {name}
            </span>
          )}
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 rounded-full border-2 border-primary-fixed overflow-hidden focus:outline-none focus:ring-2 focus:ring-white transition-all active:scale-95 bg-surface-container"
          >
            <Image 
              width={40} 
              height={40} 
              alt="Foto de perfil" 
              className="w-full h-full object-cover" 
              src={avatarUrl} 
            />
          </button>
        </div>
      </header>

      {/* Profile Administration Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`bg-gradient-to-br ${isEditing ? 'from-primary to-[#839e6a]' : 'from-[#506231] to-[#6b7e4a]'} p-6 text-center relative transition-colors duration-500`}>
              <button 
                onClick={closeProfile} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/10 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-md"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-white overflow-hidden mb-4 shadow-lg bg-surface relative">
                <Image 
                  width={96} 
                  height={96} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover" 
                  src={avatarUrl} 
                />
              </div>
              
              {isEditing ? (
                <div className="space-y-3 px-2">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">person</span>
                    <input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full bg-black/20 text-white font-headline font-extrabold text-xl text-center rounded-xl pl-8 pr-3 py-1.5 outline-none focus:bg-black/30 transition-colors border border-white/10 focus:border-white/30 placeholder:text-white/50" 
                      placeholder="Nombre Completo"
                    />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">mail</span>
                    <input 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full bg-black/20 text-white/90 text-xs font-medium uppercase tracking-widest text-center rounded-xl pl-8 pr-3 py-1.5 outline-none focus:bg-black/30 transition-colors border border-white/10 focus:border-white/30 placeholder:text-white/50" 
                      placeholder="Correo Electrónico"
                    />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">call</span>
                    <input 
                      type="tel"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="w-full bg-black/20 text-white/90 text-[13px] font-medium text-center rounded-xl pl-8 pr-3 py-1.5 outline-none focus:bg-black/30 transition-colors border border-white/10 focus:border-white/30 placeholder:text-white/50" 
                      placeholder="Teléfono"
                    />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">lock</span>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-black/20 text-white/90 text-[13px] font-medium text-center rounded-xl pl-8 pr-10 py-1.5 outline-none focus:bg-black/30 transition-colors border border-white/10 focus:border-white/30 placeholder:text-white/50" 
                      placeholder="Nueva Contraseña (Opcional)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-extrabold text-white font-headline tracking-tight">{name}</h3>
                  <p className="text-primary-fixed text-sm font-medium mt-1 uppercase tracking-widest">{email}</p>
                </>
              )}
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-2">
              {isEditing ? (
                 <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-extrabold shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-spin material-symbols-outlined">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">save</span>
                  )}
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-high transition-colors text-on-surface group"
                >
                  <div className="bg-primary/10 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined block">edit</span>
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-bold block">Editar Perfil</span>
                    <span className="text-xs text-on-surface-variant">Actualizar información personal</span>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                </button>
              )}

              <div className={`${isEditing ? 'mt-4' : 'pt-2 mt-2 border-t border-outline-variant/30'}`}>
                <button 
                  className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl hover:bg-error hover:text-white transition-colors ${isEditing ? 'text-on-surface-variant' : 'text-error font-bold'}`}
                  onClick={isEditing ? closeProfile : handleLogout}
                >
                  <span className="material-symbols-outlined">{isEditing ? 'cancel' : 'logout'}</span>
                  {isEditing ? 'Cancelar edición' : 'Cerrar Sesión'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
