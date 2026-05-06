"use client";

interface MobileHeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export function MobileHeader({ onMenuToggle, isMenuOpen }: MobileHeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
      {/* Logo a la izquierda */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#F97316] rounded-md flex items-center justify-center text-white font-bold text-xs">
          C
        </div>
        <span className="text-xs font-bold">
          <span className="text-[#F97316]">Cotiza</span>
          <span className="text-gray-900">Ya</span>
        </span>
      </div>
      
      {/* Hamburguesa a la derecha */}
      <button
        onClick={onMenuToggle}
        className="text-xl text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors"
      >
        {isMenuOpen ? "✕" : "☰"}
      </button>
    </header>
  );
}
