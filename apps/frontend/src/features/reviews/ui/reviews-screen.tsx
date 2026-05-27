import { MessageSquareWarning, Star } from 'lucide-react';
import { trust } from '@/shared/mocks/spotwave';
import { UiButton } from '@/shared/ui/button/button';
import { UiCard } from '@/shared/ui/card/card';
import { UiInput } from '@/shared/ui/input/input';

export function ReviewsScreen() {
 return (
 <div className="space-y-5">
 <div><h1 className="text-5xl leading-[.95] tracking-[-0.06em] md:text-7xl">Reviews</h1><p className="mt-4 text-white/58">Trust signals from people who actually attended.</p></div>
 <div className="grid gap-4 lg:grid-cols-2">
 <UiCard className="space-y-4 p-6"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-3-rgb),0.16)] text-[var(--sw-accent-3)]"><Star size={20} /></span><div><h2 className="text-2xl tracking-[-0.04em]">Leave a review</h2><p className="text-white/52">Rating {trust.rating} · {trust.reviewsCount} reviews</p></div></div><UiInput aria-label="review" placeholder="Leave your feedback" /><UiButton>Submit review</UiButton></UiCard>
 <UiCard className="space-y-4 p-6"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(var(--sw-accent-3-rgb),0.16)] text-[var(--sw-accent-3)]"><MessageSquareWarning size={20} /></span><h2 className="text-2xl tracking-[-0.04em]">Report an issue</h2></div><UiInput aria-label="complaint" placeholder="Describe issue" /><UiButton variant="danger">Send complaint</UiButton></UiCard>
 </div>
 </div>
 );
}
