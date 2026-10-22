import React from 'react';
import { Disc3, Heart, ExternalLink, Code2 } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#080c14] border-t border-slate-800/80 mt-20 pt-12 pb-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/60">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Disc3 className="w-4 h-4 text-slate-950 animate-spin-slow" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                SOUND<span className="text-emerald-400">BOXD</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Xarxa social i diari de valoració musical per a melòmans. Catalogar, puntuar,
              redactar ressenyes i compartir col·leccions d'àlbums inspirat en Letterboxd.
            </p>
            <div className="text-xs text-slate-500">
              Projecte MP0492 · AEA2 · Repte 1 · Desenvolupat per <strong className="text-slate-300">Adrià Gallardo</strong>.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Navegació</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  Inici / Feed Comunitari
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-400 transition-colors">
                  Cercador de Discos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('playlists')} className="hover:text-emerald-400 transition-colors">
                  Llistes Temàtiques
                </button>
              </li>
            </ul>
          </div>

          {/* External references from memory */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recursos del Projecte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/adriagallardo9/soundbox"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Repositori GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://design.penpot.app"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Prototip de Penpot
                </a>
              </li>
              <li>
                <a
                  href="https://developer.spotify.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Spotify Web API
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 SoundBoxd · Tots els drets reservats.</p>
          <p className="flex items-center gap-1">
            Fet amb <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> per als amants de la bona música.
          </p>
        </div>
      </div>
    </footer>
  );
}
