import { generateSpokaneSellerSearchProposal } from '@/services/proposals/spokane-seller-search';
import { ProposalReviewClient } from './review-client';

export const metadata = {
  title: 'Campaign Proposals | Dominion Ads AI',
};

export default function ProposalsPage() {
  // Generate the Spokane Seller Search proposal.
  // In the future this will load from Supabase, but for now
  // we generate it server-side from the proposal generator.
  const spokaneProposal = generateSpokaneSellerSearchProposal();

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold text-text-primary tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Campaign Proposals
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review AI-generated campaign structures before deployment to Google Ads.
        </p>
      </div>

      <ProposalReviewClient initialProposal={spokaneProposal} />
    </div>
  );
}
