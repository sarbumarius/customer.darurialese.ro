// src/components/content/GiftsSlider.tsx
import React from "react";

interface GiftsSliderProps {
  title?: string;
}

export const GiftsSlider: React.FC<GiftsSliderProps> = ({ title = "Alege un cadou" }) => {
  const base = 'https://darurialese.com/wp-content/themes/woodmart-child/img/cadouri-comanda';
  const gifts = [
    'cadou22','cadou10','cadou11','cadou12','cadou18','cadou1','cadou3','cadou16','cadou21','cadou20','cadou19','cadou17','cadou15','cadou5','cadou6'
  ];

  return (
    <div className="border border-border rounded-md p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-xs text-muted-foreground">vizibile 6 • restul cu scroll</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-3 pr-1">
          {gifts.map((name) => (
            <div key={name} className="flex-none w-1/6 min-w-[140px] border rounded p-2 hover:shadow-sm transition bg-background">
              <div className="w-full aspect-square overflow-hidden rounded">
                <img
                  src={`${base}/${name}.png`}
                  alt={name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-1 text-center text-xs text-muted-foreground truncate">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GiftsSlider;
