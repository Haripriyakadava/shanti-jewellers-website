import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Star } from 'lucide-react';

export default function Reviews() {
  return (
    <DashboardLayout noBackground={true}>
      <h2 className="text-2xl font-serif text-white mb-6">No reviews found</h2>
      
      <div className="bg-charcoal-light border border-white/5 rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center md:justify-start justify-center gap-6 md:gap-12">
        
        {/* Custom Icon (3 Stars + Lines) */}
        <div className="flex flex-col gap-4 opacity-80">
          <div className="flex items-center gap-4">
            <Star className="w-8 h-8 fill-gold text-gold" />
            <div className="w-24 h-3 bg-gold/30 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Star className="w-8 h-8 fill-gold text-gold" />
            <div className="w-24 h-3 bg-gold/30 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Star className="w-8 h-8 fill-gold text-gold" />
            <div className="w-24 h-3 bg-gold/30 rounded-full" />
          </div>
        </div>

        {/* Text */}
        <p className="text-xl md:text-2xl font-medium text-white">
          You haven't left any reviews yet.
        </p>

      </div>
    </DashboardLayout>
  );
}
